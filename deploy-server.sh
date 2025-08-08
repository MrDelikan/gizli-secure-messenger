#!/bin/bash
# Gizli Server Deployment Script
# Run this on your VPS (Ubuntu/Debian)

echo "🚀 Setting up Gizli server..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2, Nginx, Certbot
sudo npm install -g pm2
sudo apt install -y nginx certbot python3-certbot-nginx

# Create app directory
sudo mkdir -p /var/www/gizli
sudo chown $USER:$USER /var/www/gizli

# Clone or upload your code
cd /var/www/gizli
# git clone your-repo-url .

# Install dependencies
npm install

# Build the web app
npm run build

# Start Telegram bot with PM2
pm2 start telegram-bot.js --name "gizli-bot"
pm2 startup
pm2 save

# Configure Nginx
sudo tee /etc/nginx/sites-available/gizli > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # Web app (static files)
    location / {
        root /var/www/gizli/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer" always;
    }

    # APK downloads
    location /releases/ {
        root /var/www/gizli;
        add_header Content-Disposition "attachment";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/gizli/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/gizli /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL (replace your-domain.com)
# sudo certbot --nginx -d your-domain.com

echo "✅ Server setup complete!"
echo "📱 Telegram bot running with PM2"
echo "🌐 Web app served by Nginx"
echo "🔒 Configure SSL with: sudo certbot --nginx -d your-domain.com"
