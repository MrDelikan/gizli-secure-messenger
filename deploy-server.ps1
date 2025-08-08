# Gizli Server Deployment
# PowerShell script for Windows servers

Write-Host "🚀 Setting up Gizli server on Windows..." -ForegroundColor Green

# Install Chocolatey if not present
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Node.js and IIS
choco install nodejs -y
choco install iis-webserver -y

# Install PM2 globally
npm install -g pm2
npm install -g pm2-windows-service

# Setup PM2 as Windows service
pm2-service-install
pm2-service-start

# Create application directory
$appPath = "C:\inetpub\gizli"
New-Item -Path $appPath -ItemType Directory -Force

# Copy application files (assuming current directory)
Copy-Item -Path ".\*" -Destination $appPath -Recurse -Force

# Install dependencies
Set-Location $appPath
npm install

# Build the application
npm run build

# Start Telegram bot with PM2
pm2 start telegram-bot.js --name "gizli-bot"
pm2 save

# Configure IIS site
Import-Module WebAdministration

# Create new site
New-Website -Name "Gizli" -Port 80 -PhysicalPath "$appPath\dist"

# Configure web.config for SPA routing
$webConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="Referrer-Policy" value="no-referrer" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
"@

$webConfig | Out-File -FilePath "$appPath\dist\web.config" -Encoding UTF8

Write-Host "✅ Windows server setup complete!" -ForegroundColor Green
Write-Host "📱 Telegram bot running with PM2" -ForegroundColor Cyan
Write-Host "🌐 Web app served by IIS" -ForegroundColor Cyan
Write-Host "🔒 Configure SSL certificate in IIS Manager" -ForegroundColor Yellow
