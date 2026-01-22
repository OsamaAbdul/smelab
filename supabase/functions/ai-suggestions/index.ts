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
    const { businessType, goal, clients, stage } = await req.json();

    if (!businessType || !goal) {
      return new Response(
        JSON.stringify({ error: "Business type and goal are required" }),
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
          You are a business naming assistant.
          Suggest exactly 5 creative business names for a ${businessType} company.

          Goal: ${goal}.
          Target clients: ${clients || "general audience"}.
          Stage: ${stage || "unspecified"}.

          ⚠️ IMPORTANT: Return ONLY a valid JSON array of 5 strings.
          Example:
          ["Name1", "Name2", "Name3", "Name4", "Name5"]
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

    // 🧩 Parse into array
    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(text);
      if (!Array.isArray(suggestions)) throw new Error("Invalid JSON array");
    } catch {
      // Fallback parsing if JSON is malformed
      suggestions = text
        .replace(/[\[\]"]/g, "") // Clean up potential JSON chars if parse failed
        .split(/[\n,]/)
        .map((s: string) => s.replace(/^\d+[\.\)]?\s*/, "").trim())
        .filter((s: string) => s.length > 0)
        .slice(0, 5);
    }

    return new Response(JSON.stringify({ success: true, suggestions }), {
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
