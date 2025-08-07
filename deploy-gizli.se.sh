#!/bin/bash

# 🚀 Gizli.se Deployment Script
# This script deploys your Gizli secure messenger to www.gizli.se

set -e

echo "🔒 Starting Gizli.se deployment..."

# Configuration
DOMAIN="gizli.se"
SERVER_USER="root"  # Change to your server username
SERVER_IP="YOUR_SERVER_IP"  # Change to your server IP
REMOTE_PATH="/var/www/gizli"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Domain: ${GREEN}$DOMAIN${NC}"
echo -e "${BLUE}Remote path: ${GREEN}$REMOTE_PATH${NC}"

# Step 1: Build production version
echo -e "\n${BLUE}📦 Building production version...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist folder not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 2: Create deployment package
echo -e "\n${BLUE}📁 Creating deployment package...${NC}"
tar -czf gizli-deploy.tar.gz -C dist .
echo -e "${GREEN}✅ Package created: gizli-deploy.tar.gz${NC}"

# Step 3: Upload to server (uncomment when ready)
echo -e "\n${BLUE}⬆️  Upload commands (run manually):${NC}"
echo -e "${GREEN}# Upload files:${NC}"
echo "scp gizli-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/"
echo "scp web-server-config.nginx $SERVER_USER@$SERVER_IP:/tmp/gizli.nginx"

echo -e "\n${GREEN}# SSH into server and run:${NC}"
echo "ssh $SERVER_USER@$SERVER_IP"
echo "sudo mkdir -p $REMOTE_PATH"
echo "sudo tar -xzf /tmp/gizli-deploy.tar.gz -C $REMOTE_PATH"
echo "sudo cp /tmp/gizli.nginx /etc/nginx/sites-available/gizli"
echo "sudo ln -sf /etc/nginx/sites-available/gizli /etc/nginx/sites-enabled/"
echo "sudo nginx -t && sudo systemctl reload nginx"

# Step 4: SSL Certificate setup
echo -e "\n${BLUE}🔐 SSL Certificate setup (run on server):${NC}"
echo -e "${GREEN}# Install certbot:${NC}"
echo "sudo apt update && sudo apt install certbot python3-certbot-nginx"
echo -e "${GREEN}# Get SSL certificate:${NC}"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

# Step 5: Final steps
echo -e "\n${BLUE}🎯 Final verification:${NC}"
echo -e "${GREEN}# Test SSL:${NC}"
echo "curl -I https://$DOMAIN"
echo "curl -I https://www.$DOMAIN"

echo -e "\n${GREEN}🚀 Deployment package ready!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update SERVER_IP in this script"
echo "2. Run the upload commands above"
echo "3. Setup SSL certificate"
echo "4. Test your site at https://$DOMAIN"

# Cleanup
echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
# rm -f gizli-deploy.tar.gz  # Uncomment to auto-cleanup

echo -e "\n${GREEN}✅ Ready for deployment to $DOMAIN!${NC}"
