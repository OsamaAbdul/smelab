#!/bin/bash

# AI Generator Setup Script
echo "🚀 Setting up AI Generator with Hugging Face API..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Prompt for Hugging Face Token
echo "📝 Please enter your Hugging Face Access Token:"
echo "   (Get it from: https://huggingface.co/settings/tokens)"
read -p "Token: " HF_TOKEN

if [ -z "$HF_TOKEN" ]; then
    echo "❌ Token cannot be empty"
    exit 1
fi

echo ""
echo "🔐 Setting Hugging Face Token as Supabase secret..."
supabase secrets set HF_TOKEN="$HF_TOKEN"

if [ $? -eq 0 ]; then
    echo "✅ Secret set successfully"
else
    echo "❌ Failed to set secret"
    exit 1
fi

echo ""
echo "📦 Deploying ai-generator function..."
supabase functions deploy ai-generator

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully"
else
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test the function with: supabase functions serve ai-generator"
echo "2. Check logs with: supabase functions logs ai-generator"
echo "3. Your app is now ready to generate logos and flyers!"
echo ""
