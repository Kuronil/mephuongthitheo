#!/bin/bash

# Script cài đặt môi trường cho VPS
# Chạy với: bash setup-server.sh

echo "🚀 Bắt đầu cài đặt môi trường..."

# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt các package cần thiết
sudo apt install -y curl wget git unzip software-properties-common

# Cài đặt Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2 (Process Manager)
sudo npm install -g pm2

# Cài đặt PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Cài đặt Nginx
sudo apt install -y nginx

# Cài đặt UFW Firewall
sudo apt install -y ufw

# Cấu hình firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Cài đặt Certbot cho SSL
sudo apt install -y certbot python3-certbot-nginx

# Tạo user cho ứng dụng
sudo adduser --disabled-password --gecos "" appuser
sudo usermod -aG sudo appuser

echo "✅ Cài đặt hoàn tất!"
echo "📋 Các dịch vụ đã cài đặt:"
echo "   - Node.js $(node --version)"
echo "   - npm $(npm --version)"
echo "   - PM2 $(pm2 --version)"
echo "   - PostgreSQL $(sudo -u postgres psql -c 'SELECT version();' | head -3)"
echo "   - Nginx $(nginx -v 2>&1)"
