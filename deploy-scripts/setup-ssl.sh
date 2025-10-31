#!/bin/bash

# Script cấu hình SSL với Let's Encrypt
# Chạy với: bash setup-ssl.sh your-domain.com

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Vui lòng cung cấp domain: bash setup-ssl.sh your-domain.com"
    exit 1
fi

echo "🔒 Cấu hình SSL cho domain: $DOMAIN"

# Cập nhật Nginx config với domain thực
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/mephuongthitheo

# Test và reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Cấu hình SSL với Certbot
echo "🔐 Đang cấu hình SSL certificate..."

sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --redirect

# Cấu hình auto-renewal
echo "🔄 Cấu hình auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Kiểm tra certificate
echo "✅ SSL đã được cấu hình!"
echo "📋 Thông tin SSL:"
echo "   - Domain: $DOMAIN"
echo "   - Certificate: $(sudo certbot certificates | grep $DOMAIN)"
echo "   - Auto-renewal: $(sudo systemctl is-enabled certbot.timer)"

# Test SSL
echo "🧪 Test SSL..."
curl -I https://$DOMAIN
