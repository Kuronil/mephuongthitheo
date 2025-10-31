#!/bin/bash
# Script tự động deploy Next.js application từ GitHub lên server

set -e  # Exit on any error

echo "============================================"
echo "🚀 Starting deployment process..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/ww/mephuong/thitheomephuong"
BRANCH="main"
PM2_APP_NAME="app"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Running as non-root user. Some commands may require sudo.${NC}"
fi

# Navigate to project directory
echo -e "\n${GREEN}📁 Navigating to project directory...${NC}"
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ Error: Project directory not found: $PROJECT_DIR${NC}"
    exit 1
}
pwd

# Check git status
echo -e "\n${GREEN}🔍 Checking git status...${NC}"
git status

# Pull latest code
echo -e "\n${GREEN}⬇️  Pulling latest code from GitHub...${NC}"
git fetch origin
git pull origin "$BRANCH" || {
    echo -e "${RED}❌ Error: Failed to pull from GitHub${NC}"
    exit 1
}

# Show last commit
echo -e "\n${GREEN}📝 Last commit:${NC}"
git log -1 --oneline

# Install dependencies
echo -e "\n${GREEN}📦 Installing dependencies...${NC}"
npm ci || npm install

# Run build
echo -e "\n${GREEN}🔨 Building application...${NC}"
rm -rf .next  # Clean previous build
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build successful!${NC}"
else
    echo -e "\n${RED}❌ Build failed! Deployment aborted.${NC}"
    exit 1
fi

# Restart PM2 application
echo -e "\n${GREEN}🔄 Restarting PM2 application...${NC}"
pm2 list

# Check if app exists
if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo -e "${YELLOW}Found running process: $PM2_APP_NAME${NC}"
    pm2 restart "$PM2_APP_NAME"
else
    echo -e "${YELLOW}No running process found. Starting new one...${NC}"
    pm2 start npm --name "$PM2_APP_NAME" -- start
fi

# Save PM2 configuration
pm2 save

# Show PM2 status
echo -e "\n${GREEN}📊 PM2 Status:${NC}"
pm2 status

# Show logs
echo -e "\n${GREEN}📜 Recent logs:${NC}"
pm2 logs "$PM2_APP_NAME" --lines 50 --nostream

echo -e "\n${GREEN}============================================"
echo -e "✅ Deployment completed successfully!"
echo -e "============================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check application: pm2 logs $PM2_APP_NAME"
echo "2. Monitor: pm2 monit"
echo "3. View status: pm2 status"
echo ""

