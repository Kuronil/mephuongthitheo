# 🚀 HƯỚNG DẪN DEPLOY LÊN VPS TỰ QUẢN LÝ

## 📋 Yêu cầu hệ thống
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04/22.04 LTS
- **Domain**: Đã trỏ về IP của VPS

## 🔧 Các bước thực hiện

### 1. Chuẩn bị VPS
```bash
# Kết nối SSH vào VPS
ssh root@your-vps-ip

# Upload các script deploy
scp -r deploy-scripts/ root@your-vps-ip:/root/
scp deploy-complete.sh root@your-vps-ip:/root/
```

### 2. Chạy script deploy hoàn chỉnh
```bash
# Trên VPS, chạy script deploy
chmod +x deploy-complete.sh
./deploy-complete.sh your-domain.com
```

### 3. Cấu hình DNS
Trỏ domain về IP VPS:
```
Type: A
Name: @
Value: [IP của VPS]

Type: CNAME
Name: www
Value: your-domain.com
```

## 🛠️ Các lệnh quản lý

### PM2 (Process Manager)
```bash
# Xem trạng thái ứng dụng
sudo -u appuser pm2 status

# Xem logs
sudo -u appuser pm2 logs mephuongthitheo

# Restart ứng dụng
sudo -u appuser pm2 restart mephuongthitheo

# Stop ứng dụng
sudo -u appuser pm2 stop mephuongthitheo

# Xem monitoring
sudo -u appuser pm2 monit
```

### Database
```bash
# Backup database
sudo -u appuser /home/appuser/backups/backup-db.sh

# Kết nối database
sudo -u postgres psql -d mephuongthitheo

# Chạy migration
cd /home/appuser/apps/mephuongthitheo
sudo -u appuser npx prisma migrate deploy
```

### Nginx
```bash
# Test cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Xem logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### SSL Certificate
```bash
# Kiểm tra certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

## 📊 Monitoring

### Health Check
```bash
# Chạy health check thủ công
sudo -u appuser /home/appuser/health-check.sh

# Xem logs health check
sudo -u appuser tail -f /home/appuser/logs/health-check.log
```

### System Monitoring
```bash
# CPU và Memory
htop

# Disk usage
df -h

# Network
nethogs

# I/O
iotop
```

## 🔄 Cập nhật ứng dụng

### Deploy phiên bản mới
```bash
# SSH vào VPS
ssh root@your-vps-ip

# Chuyển sang user appuser
sudo -u appuser bash

# Vào thư mục ứng dụng
cd /home/appuser/apps/mephuongthitheo

# Pull code mới
git pull origin main

# Cài đặt dependencies mới
npm install

# Chạy migration (nếu có)
npx prisma migrate deploy

# Build ứng dụng
npm run build

# Restart ứng dụng
pm2 restart mephuongthitheo
```

## 🗂️ Cấu trúc thư mục trên VPS

```
/home/appuser/
├── apps/
│   └── mephuongthitheo/          # Code ứng dụng
├── logs/                         # Logs ứng dụng
├── backups/                      # Database backups
└── health-check.sh              # Script health check

/etc/nginx/
├── sites-available/
│   └── mephuongthitheo          # Config Nginx
└── sites-enabled/
    └── mephuongthitheo          # Symlink

/var/log/nginx/                  # Nginx logs
```

## 🚨 Troubleshooting

### Ứng dụng không chạy
```bash
# Kiểm tra PM2 status
sudo -u appuser pm2 status

# Xem logs lỗi
sudo -u appuser pm2 logs mephuongthitheo --err

# Restart ứng dụng
sudo -u appuser pm2 restart mephuongthitheo
```

### Database lỗi
```bash
# Kiểm tra PostgreSQL status
sudo systemctl status postgresql

# Kiểm tra kết nối database
sudo -u postgres psql -d mephuongthitheo -c "SELECT 1;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Nginx lỗi
```bash
# Test cấu hình
sudo nginx -t

# Xem logs lỗi
sudo tail -f /var/log/nginx/error.log

# Reload cấu hình
sudo systemctl reload nginx
```

### SSL lỗi
```bash
# Kiểm tra certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Test SSL
curl -I https://your-domain.com
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs ứng dụng: `sudo -u appuser pm2 logs mephuongthitheo`
2. Logs Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Logs system: `sudo journalctl -u nginx`
4. Health check: `sudo -u appuser /home/appuser/health-check.sh`
