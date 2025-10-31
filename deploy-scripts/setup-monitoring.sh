#!/bin/bash

# Script thiết lập monitoring và backup
# Chạy với: bash setup-monitoring.sh

echo "📊 Thiết lập monitoring và backup..."

# Cài đặt htop và các tools monitoring
sudo apt install -y htop iotop nethogs

# Tạo script backup database
sudo -u appuser bash << 'EOF'
mkdir -p /home/appuser/backups

cat > /home/appuser/backups/backup-db.sh << 'BACKUPEOF'
#!/bin/bash

# Backup database
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/appuser/backups"
DB_NAME="mephuongthitheo"

# Tạo backup
pg_dump -h localhost -U appuser $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Nén backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
BACKUPEOF

chmod +x /home/appuser/backups/backup-db.sh
EOF

# Tạo cron job cho backup hàng ngày
sudo -u appuser crontab << 'CRONEOF'
# Backup database hàng ngày lúc 2:00 AM
0 2 * * * /home/appuser/backups/backup-db.sh

# Log PM2 status hàng ngày
0 3 * * * pm2 status >> /home/appuser/logs/pm2-status.log
CRONEOF

# Tạo script health check
sudo -u appuser bash << 'EOF'
cat > /home/appuser/health-check.sh << 'HEALTHEOF'
#!/bin/bash

# Health check script
LOG_FILE="/home/appuser/logs/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check PM2 status
PM2_STATUS=$(pm2 status mephuongthitheo --no-color | grep -c "online")

# Check database connection
DB_STATUS=$(sudo -u postgres psql -c "SELECT 1;" mephuongthitheo 2>/dev/null | grep -c "1 row")

# Check Nginx status
NGINX_STATUS=$(systemctl is-active nginx)

# Log results
echo "[$DATE] PM2: $PM2_STATUS, DB: $DB_STATUS, Nginx: $NGINX_STATUS" >> $LOG_FILE

# Restart services if needed
if [ $PM2_STATUS -eq 0 ]; then
    echo "[$DATE] PM2 service down, restarting..." >> $LOG_FILE
    pm2 restart mephuongthitheo
fi

if [ $NGINX_STATUS != "active" ]; then
    echo "[$DATE] Nginx down, restarting..." >> $LOG_FILE
    sudo systemctl restart nginx
fi
HEALTHEOF

chmod +x /home/appuser/health-check.sh
EOF

# Tạo cron job cho health check mỗi 5 phút
sudo -u appuser crontab << 'CRONEOF'
# Health check mỗi 5 phút
*/5 * * * * /home/appuser/health-check.sh
CRONEOF

echo "✅ Monitoring và backup đã được thiết lập!"
echo "📋 Các tính năng đã cài đặt:"
echo "   - Database backup hàng ngày"
echo "   - Health check mỗi 5 phút"
echo "   - PM2 status logging"
echo "   - System monitoring tools"
