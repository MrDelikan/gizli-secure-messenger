# 🚀 Gizli.se Deployment Script (PowerShell)
# This script prepares your Gizli secure messenger for deployment to www.gizli.se

param(
    [string]$ServerIP = "YOUR_SERVER_IP",
    [string]$ServerUser = "root"
)

$Domain = "gizli.se"
$RemotePath = "/var/www/gizli"

Write-Host "🔒 Starting Gizli.se deployment preparation..." -ForegroundColor Cyan
Write-Host "Domain: $Domain" -ForegroundColor Green
Write-Host "Remote path: $RemotePath" -ForegroundColor Green

# Step 1: Build production version
Write-Host "`n📦 Building production version..." -ForegroundColor Blue
npm run build

if (!(Test-Path "dist")) {
    Write-Host "❌ Build failed - dist folder not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Step 2: Create deployment package
Write-Host "`n📁 Creating deployment package..." -ForegroundColor Blue

# Create deployment archive (requires 7zip or use built-in compression)
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf gizli-deploy.tar.gz -C dist .
    Write-Host "✅ Package created: gizli-deploy.tar.gz" -ForegroundColor Green
} else {
    # Fallback to PowerShell compression
    Compress-Archive -Path "dist\*" -DestinationPath "gizli-deploy.zip" -Force
    Write-Host "✅ Package created: gizli-deploy.zip" -ForegroundColor Green
}

# Step 3: Show deployment commands
Write-Host "`n⬆️  Manual deployment commands:" -ForegroundColor Blue
Write-Host "# 1. Upload files to your server:" -ForegroundColor Green

if (Test-Path "gizli-deploy.tar.gz") {
    Write-Host "scp gizli-deploy.tar.gz $ServerUser@${ServerIP}:/tmp/"
} else {
    Write-Host "scp gizli-deploy.zip $ServerUser@${ServerIP}:/tmp/"
}

Write-Host "scp web-server-config.nginx $ServerUser@${ServerIP}:/tmp/gizli.nginx"

Write-Host "`n# 2. SSH into your server and run:" -ForegroundColor Green
Write-Host "ssh $ServerUser@$ServerIP"
Write-Host "sudo mkdir -p $RemotePath"

if (Test-Path "gizli-deploy.tar.gz") {
    Write-Host "sudo tar -xzf /tmp/gizli-deploy.tar.gz -C $RemotePath"
} else {
    Write-Host "sudo unzip /tmp/gizli-deploy.zip -d $RemotePath"
}

Write-Host "sudo cp /tmp/gizli.nginx /etc/nginx/sites-available/gizli"
Write-Host "sudo ln -sf /etc/nginx/sites-available/gizli /etc/nginx/sites-enabled/"
Write-Host "sudo nginx -t && sudo systemctl reload nginx"

# Step 4: SSL setup
Write-Host "`n🔐 SSL Certificate setup (run on server):" -ForegroundColor Blue
Write-Host "# Install certbot:" -ForegroundColor Green
Write-Host "sudo apt update && sudo apt install certbot python3-certbot-nginx"
Write-Host "# Get SSL certificate:" -ForegroundColor Green
Write-Host "sudo certbot --nginx -d $Domain -d www.$Domain"

# Step 5: Testing
Write-Host "`n🎯 Test your deployment:" -ForegroundColor Blue
Write-Host "curl -I https://$Domain"
Write-Host "curl -I https://www.$Domain"

Write-Host "`n🚀 Deployment package ready!" -ForegroundColor Green
Write-Host "Your Gizli app is ready to deploy to https://$Domain" -ForegroundColor Cyan

# Show next steps
Write-Host "`n📋 Next Steps:" -ForegroundColor Blue
Write-Host "1. Get your server IP address" -ForegroundColor White
Write-Host "2. Update SERVER_IP in the commands above" -ForegroundColor White
Write-Host "3. Upload files using the scp commands" -ForegroundColor White
Write-Host "4. SSH into server and run the setup commands" -ForegroundColor White
Write-Host "5. Setup SSL certificate with Let's Encrypt" -ForegroundColor White
Write-Host "6. Visit https://gizli.se to test!" -ForegroundColor White

Write-Host "`n✅ Ready for deployment!" -ForegroundColor Green
