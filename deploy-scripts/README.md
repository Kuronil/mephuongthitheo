# Deploy Scripts

Scripts tự động hóa cho việc deploy Next.js application lên server Linux.

## 📁 Files

- **`deploy.sh`** - Script deploy đầy đủ với logging và error handling
- **`quick-deploy.sh`** - Script deploy nhanh, minimal
- **`DEPLOYMENT.md`** - Tài liệu hướng dẫn chi tiết

## 🚀 Quick Start

### Từ máy Windows (qua SSH)

```powershell
# SSH vào server
ssh user@your-server-ip

# Di chuyển vào thư mục project
cd /var/ww/mephuong/thitheomephuong

# Chạy script deploy
bash deploy-scripts/deploy.sh
```

### Từ máy local (qua SSH)

```bash
# Chạy deploy từ xa
ssh user@your-server-ip "cd /var/ww/mephuong/thitheomephuong && bash deploy-scripts/deploy.sh"
```

### Quick deploy

```bash
bash deploy-scripts/quick-deploy.sh
```

## 📖 Documentation

Xem [DEPLOYMENT.md](./DEPLOYMENT.md) để biết hướng dẫn chi tiết.

## ⚙️ Configuration

Các tham số có thể cấu hình trong `deploy.sh`:

```bash
PROJECT_DIR="/var/ww/mephuong/thitheomephuong"  # Đường dẫn project
BRANCH="main"                                    # Branch để pull
PM2_APP_NAME="app"                               # Tên PM2 process
```

## 🔧 Setup

Cấp quyền thực thi cho scripts:

```bash
chmod +x deploy-scripts/*.sh
```

## 📝 Usage Examples

### Deploy lần đầu

```bash
# Clone repository
git clone https://github.com/Kuronil/thitheomephuong.git
cd thitheomephuong

# Setup PM2
npm install -g pm2
pm2 startup
pm2 save

# Deploy
bash deploy-scripts/deploy.sh
```

### Deploy thường xuyên

```bash
# Quick deploy cho updates nhỏ
bash deploy-scripts/quick-deploy.sh
```

### Rollback

```bash
cd /var/ww/mephuong/thitheomephuong
git log --oneline -10  # Xem commit history
git checkout COMMIT_HASH
pm2 restart app
```

### Check status

```bash
pm2 status
pm2 logs app --lines 50
pm2 monit
```

## 🐛 Troubleshooting

Xem chi tiết trong [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs app`
2. Kiểm tra git status: `git status`
3. Kiểm tra build: `npm run build`
4. Xem tài liệu: `DEPLOYMENT.md`

