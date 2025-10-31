#!/bin/bash
# Quick deploy script - Minimal version for rapid deployments

set -e

PROJECT_DIR="/var/ww/mephuong/thitheomephuong"
PM2_APP_NAME="app"

echo "🚀 Quick Deploy..."

cd "$PROJECT_DIR"
git pull origin main
npm ci
npm run build
pm2 restart "$PM2_APP_NAME"

echo "✅ Done!"

