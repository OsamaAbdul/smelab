import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

Deno.serve(async (req: Request) => {
    // ✅ Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
            },
        });
    }

    try {
        const { businessIdea } = await req.json();

        if (!businessIdea) {
            return new Response(
                JSON.stringify({ error: "Business idea is required" }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
        }

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY in environment variables");
        }

        // 🧠 Build the user prompt
        const userPrompt = `
      You are an expert business consultant and brand strategist.
      Analyze the following business idea: "${businessIdea}"

      Provide:
      1. A creative, professional business Name.
      2. A short, catchy Slogan.
      3. A Viability Score (0-100) based on market trends.

      ⚠️ IMPORTANT: Return ONLY a valid JSON object.
      Example:
      {
        "name": "EcoLogix",
        "slogan": "Sustainable shipping for a greener future.",
        "score": 88
      }
    `;

        // 🚀 Use Google Gemini API
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API Error (${model}):`, errorText);
            throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
            throw new Error("Gemini returned no content");
        }

        // 🧹 Extract text
        let text = data.candidates[0].content.parts[0].text.trim();

        // 🧽 Clean up markdown/json wrappers
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let result;
        try {
            result = JSON.parse(text);
            if (!result.name || !result.slogan || typeof result.score !== 'number') {
                throw new Error("Invalid JSON structure");
            }
        } catch {
            // Fallback if parsing fails - provide generic mock to avoid breaking UI, or error out.
            // For a robust UX, let's error so the frontend handles it or provide a safe fallback.
            // Let's try to regex extract if JSON parse fails
            const nameMatch = text.match(/"name":\s*"([^"]+)"/);
            const sloganMatch = text.match(/"slogan":\s*"([^"]+)"/);
            const scoreMatch = text.match(/"score":\s*(\d+)/);

            if (nameMatch && sloganMatch && scoreMatch) {
                result = {
                    name: nameMatch[1],
                    slogan: sloganMatch[1],
                    score: parseInt(scoreMatch[1])
                };
            } else {
                throw new Error("Could not parse Gemini response");
            }
        }

        return new Response(JSON.stringify({ success: true, result }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (err: any) {
        console.error("❌ Function error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
});
