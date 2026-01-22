import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

declare const Deno: any;

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// Using the 2025 stable Gemini 2.0 Flash model
const IMAGEN_MODEL = "gemini-2.0-flash-exp";
const IMAGEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:generateContent?key=${GEMINI_API_KEY}`;


async function generateRealImage(prompt: string) {
  const response = await fetch(IMAGEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API Error: ${error}`);
  }

  const result = await response.json();

  // Try different paths for image data
  let imageData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!imageData) {
    // Some versions might put it in a different part or candidate
    const partWithImage = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    imageData = partWithImage?.inlineData?.data;
  }

  if (!imageData) {
    console.error("Gemini Response Structure:", JSON.stringify(result, null, 2));
    throw new Error("No image data found in response. The model may not have generated an image.");
  }

  return imageData;

}

Deno.serve(async (req: Request) => {
  // 1. CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const body = await req.json();
    const { type, businessType, businessName, description } = body;

    if (!type || !businessName) {
      return new Response(JSON.stringify({ error: "Missing required fields: type and businessName" }), { status: 400, headers });
    }

    // 2. Auth Check
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader?.replace("Bearer ", "") || "");

    if (authError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });


    // 3. Senior-Level Prompt Engineering
    const isLogo = type.toLowerCase() === 'logo';

    // Core Subject definition with role-playing
    const role = isLogo
      ? "Design a world-class, vector-style logo suitable for a Fortune 500 brand identity."
      : "Design a high-converting, premium marketing flyer with commercial-grade composition.";

    const context = `Client: "${businessName}" (${businessType}). Requirements: ${description || "Create a market-leading visual identity."}`;

    // distinct style strategies
    const logoStyles = [
      "Style: 'Modern Minimalist'. Focus on geometric precision, clean lines, and negative space. A singular, iconic symbol. Flat design, vector aesthetic. White background. Professional, tech-forward, scalable.",
      "Style: 'Abstract 3D Gradient'. Use vibrant glassmorphism, isometric shapes, and fluid gradients. Futuristic, dynamic, and glowing. Centered composition on a dark background for contrast.",
      "Style: 'Timeless Luxury'. Serif-inspired forms, gold or metallic textures, symmetrical balance. Sophisticated, elegant, and high-end. Monochromatic with one accent color."
    ];

    const flyerStyles = [
      "Style: 'Corporate Clean'. Swiss typography, grid-based layout, ample whitespace. vivid product photography feel. Professional, trustworthy, and organized.",
      "Style: 'Vibrant Marketing'. Bold typography overlay, energetic color palette, dynamic diagonal composition. Eye-catching, persuasive, and action-oriented.",
      "Style: 'Dark Mode editorial'. moody lighting, neon accents, cinematic depth of field. High-contrast, sleek, and modern."
    ];

    const strategies = isLogo ? logoStyles : flyerStyles;

    // Technical quality boosters appended to every prompt
    const techSpecs = "8k resolution, trending on Behance, award-winning, masterwork, sharp details.";
    const negativeConstraints = isLogo
      ? "Avoid: photorealistic details, cluttered elements, shadowing, complex backgrounds, text distortions."
      : "Avoid: blurry text, chaotic layout, low resolution, amateur composition.";

    const variations = strategies.map(style =>
      `${role} ${context} ${style} ${techSpecs} ${negativeConstraints}`
    );

    // 4. Parallel Generation (Performance Boost)
    // Using Promise.all is much faster than a sequential for-loop
    const generationPromises = variations.map(prompt => generateRealImage(prompt));
    const results = await Promise.allSettled(generationPromises);

    const images = results
      .filter(r => r.status === "fulfilled")
      .map((r: any) => ({
        data: r.value,
        format: "png",
        mimeType: "image/png"
      }));

    const errors = results
      .filter(r => r.status === "rejected")
      .map((r: any) => r.reason.message);

    if (images.length === 0 && errors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `Generation failed: ${errors.join(", ")}`
      }), { headers });
    }

    return new Response(JSON.stringify({
      success: true,
      count: images.length,
      images,
      errors // return errors even if some images succeeded
    }), { headers });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});