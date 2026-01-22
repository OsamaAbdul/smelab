# AI Image Generator - Real Image Generation with Hugging Face

## Overview
This Supabase Edge Function generates **real PNG/JPG images** for logos and flyers using the **Hugging Face Inference API** with the state-of-the-art **FLUX.1-dev** model.

## Features

✅ **Real Image Generation** - High-quality PNG outputs
✅ **FLUX.1-dev Model** - Known for excellent prompt adherence and image quality
✅ **3 Variations** - Generates Modern, Creative, and Elegant styles per request
✅ **Fast & Professional** - Optimized for business use cases
✅ **Fallback Support** - Generates a placeholder SVG if the API fails

---

## Prerequisites

1. **Hugging Face Account**
2. **Hugging Face Access Token** (Read permissions)
3. **Supabase Project** with Edge Functions
4. **Supabase CLI** installed

---

## Setup Instructions

### 1. Get Hugging Face Token

1. Go to [Hugging Face Settings > Tokens](https://huggingface.co/settings/tokens)
2. Create a new token with **Read** permissions
3. Copy the token (starts with `hf_...`)

### 2. Configure Supabase Secrets

```bash
cd client

# Set API key
supabase secrets set HF_TOKEN=your_hugging_face_token_here
```

### 3. Deploy

```bash
supabase functions deploy ai-generator
```

---

## API Usage

### Request Format

```typescript
POST /functions/v1/ai-generator

{
  "type": "logo" | "flyer",
  "businessType": "Tech Startup",
  "businessName": "InnovateTech",
  "description": "Optional description for flyers"
}
```

### Response Format

```typescript
{
  "success": true,
  "type": "logo",
  "count": 3,
  "images": [
    {
      "data": "base64_encoded_image_data",
      "format": "png",
      "mimeType": "image/png"
    },
    // ... 2 more variations
  ]
}
```

---

## Image Specifications

### Logos & Flyers
- **Format**: PNG
- **Resolution**: 1024x1024px
- **Quality**: High-definition, professional style

---

## Troubleshooting

### "HF_TOKEN not configured"
- Ensure you have set the `HF_TOKEN` secret using `supabase secrets set`.

### "Hugging Face API failed"
- Check your token permissions.
- The model might be loading (cold start). Retry after a few seconds.
- Check if you have reached your API rate limits.

---

## Cost

- Hugging Face Inference API has a free tier.
- For higher rate limits and dedicated inference, consider a Pro account or Inference Endpoints.

---

**Version**: 4.0.0 (Hugging Face FLUX.1-dev)
**Last Updated**: 2025-11-25
**Status**: Production Ready ✅
