export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const q = String(req.query.q || req.query.term || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 35), 1), 75);
  if (!q) return res.status(400).json({ error: "Missing q" });

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&country=US&limit=${limit}`;
    const response = await fetch(url, { headers: { "User-Agent": "Aura/1.0" } });
    if (!response.ok) return res.status(response.status).json({ error: "iTunes search failed", details: await response.text() });
    const data = await response.json();
    const tracks = (Array.isArray(data?.results) ? data.results : [])
      .filter((item) => item?.trackName && item?.artistName)
      .map((item) => ({
        song: item.trackName,
        artist: item.artistName,
        albumArt: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : "",
        previewUrl: item.previewUrl ? item.previewUrl.replace("http://", "https://") : "",
        appleMusicUrl: item.trackViewUrl || "",
        collectionName: item.collectionName || "",
        primaryGenreName: item.primaryGenreName || "",
        releaseYear: item.releaseDate ? String(item.releaseDate).slice(0, 4) : "",
        source: "itunes"
      }));

    return res.status(200).json({ tracks, source: "itunes", q });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "iTunes server error", details: String(error) });
  }
}
