let cachedSpotifyToken = null;
let cachedSpotifyTokenExpiresAt = 0;

async function getSpotifyToken(clientId, clientSecret) {
  const now = Date.now();
  if (cachedSpotifyToken && cachedSpotifyTokenExpiresAt > now + 30000) {
    return cachedSpotifyToken;
  }

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
    const error = new Error("Spotify token failed");
    error.status = tokenResponse.status;
    error.details = message;
    throw error;
  }

  const data = await tokenResponse.json();
  cachedSpotifyToken = data.access_token;
  cachedSpotifyTokenExpiresAt = now + Math.max(300, Number(data.expires_in || 3600) - 60) * 1000;
  return cachedSpotifyToken;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const song = String(req.query.song || "").trim();
  const artist = String(req.query.artist || "").trim();
  const q = String(req.query.q || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 50);
  const market = String(req.query.market || "US").trim().toUpperCase() || "US";

  if (!q && !song && !artist) {
    return res.status(400).json({ error: "Missing song, artist, or q" });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Missing Spotify environment variables" });
  }

  try {
    const access_token = await getSpotifyToken(clientId, clientSecret);
    const searchText = q || [song, artist].filter(Boolean).join(" ");
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchText)}&type=track&market=${encodeURIComponent(market)}&limit=${limit}`;

    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!searchResponse.ok) {
      const message = await searchResponse.text();
      return res.status(searchResponse.status).json({ error: "Spotify search failed", details: message });
    }

    const searchData = await searchResponse.json();
    const tracks = searchData?.tracks?.items || [];
    const artistIds = [...new Set(tracks.map((track) => track?.artists?.[0]?.id).filter(Boolean))].slice(0, 50);
    let artistsById = {};

    if (artistIds.length) {
      const artistsResponse = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds.join(",")}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json();
        artistsById = Object.fromEntries((artistsData?.artists || []).filter(Boolean).map((item) => [item.id, item]));
      }
    }

    const enrichedTracks = tracks.map((track) => {
      const mainArtist = artistsById[track?.artists?.[0]?.id] || null;
      return {
        ...track,
        artistFollowers: mainArtist?.followers?.total ?? 0,
        artistGenres: mainArtist?.genres || [],
        artistImage: mainArtist?.images?.[0]?.url || mainArtist?.images?.[1]?.url || ""
      };
    });

    const firstArtist = tracks[0]?.artists?.[0]?.id ? artistsById[tracks[0].artists[0].id] : null;

    return res.status(200).json({
      tracks: enrichedTracks,
      artist: firstArtist,
      artistFollowers: firstArtist?.followers?.total ?? 0,
      market
    });
  } catch (error) {
    return res.status(error?.status || 500).json({ error: error?.message || "Spotify server error", details: error?.details || String(error) });
  }
}
