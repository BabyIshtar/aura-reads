export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageDataUrl, colorMood } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return res.status(400).json({ error: "Missing imageDataUrl" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are the AI Aura Brain for a cinematic music matching app. Analyze the uploaded image emotionally and aesthetically. Return ONLY valid JSON. No markdown."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Local color engine result: ${JSON.stringify(colorMood || {})}\n\nChoose exactly one auraKey from: grungeNoir, neonNightlife, warmDreamscape, editorialLuxury, stormPressure. Also create music search seeds that would fit the image. Return JSON with this shape: {"auraKey":"...","confidence":0.0,"vibe":"...","emotion":"...","scene":"...","style":"...","lighting":"...","energy":"...","musicKeywords":["..."],"reason":"...","visualTags":["..."]}`
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
                detail: "low"
              }
            ]
          }
        ],
        max_output_tokens: 550
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: "OpenAI request failed", details: errorText });
    }

    const data = await response.json();
    const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("\n") || "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        auraKey: colorMood?.auraKey || "grungeNoir",
        confidence: 0.4,
        vibe: "cinematic visual mood",
        emotion: "atmospheric",
        scene: "unknown scene",
        style: "visual aura",
        lighting: "mixed lighting",
        energy: "medium",
        musicKeywords: ["cinematic", "moody", "atmospheric"],
        reason: text.slice(0, 500),
        visualTags: []
      };
    }

    const allowedAuraKeys = ["grungeNoir", "neonNightlife", "warmDreamscape", "editorialLuxury", "stormPressure"];
    if (!allowedAuraKeys.includes(parsed.auraKey)) {
      parsed.auraKey = colorMood?.auraKey || "grungeNoir";
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Aura AI error", error);
    return res.status(500).json({ error: "Aura AI failed", details: error?.message || String(error) });
  }
}
