# Hướng dẫn Deploy Next.js Application

Tài liệu này hướng dẫn cách deploy ứng dụng Next.js lên server Linux một cách tự động.

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt ban đầu](#cài-đặt-ban-đầu)
3. [Deploy tự động](#deploy-tự-động)
4. [Deploy thủ công](#deploy-thủ-công)
5. [Quản lý PM2](#quản-lý-pm2)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Yêu cầu hệ thống

### Phần mềm cần thiết:

- **Node.js**: Phiên bản 18.x trở lên
- **npm** hoặc **pnpm**
- **Git**
- **PM2**: Process manager cho Node.js
- **Nginx** (optional): Reverse proxy

### Kiểm tra version:

```bash
node -v       # Kiểm tra Node.js version
npm -v        # Kiểm tra npm version
git --version # Kiểm tra git version
pm2 -v        # Kiểm tra PM2 version
```

---

## 🚀 Cài đặt ban đầu

### 1. Cài đặt Node.js (nếu chưa có)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Cài đặt PM2

```bash
sudo npm install -g pm2
```

### 3. Cài đặt Git (nếu chưa có)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

### 4. Clone project từ GitHub

```bash
# Tạo thư mục
sudo mkdir -p /var/ww/mephuong
cd /var/ww/mephuong

# Clone repository
sudo git clone https://github.com/Kuronil/thitheomephuong.git

# Hoặc nếu đã có project
cd /var/ww/mephuong/thitheomephuong
git pull origin main
```

### 5. Cấu hình quyền

```bash
# Đảm bảo user có quyền truy cập
sudo chown -R $USER:$USER /var/ww/mephuong/thitheomephuong
```

---

## 🤖 Deploy tự động

### Cách 1: Sử dụng script deploy.sh

```bash
# Di chuyển vào thư mục deploy-scripts
cd /var/ww/mephuong/thitheomephuong/deploy-scripts

# Cấp quyền thực thi
chmod +x deploy.sh

# Chạy script deploy
./deploy.sh
```

### Cách 2: Chạy trực tiếp từ project root

```bash
cd /var/ww/mephuong/thitheomephuong
bash deploy-scripts/deploy.sh
```

### Script sẽ tự động:

1. ✅ Kiểm tra git status
2. ✅ Pull code mới nhất từ GitHub
3. ✅ Cài đặt dependencies với `npm ci`
4. ✅ Build ứng dụng với `npm run build`
5. ✅ Restart PM2 application
6. ✅ Hiển thị logs và status

---

## 🖐️ Deploy thủ công

Nếu bạn muốn kiểm soát từng bước:

### Bước 1: SSH vào server

```bash
ssh user@your-server-ip
# hoặc
ssh root@your-server-ip
```

### Bước 2: Di chuyển vào thư mục dự án

```bash
cd /var/ww/mephuong/thitheomephuong
```

### Bước 3: Pull code mới

```bash
git fetch origin
git pull origin main
```

Nếu có conflict:
```bash
# Xem conflict
git status

# Giải quyết conflict thủ công hoặc
git merge --abort
# Rồi pull lại
git pull origin main
```

### Bước 4: Cài đặt dependencies

```bash
# Production build (chỉ cài dependencies trong package.json)
npm ci

# Hoặc
npm install
```

### Bước 5: Build ứng dụng

```bash
# Clean build trước
rm -rf .next node_modules/.cache

# Build
npm run build
```

### Bước 6: Restart PM2

```bash
# Kiểm tra PM2 status
pm2 list

# Restart app
pm2 restart app

# Hoặc nếu chưa có process
pm2 start npm --name app -- start
```

### Bước 7: Kiểm tra logs

```bash
# Xem logs real-time
pm2 logs app

# Xem 50 dòng cuối
pm2 logs app --lines 50

# Xem logs không real-time
pm2 logs app --nostream
```

---

## ⚙️ Quản lý PM2

### Các lệnh PM2 cơ bản

```bash
# Xem danh sách processes
pm2 list

# Xem chi tiết process
pm2 show app

# Restart
pm2 restart app

# Stop
pm2 stop app

# Start
pm2 start app

# Delete
pm2 delete app

# Xem logs
pm2 logs app
pm2 logs app --lines 100

# Clear logs
pm2 flush

# Monitor real-time
pm2 monit
```

### Setup PM2 tự khởi động cùng hệ thống

```bash
# Tạo startup script
pm2 startup

# Lệnh sẽ trả về command tương tự:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Copy và chạy command đó, sau đó:
pm2 save
```

### Cấu hình PM2 với ecosystem.config.js

Tạo file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: "app",
    script: "npm",
    args: "start",
    cwd: "/var/ww/mephuong/thitheomephuong",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s"
  }]
}
```

Chạy với ecosystem:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔥 Cấu hình Nginx (Optional)

### Cài đặt Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Cấu hình Nginx

Tạo file `/etc/nginx/sites-available/thitheomephuong`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/thitheomephuong /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL với Let's Encrypt

```bash
# Cài certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto renewal
sudo certbot renew --dry-run
```

---

## 🐛 Troubleshooting

### Lỗi "next: not found"

**Nguyên nhân:** Chưa cài dependencies hoặc đang ở sai thư mục

**Giải pháp:**
```bash
cd /var/ww/mephuong/thitheomephuong
npm install
```

### Lỗi "EADDRINUSE: address already in use :::3000"

**Nguyên nhân:** Port 3000 đã được sử dụng

**Giải pháp:**
```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 PID

# Hoặc dừng tất cả PM2 processes
pm2 delete all
pm2 restart app
```

### Lỗi TypeScript build

**Nguyên nhân:** Thiếu type definitions

**Giải pháp:**
```bash
# Cài đầy đủ dependencies
npm ci

# Clean và build lại
rm -rf .next node_modules
npm install
npm run build
```

### PM2 không khởi động lại sau reboot

**Giải pháp:**
```bash
# Setup lại startup
pm2 startup
pm2 save
```

### Kiểm tra firewall

```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### Kiểm tra logs chi tiết

```bash
# PM2 logs
pm2 logs app --lines 200

# Application logs
cd /var/ww/mephuong/thitheomephuong
tail -f .next/*.log

# System logs
sudo journalctl -u nginx -f
```

---

## 📝 Checklist deploy

- [ ] SSH vào server thành công
- [ ] Cài đặt Node.js, npm, PM2
- [ ] Clone/pull code từ GitHub
- [ ] Cài đặt dependencies (`npm ci`)
- [ ] Cấu hình file `.env` (DATABASE_URL, etc.)
- [ ] Build thành công (`npm run build`)
- [ ] PM2 khởi động và chạy ổn định
- [ ] PM2 auto-restart đã setup
- [ ] Firewall đã mở các port cần thiết
- [ ] Nginx đã cấu hình (nếu dùng)
- [ ] SSL certificate đã setup (nếu có domain)
- [ ] Kiểm tra logs không có lỗi
- [ ] Test ứng dụng từ browser

---

## 🔗 Liên kết hữu ích

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Logs của ứng dụng: `pm2 logs app`
2. Logs của hệ thống: `sudo journalctl -xe`
3. Trạng thái PM2: `pm2 status`
4. Trạng thái Nginx: `sudo systemctl status nginx`

---

**Last updated:** $(date +"%Y-%m-%d")

