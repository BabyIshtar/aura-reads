import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ImagePlus, Music, Pause, Play, RefreshCw, Settings, Sparkles, X, ExternalLink, AlertTriangle } from "lucide-react";

const GENRES = [
  { key: "rbSoul", label: "R&B / Soul", query: "popular US r&b soul alternative r&b" },
  { key: "rapHipHop", label: "Rap / Hip-Hop", query: "popular US hip hop rap melodic rap" },
  { key: "indieAlt", label: "Indie / Alt", query: "popular US indie alternative bedroom pop" },
  { key: "electronic", label: "Electronic", query: "popular US electronic synthwave electropop" },
  { key: "pop", label: "Pop", query: "popular US pop alt pop dark pop" },
  { key: "rock", label: "Rock", query: "popular US alternative rock modern rock" },
  { key: "cinematic", label: "Cinematic", query: "cinematic atmospheric soundtrack electronic" }
];

const DEFAULT_GENRES = Object.fromEntries(GENRES.map((g) => [g.key, true]));

const AURAS = {
  grungeNoir: {
    name: "Grunge Noir",
    mood: "dark · textured · atmospheric",
    colors: ["#3f46ff", "#16c7ff", "#7c3cff"],
    queries: ["dark atmospheric US alternative", "moody US rock electronic", "night drive darkwave", "popular moody alternative"],
    words: [["Ghost", "Obsidian", "Noir", "Shadow", "Chrome", "Vanta", "Cinder"], ["Frequency", "Echo", "Drift", "Signal", "Bloom", "Pressure", "Haze"]]
  },
  neonNightlife: {
    name: "Neon Nightlife",
    mood: "electric · nocturnal · kinetic",
    colors: ["#00d5ff", "#a855f7", "#ff3df2"],
    queries: ["US nightlife pop rap", "neon night drive rap", "after hours r&b pop", "popular club rap electronic"],
    words: [["Neon", "Electric", "Digital", "Afterhours", "Chrome", "Plasma", "Violet"], ["Rush", "Mirage", "Pulse", "Drift", "Velocity", "Signal", "Glow"]]
  },
  warmDreamscape: {
    name: "Warm Dreamscape",
    mood: "warm · nostalgic · soft",
    colors: ["#ff7ab6", "#ffd166", "#ff9f6e"],
    queries: ["warm dreamy US r&b", "popular soft pop r&b", "sunset indie soul", "dreamy alternative r&b"],
    words: [["Golden", "Velvet", "Rose", "Honey", "Solar", "Blush", "Afterlight"], ["Reverie", "Bloom", "Gravity", "Haze", "Mirage", "Glow", "Daydream"]]
  },
  editorialLuxury: {
    name: "Editorial Luxury",
    mood: "clean · minimal · refined",
    colors: ["#d8dce8", "#8b5cf6", "#44d7ff"],
    queries: ["minimal luxury r&b", "sleek alternative r&b", "fashion editorial electronic", "popular elegant pop"],
    words: [["Silver", "Mirror", "Ivory", "Rare", "Chrome", "Pearl", "Atelier"], ["Theory", "Aura", "Drift", "Motion", "Reverie", "Silence", "Frame"]]
  },
  stormPressure: {
    name: "Storm Pressure",
    mood: "cool · focused · heavy",
    colors: ["#536dfe", "#35d3ff", "#28314f"],
    queries: ["moody atmospheric US rap", "blue reflective electronic", "cinematic hip hop dark", "popular cloud rap atmospheric"],
    words: [["Storm", "Cobalt", "Blue", "Static", "Lowlight", "Steel", "Thunder"], ["Horizon", "Echo", "Voltage", "Theory", "Signal", "Field", "Current"]]
  }
};

const AURA_KEYS = Object.keys(AURAS);
const RECENT_KEY = "aura_recent_tracks_v2";

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function clean(value = "") {
  return String(value).replace(/\(.*?\)/g, " ").replace(/feat\..*$/i, " ").replace(/[^a-z0-9\s&'-]/gi, " ").replace(/\s+/g, " ").trim();
}

function safeStorageGet(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function trackKey(track) {
  const song = clean(track?.name || track?.song || "").toLowerCase();
  const artist = clean(track?.artists?.[0]?.name || track?.artist || "").toLowerCase();
  return `${song}::${artist}`;
}

function getRecentTracks() {
  try { return new Set(JSON.parse(safeStorageGet(RECENT_KEY, "[]"))); } catch { return new Set(); }
}

function rememberTrack(key) {
  const recent = [key, ...Array.from(getRecentTracks()).filter((item) => item !== key)].slice(0, 24);
  safeStorageSet(RECENT_KEY, JSON.stringify(recent));
}

function buildAuraName(auraKey) {
  const aura = AURAS[auraKey] || AURAS.neonNightlife;
  return `${pick(aura.words[0])} ${pick(aura.words[1])}`;
}

async function fetchJson(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`Request failed ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function spotifySearch(q, limit = 35) {
  const params = new URLSearchParams({ q, limit: String(limit), market: "US" });
  const data = await fetchJson(`/api/spotify-search?${params.toString()}`);
  return Array.isArray(data?.tracks) ? data.tracks : [];
}

function isUsPlayableCandidate(track) {
  if (!track?.name || !track?.artists?.[0]?.name) return false;
  const markets = track.available_markets || [];
  if (Array.isArray(markets) && markets.length && !markets.includes("US")) return false;
  if (Number(track.popularity || 0) < 12) return false;
  return true;
}

async function findApplePreview(song, artist) {
  const queries = [`${song} ${artist}`, `${artist} ${song}`, song].map(clean).filter(Boolean);
  for (const q of queries) {
    try {
      const data = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&country=US&limit=20`, 6500);
      const results = Array.isArray(data?.results) ? data.results : [];
      const songPart = clean(song).toLowerCase().slice(0, 10);
      const artistPart = clean(artist).toLowerCase().split(" ")[0];
      const match = results.find((item) => item.previewUrl && clean(item.trackName).toLowerCase().includes(songPart) && clean(item.artistName).toLowerCase().includes(artistPart)) || results.find((item) => item.previewUrl);
      if (match?.previewUrl) return match.previewUrl.replace("http://", "https://");
    } catch {}
  }
  return "";
}

async function discoverSpotifyTrack(auraKey, genreSettings) {
  const aura = AURAS[auraKey] || AURAS.neonNightlife;
  const enabledGenreQueries = GENRES.filter((g) => genreSettings[g.key]).map((g) => g.query);
  const baseQueries = [...aura.queries, ...enabledGenreQueries, "popular US music", "US viral songs", "popular Spotify US"];
  const recent = getRecentTracks();
  const candidates = [];
  const seen = new Set();

  for (const q of shuffle(baseQueries).slice(0, 6)) {
    try {
      const tracks = await spotifySearch(q, 40);
      for (const track of tracks) {
        const key = trackKey(track);
        if (seen.has(key) || recent.has(key) || !isUsPlayableCandidate(track)) continue;
        seen.add(key);
        const score = Number(track.popularity || 0) + (track.preview_url ? 18 : 0) + (track.album?.images?.length ? 6 : 0) + Math.random() * 22;
        candidates.push({ track, score });
      }
      if (candidates.length >= 12) break;
    } catch (error) {
      console.warn("Spotify query failed", q, error);
    }
  }

  if (!candidates.length) throw new Error("Spotify could not return a usable track. Check your Spotify API variables and try again.");
  const ranked = candidates.sort((a, b) => b.score - a.score).slice(0, 18);
  return pick(ranked.slice(0, Math.min(8, ranked.length))).track;
}

function analyzeImage(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, sat = 0, bright = 0, count = 0;
      const colorful = [];
      for (let i = 0; i < data.length; i += 16) {
        const red = data[i], green = data[i + 1], blue = data[i + 2];
        const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
        const s = max ? ((max - min) / max) * 100 : 0;
        const br = (red + green + blue) / 3;
        r += red; g += green; b += blue; sat += s; bright += br; count += 1;
        if (s > 24 && br > 35) colorful.push([red, green, blue, s, br]);
      }
      r /= count; g /= count; b /= count; sat /= count; bright /= count;
      const warmth = r + g * 0.35 - b * 1.05;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      let auraKey = "editorialLuxury";
      if (bright < 85) auraKey = "grungeNoir";
      else if (sat > 62 && spread > 55) auraKey = "neonNightlife";
      else if (warmth > 28) auraKey = "warmDreamscape";
      else if (b > r && bright < 135) auraKey = "stormPressure";
      colorful.sort((a, b) => (b[3] + b[4] * 0.18) - (a[3] + a[4] * 0.18));
      const selected = [colorful[0], colorful[Math.floor(colorful.length * 0.35)], colorful[Math.floor(colorful.length * 0.7)]].filter(Boolean);
      const colors = (selected.length ? selected : [[r, g, b], [b, r, g], [g, b, r]]).map(([red, green, blue]) => `#${[red, green, blue].map((v) => Math.max(0, Math.min(255, Math.round(v * 1.14))).toString(16).padStart(2, "0")).join("")}`);
      resolve({ auraKey, colors, confidence: Math.round(Math.min(96, Math.max(68, 58 + sat * 0.28 + spread * 0.18))) });
    };
    img.onerror = () => resolve({ auraKey: "neonNightlife", colors: AURAS.neonNightlife.colors, confidence: 72 });
    img.src = imageSrc;
  });
}

function albumArtFor(track) {
  return track?.album?.images?.[0]?.url || track?.album?.images?.[1]?.url || track?.album?.images?.[2]?.url || "";
}

function fallbackArt(colors) {
  const [a, b, c] = colors;
  return `linear-gradient(135deg, ${a}, ${b} 52%, ${c})`;
}

export default function App() {
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const [imageSrc, setImageSrc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [genreSettings, setGenreSettings] = useState(() => {
    try { return { ...DEFAULT_GENRES, ...JSON.parse(safeStorageGet("aura_genres_v2", "{}")) }; } catch { return DEFAULT_GENRES; }
  });

  const colors = result?.colors || (imageSrc ? ["#6d5dfc", "#19d8ff", "#ff3df2"] : ["#6d5dfc", "#19d8ff", "#ff3df2"]);
  const aura = result ? AURAS[result.auraKey] : AURAS.neonNightlife;

  useEffect(() => {
    safeStorageSet("aura_genres_v2", JSON.stringify(genreSettings));
  }, [genreSettings]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const stop = () => setPlaying(false);
    audio.addEventListener("ended", stop);
    audio.addEventListener("pause", stop);
    audio.addEventListener("play", () => setPlaying(true));
    return () => {
      audio.removeEventListener("ended", stop);
      audio.removeEventListener("pause", stop);
    };
  }, []);

  const onFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(String(reader.result || ""));
      setResult(null);
      setError("");
      setPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    };
    reader.readAsDataURL(file);
  }, []);

  const readAura = useCallback(async () => {
    if (!imageSrc || loading) return;
    setLoading(true);
    setError("");
    setPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    try {
      const analysis = await analyzeImage(imageSrc);
      const track = await discoverSpotifyTrack(analysis.auraKey, genreSettings);
      const artist = track.artists?.[0]?.name || "Unknown Artist";
      const song = track.name || "Unknown Track";
      const previewUrl = track.preview_url || await findApplePreview(song, artist);
      const spotifyUrl = track.external_urls?.spotify || `https://open.spotify.com/search/${encodeURIComponent(`${song} ${artist}`)}`;
      const key = trackKey(track);
      rememberTrack(key);

      setResult({
        auraKey: analysis.auraKey,
        colors: analysis.colors?.length ? analysis.colors : (AURAS[analysis.auraKey]?.colors || colors),
        auraName: buildAuraName(analysis.auraKey),
        confidence: analysis.confidence,
        song,
        artist,
        album: track.album?.name || "",
        releaseYear: String(track.album?.release_date || "").slice(0, 4),
        albumArt: albumArtFor(track),
        previewUrl,
        spotifyUrl,
        popularity: track.popularity ?? null,
        insight: `Aura read this image as ${AURAS[analysis.auraKey]?.mood}. The match comes from a live Spotify search, then Aura uses the track color, tempo feel, and mood alignment to pair the image with ${song}.`
      });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Aura could not complete the Spotify match. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [imageSrc, loading, genreSettings, colors]);

  const playPreview = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !result?.previewUrl) return;
    try {
      if (!audio.paused && audio.src === result.previewUrl) {
        audio.pause();
        return;
      }
      audio.pause();
      audio.removeAttribute("crossorigin");
      if (audio.src !== result.previewUrl) audio.src = result.previewUrl;
      audio.currentTime = 0;
      await audio.play();
      setPlaying(true);
    } catch (err) {
      console.error("Preview failed", err);
      setError("Preview could not play in this browser. Open the track on Spotify, or tap Read Aura again for another Spotify match.");
      setPlaying(false);
    }
  }, [result]);

  const toggleGenre = (key) => {
    setGenreSettings((current) => {
      const next = { ...current, [key]: !current[key] };
      return Object.values(next).some(Boolean) ? next : current;
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090a0f] text-white" style={{ "--aura-a": colors[0], "--aura-b": colors[1], "--aura-c": colors[2] }}>
      <audio ref={audioRef} preload="none" playsInline />
      <div className="fixed inset-0 opacity-80 pointer-events-none" style={{ background: `radial-gradient(circle at 25% 10%, ${colors[0]}55, transparent 32%), radial-gradient(circle at 80% 18%, ${colors[1]}44, transparent 30%), radial-gradient(circle at 50% 100%, ${colors[2]}33, transparent 38%), #090a0f` }} />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 pointer-events-none" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-white/45">Aura Reads</p>
            <h1 className="text-2xl font-black tracking-[-0.06em] sm:text-4xl">Turn a photo into a Spotify match.</h1>
          </div>
          <button onClick={() => setSettingsOpen(true)} className="rounded-full border border-white/10 bg-white/10 p-3 backdrop-blur-xl transition hover:bg-white/15" aria-label="Settings">
            <Settings size={20} />
          </button>
        </header>

        <div className="grid flex-1 items-center gap-7 py-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.075] p-4 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] border border-white/10 bg-black/30">
              {imageSrc ? <img src={imageSrc} alt="Uploaded aura source" className="h-full w-full object-cover" /> : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-white/60">
                  <ImagePlus size={42} />
                  <p className="max-w-xs text-sm">Upload a photo first. Aura will read the colors and mood, then search Spotify for a real track.</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01]">
                  <ImagePlus size={18} /> {imageSrc ? "Change photo" : "Upload photo"}
                </button>
                <input ref={fileInputRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <button onClick={readAura} disabled={!imageSrc || loading} className="group relative mb-7 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Read aura">
              <div className="aura-sphere-wrap relative h-56 w-56 sm:h-72 sm:w-72">
                <div className="aura-halo absolute inset-0 rounded-full" />
                <div className="aura-sphere absolute inset-8 rounded-full">
                  <div className="aura-sphere-core absolute inset-0 rounded-full" />
                  <div className="aura-sphere-light absolute inset-0 rounded-full" />
                  <div className="absolute inset-0 z-10 flex items-center justify-center text-3xl font-black tracking-[-0.09em]">AURA</div>
                </div>
              </div>
            </button>

            <button onClick={readAura} disabled={!imageSrc || loading} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 font-black text-black shadow-xl transition hover:scale-[1.02] disabled:opacity-50">
              {loading ? <RefreshCw className="animate-spin" size={19} /> : <Sparkles size={19} />}
              {loading ? "Searching Spotify..." : result ? "Read again" : "Read aura"}
            </button>

            {error && <div className="mb-4 flex max-w-xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-left text-sm text-red-100"><AlertTriangle size={18} className="mt-0.5 shrink-0" />{error}</div>}

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key={`${result.song}-${result.artist}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.34 }} className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-black/30 p-4 text-left shadow-2xl backdrop-blur-xl sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-[148px_1fr]">
                    <div className="aspect-square overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/10" style={!result.albumArt ? { background: fallbackArt(result.colors) } : undefined}>
                      {result.albumArt && <img src={result.albumArt} alt={`${result.song} album art`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-white/40">{aura.name}</p>
                      <h2 className="mt-1 text-4xl font-black tracking-[-0.08em] sm:text-5xl">{result.auraName}</h2>
                      <p className="mt-2 text-sm text-white/55">{aura.mood} · confidence {result.confidence}%</p>
                      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <div className="flex items-start gap-3">
                          <Music className="mt-1 shrink-0 text-white/70" size={20} />
                          <div className="min-w-0">
                            <h3 className="truncate text-xl font-black tracking-[-0.04em]">{result.song}</h3>
                            <p className="truncate text-white/65">{result.artist}{result.releaseYear ? ` · ${result.releaseYear}` : ""}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.previewUrl ? (
                            <button onClick={playPreview} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
                              {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pause preview" : "Play preview"}
                            </button>
                          ) : <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/60">Preview not available</span>}
                          <a href={result.spotifyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">
                            Open Spotify <ExternalLink size={15} />
                          </a>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-white/64">{result.insight}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl text-white/55">No demo tracks. No fake fallback. Upload a photo and Aura will search Spotify live.</motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-md sm:items-center">
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#11131b] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div><h3 className="text-xl font-black tracking-[-0.04em]">Music settings</h3><p className="text-sm text-white/50">Choose which Spotify search lanes Aura can use.</p></div>
                <button onClick={() => setSettingsOpen(false)} className="rounded-full bg-white/10 p-2"><X size={18} /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {GENRES.map((genre) => (
                  <button key={genre.key} onClick={() => toggleGenre(genre.key)} className={`rounded-2xl border p-4 text-left transition ${genreSettings[genre.key] ? "border-white/20 bg-white/15" : "border-white/10 bg-white/[0.04] text-white/45"}`}>
                    <span className="font-bold">{genre.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
