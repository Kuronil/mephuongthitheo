# 🚀 Quick Start - Notification System

## ⚡ Chạy ngay trong 3 bước

### Bước 1: Start Server
```bash
npm run dev
```

### Bước 2: Chạy Test
```bash
# Test notification APIs
node test-notification-system.js

# Test order notification flow
node test-order-notification.js
```

### Bước 3: Kiểm tra UI
1. Mở browser: `http://localhost:3000`
2. Login với user account
3. Nhìn góc trên phải → icon chuông 🔔
4. Đặt một đơn hàng → Check notification

## ✅ Đã có gì?

### Backend:
✓ APIs để tạo/đọc/xóa notifications  
✓ Tự động tạo notification khi đặt hàng  
✓ Tự động tạo notification khi admin update status

### Frontend:
✓ Notification bell trên header  
✓ Badge đỏ hiển thị số chưa đọc  
✓ Dropdown danh sách notifications  
✓ Auto-refresh mỗi 30 giây

### Database:
✓ Bảng `notifications` đã tạo  
✓ Relations với `users`  
✓ Indexes để optimize

## 📱 Cách sử dụng cho User

### Xem notifications:
```
1. Click vào icon chuông 🔔
2. Xem danh sách
3. Badge đỏ = số chưa đọc
```

### Đánh dấu đã đọc:
```
1. Click icon ✓ → đánh dấu 1 notification
2. Click "Đánh dấu tất cả" → đánh dấu hết
```

### Xóa notification:
```
Click icon 🗑️
```

## 👨‍💼 Cách sử dụng cho Admin

### Update trạng thái đơn hàng:
```
1. Vào /admin/orders
2. Chọn order
3. Đổi status từ dropdown
4. User tự động nhận notification!
```

## 💻 Cách sử dụng cho Developer

### Tạo notification trong code:

```typescript
import { createNotification } from '@/lib/notification'

// Notification đơn giản
await createNotification({
  userId: 1,
  title: 'Tiêu đề',
  message: 'Nội dung notification',
  type: 'SYSTEM'
})

// Notification với data
await createNotification({
  userId: 1,
  title: '🎁 Khuyến mãi',
  message: 'Giảm 50% hôm nay!',
  type: 'PROMOTION',
  data: { discount: 50, code: 'SALE50' }
})
```

### Notification types:
- `ORDER` - Đơn hàng
- `PROMOTION` - Khuyến mãi  
- `LOYALTY` - Điểm thưởng
- `SYSTEM` - Hệ thống

## 🧪 Test nhanh

### Test 1: Đặt hàng
```
1. Login user
2. Thêm sản phẩm vào giỏ
3. Checkout
4. Check notification bell
→ Phải có "🎉 Đặt hàng thành công"
```

### Test 2: Update status
```
1. Login admin
2. Update order status
3. Logout → Login user
4. Check notification bell
→ Phải có notification về status mới
```

## 📚 Tài liệu chi tiết

- **`ORDER-NOTIFICATION-SYSTEM.md`** → Tài liệu đầy đủ
- **`TEST-NOTIFICATION-GUIDE.md`** → Hướng dẫn test
- **`NOTIFICATION-SUMMARY.md`** → Tóm tắt

## 🐛 Troubleshooting

### Không thấy notification bell?
```
→ Check components/header.tsx có import NotificationBell không
```

### Notifications không được tạo?
```
→ Check server console logs
→ Check database có bảng notifications không
→ Run: npx prisma db push
```

### Badge số không đúng?
```
→ Refresh page
→ Check database isRead flags
```

## 🎯 Files quan trọng

```
lib/notification.ts                        → Helper functions
app/api/notifications/route.ts            → GET/POST notifications
app/api/notifications/[id]/route.ts       → PUT/DELETE notification
app/api/notifications/mark-all-read/      → Mark all read
components/notification-bell.tsx          → UI component
app/api/admin/orders/route.ts             → Tích hợp notifications
app/api/orders/route.ts                   → Tích hợp notifications
```

## ✨ That's it!

Hệ thống đã sẵn sàng. Chỉ cần:
1. ✅ Start server
2. ✅ Test
3. ✅ Use!

Happy coding! 🎉

