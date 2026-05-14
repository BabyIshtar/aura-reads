export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const song = String(req.query.song || "").trim();
  const artist = String(req.query.artist || "").trim();

  if (!song && !artist) {
    return res.status(400).json({ error: "Missing song or artist" });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Missing Spotify environment variables" });
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!tokenResponse.ok) {
      const message = await tokenResponse.text();
      return res.status(tokenResponse.status).json({ error: "Spotify token failed", details: message });
    }

    const { access_token } = await tokenResponse.json();
    const query = encodeURIComponent(`track:${song} artist:${artist}`.trim());
    const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&market=US&limit=20`;

    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!searchResponse.ok) {
      const message = await searchResponse.text();
      return res.status(searchResponse.status).json({ error: "Spotify search failed", details: message });
    }

    const searchData = await searchResponse.json();
    const tracks = searchData?.tracks?.items || [];
    const firstArtistId = tracks[0]?.artists?.[0]?.id || "";
    let artistData = null;

    if (firstArtistId) {
      const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${firstArtistId}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      if (artistResponse.ok) {
        artistData = await artistResponse.json();
      }
    }

    return res.status(200).json({
      tracks,
      artist: artistData,
      artistFollowers: artistData?.followers?.total ?? 0,
      market: "US"
    });
  } catch (error) {
    return res.status(500).json({ error: "Spotify server error", details: error?.message || String(error) });
  }
}
