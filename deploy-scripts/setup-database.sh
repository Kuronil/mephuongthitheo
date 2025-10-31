#!/bin/bash

# Script cấu hình PostgreSQL cho production
# Chạy với: bash setup-database.sh

echo "🗄️ Cấu hình PostgreSQL..."

# Tạo database và user cho ứng dụng
sudo -u postgres psql << EOF
-- Tạo database
CREATE DATABASE mephuongthitheo;

-- Tạo user
CREATE USER appuser WITH PASSWORD 'your_secure_password_here';

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE mephuongthitheo TO appuser;
GRANT ALL ON SCHEMA public TO appuser;

-- Kết nối database và cấp quyền
\c mephuongthitheo;
GRANT ALL ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO appuser;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO appuser;

-- Cấp quyền cho các table tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO appuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO appuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO appuser;

\q
EOF

# Cấu hình PostgreSQL để accept connections
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf

# Khởi động lại PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql

echo "✅ Database đã được cấu hình!"
echo "📋 Thông tin kết nối:"
echo "   Database: mephuongthitheo"
echo "   User: appuser"
echo "   Password: your_secure_password_here"
echo "   Host: localhost"
echo "   Port: 5432"
