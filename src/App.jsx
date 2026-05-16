import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, Music, RefreshCw, Sparkles, ExternalLink, Play, Pause, Settings, X } from "lucide-react";

const AURA_PROFILES = {
  grungeNoir: {
    auraNames: ["Ghost Frequency", "Chrome Static", "Midnight Blur", "Obsidian Motion", "Black Echo", "Noir Drift", "Static Bloom", "Shadow Signal"],
    mood: "dark · textured · atmospheric",
    colorFallback: ["4f5bff", "15c8ff", "7c3cff"],
    songs: [
      ["After Dark", "Mr.Kitty", "Dark, cold, and hypnotic — the photo reads like low light, shadow, and late-night static."],
      ["Be Quiet and Drive (Far Away)", "Deftones", "Heavy and moody without feeling loud — this matches a grungy image with pressure under the surface."],
      ["SLOW DANCING IN THE DARK", "Joji", "Softly damaged and cinematic — the image feels blue, distant, and emotionally low-lit."],
      ["Space Song", "Beach House", "Dreamy, dark, and floating — a quiet match for shadow-heavy images with emotional softness."],
      ["K.", "Cigarettes After Sex", "Slow, intimate, and monochrome — the image feels like a private nighttime memory."]
    ]
  },
  neonNightlife: {
    auraNames: ["Neon Drift", "Digital Mirage", "Blue Velocity", "Afterhours", "Infrared Echo", "Electric Bloom", "Chrome Horizon", "Signal Rush"],
    mood: "electric · nocturnal · kinetic",
    colorFallback: ["00d5ff", "a855f7", "ff3df2"],
    songs: [
      ["After Hours", "The Weeknd", "Glossy, nocturnal, and electric — this image feels like city light moving through darkness."],
      ["No Pole", "Don Toliver", "Smooth and neon-lit — a good match for flash, nightlife, cars, or after-hours energy."],
      ["Nightcrawler", "Travis Scott", "Dark, crowded, and high-energy — the photo feels loud without needing to say anything."],
      ["Sky", "Playboi Carti", "Bright, synthetic, and chaotic — this matches a colorful, distorted, high-energy image."],
      ["Midnight City", "M83", "Wide, cinematic, and neon — the image feels like motion across a night skyline."]
    ]
  },
  warmDreamscape: {
    auraNames: ["Velvet Bloom", "Golden Reverie", "Soft Gravity", "Afterlight", "Lunar Haze", "Rose Mirage", "Distant Summer", "Warm Static"],
    mood: "warm · nostalgic · soft",
    colorFallback: ["ff7ab6", "ffd166", "ff9f6e"],
    songs: [
      ["Pink + White", "Frank Ocean", "Warm, soft, and nostalgic — the photo feels like sunlight turning into memory."],
      ["Bad Habit", "Steve Lacy", "Casual, warm, and stylish — this fits a soft image with color and personality."],
      ["Get You", "Daniel Caesar", "Romantic and glowing — the image feels close, warm, and emotionally smooth."],
      ["Japanese Denim", "Daniel Caesar", "Slow, intimate, and golden — the photo feels polished but sentimental."],
      ["Snooze", "SZA", "Soft and warm with emotional depth — this fits dreamy, gentle photos."]
    ]
  },
  editorialLuxury: {
    auraNames: ["Silver Theory", "Mirror Aura", "Rare Motion", "Ivory Drift", "Velvet Theory", "Chrome Reverie", "Monochrome Bloom", "Polaroid Silence"],
    mood: "clean · minimal · refined",
    colorFallback: ["d8dce8", "8b5cf6", "44d7ff"],
    songs: [
      ["Nights", "Frank Ocean", "Polished, layered, and cool — the image feels clean but emotionally complex."],
      ["Gravity", "Brent Faiyaz", "Smooth, minimal, and expensive — this matches a refined fashion/editorial image."],
      ["Escapism", "070 Shake", "Cinematic and sleek — the photo feels controlled, glossy, and slightly detached."],
      ["Cellophane", "FKA twigs", "Delicate, dramatic, and editorial — this fits minimal images with emotional tension."],
      ["Retrograde", "James Blake", "Cold, elegant, and atmospheric — a match for clean composition and restrained color."]
    ]
  },
  stormPressure: {
    auraNames: ["Static Horizon", "Blue Mirage", "Soft Voltage", "Storm Theory", "Lowlight", "Cobalt Echo", "Slow Pressure", "Drift Signal"],
    mood: "cool · focused · heavy",
    colorFallback: ["536dfe", "35d3ff", "28314f"],
    songs: [
      ["90210", "Travis Scott", "Layered and cinematic — calm on the surface, but heavy underneath."],
      ["A.D.H.D", "Kendrick Lamar", "Focused, atmospheric, and cool — the photo feels composed but loaded."],
      ["Resonance", "HOME", "Cool, distant, and reflective — this fits blue-toned images with quiet pressure."],
      ["LVL", "A$AP Rocky", "Dark, stylish, and understated — a fit for muted images with confidence."],
      ["Ghost Town", "Kanye West", "Emotional and textured — the photo feels imperfect, big, and human."]
    ]
  }
};

const PROFILE_ORDER = ["grungeNoir", "neonNightlife", "warmDreamscape", "editorialLuxury", "stormPressure"];

const ARTIST_SUMMARIES = {
  "Mr.Kitty": "Dark synth-pop with a hypnotic late-night glow.",
  "Deftones": "Heavy, atmospheric, and emotionally charged.",
  "Joji": "Melancholic alt-pop with cinematic sadness.",
  "Beach House": "Dreamy indie pop that feels soft and weightless.",
  "Cigarettes After Sex": "Minimal, intimate, and slow-burning.",
  "The Weeknd": "Nocturnal pop with glossy, cinematic energy.",
  "Don Toliver": "Smooth melodic rap with neon atmosphere.",
  "Travis Scott": "Dark, spacious, and highly textured rap production.",
  "Playboi Carti": "Chaotic, bright, and high-energy rap aesthetics.",
  "M83": "Wide-screen synth music with nostalgic emotion.",
  "Frank Ocean": "Genre-blending soul with emotional detail and elegance.",
  "Steve Lacy": "Stylish, warm, and groove-heavy alternative R&B.",
  "Daniel Caesar": "Romantic soul with soft, golden warmth.",
  "SZA": "Velvety R&B with honest emotional depth.",
  "Brent Faiyaz": "Sleek R&B with cool, expensive confidence.",
  "070 Shake": "Cinematic, moody, and futuristic alt-pop.",
  "FKA twigs": "Delicate, experimental, and visually dramatic.",
  "James Blake": "Minimal electronic soul with cold atmosphere.",
  "Kendrick Lamar": "Sharp storytelling with layered emotional weight.",
  "HOME": "Retro electronic music with calm, nostalgic distance.",
  "A$AP Rocky": "Stylish rap with dark, fashion-forward texture.",
  "Kanye West": "Bold, emotional, and genre-shifting production."
};

function getArtistSummary(artist = "") {
  return ARTIST_SUMMARIES[artist] || "A fitting artist match for the mood, color, and energy of this aura.";
}

function getAuraDescription(result) {
  if (!result) return "";
  if (result.aiInsight) return result.aiInsight;
  const mood = result.mood || "emotional · visual · cinematic";
  return `This aura leans ${mood}. It feels like ${result.song} because the image carries the same color pressure, emotional temperature, and visual rhythm.`;
}

function auraTypographyClass(auraKey = "") {
  if (auraKey === "editorialLuxury") return "font-light tracking-[-0.04em]";
  if (auraKey === "neonNightlife") return "font-black tracking-[-0.08em]";
  if (auraKey === "warmDreamscape") return "font-semibold tracking-[-0.06em]";
  if (auraKey === "stormPressure") return "font-bold tracking-[-0.07em]";
  return "font-semibold tracking-[-0.07em]";
}


const AURA_ENVIRONMENTS = {
  grungeNoir: {
    overlay: "rgba(4,4,6,.22)",
    blur: "120px",
    opacity: 0.22
  },
  neonNightlife: {
    overlay: "rgba(0,16,38,.16)",
    blur: "140px",
    opacity: 0.36
  },
  warmDreamscape: {
    overlay: "rgba(40,14,8,.12)",
    blur: "130px",
    opacity: 0.26
  },
  editorialLuxury: {
    overlay: "rgba(255,255,255,.04)",
    blur: "160px",
    opacity: 0.14
  },
  stormPressure: {
    overlay: "rgba(12,20,42,.16)",
    blur: "145px",
    opacity: 0.24
  }
};



const IOS_EASE = [0.22, 1, 0.36, 1];
const SOFT_SPRING = { type: "spring", stiffness: 72, damping: 20, mass: 1.05 };
const CASCADE_EASE = [0.16, 1, 0.3, 1];

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function rgbToHex(r, g, b) {
  return [r, g, b]
    .map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0"))
    .join("");
}

function readableAccent(hex) {
  return `#${hex}`;
}

function generatedAlbumArt(song, artist, colors) {
  const [a, b, c] = colors;
  const safeSong = song.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const safeArtist = artist.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const initials = song.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#${a}'/>
        <stop offset='52%' stop-color='#${b}'/>
        <stop offset='100%' stop-color='#${c}'/>
      </linearGradient>
      <radialGradient id='shine' cx='38%' cy='28%' r='70%'>
        <stop offset='0%' stop-color='rgba(255,255,255,.65)'/>
        <stop offset='38%' stop-color='rgba(255,255,255,.12)'/>
        <stop offset='100%' stop-color='rgba(0,0,0,.74)'/>
      </radialGradient>
      <filter id='blur'><feGaussianBlur stdDeviation='28'/></filter>
    </defs>
    <rect width='800' height='800' fill='#171717'/>
    <circle cx='190' cy='160' r='310' fill='url(#g)' opacity='.95' filter='url(#blur)'/>
    <circle cx='650' cy='650' r='360' fill='url(#g)' opacity='.58' filter='url(#blur)'/>
    <circle cx='420' cy='250' r='230' fill='#ffffff' opacity='.08' filter='url(#blur)'/>
    <rect width='800' height='800' fill='url(#shine)'/>
    <circle cx='400' cy='355' r='205' fill='rgba(0,0,0,.26)' stroke='rgba(255,255,255,.28)' stroke-width='2'/>
    <text x='400' y='397' text-anchor='middle' font-family='Arial,sans-serif' font-size='112' font-weight='900' fill='white' letter-spacing='-10'>${initials}</text>
    <text x='64' y='660' font-family='Arial,sans-serif' font-size='44' font-weight='900' fill='white'>${safeSong}</text>
    <text x='64' y='715' font-family='Arial,sans-serif' font-size='30' font-weight='500' fill='rgba(255,255,255,.65)'>${safeArtist}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      mode: "cors",
      signal: controller.signal,
      ...options
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function cleanQuery(value = "") {
  return value
    .replace(/\(.*?\)/g, " ")
    .replace(/feat\..*$/i, " ")
    .replace(/ft\..*$/i, " ")
    .replace(/[^a-z0-9\s&'-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bestMusicMatch(results, song, artist) {
  const normalizedSong = cleanQuery(song).toLowerCase();
  const artistLead = cleanQuery(artist).toLowerCase().split(" ")[0];

  const withPreview = results.filter((item) => item.previewUrl || item.preview);

  return (
    withPreview.find((item) => {
      const trackName = (item.trackName || item.title || "").toLowerCase();
      const artistName = (item.artistName || item.artist?.name || "").toLowerCase();
      return trackName.includes(normalizedSong.slice(0, Math.min(12, normalizedSong.length))) && artistName.includes(artistLead);
    }) ||
    withPreview.find((item) => {
      const artistName = (item.artistName || item.artist?.name || "").toLowerCase();
      return artistName.includes(artistLead);
    }) ||
    withPreview[0]
  );
}


function bestSpotifyTrack(tracks = [], song, artist) {
  const normalizedSong = cleanQuery(song).toLowerCase();
  const artistLead = cleanQuery(artist).toLowerCase().split(" ")[0];

  return (
    tracks.find((track) => {
      const trackName = cleanQuery(track?.name || "").toLowerCase();
      const artistNames = (track?.artists || []).map((a) => cleanQuery(a?.name || "").toLowerCase()).join(" ");
      return trackName.includes(normalizedSong.slice(0, Math.min(12, normalizedSong.length))) && artistNames.includes(artistLead);
    }) ||
    tracks.find((track) => {
      const artistNames = (track?.artists || []).map((a) => cleanQuery(a?.name || "").toLowerCase()).join(" ");
      return artistNames.includes(artistLead);
    }) ||
    tracks[0]
  );
}

async function fetchSpotifyMedia(song, artist) {
  try {
    const params = new URLSearchParams({ song: cleanQuery(song), artist: cleanQuery(artist) });
    const data = await fetchJson(`/api/spotify-search?${params.toString()}`);
    const track = bestSpotifyTrack(data?.tracks || [], song, artist);

    if (!track) return {};

    const albumImages = track.album?.images || [];
    const artistImages = data?.artist?.images || [];
    const releaseDate = track.album?.release_date || "";

    return {
      albumArt: albumImages[0]?.url || albumImages[1]?.url || "",
      previewUrl: track.preview_url || "",
      spotifyUrl: track.external_urls?.spotify || "",
      spotifyTrackId: track.id || "",
      collectionName: track.album?.name || "",
      popularity: track.popularity ?? null,
      releaseYear: releaseDate ? releaseDate.slice(0, 4) : "",
      genres: Array.isArray(track.artistGenres) && track.artistGenres.length
        ? track.artistGenres.slice(0, 6)
        : (Array.isArray(data?.artist?.genres) ? data.artist.genres.slice(0, 6) : []),
      artistImage: track.artistImage || artistImages[0]?.url || artistImages[1]?.url || "",
      artistFollowers: track.artistFollowers ?? data?.artistFollowers ?? data?.artist?.followers?.total ?? 0,
      availableMarkets: Array.isArray(track.available_markets) ? track.available_markets : [],
      spotifyVerified: true
    };
  } catch (error) {
    console.warn("Spotify lookup failed", error);
    return {};
  }
}

async function fetchItunesMedia(song, artist) {
  const queries = [
    `${cleanQuery(song)} ${cleanQuery(artist)}`,
    `${cleanQuery(artist)} ${cleanQuery(song)}`,
    `"${cleanQuery(song)}" "${cleanQuery(artist)}"`,
    cleanQuery(song)
  ].filter(Boolean);

  for (const rawQuery of queries) {
    try {
      const query = encodeURIComponent(rawQuery);
      const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&country=US&limit=35`;
      const data = await fetchJson(url);
      const results = Array.isArray(data?.results) ? data.results : [];
      const match = bestMusicMatch(results, song, artist);

      if (!match?.previewUrl) continue;

      return {
        albumArt: match.artworkUrl100?.replace("100x100bb", "600x600bb") || "",
        previewUrl: match.previewUrl.replace("http://", "https://"),
        appleMusicUrl: match.trackViewUrl || "",
        collectionName: match.collectionName || ""
      };
    } catch (error) {
      console.warn("iTunes preview lookup failed", rawQuery, error);
    }
  }

  return {};
}

async function fetchDeezerMedia(song, artist) {
  const query = encodeURIComponent(`${cleanQuery(artist)} ${cleanQuery(song)}`);
  const deezerUrl = `https://api.deezer.com/search?q=${query}&limit=25`;
  const urls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(deezerUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`
  ];

  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      const results = Array.isArray(data?.data) ? data.data : [];
      const match = bestMusicMatch(results, song, artist);

      if (!match?.preview) continue;

      return {
        albumArt: match.album?.cover_big || match.album?.cover_medium || "",
        previewUrl: match.preview.replace("http://", "https://"),
        appleMusicUrl: match.link || "",
        collectionName: match.album?.title || ""
      };
    } catch (error) {
      console.warn("Deezer preview lookup failed", error);
    }
  }

  return {};
}


async function fetchSongMedia(song, artist) {
  const spotifyMedia = await fetchSpotifyMedia(song, artist);

  if (spotifyMedia?.previewUrl) {
    return spotifyMedia;
  }

  const previewSources = [
    () => fetchItunesMedia(song, artist),
    () => fetchDeezerMedia(song, artist)
  ];

  for (const source of previewSources) {
    const previewMedia = await source();

    if (previewMedia?.previewUrl) {
      return {
        ...spotifyMedia,
        ...previewMedia,
        albumArt: spotifyMedia.albumArt || previewMedia.albumArt,
        spotifyUrl: spotifyMedia.spotifyUrl || previewMedia.spotifyUrl || "",
        collectionName: spotifyMedia.collectionName || previewMedia.collectionName || ""
      };
    }
  }

  return spotifyMedia || {};
}


const DEFAULT_GENRE_SETTINGS = {
  rbSoul: true,
  rapHipHop: true,
  indieAlt: true,
  electronic: true,
  pop: true,
  rock: true,
  cinematic: true
};

const GENRE_OPTIONS = [
  { key: "rbSoul", label: "R&B / Soul", terms: ["alternative r&b", "neo soul", "smooth r&b", "soulful"] },
  { key: "rapHipHop", label: "Rap / Hip-Hop", terms: ["hip hop", "rap", "cloud rap", "melodic rap"] },
  { key: "indieAlt", label: "Indie / Alt", terms: ["indie", "alternative", "bedroom pop", "shoegaze"] },
  { key: "electronic", label: "Electronic", terms: ["electronic", "synthwave", "darkwave", "ambient electronic"] },
  { key: "pop", label: "Pop", terms: ["dark pop", "alt pop", "dream pop", "pop"] },
  { key: "rock", label: "Rock", terms: ["alternative rock", "post punk", "grunge", "guitar"] },
  { key: "cinematic", label: "Cinematic", terms: ["cinematic", "atmospheric", "night drive", "moody soundtrack"] }
];

const GENRE_MATCHERS = {
  rbSoul: ["r&b", "rnb", "soul", "neo soul", "quiet storm", "funk", "motown"],
  rapHipHop: ["hip-hop", "hip hop", "rap", "trap", "drill", "cloud rap", "melodic rap"],
  indieAlt: ["indie", "alternative", "bedroom pop", "shoegaze", "lo-fi", "lofi"],
  electronic: ["electronic", "electronica", "dance", "edm", "house", "techno", "synth", "synthwave", "darkwave", "ambient"],
  pop: ["pop", "hyperpop", "dream pop", "alt pop"],
  rock: ["rock", "punk", "grunge", "metal", "guitar", "post-punk", "post punk"],
  cinematic: ["soundtrack", "score", "cinematic", "orchestral", "movie", "film", "instrumental", "atmospheric"]
};

const STRICT_GENRE_QUERY_POOLS = {
  rbSoul: [
    "US alternative r&b", "US neo soul", "modern r&b", "popular r&b", "smooth r&b", "r&b soul", "r&b chill", "r&b night drive"
  ],
  rapHipHop: [
    "US hip hop", "US rap", "popular rap", "melodic rap", "cloud rap", "trap rap", "rap night drive", "hip hop hits"
  ],
  indieAlt: [
    "US indie alternative", "indie pop", "alternative indie", "bedroom pop", "shoegaze", "alt indie", "indie chill", "alternative hits"
  ],
  electronic: [
    "electronic US", "synthwave", "darkwave", "ambient electronic", "electropop", "electronic night drive", "dance electronic", "chill electronic"
  ],
  pop: [
    "US pop", "popular pop", "alt pop", "dark pop", "dream pop", "pop hits", "modern pop", "indie pop"
  ],
  rock: [
    "US alternative rock", "modern rock", "post punk", "grunge rock", "rock hits", "guitar alternative", "shoegaze rock", "indie rock"
  ],
  cinematic: [
    "cinematic atmospheric", "movie soundtrack", "instrumental cinematic", "score ambient", "moody soundtrack", "atmospheric instrumental", "cinematic electronic", "night drive soundtrack"
  ]
};

const AURA_NAME_WORDS = {
  grungeNoir: {
    left: ["Ghost", "Obsidian", "Black", "Static", "Noir", "Ash", "Midnight", "Velvet", "Shadow", "Chrome", "Grave", "Smoke", "Vanta", "Feral", "Hollow", "Raven", "Crypt", "Phantom", "Tar", "Onyx", "Eclipse", "Wraith", "Bruise", "Ink", "Cathedral", "Basement", "Dagger", "Moth", "Lowlight", "Charcoal", "Nightmare", "Cinder"],
    right: ["Frequency", "Echo", "Drift", "Signal", "Bloom", "Pressure", "Theory", "Mirage", "Pulse", "Haze", "Ritual", "Current", "Weather", "Halo", "Afterimage", "Static", "Cinema", "Orbit", "Undertow", "Lullaby", "Memory", "Artifact", "Silhouette", "Syndrome", "Wavelength", "Monolith", "Vapor", "Corridor", "Field", "Language", "Gravity", "Whisper"]
  },
  neonNightlife: {
    left: ["Neon", "Electric", "Infrared", "Digital", "Afterhours", "Laser", "Chrome", "Ultraviolet", "Signal", "City", "Cyber", "Plasma", "Vapor", "Prism", "Blue", "Motion", "Strobe", "Pixel", "Arcade", "Violet", "Turbo", "Metro", "Hologram", "Photon", "Glass", "Pulse", "Circuit", "Nightclub", "Flash", "Velocity", "Spectrum", "Voltage"],
    right: ["Rush", "Mirage", "Pulse", "Drift", "Bloom", "Velocity", "Horizon", "Aura", "Signal", "Current", "Flare", "Weather", "Glow", "Circuit", "Flash", "Dream", "Transmission", "Highway", "Engine", "Afterglow", "Portal", "Skyline", "Radar", "Overdrive", "Frequency", "Sequence", "Orbit", "Comet", "Spark", "Reflection", "Nightfall", "Surge"]
  },
  warmDreamscape: {
    left: ["Golden", "Velvet", "Rose", "Honey", "Solar", "Soft", "Blush", "Amber", "Summer", "Lunar", "Peach", "Halo", "Dream", "Afterlight", "Warm", "Memory", "Apricot", "Sunset", "Dove", "Satin", "Candle", "Meadow", "Pearl", "Sunday", "Lavender", "Honeydew", "Cotton", "Daylight", "Petal", "Glow", "Pastel", "Tender"],
    right: ["Reverie", "Bloom", "Gravity", "Haze", "Mirage", "Glow", "Drift", "Weather", "Pulse", "Garden", "Echo", "Aura", "Daydream", "Signal", "Mist", "Field", "Window", "Summer", "Archive", "Letter", "Horizon", "Afterglow", "Tide", "Memory", "Language", "Orbit", "Fever", "Serenade", "Room", "Whisper", "Light", "Song"]
  },
  editorialLuxury: {
    left: ["Silver", "Mirror", "Ivory", "Rare", "Chrome", "Velvet", "Pearl", "Glass", "Quiet", "Monochrome", "Platinum", "Editorial", "Satin", "Marble", "Crystal", "Luxe", "Runway", "Atelier", "Gallery", "Caviar", "Diamond", "Noir", "Minimal", "Silk", "Opal", "Studio", "Polished", "Velour", "Carbon", "Muse", "Archive", "Sterling"],
    right: ["Theory", "Aura", "Drift", "Motion", "Reverie", "Silence", "Bloom", "Frame", "Signal", "Composition", "Halo", "Muse", "Archive", "Pressure", "Poise", "Reflection", "Editorial", "Index", "Portrait", "Monument", "Gesture", "Surface", "Room", "Exposure", "Negative", "Study", "Angle", "House", "Stillness", "Formula", "Suite", "Afterimage"]
  },
  stormPressure: {
    left: ["Storm", "Cobalt", "Blue", "Static", "Lowlight", "Cold", "Thunder", "Mercury", "Steel", "Rain", "Magnetic", "Tidal", "Grey", "Voltage", "Night", "Pressure", "Arctic", "Flood", "Iron", "Cloud", "Tempest", "Concrete", "Slate", "Wave", "Distant", "Heavy", "Mineral", "North", "Fog", "Current", "Polar", "Ion"],
    right: ["Horizon", "Echo", "Voltage", "Theory", "Signal", "Field", "Current", "Weather", "Mirage", "Pulse", "Drift", "Weight", "Aura", "Bloom", "Static", "Focus", "Front", "Pressure", "Depth", "Undertow", "System", "Signal", "Forecast", "Gravity", "Tension", "Rainfall", "Transmission", "Crown", "Wake", "Engine", "Trace", "Surge"]
  }
};

function getRecentAuraNames(limit = 24) {
  try {
    const history = JSON.parse(safeLocalStorageGet("aura_history", "[]") || "[]");
    return new Set(history.slice(0, limit).map((item) => String(item.aura || "").toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function generateAuraName(auraKey = "grungeNoir", imageBrain = null) {
  const bank = AURA_NAME_WORDS[auraKey] || AURA_NAME_WORDS.grungeNoir;
  const recent = getRecentAuraNames(30);
  const moodWords = [imageBrain?.energyLabel, imageBrain?.textureLabel, imageBrain?.temperatureLabel, imageBrain?.lightLabel, imageBrain?.compositionLabel, imageBrain?.paceLabel]
    .filter(Boolean)
    .map((word) => String(word).split(/\s+/)[0])
    .filter((word) => word.length > 2);

  const leftPool = shuffleItems([...bank.left, ...moodWords]);
  const rightPool = shuffleItems(bank.right);

  for (const left of leftPool) {
    for (const right of rightPool) {
      const name = `${left} ${right}`.replace(/\b\w/g, (char) => char.toUpperCase());
      if (!recent.has(name.toLowerCase())) return name;
    }
  }

  return `${randomItem(bank.left)} ${randomItem(bank.right)} ${Math.floor(10 + Math.random() * 89)}`;
}


const US_MAINSTREAM_FILTER = {
  market: "US",
  // Spotify does not expose total lifetime plays through the public Web API.
  // This uses artist followers + track popularity as the reliable gate instead.
  minArtistFollowers: 30000,
  minTrackPopularity: 20
};

const SPOTIFY_DISCOVERY_QUERY_LIMIT = 10;
const SPOTIFY_DISCOVERY_PICK_POOL = 70;

function scoreSpotifyCandidate(track = {}) {
  const popularity = Number(track.popularity ?? 0);
  const followers = Number(track.artistFollowers ?? 0);
  const followerScore = Math.min(45, Math.log10(Math.max(1, followers)) * 7);
  const previewBonus = track.preview_url ? 9 : 0;
  const artBonus = track.album?.images?.length ? 4 : 0;
  const randomNoise = Math.random() * 26;
  return popularity + followerScore + previewBonus + artBonus + randomNoise;
}

function spotifyTrackGenreLooksAllowed(track = {}, searchGenreKey, genreSettings = DEFAULT_GENRE_SETTINGS) {
  if (!genreAllowedForSettings([searchGenreKey].filter(Boolean), genreSettings, true)) return false;

  const artistGenres = Array.isArray(track.artistGenres) ? track.artistGenres : [];
  if (!artistGenres.length) return true;

  const matchedKeys = genreKeysFromText(artistGenres.join(" "));
  if (!matchedKeys.length) return true;
  return matchedKeys.includes(searchGenreKey) && genreAllowedForSettings(matchedKeys, genreSettings, true);
}

function isUsMarketTrack(metadata = {}) {
  const markets = metadata.availableMarkets || metadata.available_markets || [];
  if (!Array.isArray(markets) || !markets.length) return true;
  return markets.includes("US");
}

function isUsMainstreamEligible(metadata = {}, strict = true) {
  const popularity = Number(metadata.popularity ?? metadata.spotifyPopularity ?? -1);
  const followers = Number(metadata.artistFollowers ?? metadata.followers ?? 0);
  const hasSpotifyProof = Boolean(metadata.spotifyTrackId || metadata.spotifyUrl || metadata.spotifyVerified);

  if (!strict && !hasSpotifyProof) return true;
  if (!hasSpotifyProof) return false;
  if (!isUsMarketTrack(metadata)) return false;
  if (!Number.isFinite(popularity) || popularity < US_MAINSTREAM_FILTER.minTrackPopularity) return false;
  if (!Number.isFinite(followers) || followers < US_MAINSTREAM_FILTER.minArtistFollowers) return false;
  return true;
}


function hasProviderArtworkOrPreview(metadata = {}) {
  return Boolean(metadata.albumArt || metadata.previewUrl || metadata.appleMusicUrl || metadata.spotifyUrl);
}

function isLiveDiscoveryEligible(metadata = {}) {
  // Spotify proof is ideal, but Apple/iTunes US and Deezer often provide better previews/artwork.
  // If Spotify data exists, enforce the US-mainstream gate. If it does not, do not kill the live result
  // just to fall back to the tiny demo pool.
  if (metadata.spotifyTrackId || metadata.spotifyVerified || metadata.spotifyUrl) {
    return isUsMainstreamEligible(metadata, true);
  }
  return hasProviderArtworkOrPreview(metadata);
}

const SONG_GENRE_KEYS = {
  "after dark::mr.kitty": ["electronic"],
  "be quiet and drive far away::deftones": ["rock"],
  "slow dancing in the dark::joji": ["pop", "indieAlt"],
  "space song::beach house": ["indieAlt", "pop"],
  "k::cigarettes after sex": ["indieAlt"],
  "after hours::the weeknd": ["pop", "rbSoul"],
  "no pole::don toliver": ["rapHipHop", "rbSoul"],
  "nightcrawler::travis scott": ["rapHipHop"],
  "sky::playboi carti": ["rapHipHop"],
  "midnight city::m83": ["electronic", "pop"],
  "pink white::frank ocean": ["rbSoul"],
  "bad habit::steve lacy": ["rbSoul", "indieAlt"],
  "get you::daniel caesar": ["rbSoul"],
  "japanese denim::daniel caesar": ["rbSoul"],
  "snooze::sza": ["rbSoul"],
  "nights::frank ocean": ["rbSoul"],
  "gravity::brent faiyaz": ["rbSoul"],
  "escapism::070 shake": ["pop", "electronic"],
  "cellophane::fka twigs": ["pop", "electronic"],
  "retrograde::james blake": ["electronic", "rbSoul"],
  "90210::travis scott": ["rapHipHop"],
  "adhd::kendrick lamar": ["rapHipHop"],
  "resonance::home": ["electronic"],
  "lvl::a$ap rocky": ["rapHipHop"],
  "ghost town::kanye west": ["rapHipHop", "pop"]
};

function normalizeGenreSettings(value = {}) {
  const merged = { ...DEFAULT_GENRE_SETTINGS, ...(value || {}) };
  const hasEnabled = Object.values(merged).some(Boolean);
  return hasEnabled ? merged : { ...DEFAULT_GENRE_SETTINGS };
}

function enabledGenreKeys(settings = DEFAULT_GENRE_SETTINGS) {
  const safeSettings = normalizeGenreSettings(settings);
  return GENRE_OPTIONS.filter((genre) => safeSettings[genre.key]).map((genre) => genre.key);
}

function enabledGenreTerms(settings = DEFAULT_GENRE_SETTINGS) {
  const safeSettings = normalizeGenreSettings(settings);
  return GENRE_OPTIONS
    .filter((genre) => safeSettings[genre.key])
    .flatMap((genre) => genre.terms.map((term) => ({ term, key: genre.key })));
}

function compactGenreText(value = "") {
  return cleanQuery(String(value)).toLowerCase().replace(/[-_]+/g, " ");
}

function genreKeysFromText(value = "") {
  const text = compactGenreText(value);
  if (!text) return [];

  return Object.entries(GENRE_MATCHERS)
    .filter(([, matchers]) => matchers.some((matcher) => text.includes(matcher)))
    .map(([key]) => key);
}

function trackGenreKeys(song = "", artist = "", metadata = {}) {
  const knownKey = normalizeTrackKey(song, artist).replace(/[().]/g, "").replace(/\s+/g, " ");
  const known = SONG_GENRE_KEYS[knownKey] || SONG_GENRE_KEYS[normalizeTrackKey(song, artist)];
  const sourceKeys = [metadata.searchGenreKey, metadata.genreKey].filter((key) => GENRE_MATCHERS[key]);
  const primaryKeys = genreKeysFromText(metadata.primaryGenreName || "");
  const spotifyGenreKeys = genreKeysFromText((Array.isArray(metadata.genres) ? metadata.genres : []).join(" "));
  const albumKeys = genreKeysFromText([metadata.collectionName, metadata.albumTitle].filter(Boolean).join(" "));

  // For live discovery, the enabled genre bucket is the strict source of truth.
  // Provider genre metadata is inconsistent and often too broad, so it is used mainly for demo/known tracks.
  if (sourceKeys.length) return [...new Set(sourceKeys)];
  if (known?.length) return [...new Set(known)];
  if (primaryKeys.length) return [...new Set(primaryKeys)];
  if (spotifyGenreKeys.length) return [...new Set(spotifyGenreKeys)];
  if (albumKeys.length) return [...new Set(albumKeys)];
  return [];
}

function genreAllowedForSettings(keys = [], settings = DEFAULT_GENRE_SETTINGS, strictUnknown = false) {
  const enabled = new Set(enabledGenreKeys(settings));
  if (!keys.length) return !strictUnknown;
  return keys.some((key) => enabled.has(key));
}

function isTrackAllowedByGenre(song = "", artist = "", metadata = {}, settings = DEFAULT_GENRE_SETTINGS, strictUnknown = false) {
  return genreAllowedForSettings(trackGenreKeys(song, artist, metadata), settings, strictUnknown);
}

const AURA_DISCOVERY = {
  grungeNoir: {
    queries: [
      "darkwave synth pop night drive",
      "shoegaze alternative rock moody",
      "post punk dark atmospheric",
      "deftones radio moody alternative",
      "gothic electronic cold wave"
    ],
    reasons: [
      "This match was discovered live from the dark, textured side of the aura — not pulled from the demo pool.",
      "The image reads shadowy and atmospheric, so Aura searched for a fresh track with late-night pressure.",
      "This track fits the low-light texture and emotional static inside the photo."
    ]
  },
  neonNightlife: {
    queries: [
      "night drive rap neon",
      "after hours r&b dark pop",
      "hyperpop electronic nightlife",
      "club rap nocturnal",
      "synthwave midnight city pop"
    ],
    reasons: [
      "Aura found this through a live nightlife search because the image feels electric, fast, and after-hours.",
      "The photo has neon motion, so this fresh match leans glossy, nocturnal, and kinetic.",
      "This track matches the bright signal and city-light energy in the image."
    ]
  },
  warmDreamscape: {
    queries: [
      "warm r&b dreamy",
      "indie soul sunset nostalgic",
      "soft pop romantic",
      "alternative r&b golden",
      "bedroom pop warm dreamy"
    ],
    reasons: [
      "Aura searched fresh warm and dreamy tracks because the photo feels soft, nostalgic, and glowing.",
      "This match carries the same golden emotional temperature as the image.",
      "The colors feel warm and intimate, so Aura pulled a fresh soft track instead of a demo pick."
    ]
  },
  editorialLuxury: {
    queries: [
      "minimal r&b luxury",
      "fashion editorial electronic",
      "sleek alternative r&b",
      "art pop cinematic elegant",
      "minimal electronic soul"
    ],
    reasons: [
      "Aura discovered this from a clean editorial search because the image feels polished and refined.",
      "The photo reads controlled, glossy, and minimal, so this fresh match carries that luxury mood.",
      "This track fits the image's sleek composition and restrained color pressure."
    ]
  },
  stormPressure: {
    queries: [
      "moody rap atmospheric",
      "blue electronic reflective",
      "cinematic hip hop dark",
      "cloud rap atmospheric",
      "ambient trap moody"
    ],
    reasons: [
      "Aura searched live for cool, heavy, atmospheric tracks because the image feels focused and loaded.",
      "This fresh match fits the blue pressure and quiet weight of the photo.",
      "The image has storm energy, so Aura pulled a track with calm surface and heavy undertone."
    ]
  }
};

function randomItem(items = []) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleItems(items = []) {
  return [...items].sort(() => Math.random() - 0.5);
}

function discoveryReason(auraKey) {
  const pool = AURA_DISCOVERY[auraKey] || AURA_DISCOVERY.grungeNoir;
  return randomItem(pool.reasons) || "Aura discovered this track live from the mood, color, and energy of the image.";
}

function normalizeTrackKey(song = "", artist = "") {
  return `${cleanQuery(song).toLowerCase()}::${cleanQuery(artist).toLowerCase()}`;
}

function normalizeDiscoveryTrack(track = {}) {
  return {
    song: track.song || "Unknown Track",
    artist: track.artist || "Unknown Artist",
    albumArt: track.albumArt || "",
    previewUrl: track.previewUrl || "",
    appleMusicUrl: track.appleMusicUrl || "",
    collectionName: track.collectionName || "",
    genreKey: track.genreKey || "",
    searchGenreKey: track.searchGenreKey || track.genreKey || "",
    primaryGenreName: track.primaryGenreName || "",
    spotifyUrl: track.spotifyUrl || "",
    spotifyTrackId: track.spotifyTrackId || "",
    popularity: track.popularity ?? null,
    releaseYear: track.releaseYear || "",
    genres: track.genres || [],
    artistImage: track.artistImage || "",
    artistFollowers: track.artistFollowers ?? 0,
    availableMarkets: track.availableMarkets || [],
    spotifyVerified: !!track.spotifyVerified
  };
}

function getRecentSongKeys(limit = 18) {
  try {
    const history = JSON.parse(safeLocalStorageGet("aura_history", "[]") || "[]");
    return new Set(
      history
        .slice(0, limit)
        .map((item) => normalizeTrackKey(item.song, item.artist))
        .filter((key) => key !== "::")
    );
  } catch {
    return new Set();
  }
}

function isExcludedTrack(song, artist, excludedKeys = new Set()) {
  return excludedKeys.has(normalizeTrackKey(song, artist));
}

function discoveryQueriesForAura(auraKey, genreSettings = DEFAULT_GENRE_SETTINGS, imageBrain = null) {
  const pool = AURA_DISCOVERY[auraKey] || AURA_DISCOVERY.grungeNoir;
  const enabledKeys = enabledGenreKeys(genreSettings);
  const intelligenceTerms = [
    imageBrain?.energyLabel,
    imageBrain?.lightLabel,
    imageBrain?.textureLabel,
    imageBrain?.temperatureLabel,
    imageBrain?.compositionLabel,
    imageBrain?.paceLabel,
    ...(Array.isArray(imageBrain?.searchTerms) ? imageBrain.searchTerms : []),
    "moody",
    "night drive",
    "atmospheric"
  ].filter(Boolean);

  const expanded = enabledKeys.flatMap((genreKey) => {
    const strictTerms = STRICT_GENRE_QUERY_POOLS[genreKey] || [];
    return strictTerms.flatMap((term) => {
      const auraTerm = randomItem(pool.queries) || "atmospheric music";
      const smartTerm = randomItem(intelligenceTerms) || "moody";
      return [
        { text: `${term} ${smartTerm}`, genreKey },
        { text: `${term} ${auraTerm}`, genreKey },
        { text: `${term} US popular`, genreKey },
        { text: `${term} playlist`, genreKey }
      ];
    });
  });

  const seen = new Set();
  return shuffleItems(expanded.filter((item) => {
    const key = `${item.genreKey}::${item.text}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
}

function resilientSpotifyQueries(auraKey, genreSettings = DEFAULT_GENRE_SETTINGS, imageBrain = null) {
  const enabledKeys = enabledGenreKeys(genreSettings);
  const byGenre = {
    rbSoul: ["r&b", "alternative r&b", "soul", "artist:SZA", "artist:Frank Ocean", "artist:Brent Faiyaz", "artist:Daniel Caesar", "artist:Steve Lacy"],
    rapHipHop: ["hip hop", "rap", "melodic rap", "artist:Drake", "artist:Travis Scott", "artist:Kendrick Lamar", "artist:Don Toliver", "artist:Metro Boomin"],
    indieAlt: ["indie", "alternative", "bedroom pop", "artist:Beach House", "artist:Tame Impala", "artist:The Neighbourhood", "artist:Clairo"],
    electronic: ["electronic", "synthwave", "dance", "artist:Daft Punk", "artist:Calvin Harris", "artist:ODESZA", "artist:Kaytranada", "artist:M83"],
    pop: ["pop", "alt pop", "dream pop", "artist:The Weeknd", "artist:Billie Eilish", "artist:Dua Lipa", "artist:Post Malone", "artist:Doja Cat"],
    rock: ["alternative rock", "rock", "shoegaze", "artist:Deftones", "artist:Arctic Monkeys", "artist:Paramore", "artist:The 1975"],
    cinematic: ["cinematic", "soundtrack", "atmospheric", "artist:Hans Zimmer", "artist:Ludwig Göransson", "artist:M83", "artist:James Blake"]
  };

  const smartTerms = [
    imageBrain?.energyLabel,
    imageBrain?.lightLabel,
    imageBrain?.textureLabel,
    imageBrain?.temperatureLabel,
    imageBrain?.compositionLabel,
    imageBrain?.paceLabel,
    ...(Array.isArray(imageBrain?.searchTerms) ? imageBrain.searchTerms : [])
  ].filter(Boolean).slice(0, 4);

  const auraQueries = discoveryQueriesForAura(auraKey, genreSettings, imageBrain).slice(0, 8);
  const genreQueries = enabledKeys.flatMap((genreKey) => {
    const anchors = byGenre[genreKey] || ["popular music"];
    return anchors.flatMap((anchor) => [
      { text: anchor, genreKey },
      { text: `${anchor} ${randomItem(smartTerms) || "popular"}`, genreKey }
    ]);
  });

  const emergencyQueries = [
    { text: "artist:The Weeknd", genreKey: enabledKeys.includes("pop") ? "pop" : enabledKeys[0] },
    { text: "artist:SZA", genreKey: enabledKeys.includes("rbSoul") ? "rbSoul" : enabledKeys[0] },
    { text: "artist:Drake", genreKey: enabledKeys.includes("rapHipHop") ? "rapHipHop" : enabledKeys[0] },
    { text: "artist:Travis Scott", genreKey: enabledKeys.includes("rapHipHop") ? "rapHipHop" : enabledKeys[0] },
    { text: "artist:Frank Ocean", genreKey: enabledKeys.includes("rbSoul") ? "rbSoul" : enabledKeys[0] },
    { text: "artist:Billie Eilish", genreKey: enabledKeys.includes("pop") ? "pop" : enabledKeys[0] },
    { text: "artist:Deftones", genreKey: enabledKeys.includes("rock") ? "rock" : enabledKeys[0] },
    { text: "artist:M83", genreKey: enabledKeys.includes("electronic") ? "electronic" : enabledKeys[0] }
  ].filter((item) => item.genreKey);

  const seen = new Set();
  return [...auraQueries, ...shuffleItems(genreQueries), ...shuffleItems(emergencyQueries)]
    .filter((item) => item?.text && item?.genreKey)
    .filter((item) => {
      const key = `${item.genreKey}::${item.text}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function fetchSpotifyDiscovery(auraKey, excludedKeys = new Set(), genreSettings = DEFAULT_GENRE_SETTINGS, imageBrain = null) {
  const allQueries = resilientSpotifyQueries(auraKey, genreSettings, imageBrain);
  const queryPasses = [
    { queries: allQueries.slice(0, 10), minPopularity: 8, ignoreHistory: false },
    { queries: allQueries.slice(0, 22), minPopularity: 0, ignoreHistory: false },
    { queries: allQueries.slice(-10), minPopularity: 0, ignoreHistory: true }
  ];

  for (const pass of queryPasses) {
    const settled = await Promise.allSettled(
      pass.queries.map(async (queryItem) => {
        const params = new URLSearchParams({ q: queryItem.text, limit: "35", market: "US" });
        const data = await fetchJson(`/api/spotify-search?${params.toString()}&_=${Date.now()}`);
        return { queryItem, tracks: Array.isArray(data?.tracks) ? data.tracks : [] };
      })
    );

    const candidates = [];
    const seen = new Set();

    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      const { queryItem, tracks } = result.value;
      const searchGenreKey = queryItem.genreKey;

      for (const track of tracks) {
        const artistName = track?.artists?.[0]?.name || "";
        const trackKey = normalizeTrackKey(track?.name, artistName);
        if (!track?.name || !artistName || seen.has(trackKey)) continue;
        if (!pass.ignoreHistory && isExcludedTrack(track.name, artistName, excludedKeys)) continue;

        const albumImages = track.album?.images || [];
        const metadata = {
          spotifyTrackId: track.id,
          spotifyUrl: track.external_urls?.spotify || "",
          popularity: track.popularity,
          artistFollowers: track.artistFollowers,
          availableMarkets: track.available_markets || [],
          spotifyVerified: true,
          genreKey: searchGenreKey
        };

        if (!albumImages.length) continue;
        if (!isUsMarketTrack(metadata)) continue;
        if (Number(track.popularity ?? 0) < pass.minPopularity) continue;
        if (!genreAllowedForSettings([searchGenreKey].filter(Boolean), genreSettings, true)) continue;

        seen.add(trackKey);
        candidates.push({ track, searchGenreKey, score: scoreSpotifyCandidate(track) });
      }
    }

    if (candidates.length) {
      const ranked = shuffleItems(candidates)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(candidates.length, SPOTIFY_DISCOVERY_PICK_POOL));
      const pickedBundle = randomItem(ranked.slice(0, Math.min(ranked.length, 25))) || ranked[0];
      const picked = pickedBundle.track;
      const searchGenreKey = pickedBundle.searchGenreKey;
      const albumImages = picked.album?.images || [];
      const releaseDate = picked.album?.release_date || "";
      const artistName = picked.artists?.[0]?.name || "Unknown Artist";

      return normalizeDiscoveryTrack({
        song: picked.name,
        artist: artistName,
        albumArt: albumImages[0]?.url || albumImages[1]?.url || "",
        previewUrl: picked.preview_url || "",
        spotifyUrl: picked.external_urls?.spotify || "",
        spotifyTrackId: picked.id || "",
        collectionName: picked.album?.name || "",
        genreKey: searchGenreKey,
        searchGenreKey,
        popularity: picked.popularity ?? null,
        releaseYear: releaseDate ? releaseDate.slice(0, 4) : "",
        genres: picked.artistGenres || [],
        artistImage: picked.artistImage || "",
        artistFollowers: picked.artistFollowers ?? 0,
        availableMarkets: picked.available_markets || [],
        spotifyVerified: true
      });
    }
  }

  return null;
}

async function fetchItunesDiscovery(auraKey, excludedKeys = new Set(), genreSettings = DEFAULT_GENRE_SETTINGS, imageBrain = null) {
  const queries = discoveryQueriesForAura(auraKey, genreSettings, imageBrain);

  for (const queryItem of queries) {
    const rawQuery = typeof queryItem === "string" ? queryItem : queryItem.text;
    const searchGenreKey = typeof queryItem === "string" ? null : queryItem.genreKey;
    try {
      const query = encodeURIComponent(rawQuery);
      const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&country=US&limit=75&_=${Date.now()}`;
      const data = await fetchJson(url);
      const results = (Array.isArray(data?.results) ? data.results : [])
        .filter((item) => item.previewUrl && item.trackName && item.artistName)
        .filter((item) => !isExcludedTrack(item.trackName, item.artistName, excludedKeys))
        .filter((item) => isTrackAllowedByGenre(item.trackName, item.artistName, {
          primaryGenreName: item.primaryGenreName,
          collectionName: item.collectionName,
          searchGenreKey
        }, genreSettings, !!item.primaryGenreName));

      if (!results.length) continue;

      const topWindow = results.slice(0, Math.min(results.length, 55));
      const picked = randomItem(topWindow);
      const previewUrl = picked.previewUrl?.replace("http://", "https://") || "";

      return normalizeDiscoveryTrack({
        song: picked.trackName,
        artist: picked.artistName,
        albumArt: picked.artworkUrl100?.replace("100x100bb", "600x600bb") || "",
        previewUrl,
        appleMusicUrl: picked.trackViewUrl || "",
        collectionName: picked.collectionName || "",
        genreKey: searchGenreKey,
        primaryGenreName: picked.primaryGenreName || ""
      });
    } catch (error) {
      console.warn("iTunes discovery failed", rawQuery, error);
    }
  }

  return null;
}

async function fetchDeezerDiscovery(auraKey, excludedKeys = new Set(), genreSettings = DEFAULT_GENRE_SETTINGS, imageBrain = null) {
  const queries = discoveryQueriesForAura(auraKey, genreSettings, imageBrain);

  for (const queryItem of queries) {
    const rawQuery = typeof queryItem === "string" ? queryItem : queryItem.text;
    const searchGenreKey = typeof queryItem === "string" ? null : queryItem.genreKey;
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(rawQuery)}&limit=75`;
    const urls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(deezerUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`
    ];

    for (const url of urls) {
      try {
        const data = await fetchJson(url);
        const results = (Array.isArray(data?.data) ? data.data : [])
          .filter((item) => item.preview && item.title && item.artist?.name)
          .filter((item) => !isExcludedTrack(item.title, item.artist?.name, excludedKeys))
          .filter((item) => genreAllowedForSettings([searchGenreKey].filter(Boolean), genreSettings, false));

        if (!results.length) continue;

        const topWindow = results.slice(0, Math.min(results.length, 55));
        const picked = randomItem(topWindow);
        const previewUrl = picked.preview?.replace("http://", "https://") || "";

        return normalizeDiscoveryTrack({
          song: picked.title,
          artist: picked.artist?.name,
          albumArt: picked.album?.cover_big || picked.album?.cover_medium || "",
          previewUrl,
          appleMusicUrl: picked.link || "",
          collectionName: picked.album?.title || "",
          genreKey: searchGenreKey
        });
      } catch (error) {
        console.warn("Deezer discovery failed", rawQuery, error);
      }
    }
  }

  return null;
}

async function buildFreshAuraResult(auraKey, colors = ["6d5dfc", "19d8ff", "ff3df2"], genreSettings = DEFAULT_GENRE_SETTINGS, imageBrain = null) {
  const profile = AURA_PROFILES[auraKey] || AURA_PROFILES.grungeNoir;
  const safeColors = colors?.length >= 3 ? colors : profile.colorFallback;
  const excludedKeys = getRecentSongKeys(32);

  // Production rule: no built-in/demo song fallback. Aura must discover the song from Spotify.
  // iTunes/Deezer are only used to find a 30-second preview for that exact Spotify result.
  const discovered = await fetchSpotifyDiscovery(auraKey, excludedKeys, genreSettings, imageBrain);

  if (!discovered?.song || !discovered?.artist) {
    throw new Error("Aura could not reach Spotify cleanly. Tap Read Aura again — no demo tracks were used.");
  }

  const spotifyMedia = await fetchSpotifyMedia(discovered.song, discovered.artist);
  const spotifyProof = {
    ...discovered,
    ...spotifyMedia,
    spotifyTrackId: discovered.spotifyTrackId || spotifyMedia.spotifyTrackId,
    spotifyUrl: discovered.spotifyUrl || spotifyMedia.spotifyUrl,
    popularity: discovered.popularity ?? spotifyMedia.popularity,
    artistFollowers: discovered.artistFollowers ?? spotifyMedia.artistFollowers,
    availableMarkets: discovered.availableMarkets?.length ? discovered.availableMarkets : (spotifyMedia.availableMarkets || []),
    genres: discovered.genres?.length ? discovered.genres : (spotifyMedia.genres || []),
    spotifyVerified: true,
    genreKey: discovered.genreKey
  };

  if (!isUsMarketTrack(spotifyProof)) {
    console.warn("Spotify track did not include US market proof; continuing because search was requested with market=US.");
  }

  const previewMedia = discovered.previewUrl ? {} : await fetchSongMedia(discovered.song, discovered.artist);
  const media = {
    ...spotifyMedia,
    ...previewMedia,
    ...discovered,
    song: discovered.song,
    artist: discovered.artist,
    albumArt: discovered.albumArt || spotifyMedia.albumArt || previewMedia.albumArt || "",
    previewUrl: discovered.previewUrl || previewMedia.previewUrl || spotifyMedia.previewUrl || "",
    spotifyUrl: discovered.spotifyUrl || spotifyMedia.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(`${discovered.song} ${discovered.artist}`)}`,
    collectionName: discovered.collectionName || spotifyMedia.collectionName || previewMedia.collectionName || "",
    artistFollowers: discovered.artistFollowers ?? spotifyMedia.artistFollowers ?? 0,
    popularity: discovered.popularity ?? spotifyMedia.popularity ?? null,
    genres: discovered.genres?.length ? discovered.genres : (spotifyMedia.genres || []),
    availableMarkets: discovered.availableMarkets?.length ? discovered.availableMarkets : (spotifyMedia.availableMarkets || []),
    spotifyVerified: true
  };

  const auraName = generateAuraName(auraKey, imageBrain);

  return {
    auraKey,
    songIndex: Date.now(),
    colors: safeColors,
    aura: auraName,
    mood: profile.mood,
    song: media.song,
    artist: media.artist,
    reason: discoveryReason(auraKey),
    aiInsight: buildAuraInsight({ ...imageBrain, auraKey }, media.song),
    visualBrain: { ...imageBrain, auraKey },
    albumArt: media.albumArt || generatedAlbumArt(media.song, media.artist, safeColors),
    previewUrl: media.previewUrl || "",
    appleMusicUrl: media.appleMusicUrl || "",
    collectionName: media.collectionName || "",
    spotifyUrl: media.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(`${media.song} ${media.artist}`)}`,
    spotifyTrackId: media.spotifyTrackId || "",
    popularity: media.popularity ?? null,
    releaseYear: media.releaseYear || "",
    genres: media.genres || [],
    artistImage: media.artistImage || "",
    artistFollowers: media.artistFollowers ?? 0,
    usMainstreamVerified: isUsMainstreamEligible(media, true)
  };
}

function pickAuraFromColors(stats) {
  const { brightness, warmth, saturation, contrast, red, green, blue, colorSpread } = stats;
  const scores = {
    grungeNoir: 0,
    neonNightlife: 0,
    warmDreamscape: 0,
    editorialLuxury: 0,
    stormPressure: 0
  };

  // Core light + color read
  if (brightness < 78) scores.grungeNoir += 3;
  if (brightness < 95 && contrast > 42) scores.grungeNoir += 2;
  if (blue > red * 1.05 && brightness < 115) scores.grungeNoir += 1;
  if (saturation < 38 && brightness < 120) scores.grungeNoir += 1;

  if (saturation > 66 && contrast > 34) scores.neonNightlife += 3;
  if (blue > red && saturation > 52) scores.neonNightlife += 2;
  if (colorSpread > 86 && brightness > 70) scores.neonNightlife += 2;

  if (warmth > 26 && brightness > 82) scores.warmDreamscape += 3;
  if (red > blue * 1.12 && saturation > 38) scores.warmDreamscape += 2;
  if (brightness > 125 && contrast < 52) scores.warmDreamscape += 1;

  if (saturation < 34 && contrast < 45 && brightness > 92) scores.editorialLuxury += 3;
  if (Math.abs(red - green) < 18 && Math.abs(green - blue) < 22) scores.editorialLuxury += 2;
  if (brightness > 110 && saturation < 45) scores.editorialLuxury += 1;

  if (blue > green && brightness < 126) scores.stormPressure += 2;
  if (contrast > 48 && saturation < 58) scores.stormPressure += 2;
  if (brightness >= 78 && brightness <= 132 && warmth < 12) scores.stormPressure += 1;

  let winner = PROFILE_ORDER[0];
  for (const key of PROFILE_ORDER) {
    if (scores[key] > scores[winner]) winner = key;
  }

  return winner;
}

function describeVisualBrain(stats = {}) {
  const brightness = stats.brightness || 0;
  const saturation = stats.saturation || 0;
  const contrast = stats.contrast || 0;
  const warmth = stats.warmth || 0;
  const colorSpread = stats.colorSpread || 0;
  const edgeIntensity = stats.edgeIntensity || 0;

  const energyLabel = saturation > 70 || colorSpread > 96 ? "high energy" : contrast > 56 || edgeIntensity > 44 ? "intense" : brightness > 132 ? "open" : "low tempo";
  const lightLabel = brightness < 74 ? "low light" : brightness > 148 ? "bright light" : "soft light";
  const textureLabel = edgeIntensity > 52 ? "grainy texture" : contrast > 58 ? "sharp texture" : saturation < 32 ? "minimal texture" : "smooth texture";
  const temperatureLabel = warmth > 30 ? "warm" : warmth < -12 ? "cool" : "neutral";
  const compositionLabel = contrast > 62 && brightness < 110 ? "dramatic composition" : saturation > 64 ? "color-forward composition" : brightness > 145 ? "airy composition" : "cinematic composition";
  const paceLabel = energyLabel === "high energy" ? "fast pulse" : energyLabel === "intense" ? "heavy pulse" : brightness > 132 ? "floating pulse" : "slow pulse";
  const toneSignature = `${temperatureLabel} ${textureLabel} ${paceLabel}`;
  const searchTerms = [energyLabel, lightLabel, textureLabel, temperatureLabel, compositionLabel, paceLabel]
    .filter(Boolean)
    .map((value) => String(value).replace(/\s+/g, " ").trim());
  const confidence = Math.min(99, Math.max(66, Math.round(59 + Math.abs(warmth) * 0.2 + saturation * 0.22 + contrast * 0.18 + colorSpread * 0.08 + edgeIntensity * 0.12)));

  return { energyLabel, lightLabel, textureLabel, temperatureLabel, compositionLabel, paceLabel, toneSignature, searchTerms, edgeIntensity, confidence };
}

function buildAuraInsight(imageBrain = {}, song = "this song") {
  const profile = AURA_PROFILES[imageBrain?.auraKey] || AURA_PROFILES.grungeNoir;
  const energy = imageBrain?.energyLabel || "emotional";
  const light = imageBrain?.lightLabel || "soft light";
  const texture = imageBrain?.textureLabel || "visual texture";
  const temp = imageBrain?.temperatureLabel || "balanced";
  const composition = imageBrain?.compositionLabel || "cinematic composition";
  const pace = imageBrain?.paceLabel || "slow pulse";
  const confidence = imageBrain?.confidence || 78;

  return `Aura read this as ${profile.mood}: ${light}, ${temp} color temperature, ${texture}, ${composition}, and a ${pace}. That is why it matched ${song} — the track carries a similar emotional rhythm, visual pressure, and movement signature. Reading confidence: ${confidence}%.`;
}

function extractImageMood(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 90;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);

      const pixels = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0, saturationTotal = 0, brightnessTotal = 0, brightnessSquared = 0, edgeTotal = 0, edgeCount = 0, lastBrightness = null;
      const colorful = [];

      for (let i = 0; i < pixels.length; i += 16) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
        const brightness = (red + green + blue) / 3;

        r += red;
        g += green;
        b += blue;
        saturationTotal += saturation;
        brightnessTotal += brightness;
        brightnessSquared += brightness * brightness;
        if (lastBrightness !== null) {
          edgeTotal += Math.abs(brightness - lastBrightness);
          edgeCount += 1;
        }
        lastBrightness = brightness;
        count += 1;

        if (saturation > 28 && brightness > 45) {
          colorful.push([red, green, blue, saturation, brightness]);
        }
      }

      const red = r / count;
      const green = g / count;
      const blue = b / count;
      const brightness = (red + green + blue) / 3;
      const warmth = red + green * 0.35 - blue * 1.08;
      const saturation = saturationTotal / count;
      const meanBrightness = brightnessTotal / count;
      const contrast = Math.sqrt(Math.max(0, brightnessSquared / count - meanBrightness * meanBrightness));
      const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);
      const edgeIntensity = edgeCount ? edgeTotal / edgeCount : 0;

      colorful.sort((a, b) => (b[3] + b[4] * 0.22) - (a[3] + a[4] * 0.22));

      const c1 = colorful[0] || [red, green, blue];
      const c2 = colorful[Math.floor(colorful.length * 0.35)] || [blue, red, green];
      const c3 = colorful[Math.floor(colorful.length * 0.7)] || [green, blue, red];

      const colors = [
        rgbToHex(c1[0] * 1.12, c1[1] * 1.12, c1[2] * 1.12),
        rgbToHex(c2[0] * 1.2, c2[1] * 1.2, c2[2] * 1.2),
        rgbToHex(c3[0] * 1.25, c3[1] * 1.25, c3[2] * 1.25)
      ];

      const auraKey = pickAuraFromColors({ brightness, warmth, saturation, contrast, red, green, blue, colorSpread });
      const visualBrain = describeVisualBrain({ brightness, warmth, saturation, contrast, red, green, blue, colorSpread, edgeIntensity });

      resolve({
        auraKey,
        colors,
        visualBrain: { ...visualBrain, brightness, warmth, saturation, contrast, colorSpread, edgeIntensity }
      });
    };

    img.onerror = () => resolve({
      auraKey: "midnight",
      colors: ["6d5dfc", "19d8ff", "ff3df2"]
    });

    img.src = imageSrc;
  });
}

async function buildResult(auraKey, songIndex = 0, colors = ["6d5dfc", "19d8ff", "ff3df2"], requirePlayable = false, imageBrain = null, genreSettings = DEFAULT_GENRE_SETTINGS) {
  const profile = AURA_PROFILES[auraKey] || AURA_PROFILES.grungeNoir;
  const safeColors = colors?.length >= 3 ? colors : profile.colorFallback;

  let chosenIndex = songIndex % profile.songs.length;
  let songPack = profile.songs[chosenIndex];
  let media = {};

  // When the user taps Similar Track, or when the first match has no playable source,
  // cycle through the matching aesthetic pool until one returns a playable preview.
  const attempts = requirePlayable ? profile.songs.length : Math.min(2, profile.songs.length);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const index = (songIndex + attempt) % profile.songs.length;
    const candidate = profile.songs[index];
    const [candidateSong, candidateArtist] = candidate;

    if (!isTrackAllowedByGenre(candidateSong, candidateArtist, {}, genreSettings, true)) {
      continue;
    }

    const candidateMedia = await fetchSongMedia(candidateSong, candidateArtist);

    if (candidateMedia?.genres?.length && !isTrackAllowedByGenre(candidateSong, candidateArtist, candidateMedia, genreSettings, true)) {
      continue;
    }

    if (!isUsMainstreamEligible(candidateMedia, true)) {
      continue;
    }

    if (candidateMedia?.previewUrl && isUsMainstreamEligible(candidateMedia, true)) {
      chosenIndex = index;
      songPack = candidate;
      media = candidateMedia;
      break;
    }

    if (!media.previewUrl && !media.albumArt) {
      chosenIndex = index;
      songPack = candidate;
      media = candidateMedia || {};
    }
  }

  if (!isUsMainstreamEligible(media, true)) {
    const fallbackPool = profile.songs
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) => isTrackAllowedByGenre(candidate[0], candidate[1], {}, genreSettings, true));
    const fallback = fallbackPool.length ? randomItem(fallbackPool) : null;

    if (fallback) {
      chosenIndex = fallback.index;
      songPack = fallback.candidate;
      media = await fetchSongMedia(songPack[0], songPack[1]);
    }
  }

  if (!isTrackAllowedByGenre(songPack[0], songPack[1], media, genreSettings, true)) {
    const allowedFallbackPool = profile.songs
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) => isTrackAllowedByGenre(candidate[0], candidate[1], {}, genreSettings, true));
    const allowedFallback = allowedFallbackPool.length ? randomItem(allowedFallbackPool) : null;

    if (allowedFallback) {
      chosenIndex = allowedFallback.index;
      songPack = allowedFallback.candidate;
      media = {};
    }
  }

  const [song, artist, reason] = songPack;
  const auraName = generateAuraName(auraKey, imageBrain);
  const albumArt = media.albumArt || generatedAlbumArt(song, artist, safeColors);

  return {
    auraKey,
    songIndex: chosenIndex,
    colors: safeColors,
    aura: auraName,
    mood: profile.mood,
    song,
    artist,
    reason,
    aiInsight: buildAuraInsight({ ...imageBrain, auraKey }, song),
    albumArt,
    previewUrl: media.previewUrl || "",
    appleMusicUrl: media.appleMusicUrl || "",
    collectionName: media.collectionName || "",
    spotifyUrl: media.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(`${song} ${artist}`)}`,
    spotifyTrackId: media.spotifyTrackId || "",
    popularity: media.popularity ?? null,
    releaseYear: media.releaseYear || "",
    genres: media.genres || [],
    artistImage: media.artistImage || "",
    artistFollowers: media.artistFollowers ?? 0,
    usMainstreamVerified: isUsMainstreamEligible(media, true)
  };
}


function scanVideoMood(video) {
  if (!video || !video.videoWidth || !video.videoHeight) {
    return {
      auraKey: "neonNightlife",
      colors: ["6d5dfc", "19d8ff", "ff3df2"]
    };
  }

  const canvas = document.createElement("canvas");
  const size = 56;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.drawImage(video, 0, 0, size, size);

  const pixels = ctx.getImageData(0, 0, size, size).data;
  let r = 0, g = 0, b = 0, count = 0, saturationTotal = 0, brightnessTotal = 0, brightnessSquared = 0;
  const colorful = [];

  for (let i = 0; i < pixels.length; i += 16) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
    const brightness = (red + green + blue) / 3;

    r += red;
    g += green;
    b += blue;
    saturationTotal += saturation;
    brightnessTotal += brightness;
    brightnessSquared += brightness * brightness;
    count += 1;

    if (saturation > 24 && brightness > 38) {
      colorful.push([red, green, blue, saturation, brightness]);
    }
  }

  const red = r / count;
  const green = g / count;
  const blue = b / count;
  const brightness = (red + green + blue) / 3;
  const warmth = red + green * 0.35 - blue * 1.08;
  const saturation = saturationTotal / count;
  const meanBrightness = brightnessTotal / count;
  const contrast = Math.sqrt(Math.max(0, brightnessSquared / count - meanBrightness * meanBrightness));
  const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);
  const edgeIntensity = 0;

  colorful.sort((a, b) => (b[3] + b[4] * 0.22) - (a[3] + a[4] * 0.22));

  const c1 = colorful[0] || [red, green, blue];
  const c2 = colorful[Math.floor(colorful.length * 0.35)] || [blue, red, green];
  const c3 = colorful[Math.floor(colorful.length * 0.7)] || [green, blue, red];

  const auraKey = pickAuraFromColors({ brightness, warmth, saturation, contrast, red, green, blue, colorSpread });
  const visualBrain = describeVisualBrain({ brightness, warmth, saturation, contrast, red, green, blue, colorSpread, edgeIntensity });

  return {
    auraKey,
    visualBrain: { ...visualBrain, brightness, warmth, saturation, contrast, colorSpread, edgeIntensity },
    colors: [
      rgbToHex(c1[0] * 1.14, c1[1] * 1.14, c1[2] * 1.14),
      rgbToHex(c2[0] * 1.22, c2[1] * 1.22, c2[2] * 1.22),
      rgbToHex(c3[0] * 1.28, c3[1] * 1.28, c3[2] * 1.28)
    ]
  };
}

function getLiveCameraAuraLabel(auraKey = "neonNightlife") {
  const labels = {
    grungeNoir: "Ghost signal",
    neonNightlife: "Neon pulse",
    warmDreamscape: "Warm bloom",
    editorialLuxury: "Mirror mode",
    stormPressure: "Storm field"
  };

  return labels[auraKey] || "Aura field";
}

function AuraSphere({ colors, image, onClick, loading = false }) {
  const gradientStyle = {
    "--aura-a": readableAccent(colors[0]),
    "--aura-b": readableAccent(colors[1]),
    "--aura-c": readableAccent(colors[2])
  };

  return (
    <button
      onClick={onClick}
      style={gradientStyle}
      className="aura-sphere-wrap relative mb-6 flex h-72 w-72 items-center justify-center rounded-full transition active:scale-95"
      aria-label="Read Aura"
    >
      <motion.div
        animate={{ scale: loading ? [1, 1.14, 1] : [1, 1.045, 1], opacity: loading ? [0.72, 1, 0.72] : [0.58, 0.9, 0.58] }}
        transition={{ repeat: Infinity, duration: loading ? 1.65 : 4.8, ease: "easeInOut" }}
        className="aura-halo absolute inset-[-8px] rounded-full"
      />

      <motion.div
        animate={{
          rotate: loading ? [0, 360] : [0, 360],
          scale: loading ? [1, 1.048, 1] : [1, 1.024, 1]
        }}
        transition={{
          rotate: { repeat: Infinity, duration: loading ? 7.5 : 42, ease: "linear" },
          scale: { repeat: Infinity, duration: loading ? 1.65 : 5.4, ease: "easeInOut" }
        }}
        className="aura-sphere relative flex h-56 w-56 items-center justify-center rounded-full overflow-hidden"
      >
        <motion.div
          className="aura-plasma absolute inset-[-2px] rounded-full"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: loading ? 9 : 32, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="aura-liquid absolute inset-[-18px] rounded-full"
          animate={{
            rotate: [0, -360],
            scale: loading ? [1, 1.09, 1] : [1, 1.04, 1],
            opacity: loading ? [0.72, 1, 0.72] : [0.58, 0.82, 0.58]
          }}
          transition={{
            rotate: { duration: loading ? 10 : 38, repeat: Infinity, ease: "linear" },
            scale: { duration: loading ? 1.8 : 6.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: loading ? 1.8 : 6.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        <motion.div
          className="aura-shimmer absolute inset-0 rounded-full"
          animate={{
            x: ["-10%", "8%", "-10%"],
            y: ["6%", "-8%", "6%"],
            opacity: loading ? [0.34, 0.74, 0.34] : [0.22, 0.48, 0.22]
          }}
          transition={{ duration: loading ? 2.2 : 7.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {image && (
          <img
            src={image}
            alt=""
            className="absolute inset-[34px] h-[calc(100%-68px)] w-[calc(100%-68px)] rounded-full object-cover opacity-24 mix-blend-soft-light blur-[1px]"
          />
        )}

        <div className="aura-sphere-core absolute inset-0 rounded-full" />
        <div className="aura-sphere-light absolute inset-0 rounded-full" />
      </motion.div>
    </button>
  );
}


function AmbientParticles({ colors, active }) {
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, index) => ({
      id: index,
      left: 8 + Math.random() * 84,
      top: 10 + Math.random() * 78,
      size: 2 + Math.random() * 3.5,
      delay: Math.random() * 5,
      duration: 9 + Math.random() * 9,
      drift: Math.random() > 0.5 ? 18 : -18
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {particles.map((particle, index) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full blur-[1px] will-change-transform"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            background: readableAccent(colors[index % colors.length])
          }}
          animate={{
            opacity: active ? [0, 0.22, 0] : [0, 0.09, 0],
            y: [0, -38, -70],
            x: [0, particle.drift * 0.45, particle.drift]
          }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}




function AudioWaveform({ active, colors }) {
  const bars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <div className="mt-6 flex h-16 w-full max-w-sm items-end justify-center gap-[4px] px-2">
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="rounded-full"
          style={{
            width: 4,
            background: `linear-gradient(180deg, ${readableAccent(colors[bar % colors.length])}, rgba(255,255,255,.18))`
          }}
          animate={{
            height: active
              ? [
                  10 + (bar % 4) * 4,
                  42 + ((bar * 7) % 18),
                  14 + ((bar * 3) % 10)
                ]
              : [10, 18, 10],
            opacity: active ? [0.42, 1, 0.42] : [0.18, 0.35, 0.18]
          }}
          transition={{
            duration: active ? 0.9 + (bar % 5) * 0.08 : 2.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: bar * 0.025
          }}
        />
      ))}
    </div>
  );
}


function SongUnlockOverlay({ reveal, image, colors }) {
  if (!reveal) return null;

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden bg-[#020304] px-5 py-6 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42, ease: IOS_EASE }}
      style={{
        "--aura-a": readableAccent(colors[0]),
        "--aura-b": readableAccent(colors[1]),
        "--aura-c": readableAccent(colors[2])
      }}
    >
      {/* User photo owns the screen */}
      <motion.img
        src={image}
        alt="Aura source"
        className="absolute inset-0 h-full w-full object-cover opacity-75"
        initial={{ scale: 1.08, filter: "blur(18px) saturate(1)" }}
        animate={{ scale: 1.02, filter: "blur(0px) saturate(1.16)" }}
        exit={{ scale: 1.05, opacity: 0 }}
        transition={{ duration: 1.15, ease: CASCADE_EASE }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,4,.28)_0%,rgba(2,3,4,.18)_34%,rgba(2,3,4,.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,transparent_0%,rgba(0,0,0,.18)_38%,rgba(0,0,0,.72)_100%)]" />

      <motion.div
        className="aura-color-bloom pointer-events-none absolute inset-[-18%] opacity-80"
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.86, 0.45] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: CASCADE_EASE }}
          className="pt-2 text-center"
        >
          <p className="text-xs uppercase tracking-[0.44em] text-white/56">aura found</p>
        </motion.div>

        <div className="flex flex-1 flex-col justify-end pb-4">
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1, ease: CASCADE_EASE }}
            className="mb-5"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-white/48">your photo reads as</p>
            <h2 className="aura-result-title aura-type-glow mt-2 text-5xl font-black leading-[0.9] tracking-[-0.09em]">
              {reveal.aura}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/68">
              {reveal.mood}
            </p>
          </motion.div>

          {/* Shazam-inspired song found card, but secondary to the photo */}
          <motion.div
            initial={{ opacity: 0, y: 42, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.82, delay: 0.24, ease: CASCADE_EASE }}
            className="aura-result-card rounded-[2.4rem] p-4 shadow-[0_34px_130px_rgba(0,0,0,.68)]"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="relative shrink-0"
                initial={{ rotate: -4, scale: 0.88 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.72, delay: 0.38, ease: CASCADE_EASE }}
              >
                <div className="absolute inset-[-10px] rounded-[1.8rem] bg-[radial-gradient(circle,var(--aura-b),transparent_68%)] blur-xl opacity-70" />
                <img
                  src={reveal.albumArt}
                  alt={`${reveal.song} album art`}
                  className="relative h-24 w-24 rounded-[1.45rem] border border-white/20 object-cover shadow-2xl shadow-black/55"
                />
              </motion.div>

              <div className="min-w-0 flex-1 text-left">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/38">song match</p>
                <h3 className="mt-1 truncate text-2xl font-black tracking-[-0.055em] text-white">
                  {reveal.song}
                </h3>
                <p className="truncate text-sm text-white/56">{reveal.artist}</p>
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full rounded-full bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] shadow-[0_0_30px_var(--aura-b)]" />

            <p className="mt-4 text-sm leading-relaxed text-white/64">
              {reveal.reason}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

const auraRuntimeCss = `
  .aura-sphere-wrap,
  .aura-sphere,
  .aura-liquid,
  .aura-shimmer,
  .aura-unlock-wash,
  .aura-unlock-sweep,
  .unlock-split-card {
    transform: translateZ(0);
    will-change: transform, opacity;
  }

  .aura-sphere-wrap {
    filter:
      drop-shadow(0 0 40px color-mix(in srgb, var(--aura-a) 82%, transparent))
      drop-shadow(0 0 92px color-mix(in srgb, var(--aura-b) 68%, transparent))
      drop-shadow(0 0 150px color-mix(in srgb, var(--aura-c) 50%, transparent))
      drop-shadow(0 26px 64px rgba(0,0,0,.52));
  }

  .aura-sphere {
    isolation: isolate;
    overflow: visible;
    background:
      radial-gradient(circle at 30% 20%, rgba(255,255,255,.72), rgba(255,255,255,.16) 13%, transparent 27%),
      radial-gradient(circle at 70% 78%, rgba(0,0,0,.74), transparent 48%),
      radial-gradient(circle at 34% 72%, var(--aura-c), transparent 42%),
      radial-gradient(circle at 74% 30%, var(--aura-a), transparent 44%),
      conic-gradient(from 145deg, var(--aura-a), var(--aura-b), var(--aura-c), var(--aura-a));
    box-shadow:
      0 0 38px color-mix(in srgb, var(--aura-a) 92%, transparent),
      0 0 92px color-mix(in srgb, var(--aura-b) 72%, transparent),
      0 0 150px color-mix(in srgb, var(--aura-c) 58%, transparent),
      inset 0 2px 22px rgba(255,255,255,.38),
      inset 0 -40px 76px rgba(0,0,0,.55),
      inset -22px -12px 60px rgba(0,0,0,.25);
  }

  .aura-sphere::before {
    content: "";
    position: absolute;
    inset: -18px;
    border-radius: inherit;
    z-index: -1;
    background:
      radial-gradient(circle at 50% 50%, var(--aura-a), transparent 55%),
      radial-gradient(circle at 32% 28%, var(--aura-c), transparent 46%),
      radial-gradient(circle at 76% 72%, var(--aura-b), transparent 52%);
    filter: blur(22px) saturate(1.45);
    opacity: 1;
  }

  .aura-plasma {
    background:
      radial-gradient(circle at 28% 24%, rgba(255,255,255,.42), transparent 18%),
      radial-gradient(circle at 22% 78%, var(--aura-c), transparent 40%),
      radial-gradient(circle at 78% 38%, var(--aura-a), transparent 44%),
      conic-gradient(from 0deg, var(--aura-a), var(--aura-b), var(--aura-c), var(--aura-a));
    filter: saturate(1.42) contrast(1.08);
    opacity: .98;
    animation: auraPulseHue 9s ease-in-out infinite;
  }

  @keyframes auraPulseHue {
    0%, 100% { filter: saturate(1.42) contrast(1.08) brightness(1); }
    50% { filter: saturate(1.72) contrast(1.12) brightness(1.12); }
  }

  .aura-sphere::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      linear-gradient(135deg, rgba(255,255,255,.42), transparent 27%, rgba(255,255,255,.08) 56%, transparent 72%),
      radial-gradient(circle at 64% 22%, rgba(255,255,255,.26), transparent 17%);
    mix-blend-mode: screen;
    opacity: .78;
    pointer-events: none;
  }

  .aura-liquid {
    background:
      radial-gradient(circle at 28% 32%, rgba(255,255,255,.26), transparent 18%),
      radial-gradient(circle at 30% 74%, var(--aura-c), transparent 38%),
      radial-gradient(circle at 78% 38%, var(--aura-a), transparent 42%),
      radial-gradient(circle at 54% 54%, var(--aura-b), transparent 58%);
    mix-blend-mode: screen;
    filter: saturate(1.32);
    opacity: .86;
  }

  .aura-shimmer {
    background:
      radial-gradient(circle at 35% 18%, rgba(255,255,255,.48), transparent 15%),
      linear-gradient(118deg, transparent 14%, rgba(255,255,255,.34), transparent 37%, rgba(255,255,255,.08), transparent 74%);
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .aura-unlock-wash {
    position: absolute;
    inset: -12%;
    background:
      radial-gradient(circle at 50% 48%, rgba(255,255,255,.14), transparent 18%),
      radial-gradient(circle at 50% 50%, var(--aura-a), transparent 34%),
      radial-gradient(circle at 62% 58%, var(--aura-c), transparent 44%);
    filter: blur(34px) saturate(1.28);
  }

  .aura-unlock-sweep {
    position: absolute;
    top: -18%;
    bottom: -18%;
    width: 54%;
    background: linear-gradient(110deg, transparent, rgba(255,255,255,.28), transparent);
    filter: blur(16px);
    transform: rotate(10deg);
  }


  .ios-glass {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    background:
      linear-gradient(145deg, rgba(255,255,255,.105), rgba(255,255,255,.032) 42%, rgba(255,255,255,.018)),
      rgba(4,5,7,.58);
    backdrop-filter: blur(28px) saturate(1.42);
    -webkit-backdrop-filter: blur(28px) saturate(1.42);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.22),
      inset 0 -1px 0 rgba(255,255,255,.045),
      0 18px 56px rgba(0,0,0,.42);
  }

  .ios-glass::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background:
      linear-gradient(120deg, rgba(255,255,255,.26), transparent 19%, transparent 54%, rgba(255,255,255,.075) 72%, transparent),
      radial-gradient(circle at 24% 0%, rgba(255,255,255,.18), transparent 28%);
    opacity: .7;
    mix-blend-mode: screen;
  }

  .ios-glass > * {
    position: relative;
    z-index: 1;
  }

  .unlock-split-card {
    border: 1px solid rgba(255,255,255,.16);
    background:
      linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.025)),
      rgba(4,5,7,.62);
    backdrop-filter: blur(34px) saturate(1.5);
    -webkit-backdrop-filter: blur(34px) saturate(1.5);
  }

  .unlock-panel::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(118deg, rgba(255,255,255,.18), transparent 24%, transparent 62%, rgba(255,255,255,.06));
    mix-blend-mode: screen;
  }

  .unlock-connector {
    filter:
      drop-shadow(0 0 22px color-mix(in srgb, var(--aura-a) 86%, transparent))
      drop-shadow(0 0 54px color-mix(in srgb, var(--aura-c) 58%, transparent));
  }


  .aura-result-hero {
    box-shadow:
      0 0 34px color-mix(in srgb, var(--aura-a) 42%, transparent),
      0 0 88px color-mix(in srgb, var(--aura-b) 30%, transparent),
      0 28px 90px rgba(0,0,0,.56);
  }

  .aura-result-card {
    border: 1px solid rgba(255,255,255,.18);
    background:
      radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--aura-a) 26%, transparent), transparent 34%),
      radial-gradient(circle at 90% 18%, color-mix(in srgb, var(--aura-c) 24%, transparent), transparent 38%),
      linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.035) 48%, rgba(255,255,255,.018)),
      rgba(4,5,7,.72);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.24),
      0 0 52px color-mix(in srgb, var(--aura-a) 22%, transparent),
      0 20px 70px rgba(0,0,0,.48);
  }

  .aura-result-title {
    background: linear-gradient(90deg, var(--aura-a), var(--aura-b), var(--aura-c));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 22px color-mix(in srgb, var(--aura-b) 38%, transparent);
  }

  .aura-color-bloom {
    background:
      radial-gradient(circle at 20% 25%, color-mix(in srgb, var(--aura-a) 72%, transparent), transparent 34%),
      radial-gradient(circle at 75% 35%, color-mix(in srgb, var(--aura-b) 60%, transparent), transparent 38%),
      radial-gradient(circle at 50% 86%, color-mix(in srgb, var(--aura-c) 58%, transparent), transparent 42%);
    filter: blur(34px) saturate(1.45);
  }

  .aura-song-pill {
    border: 1px solid rgba(255,255,255,.16);
    background:
      linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.035)),
      radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--aura-b) 25%, transparent), transparent 46%);
  }


  .aura-gradient-mesh {
    background:
      radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--aura-a) 42%, transparent), transparent 32%),
      radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--aura-b) 36%, transparent), transparent 36%),
      radial-gradient(circle at 50% 84%, color-mix(in srgb, var(--aura-c) 34%, transparent), transparent 42%),
      linear-gradient(180deg, #020304, #050608 48%, #020304);
    filter: saturate(1.35);
  }

  .aura-trail {
    position: absolute;
    width: 9rem;
    height: 9rem;
    border-radius: 999px;
    background: radial-gradient(circle, var(--aura-a), transparent 68%);
    filter: blur(38px);
    opacity: .26;
    pointer-events: none;
  }

  .aura-type-glow {
    text-shadow:
      0 0 22px color-mix(in srgb, var(--aura-a) 50%, transparent),
      0 0 48px color-mix(in srgb, var(--aura-b) 32%, transparent);
  }

  .aura-history-card {
    border: 1px solid rgba(255,255,255,.12);
    background:
      linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.025)),
      rgba(3,4,6,.58);
    backdrop-filter: blur(24px) saturate(1.28);
    -webkit-backdrop-filter: blur(24px) saturate(1.28);
  }

  .aura-onboarding-card {
    background:
      radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--aura-a) 26%, transparent), transparent 34%),
      radial-gradient(circle at 86% 18%, color-mix(in srgb, var(--aura-c) 24%, transparent), transparent 38%),
      linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.035)),
      rgba(2,3,4,.78);
    border: 1px solid rgba(255,255,255,.18);
    box-shadow: 0 32px 120px rgba(0,0,0,.72);
  }


  .aura-live-camera {
    background:
      radial-gradient(circle at 20% 12%, color-mix(in srgb, var(--aura-a) 26%, transparent), transparent 35%),
      radial-gradient(circle at 82% 20%, color-mix(in srgb, var(--aura-b) 24%, transparent), transparent 38%),
      linear-gradient(180deg, rgba(2,3,4,.94), rgba(2,3,4,.84));
  }

  .aura-camera-reticle {
    border: 1px solid rgba(255,255,255,.26);
    box-shadow:
      0 0 0 1px rgba(255,255,255,.04) inset,
      0 0 46px color-mix(in srgb, var(--aura-b) 34%, transparent);
  }

  .aura-camera-reticle::before,
  .aura-camera-reticle::after {
    content: "";
    position: absolute;
    inset: 14%;
    border-radius: inherit;
    border: 1px solid rgba(255,255,255,.08);
  }

  .aura-camera-reticle::after {
    inset: 30%;
    border-color: color-mix(in srgb, var(--aura-a) 40%, transparent);
  }

  .aura-scan-line {
    background: linear-gradient(90deg, transparent, var(--aura-a), var(--aura-b), var(--aura-c), transparent);
    box-shadow: 0 0 34px var(--aura-b);
  }



  .aura-gradient-mesh,
  .aura-trail,
  .aura-color-bloom,
  .aura-live-camera video {
    backface-visibility: hidden;
    transform: translate3d(0,0,0);
  }

  @media (max-width: 480px) {
    .aura-trail {
      width: 6.5rem;
      height: 6.5rem;
      filter: blur(30px);
      opacity: .18;
    }

    .aura-gradient-mesh {
      filter: saturate(1.18);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .aura-plasma { animation-duration: 20s; }
    .aura-trail { opacity: .12; }
  }

  @supports not (color: color-mix(in srgb, red, transparent)) {
    .aura-sphere-wrap {
      filter: drop-shadow(0 0 34px var(--aura-a)) drop-shadow(0 22px 56px rgba(0,0,0,.5));
    }

    .aura-sphere {
      box-shadow:
        0 0 34px var(--aura-a),
        0 0 82px var(--aura-b),
        inset 0 2px 22px rgba(255,255,255,.38),
        inset 0 -40px 76px rgba(0,0,0,.55);
    }
  }
`;


function shouldAttemptAutoplay() {
  return true;
}

function safeLocalStorageGet(key, fallback = null) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Private browsing / storage permissions can throw on mobile.
  }
}

const SILENT_AUDIO_SRC = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

export default function App() {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const liveVideoRef = useRef(null);
  const audioRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const autoPlayAfterMatchRef = useRef(false);
  const lastAutoPlayedPreviewRef = useRef("");
  const liveCameraStreamRef = useRef(null);
  const playbackRequestRef = useRef(0);
  const audioUnlockedRef = useRef(false);
  const revealTimerRef = useRef(null);
  const finalRevealTimerRef = useRef(null);
  const installPromptRef = useRef(null);

  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imageColors, setImageColors] = useState(["6d5dfc", "19d8ff", "ff3df2"]);
  const [playing, setPlaying] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState(null);
  const [audioReactive, setAudioReactive] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [liveCameraOpen, setLiveCameraOpen] = useState(false);
  const [liveCameraError, setLiveCameraError] = useState("");
  const [liveAura, setLiveAura] = useState({
    auraKey: "neonNightlife",
    colors: ["6d5dfc", "19d8ff", "ff3df2"]
  });
  const [liveCapturing, setLiveCapturing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const [genreSettings, setGenreSettings] = useState(() => {
    try {
      return normalizeGenreSettings(JSON.parse(safeLocalStorageGet("aura_genre_settings", "null") || "null"));
    } catch {
      return { ...DEFAULT_GENRE_SETTINGS };
    }
  });
  const [showOnboarding, setShowOnboarding] = useState(() => !safeLocalStorageGet("aura_seen_onboarding"));
  const [auraHistory, setAuraHistory] = useState(() => {
    try {
      return JSON.parse(safeLocalStorageGet("aura_history", "[]") || "[]");
    } catch {
      return [];
    }
  });

  const colors = liveCameraOpen ? liveAura.colors : (result?.colors || unlockResult?.colors || imageColors);
  const environment = AURA_ENVIRONMENTS[(liveCameraOpen ? liveAura.auraKey : (result?.auraKey || unlockResult?.auraKey)) || "grungeNoir"];

  const gradientStyle = useMemo(() => ({
    "--aura-a": readableAccent(colors[0]),
    "--aura-b": readableAccent(colors[1]),
    "--aura-c": readableAccent(colors[2])
  }), [colors]);

  const enabledGenresCount = GENRE_OPTIONS.filter((genre) => genreSettings[genre.key]).length;


  useEffect(() => {
    if (typeof document === "undefined") return;
    let themeMeta = document.querySelector("meta[name='theme-color']");
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute("content", readableAccent(colors[1] || "07080a"));
  }, [colors]);

  useEffect(() => {
    safeLocalStorageSet("aura_genre_settings", JSON.stringify(genreSettings));
  }, [genreSettings]);

  function toggleGenre(key) {
    setGenreSettings((prev) => {
      const next = normalizeGenreSettings({ ...prev, [key]: !prev[key] });
      return next;
    });
  }


  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      installPromptRef.current = event;
      setInstallReady(true);
    };

    const handleInstalled = () => {
      installPromptRef.current = null;
      setInstallReady(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installAuraApp() {
    const prompt = installPromptRef.current;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice.catch(() => null);
    installPromptRef.current = null;
    setInstallReady(false);
  }



  useEffect(() => {
    if (!liveCameraOpen) return;

    let cancelled = false;
    let scanTimer = null;

    async function openLiveCamera() {
      try {
        setLiveCameraError("");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 1920 }
          },
          audio: false
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        liveCameraStreamRef.current = stream;

        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          await liveVideoRef.current.play();
        }

        scanTimer = window.setInterval(() => {
          const video = liveVideoRef.current;
          if (!video || video.readyState < 2) return;

          const nextMood = scanVideoMood(video);
          setLiveAura(nextMood);
          setImageColors(nextMood.colors);
        }, 1050);
      } catch (error) {
        console.warn("Live camera failed", error);
        setLiveCameraError("Camera access was blocked. Check browser permissions or use Upload instead.");
      }
    }

    openLiveCamera();

    return () => {
      cancelled = true;
      if (scanTimer) window.clearInterval(scanTimer);
      if (liveCameraStreamRef.current) {
        liveCameraStreamRef.current.getTracks().forEach((track) => track.stop());
        liveCameraStreamRef.current = null;
      }
    };
  }, [liveCameraOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    clearFadeTimer();
    playbackRequestRef.current += 1;
    setPlaying(false);
    setPreviewError("");
    setPreviewLoading(false);
    setAudioReactive(false);

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.muted = false;
    audio.loop = false;
    audio.preload = "auto";

    if (result?.previewUrl) {
      audio.src = result.previewUrl;
      audio.load();
    } else {
      audio.removeAttribute("src");
      audio.load();
    }
  }, [result?.previewUrl]);

  useEffect(() => {
    if (!result) return;
const entry = {
      id: `${result.song}-${result.artist}-${Date.now()}`,
      aura: result.aura,
      song: result.song,
      artist: result.artist,
      albumArt: result.albumArt,
      colors: result.colors,
      createdAt: new Date().toISOString()
    };

    setAuraHistory((prev) => {
      const entryKey = normalizeTrackKey(entry.song, entry.artist);
      const withoutDuplicate = prev.filter((item) => normalizeTrackKey(item.song, item.artist) !== entryKey);
      const next = [entry, ...withoutDuplicate].slice(0, 18);
      safeLocalStorageSet("aura_history", JSON.stringify(next));
      return next;
    });
  }, [result?.song, result?.artist]);
  async function unlockMobileAudio() {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      clearFadeTimer();
      audio.pause();
      audio.loop = true;
      audio.muted = true;
      audio.volume = 0;
      audio.playsInline = true;
      audio.preload = "auto";

      if (audio.src !== SILENT_AUDIO_SRC) {
        audio.src = SILENT_AUDIO_SRC;
        audio.load();
      }

      const prime = audio.play();
      if (prime !== undefined) await prime.catch(() => {});
      audioUnlockedRef.current = true;
      return true;
    } catch (error) {
      console.warn("Audio prime skipped", error);
      audioUnlockedRef.current = false;
      return false;
    }
  }

  function scheduleAutoPlay(built, delay = 260) {
    if (!built?.previewUrl || !autoPlayAfterMatchRef.current || !shouldAttemptAutoplay()) return;
    if (lastAutoPlayedPreviewRef.current === built.previewUrl) return;

    autoPlayAfterMatchRef.current = false;
    lastAutoPlayedPreviewRef.current = built.previewUrl;

    window.setTimeout(() => {
      playPreviewUrl(built.previewUrl, true);
    }, delay);
  }

  function clearRevealTimers() {
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    if (finalRevealTimerRef.current) window.clearTimeout(finalRevealTimerRef.current);
    revealTimerRef.current = null;
    finalRevealTimerRef.current = null;
  }

  function handleFile(file) {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setFileName(file.name || "Aura image");
    setResult(null);
    setUnlockResult(null);
    setPlaying(false);
    setPreviewError("");

    extractImageMood(imageUrl).then(({ colors }) => {
      setImageColors(colors);
    });
  }

  async function analyzeAura() {
    if (!image) {
      fileInputRef.current?.click();
      return;
    }

    clearRevealTimers();
    autoPlayAfterMatchRef.current = false;
    lastAutoPlayedPreviewRef.current = "";

    setLoading(true);
    setResult(null);
    setUnlockResult(null);
    setPlaying(false);
    setPreviewError("");
    setAudioReactive(false);
    setUnlocking(true);

    try {
      const mood = await extractImageMood(image);
      setImageColors(mood.colors);

      const built = await buildFreshAuraResult(mood.auraKey, mood.colors, genreSettings, mood.visualBrain);

      revealTimerRef.current = window.setTimeout(() => {
        setLoading(false);
        setUnlocking(false);
        setUnlockResult(built);
      }, 120);

      finalRevealTimerRef.current = window.setTimeout(() => {
        setResult(built);
        setUnlockResult(null);
        setUnlocking(true);
        window.setTimeout(() => setUnlocking(false), 780);
        // Manual preview only: one button tap starts audio more reliably across browsers.
      }, 420);
    } catch (error) {
      console.warn("Aura analysis failed", error);
      setLoading(false);
      setUnlocking(false);
      setPreviewError(error?.message || "Aura had trouble reading this image. Try another photo.");
      autoPlayAfterMatchRef.current = false;
    }
  }

  async function tryAnotherSong() {
    if (!result) return;
    setUnlockResult(null);
    setPlaying(false);
    setPreviewError("");
    fadeOutAndPause();
    const next = await buildFreshAuraResult(result.auraKey, result.colors, genreSettings, result.visualBrain);
    setResult(next);
    setUnlocking(true);
    window.setTimeout(() => setUnlocking(false), 1250);
  }


  function openLiveCameraMode() {
    setLiveCameraOpen(true);
    setLiveCameraError("");
    setResult(null);
    setUnlockResult(null);
    setPlaying(false);
    setPreviewError("");
    fadeOutAndPause();
  }

  function closeLiveCameraMode() {
    setLiveCameraOpen(false);
    setLiveCameraError("");
    setLiveCapturing(false);

    if (liveCameraStreamRef.current) {
      liveCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      liveCameraStreamRef.current = null;
    }
  }

  async function captureLiveAura() {
    const video = liveVideoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setLiveCameraError("Camera is still warming up. Try again in a second.");
      return;
    }

    clearRevealTimers();
    autoPlayAfterMatchRef.current = false;
    lastAutoPlayedPreviewRef.current = "";

    setLiveCapturing(true);
    setLoading(true);
    setResult(null);
    setUnlockResult(null);
    setPlaying(false);
    setPreviewError("");
    setAudioReactive(false);
    setUnlocking(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = canvas.toDataURL("image/jpeg", 0.92);
      const mood = scanVideoMood(video);

      setImage(frame);
      setFileName("Live camera aura");
      setImageColors(mood.colors);
      closeLiveCameraMode();

      const built = await buildFreshAuraResult(mood.auraKey, mood.colors, genreSettings, mood.visualBrain);

      revealTimerRef.current = window.setTimeout(() => {
        setLoading(false);
        setUnlocking(false);
        setUnlockResult(built);
        setLiveCapturing(false);
      }, 120);

      finalRevealTimerRef.current = window.setTimeout(() => {
        setResult(built);
        setUnlockResult(null);
        setUnlocking(true);
        window.setTimeout(() => setUnlocking(false), 780);
        // Manual preview only: one button tap starts audio more reliably across browsers.
      }, 420);
    } catch (error) {
      console.warn("Live aura capture failed", error);
      setLoading(false);
      setUnlocking(false);
      setLiveCapturing(false);
      setLiveCameraError(error?.message || "Aura had trouble reading the camera frame. Try again.");
      autoPlayAfterMatchRef.current = false;
    }
  }

  function resetApp() {
    clearRevealTimers();
    playbackRequestRef.current += 1;
    autoPlayAfterMatchRef.current = false;
    lastAutoPlayedPreviewRef.current = "";
    setImage(null);
    setFileName("");
    setLoading(false);
    setResult(null);
    setUnlockResult(null);
    setPlaying(false);
    setPreviewError("");
    setLiveCameraOpen(false);
    setLiveCameraError("");
    setLiveCapturing(false);
    fadeOutAndPause();
    setImageColors(["6d5dfc", "19d8ff", "ff3df2"]);
  }

  function clearFadeTimer() {
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }

  function fadeOutAndPause() {
    const audio = audioRef.current;
    if (!audio) return;

    clearFadeTimer();

    fadeTimerRef.current = window.setInterval(() => {
      const nextVolume = Math.max(0, audio.volume - 0.045);
      audio.volume = nextVolume;

      if (nextVolume <= 0.02) {
        clearFadeTimer();
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        setPlaying(false);
        setAudioReactive(false);
      }
    }, 38);
  }

  async function getFreshPreviewUrl(currentResult) {
    if (!currentResult) return "";

    setPreviewLoading(true);
    setPreviewError("");

    const media = await fetchSongMedia(currentResult.song, currentResult.artist);
    setPreviewLoading(false);

    if (media?.previewUrl) {
      setResult((prev) =>
        prev
          ? {
              ...prev,
              previewUrl: media.previewUrl,
              albumArt: media.albumArt || prev.albumArt,
              appleMusicUrl: media.appleMusicUrl || prev.appleMusicUrl,
              collectionName: media.collectionName || prev.collectionName
            }
          : prev
      );

      return media.previewUrl;
    }

    return "";
  }

  async function playPreviewUrl(previewUrl, autoStarted = false) {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return false;

    const requestId = ++playbackRequestRef.current;
    clearFadeTimer();

    try {
      setPreviewLoading(true);
      setPreviewError("");

      audio.pause();
      audio.loop = false;
      audio.currentTime = 0;
      audio.playsInline = true;
      audio.preload = "auto";
      // Do not set crossOrigin here. Apple/Deezer preview hosts can reject CORS-enabled media requests,
      // even though normal <audio> playback is allowed. Setting crossOrigin caused silent playback failures.

      if (audio.src !== previewUrl) {
        audio.src = previewUrl;
        audio.load();
      }

      audio.muted = false;
      audio.volume = 1;

      const playPromise = audio.play();
      if (playPromise !== undefined) await playPromise;

      if (requestId !== playbackRequestRef.current) return false;

      setPlaying(true);
      setAudioReactive(true);
      setPreviewError("");

      return true;
    } catch (error) {
      console.warn("Preview playback failed", error);
      if (requestId === playbackRequestRef.current) {
        setPlaying(false);
        setAudioReactive(false);
        setPreviewError("Preview could not play. Tap Play preview again or try Similar Track.");
      }
      return false;
    } finally {
      if (requestId === playbackRequestRef.current) setPreviewLoading(false);
    }
  }

  async function togglePreview() {
    const audio = audioRef.current;

    if (!audio || !result) return;

    clearFadeTimer();
    setPreviewError("");

    if (!audio.paused && !audio.ended) {
      playbackRequestRef.current += 1;
      audio.pause();
      setPlaying(false);
      setAudioReactive(false);
      return;
    }

    try {
      let previewUrl = result.previewUrl;

      if (!previewUrl) {
        previewUrl = await getFreshPreviewUrl(result);
      }

      if (!previewUrl) {
        setPreviewError("No playable preview found for this match. Try Similar Track.");
        return;
      }

      await playPreviewUrl(previewUrl, false);
    } catch (error) {
      console.warn("Preview playback failed", error);
      setPlaying(false);
      setAudioReactive(false);
      setPreviewError("Preview could not play. Try Similar Track.");
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setPlaying(true);
      setAudioReactive(true);
    };
    const handlePause = () => {
      setPlaying(false);
      setAudioReactive(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      clearRevealTimers();
      clearFadeTimer();
      audio.pause();
    };
  }, []);


  return (
    <main style={gradientStyle} className="relative min-h-screen overflow-hidden bg-[#07080a] text-white">
      <style>{auraRuntimeCss}</style>
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        className="hidden"
        onCanPlay={() => setPreviewLoading(false)}
        onPlay={() => {
          setPlaying(true);
          setAudioReactive(true);
        }}
        onPause={() => {
          setPlaying(false);
          setAudioReactive(false);
        }}
        onEnded={() => {
          setPlaying(false);
          setAudioReactive(false);
        }}
        onError={() => {
          const err = audioRef.current?.error;
          console.warn("Audio element failed", err);
          setPlaying(false);
          setAudioReactive(false);
          setPreviewLoading(false);
          setPreviewError("This preview link failed to load. Tap Similar Track for another playable match.");
        }}
      />

      <motion.div
        className="aura-gradient-mesh pointer-events-none fixed inset-0"
        animate={{ opacity: [0.62, 0.86, 0.62], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {[0, 1, 2].map((trail) => (
        <motion.div
          key={`trail-${trail}`}
          className="aura-trail fixed z-[2]"
          style={{
            left: `${18 + trail * 26}%`,
            top: `${20 + trail * 15}%`,
            background: `radial-gradient(circle, ${readableAccent(colors[trail % colors.length])}, transparent 68%)`
          }}
          animate={{
            x: [0, trail % 2 ? -36 : 36, 0],
            y: [0, trail % 2 ? 44 : -44, 0],
            scale: [1, 1.25, 1],
            opacity: [0.12, 0.34, 0.12]
          }}
          transition={{ duration: 8 + trail * 1.7, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/72 px-5 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="aura-onboarding-card w-full max-w-sm rounded-[2.5rem] p-7 text-center"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.68, ease: CASCADE_EASE }}
            >
              <motion.div
                className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-[conic-gradient(from_0deg,var(--aura-a),var(--aura-b),var(--aura-c),var(--aura-a))] shadow-[0_0_80px_var(--aura-b)]"
                animate={{ rotate: [0, 360], scale: [1, 1.06, 1] }}
                transition={{ rotate: { duration: 16, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              >
                <Sparkles size={30} className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,.8)]" />
              </motion.div>

              <p className="text-xs uppercase tracking-[0.36em] text-white/38">welcome to aura</p>
              <h2 className="mt-3 text-5xl font-semibold leading-[0.9] tracking-[-0.09em]">Turn a photo into a feeling.</h2>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/55">
                Upload or capture a moment. Aura reads its color, energy, and mood, then unlocks the song that matches it.
              </p>

              <button
                onClick={() => {
                  window.localStorage.setItem("aura_seen_onboarding", "true");
                  setShowOnboarding(false);
                }}
                className="mt-7 w-full rounded-3xl bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] px-5 py-4 text-sm font-black text-black shadow-[0_0_46px_var(--aura-b)] transition active:scale-[0.985]"
              >
                Start reading
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="fixed inset-0 z-[92] flex items-end justify-center bg-black/62 px-4 pb-4 backdrop-blur-2xl sm:items-center sm:pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="aura-onboarding-card w-full max-w-md rounded-[2.4rem] p-5 text-white"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.42, ease: CASCADE_EASE }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-white/35">aura settings</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.07em]">Music taste filter</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/48">
                    Toggle genres on or off. Aura will use these genres when it searches for the photo's song match.
                  </p>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="ios-glass rounded-full p-3 text-white/70 transition active:scale-95" aria-label="Close settings">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const enabled = !!genreSettings[genre.key];
                  return (
                    <button
                      key={genre.key}
                      onClick={() => toggleGenre(genre.key)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition active:scale-[0.985] ${enabled ? "border-white/18 bg-white/[0.09]" : "border-white/8 bg-black/20 opacity-55"}`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-white/82">{genre.label}</span>
                        <span className="block text-xs text-white/34">{genre.terms.slice(0, 3).join(" · ")}</span>
                      </span>
                      <span className={`h-7 w-12 rounded-full p-1 transition ${enabled ? "bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))]" : "bg-white/10"}`}>
                        <span className={`block h-5 w-5 rounded-full bg-white shadow-lg transition ${enabled ? "translate-x-5" : "translate-x-0"}`} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {installReady && (
                <button
                  onClick={installAuraApp}
                  className="ios-glass mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white/78 transition active:scale-[0.985]"
                >
                  Install Aura as app
                </button>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGenreSettings({ ...DEFAULT_GENRE_SETTINGS })}
                  className="ios-glass rounded-2xl px-4 py-3 text-sm font-semibold text-white/72 transition active:scale-[0.985]"
                >
                  Enable all
                </button>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="rounded-2xl bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] px-4 py-3 text-sm font-black text-black transition active:scale-[0.985]"
                >
                  Save taste
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {liveCameraOpen && (
          <motion.div
            className="aura-live-camera fixed inset-0 z-[95] overflow-hidden text-white"
            style={gradientStyle}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.48, ease: IOS_EASE }}
          >
            <video
              ref={liveVideoRef}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.1)_42%,rgba(0,0,0,.78))]" />
            <motion.div
              className="aura-color-bloom pointer-events-none absolute inset-[-20%]"
              animate={{ opacity: [0.32, 0.7, 0.32], scale: [1, 1.08, 1] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-5 py-6">
              <header className="flex items-center justify-between">
                <div className="ios-glass rounded-full px-4 py-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">live aura</p>
                  <p className="text-sm font-semibold text-white/78">{getLiveCameraAuraLabel(liveAura.auraKey)}</p>
                </div>

                <button
                  onClick={closeLiveCameraMode}
                  className="ios-glass rounded-full px-4 py-2 text-sm font-semibold text-white/70"
                >
                  Close
                </button>
              </header>

              <div className="flex flex-1 items-center justify-center">
                <motion.div
                  className="aura-camera-reticle relative h-72 w-72 rounded-full"
                  animate={{
                    scale: [1, 1.035, 1],
                    rotate: [0, 2, 0, -2, 0]
                  }}
                  transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    className="aura-scan-line absolute left-[-20%] right-[-20%] top-1/2 h-px rounded-full"
                    animate={{ y: [-118, 118, -118], opacity: [0.22, 1, 0.22] }}
                    transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_24px_var(--aura-b)]" />
                </motion.div>
              </div>

              <div>
                {liveCameraError && (
                  <p className="ios-glass mb-3 rounded-2xl px-4 py-3 text-center text-xs text-white/68">
                    {liveCameraError}
                  </p>
                )}

                <div className="ios-glass mb-3 rounded-[2rem] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-white/35">scanning</p>
                      <h2 className="mt-1 text-3xl font-black tracking-[-0.07em]">{getLiveCameraAuraLabel(liveAura.auraKey)}</h2>
                    </div>
                    <div className="flex gap-1.5">
                      {liveAura.colors.map((color, index) => (
                        <span
                          key={`${color}-${index}`}
                          className="h-8 w-8 rounded-full border border-white/15 shadow-[0_0_24px_var(--aura-b)]"
                          style={{ background: readableAccent(color) }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/48">
                    Move your camera around. Aura reads the live color, contrast, light, and energy field before locking the music match.
                  </p>
                </div>

                <button
                  onClick={captureLiveAura}
                  disabled={liveCapturing || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] px-5 py-4 text-sm font-black text-black shadow-[0_0_54px_var(--aura-b)] transition active:scale-[0.985] disabled:opacity-60"
                >
                  <Sparkles size={18} />
                  {liveCapturing ? "Capturing aura..." : "Capture Live Aura"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {unlockResult && <SongUnlockOverlay reveal={unlockResult} image={image} colors={unlockResult.colors || colors} />}
      </AnimatePresence>
      <AmbientParticles colors={colors} active={loading || unlocking || !!result} />

      <AnimatePresence>
        {result && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[18] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.2, opacity: 0.85 }}
              animate={{ scale: 5.2, opacity: 0 }}
              transition={{ duration: 1.25, ease: CASCADE_EASE }}
              className="h-40 w-40 rounded-full bg-[radial-gradient(circle,var(--aura-a),transparent_68%)] blur-[28px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result?.albumArt && (
          <motion.img
            key={result.albumArt}
            src={result.albumArt}
            alt="Blurred album background"
            initial={{ opacity: 0, scale: 1.18, filter: "blur(42px) saturate(1)" }}
            animate={{ opacity: 0.24, scale: 1.28, filter: "blur(58px) saturate(1.18)" }}
            exit={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 1.15, ease: IOS_EASE }}
            className="pointer-events-none fixed inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>

      
      <AnimatePresence>
        {immersiveMode && result && (
          <motion.div
            className="fixed inset-0 z-[70] overflow-hidden bg-[#020304]"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.62, ease: CASCADE_EASE }}
          >
            <motion.img
              src={result.albumArt}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-30 blur-[80px] scale-125"
              animate={{ scale: [1.18, 1.26, 1.18] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.78))]" />
            <div className="absolute inset-0" style={{ background: environment.overlay }} />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-10">
              <button
                onClick={() => setImmersiveMode(false)}
                className="ios-glass self-end rounded-full px-4 py-2 text-sm text-white/70"
              >
                Close
              </button>

              <div className="flex flex-col items-center">
                <div className="relative mb-8">
                  <motion.div
                    animate={{
                      scale: audioReactive ? [1, 1.12, 1] : [1, 1.04, 1],
                      opacity: audioReactive ? [0.45, 0.9, 0.45] : [0.22, 0.5, 0.22]
                    }}
                    transition={{ duration: audioReactive ? 1.8 : 5.5, repeat: Infinity }}
                    className="absolute inset-[-40px] rounded-full bg-[radial-gradient(circle,var(--aura-a),transparent_65%)] blur-[50px]"
                  />

                  <img
                    src={result.albumArt}
                    alt={result.song}
                    layoutId="shared-album-art" className="relative h-72 w-72 rounded-[2.8rem] object-cover shadow-[0_30px_120px_rgba(0,0,0,.65)]"
                  />
                </div>

                <h2 className="text-center text-4xl font-semibold tracking-[-0.08em]">
                  {result.song}
                </h2>

                <p className="mt-2 text-sm text-white/55">
                  {result.artist}
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12, ease: IOS_EASE }}
                  className="ios-glass mt-4 max-w-xs rounded-[1.5rem] px-4 py-3 text-center"
                >
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/32">
                    artist note
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/58">
                    {getArtistSummary(result.artist)}
                  </p>
                </motion.div>

                <div className="opacity-70">
                  <AudioWaveform active={playing || audioReactive} colors={colors} />
                </div>

                <div className="ios-glass mt-6 rounded-[2rem] px-5 py-4 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                    aura
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
                    {result.aura}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
                    {result.reason}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={togglePreview}
                  className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] text-black shadow-2xl transition duration-300 active:scale-95"
                >
                  {playing ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>

                <AudioWaveform active={playing || audioReactive} colors={colors} />

                <p className="mt-4 text-xs text-white/35">
                  immersive playback mode
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="pointer-events-none fixed inset-0 bg-[#020304]/95" />
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          animate={{ y: [0, 18, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-[-12rem] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--aura-a),var(--aura-b),transparent_68%)] opacity-32 blur-[92px]"
        />
        <motion.div
          animate={{ x: [0, -18, 0], y: [0, -12, 0], scale: [1, 1.07, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-14rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,var(--aura-c),var(--aura-b),transparent_70%)] opacity-22 blur-[112px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.045),transparent_44%)]" />
        <motion.div
          animate={{
            opacity: audioReactive ? [environment.opacity, environment.opacity + 0.18, environment.opacity] : [environment.opacity * 0.55, environment.opacity, environment.opacity * 0.55],
            scale: audioReactive ? [1, 1.12, 1] : [1, 1.05, 1]
          }}
          transition={{ duration: audioReactive ? 2.2 : 6.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--aura-a),transparent_58%)]"
          style={{ filter: `blur(${environment.blur})` }}
        />

      </div>

      
      <AnimatePresence>
        {unlocking && (
          <motion.div
            className="aura-unlock pointer-events-none fixed inset-0 z-20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: IOS_EASE }}
          >
            <motion.div
              className="aura-unlock-wash"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: [0, 0.46, 0], scale: [0.96, 1.035, 1.08] }}
              transition={{ duration: 1.2, ease: IOS_EASE }}
            />
            <motion.div
              className="aura-unlock-sweep"
              initial={{ opacity: 0, x: "-120%" }}
              animate={{ opacity: [0, 0.34, 0], x: "120%" }}
              transition={{ duration: 1.14, ease: IOS_EASE }}
            />
          </motion.div>
        )}
      </AnimatePresence>


<section className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.06em]">Aura</h1>
            <p className="text-xs text-white/42">find the sound of a photo</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="ios-glass rounded-full p-3 text-white/70 transition active:scale-95"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={resetApp}
              className="ios-glass rounded-full p-3 text-white/70 transition active:scale-95"
              aria-label="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <AnimatePresence mode="wait">
            {!image && !loading && !result && (
              <motion.div key="home" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="flex w-full flex-col items-center">
                <div className="mb-7 space-y-3">
                  <p className="text-xs uppercase tracking-[0.38em] text-white/35">photo to music</p>
                  <h2 className="mx-auto max-w-sm text-5xl font-semibold leading-[0.92] tracking-[-0.08em]">Tap into your aura.</h2>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/45">Upload a moment. Aura reads the mood and gives it a song.</p>
                  <button onClick={() => setSettingsOpen(true)} className="mt-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/48 transition active:scale-95">
                    {enabledGenresCount} genres enabled
                  </button>
                </div>

                <AuraSphere colors={colors} onClick={() => fileInputRef.current?.click()} loading={audioReactive} />

                <div className="grid w-full grid-cols-2 gap-3">
                  <button onClick={openLiveCameraMode} className="ios-glass flex items-center justify-center gap-2 rounded-3xl px-4 py-4 text-sm font-semibold text-white/84 transition duration-500 ease-out hover:scale-[1.015] active:scale-[0.985]">
                    <Camera size={17} /> Live Camera
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="ios-glass flex items-center justify-center gap-2 rounded-3xl px-4 py-4 text-sm font-semibold text-white/84 transition duration-500 ease-out hover:scale-[1.015] active:scale-[0.985]">
                    <ImagePlus size={17} /> Library
                  </button>
                </div>
              </motion.div>
            )}

            {image && !loading && !result && (
              <motion.div key="preview" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="flex w-full flex-col items-center">
                <AuraSphere colors={colors} image={image} onClick={analyzeAura} loading={audioReactive} />
                <p className="mb-1 max-w-xs truncate text-sm font-medium text-white/70">{fileName}</p>
                <p className="mb-5 text-xs text-white/35">tap the sphere to read the mood</p>
                <button onClick={analyzeAura} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] px-5 py-4 text-sm font-bold text-black shadow-2xl transition duration-500 ease-out hover:scale-[1.015] active:scale-[0.985] disabled:opacity-60">
                  <Sparkles size={18} /> {loading ? "Reading Aura..." : "Read Aura"}
                </button>
                {previewError && !result && (
                  <p className="mt-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-xs leading-relaxed text-white/62">{previewError}</p>
                )}
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="flex flex-col items-center">
                <AuraSphere colors={colors} image={image} onClick={() => {}} loading />
                <h3 className="text-3xl font-semibold tracking-[-0.06em]">Listening to the image</h3>
                <p className="mt-2 text-sm text-white/42">reading color, light, mood, and energy...</p>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 34, scale: 0.97, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: -18, scale: 0.98, filter: "blur(10px)" }} transition={{ duration: 0.82, ease: CASCADE_EASE }} className="w-full">
                <div className="aura-result-hero ios-glass mb-5 overflow-hidden rounded-[2.3rem] p-2 shadow-2xl shadow-black/40">
                  <div className="relative">
                    <div className="aura-color-bloom pointer-events-none absolute inset-[-22%] opacity-70" />
                    <img src={image} alt="Aura result" className="h-[380px] w-full rounded-[1.8rem] object-cover" />
                    <div className="absolute inset-0 rounded-[1.8rem] bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,.16),transparent_25%),linear-gradient(to_top,#050607,rgba(0,0,0,.16),transparent)]" />
                    <button onClick={() => setImmersiveMode(true)} className="group absolute bottom-4 left-4 transition duration-300 active:scale-95" aria-label="Open immersive playback mode">
                      <img src={result.albumArt} alt={`${result.song} album art`} layoutId="shared-album-art" className="h-28 w-28 rounded-[1.4rem] border border-white/25 object-cover shadow-[0_0_44px_var(--aura-b),0_20px_50px_rgba(0,0,0,.62)]" />
                      <motion.span
                        className="absolute -right-2 -top-2 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/78 shadow-xl backdrop-blur-xl"
                        animate={{ opacity: [0.72, 1, 0.72], y: [0, -2, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        tap
                      </motion.span>
                      <span className="absolute inset-0 rounded-2xl ring-1 ring-white/0 transition group-hover:ring-white/30" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))]" />
                  </div>
                </div>

                <div className="aura-result-card rounded-[2rem] p-5 text-left shadow-xl shadow-black/40">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/35">your aura</p>
                  <h2 className={`aura-result-title aura-type-glow mt-1 text-4xl ${auraTypographyClass(result.auraKey)}`}>{result.aura}</h2>
                  <p className="mt-2 text-sm text-white/58">{result.mood}</p>
                  {result.visualBrain?.confidence && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-5">
                      <div className="rounded-2xl bg-white/[0.05] px-2 py-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/28">energy</p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/68">{result.visualBrain.energyLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.05] px-2 py-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/28">light</p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/68">{result.visualBrain.lightLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.05] px-2 py-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/28">texture</p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/68">{result.visualBrain.textureLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.05] px-2 py-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/28">motion</p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/68">{result.visualBrain.paceLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.05] px-2 py-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/28">read</p>
                        <p className="mt-1 text-xs font-semibold text-white/68">{result.visualBrain.confidence}%</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] shadow-[0_0_28px_var(--aura-b)]" />
                  <div className="mt-2 flex gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--aura-a)] opacity-80" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--aura-b)] opacity-70" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--aura-c)] opacity-60" />
                  </div>

                  <div className="my-3 h-px bg-white/10" />

                  <div className="aura-song-pill flex items-center gap-3 rounded-[1.5rem] p-3">
                    <img src={result.albumArt} alt={`${result.song} album art`} className="h-16 w-16 rounded-2xl object-cover shadow-xl shadow-black/40" />
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.26em] text-white/35">song match</p>
                      <h3 className="truncate text-xl font-semibold tracking-[-0.03em]">{result.song}</h3>
                      <p className="text-sm text-white/45">{result.artist}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-white/58">{getAuraDescription(result)}</p>

                  <button onClick={togglePreview} disabled={previewLoading || !result?.previewUrl} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] px-4 py-3.5 text-sm font-black text-black shadow-[0_0_42px_color-mix(in_srgb,var(--aura-b)_45%,transparent)] transition duration-300 ease-out active:scale-[0.985] disabled:opacity-55">
                    {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    {previewLoading ? "Finding preview..." : playing ? "Pause preview" : result?.previewUrl ? "Play preview" : "Preview unavailable"}
                  </button>
                  {previewError && (
                    <p className="mt-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-xs leading-relaxed text-white/62">{previewError}</p>
                  )}

                  

                  <a href={result.spotifyUrl} target="_blank" rel="noreferrer" className="ios-glass mt-3 flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white/78 transition duration-500 ease-out hover:scale-[1.015] active:scale-[0.985]">
                    Open song search <ExternalLink size={15} />
                  </a>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button onClick={tryAnotherSong} className="ios-glass rounded-3xl px-4 py-4 text-sm font-semibold text-white/78 transition duration-500 ease-out hover:scale-[1.015] active:scale-[0.985]">Similar Track</button>
                  <button onClick={resetApp} className="rounded-3xl bg-[linear-gradient(90deg,var(--aura-a),var(--aura-b),var(--aura-c))] px-4 py-4 text-sm font-bold text-black transition duration-500 ease-out hover:scale-[1.015] active:scale-[0.985]">New photo</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        
        {auraHistory.length > 0 && (
          <div className="pb-5">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-white/28">recent auras</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {auraHistory.slice(0, 6).map((item) => (
                <div key={item.id} className="aura-history-card min-w-[138px] rounded-[1.4rem] p-2">
                  <img src={item.albumArt} alt="" className="h-20 w-full rounded-[1rem] object-cover" />
                  <p className="mt-2 truncate text-xs font-semibold text-white/75">{item.aura}</p>
                  <p className="truncate text-[11px] text-white/38">{item.song}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="pb-1 text-center text-[11px] text-white/28">Aura v0.7 · smarter aura engine</footer>
      </section>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
    </main>
  );
}
