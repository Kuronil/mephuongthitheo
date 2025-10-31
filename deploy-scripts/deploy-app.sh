#!/bin/bash

# Script deploy ứng dụng Next.js lên VPS
# Chạy với: bash deploy-app.sh

echo "🚀 Bắt đầu deploy ứng dụng..."

# Chuyển sang user appuser
sudo -u appuser bash << 'EOF'

# Tạo thư mục ứng dụng
cd /home/appuser
mkdir -p apps
cd apps

# Clone hoặc pull code từ Git
if [ -d "mephuongthitheo" ]; then
    echo "📥 Cập nhật code từ Git..."
    cd mephuongthitheo
    git pull origin main
else
    echo "📥 Clone code từ Git..."
    git clone https://github.com/your-username/mephuongthitheo.git
    cd mephuongthitheo
fi

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
npm install

# Tạo file environment cho production
cat > .env.production << 'ENVEOF'
# Database
DATABASE_URL="postgresql://appuser:your_secure_password_here@localhost:5432/mephuongthitheo"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="https://your-domain.com"

# Environment
NODE_ENV="production"

# Google Maps (nếu sử dụng)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
ENVEOF

# Copy schema production
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate Prisma client
echo "🗄️ Generate Prisma client..."
npx prisma generate

# Chạy migration
echo "🔄 Chạy database migration..."
npx prisma migrate deploy

# Seed data (nếu cần)
echo "🌱 Seed initial data..."
npm run seed:products || echo "Seed script không tồn tại, bỏ qua..."

# Build ứng dụng
echo "🔨 Build ứng dụng..."
npm run build

# Tạo PM2 ecosystem file
cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'mephuongthitheo',
    script: 'npm',
    args: 'start',
    cwd: '/home/appuser/apps/mephuongthitheo',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/appuser/logs/err.log',
    out_file: '/home/appuser/logs/out.log',
    log_file: '/home/appuser/logs/combined.log',
    time: true
  }]
}
PM2EOF

# Tạo thư mục logs
mkdir -p /home/appuser/logs

# Khởi động ứng dụng với PM2
echo "🚀 Khởi động ứng dụng..."
pm2 delete mephuongthitheo 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Deploy hoàn tất!"
echo "📋 Thông tin ứng dụng:"
echo "   - URL: http://localhost:3000"
echo "   - PM2 Status: $(pm2 status mephuongthitheo --no-color | grep mephuongthitheo)"
echo "   - Logs: pm2 logs mephuongthitheo"

EOF

echo "✅ Deploy script hoàn tất!"
