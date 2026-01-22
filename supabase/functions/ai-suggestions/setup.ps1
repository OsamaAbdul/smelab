# Setup script for ai-suggestions function (Windows)
# Usage: .\setup.ps1

Write-Host "🚀 Setting up ai-suggestions function..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Prompt for Hugging Face Token
Write-Host "🔑 We need your Hugging Face Token to enable AI suggestions." -ForegroundColor Yellow
Write-Host "   If you don't have one, get it here: https://huggingface.co/settings/tokens" -ForegroundColor Gray
$HF_TOKEN = Read-Host "Enter your Hugging Face Token (starts with hf_)"

if ([string]::IsNullOrWhiteSpace($HF_TOKEN)) {
    Write-Host "❌ Token cannot be empty." -ForegroundColor Red
    exit 1
}

# Set the secret
Write-Host "🔒 Setting HF_TOKEN secret..." -ForegroundColor Cyan
supabase secrets set HF_TOKEN="$HF_TOKEN"

# Deploy the function
Write-Host "Deploying ai-suggestions function..." -ForegroundColor Cyan
supabase functions deploy ai-suggestions --no-verify-jwt

Write-Host "✅ Success! ai-suggestions function is deployed." -ForegroundColor Green
