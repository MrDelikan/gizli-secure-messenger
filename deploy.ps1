# Gizli Deployment Script
# This script builds the app and updates the deployment folder

Write-Host "🚀 Starting Gizli deployment..." -ForegroundColor Cyan

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Clear and update gizli-deploy folder
Write-Host "🗂️  Updating deployment folder..." -ForegroundColor Yellow
Remove-Item -Recurse -Force gizli-deploy\* -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force dist\* gizli-deploy\

# Git operations
Write-Host "📤 Committing and pushing changes..." -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
git commit -m "Deploy: $timestamp - Updated build"
git push origin master

Write-Host "✅ Deployment complete! Changes should be live shortly." -ForegroundColor Green
Write-Host "🌐 Visit: https://gizli.se" -ForegroundColor Cyan
