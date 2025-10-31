# 🚀 Hướng dẫn Deploy nhanh

## Từ Windows (Local) lên Server Linux

### Cách 1: Qua SSH trực tiếp

```bash
# 1. Mở PowerShell hoặc WSL
ssh user@your-server-ip

# 2. Di chuyển vào thư mục project
cd /var/ww/mephuong/thitheomephuong

# 3. Pull code mới
git pull origin main

# 4. Chạy script deploy
bash deploy-scripts/deploy.sh
```

### Cách 2: Chạy từ xa (Một lệnh)

```bash
# Chạy trực tiếp từ Windows PowerShell
ssh user@your-server-ip "cd /var/ww/mephuong/thitheomephuong && git pull origin main && npm ci && npm run build && pm2 restart app"
```

### Cách 3: Sử dụng script có sẵn

```bash
# SSH vào server
ssh user@your-server-ip

# Chạy quick deploy
cd /var/ww/mephuong/thitheomephuong
bash deploy-scripts/quick-deploy.sh
```

## 📋 Các lệnh thường dùng

```bash
# Kiểm tra PM2 status
pm2 list

# Xem logs
pm2 logs app

# Restart
pm2 restart app

# Monitor
pm2 monit
```

## 📖 Tài liệu chi tiết

Xem file: `md/DEPLOYMENT.md` hoặc `deploy-scripts/README.md`

## ⚡ Quick Reference

| Lệnh | Mô tả |
|------|-------|
| `bash deploy-scripts/deploy.sh` | Deploy đầy đủ với logging |
| `bash deploy-scripts/quick-deploy.sh` | Deploy nhanh |
| `pm2 restart app` | Restart ứng dụng |
| `pm2 logs app --lines 50` | Xem 50 dòng log |
| `pm2 status` | Kiểm tra trạng thái |
| `pm2 monit` | Monitor real-time |

## 🐛 Troubleshooting

**Lỗi build:** `npm run build`

**Lỗi port 3000:** `pm2 delete all && pm2 restart app`

**Không pull được:** `git reset --hard origin/main && git pull`

---

**Last updated:** 2024-12-27

