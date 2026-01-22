#!/bin/bash

# Setup script for ai-suggestions function
# Usage: ./setup.sh

echo "🚀 Setting up ai-suggestions function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first."
    exit 1
fi

# Prompt for Hugging Face Token if not already set
echo "🔑 We need your Hugging Face Token to enable AI suggestions."
echo "   If you don't have one, get it here: https://huggingface.co/settings/tokens"
read -p "Enter your Hugging Face Token (starts with hf_): " HF_TOKEN

if [ -z "$HF_TOKEN" ]; then
    echo "❌ Token cannot be empty."
    exit 1
fi

# Set the secret
echo "🔒 Setting HF_TOKEN secret..."
supabase secrets set HF_TOKEN="$HF_TOKEN"

# Deploy the function
echo "Deploying ai-suggestions function..."
supabase functions deploy ai-suggestions --no-verify-jwt

echo "✅ Success! ai-suggestions function is deployed."
