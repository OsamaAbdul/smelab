# AI Generator Setup Script (PowerShell)
Write-Host "🚀 Setting up AI Generator with Hugging Face API..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Prompt for Hugging Face Token
Write-Host "📝 Please enter your Hugging Face Access Token:" -ForegroundColor Cyan
Write-Host "   (Get it from: https://huggingface.co/settings/tokens)" -ForegroundColor Gray
$HF_TOKEN = Read-Host "Token"

if ([string]::IsNullOrWhiteSpace($HF_TOKEN)) {
    Write-Host "❌ Token cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔐 Setting Hugging Face Token as Supabase secret..." -ForegroundColor Cyan
$secretCmd = "supabase secrets set HF_TOKEN=`"$HF_TOKEN`""
Invoke-Expression $secretCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set secret" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Deploying ai-generator function..." -ForegroundColor Cyan
supabase functions deploy ai-generator

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Function deployed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test the function with: supabase functions serve ai-generator" -ForegroundColor Yellow
Write-Host "2. Check logs with: supabase functions logs ai-generator" -ForegroundColor Yellow
Write-Host "3. Your app is now ready to generate logos and flyers!" -ForegroundColor Yellow
Write-Host ""
