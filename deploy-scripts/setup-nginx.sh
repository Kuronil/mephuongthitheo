#!/bin/bash

# Script cấu hình Nginx
# Chạy với: bash setup-nginx.sh

echo "🌐 Cấu hình Nginx..."

# Copy config file
sudo cp deploy-scripts/nginx-config.conf /etc/nginx/sites-available/mephuongthitheo

# Tạo symbolic link
sudo ln -sf /etc/nginx/sites-available/mephuongthitheo /etc/nginx/sites-enabled/

# Xóa default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test cấu hình
sudo nginx -t

if [ $? -eq 0 ]; then
    # Reload Nginx
    sudo systemctl reload nginx
    sudo systemctl enable nginx
    
    echo "✅ Nginx đã được cấu hình!"
    echo "📋 Cấu hình:"
    echo "   - Config file: /etc/nginx/sites-available/mephuongthitheo"
    echo "   - Status: $(sudo systemctl is-active nginx)"
    echo "   - Test config: sudo nginx -t"
else
    echo "❌ Lỗi cấu hình Nginx!"
    exit 1
fi
