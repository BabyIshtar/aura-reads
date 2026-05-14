export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const song = String(req.query.song || "").trim();
  const artist = String(req.query.artist || "").trim();
  const q = String(req.query.q || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 50);

  if (!q && !song && !artist) {
    return res.status(400).json({ error: "Missing song, artist, or q" });
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
    const searchText = q || `track:${song} artist:${artist}`.trim();
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchText)}&type=track&market=US&limit=${limit}`;

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
      market: "US"
    });
  } catch (error) {
    return res.status(500).json({ error: "Spotify server error", details: error?.message || String(error) });
  }
}
