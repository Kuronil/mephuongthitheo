# Hướng dẫn Test Hệ thống Notification

## 📋 Tổng quan

Có 2 script test để kiểm tra hệ thống notification:

1. **`test-notification-system.js`** - Test các API notification cơ bản
2. **`test-order-notification.js`** - Test notification khi cập nhật trạng thái đơn hàng

## 🚀 Chuẩn bị

### 1. Đảm bảo server đang chạy

```bash
npm run dev
```

Server phải chạy ở `http://localhost:3000`

### 2. Tạo test user (nếu chưa có)

Đăng ký user với thông tin:
```
Email: test@example.com
Password: Test123
Name: Test User
```

Hoặc thay đổi credentials trong script:

```javascript
// Trong file test script
const TEST_USER = {
  email: 'your-email@example.com',  // Thay đổi
  password: 'YourPassword123'        // Thay đổi
}
```

### 3. Đảm bảo có admin account

Admin account mặc định:
```
Email: admin@mephuong.com
Password: Admin123
```

Nếu chưa có, chạy script tạo admin:
```bash
node scripts/set-admin.ts
```

## 🧪 Test 1: Test Notification API

### Chạy test:

```bash
node test-notification-system.js
```

### Test này kiểm tra:

✅ **Login user**
- Xác thực user credentials
- Lấy auth headers

✅ **Tạo notification**
- Tạo notification mới qua API
- Kiểm tra response

✅ **Lấy danh sách notifications**
- GET /api/notifications
- Kiểm tra pagination
- Hiển thị unreadCount

✅ **Đánh dấu đã đọc**
- PUT /api/notifications/[id]
- Cập nhật isRead = true

✅ **Tạo notification đơn hàng**
- Tạo notification type ORDER
- Kiểm tra data structure

✅ **Filter by type**
- Lọc theo ORDER, PROMOTION, SYSTEM, LOYALTY
- Đếm số lượng mỗi loại

✅ **Filter unread only**
- Lấy chỉ notifications chưa đọc

✅ **Đánh dấu tất cả đã đọc**
- PUT /api/notifications/mark-all-read
- Reset unreadCount về 0

✅ **Xóa notification**
- DELETE /api/notifications/[id]

### Kết quả mong đợi:

```
========================================
🧪 TEST HỆ THỐNG NOTIFICATION
========================================

🔐 Đang login...

✅ Login thành công
   User: Test User (ID: 2)

📝 Test 1: Tạo notification

✅ Tạo notification thành công
   ID: 15, Title: Test Notification

📋 Test 2: Lấy danh sách notifications

✅ Lấy danh sách notifications thành công
   Tổng: 10 notifications, Chưa đọc: 3
   📌 Notifications gần nhất:
   1. [○] Test Notification
      Đây là notification test được tạo bởi script...
   2. [✓] 🚚 Đang giao hàng
      Đơn hàng #MP123456789 đang được giao đến bạn...
   3. [✓] 🎉 Đặt hàng thành công
      Đơn hàng #MP123456789 của bạn đã được đặt thành công...

✓ Test 3: Đánh dấu notification đã đọc

✅ Đánh dấu đã đọc thành công
   Notification ID: 15

... (tiếp tục các test khác)

========================================
✅ HOÀN THÀNH TẤT CẢ TESTS
========================================
```

## 🧪 Test 2: Test Order Notification

### Chạy test:

```bash
node test-order-notification.js
```

### Test này kiểm tra:

✅ **Flow hoàn chỉnh:**

1. **Login admin**
   - Xác thực admin credentials
   - Lấy admin auth headers

2. **Login user**
   - Xác thực user credentials
   - Lấy user auth headers

3. **Tạo test order** (optional)
   - Tạo order mới với user ID
   - Kiểm tra notification "Đặt hàng thành công"

4. **Lấy danh sách orders**
   - GET /api/admin/orders
   - Tìm order có userId

5. **Cập nhật trạng thái**
   - SHIPPING → notification "🚚 Đang giao hàng"
   - DELIVERED → notification "📦 Đã giao hàng"
   - COMPLETED → notification "✨ Hoàn thành"

6. **Kiểm tra notifications**
   - Xác nhận notification được tạo
   - Kiểm tra nội dung đúng
   - Kiểm tra data structure

### Kết quả mong đợi:

```
========================================
🧪 TEST ORDER NOTIFICATION SYSTEM
========================================

🔐 Đang login admin...

✅ Login admin thành công
   Admin: Admin User

🔐 Đang login user...

✅ Login user thành công
   User: Test User (ID: 2)

📝 Đang tạo test order...

✅ Tạo test order thành công
   Order ID: 45, Number: MP1234567890123

⏳ Đợi 2 giây để notification được tạo...

📌 Kiểm tra notification "Đặt hàng thành công":

🔔 Đang lấy notifications của user...

✅ Lấy notifications thành công
   Tổng: 1 notifications, Chưa đọc: 1
   🔔 Notifications:
   1. [🔴] 🎉 Đặt hàng thành công
      Đơn hàng #MP1234567890123 của bạn đã được đặt thành công...
      Type: ORDER | Time: 29/10/2025, 10:30:00
      Order: MP1234567890123 (undefined → PENDING)

📦 Đang lấy danh sách orders...

✅ Lấy orders thành công
   Tìm thấy 10 orders
   📋 Orders gần nhất:
   1. #MP1234567890123 - PENDING (User ID: 2)
   ...

✨ Sẽ test với order #MP1234567890123

🔄 Đang cập nhật trạng thái order #45 thành SHIPPING...

✅ Cập nhật trạng thái thành công
   Order #45 → SHIPPING

⏳ Đợi 2 giây để notification được tạo...

📌 Kiểm tra notification cho status SHIPPING:

✅ Lấy notifications thành công
   Tổng: 2 notifications, Chưa đọc: 2
   🔔 Notifications:
   1. [🔴] 🚚 Đang giao hàng
      Đơn hàng #MP1234567890123 đang được giao đến bạn...
      Type: ORDER | Time: 29/10/2025, 10:30:15
      Order: MP1234567890123 (PENDING → SHIPPING)

   ✅ Notification mới đã được tạo đúng!

---

🔄 Đang cập nhật trạng thái order #45 thành DELIVERED...

✅ Cập nhật trạng thái thành công
   Order #45 → DELIVERED

... (tiếp tục)

========================================
✅ HOÀN THÀNH TEST
========================================

📊 Tóm tắt:
   • Đã test 3 trạng thái
   • Mỗi lần cập nhật tạo 1 notification
   • User nhận được thông báo real-time
```

## 🔍 Debug

### Nếu test thất bại:

1. **Check server logs:**
```bash
# Terminal đang chạy npm run dev
```

Xem logs console để tìm lỗi

2. **Check database:**
```bash
npx prisma studio
```

Kiểm tra bảng `notifications`:
- Có notifications mới không?
- userId đúng không?
- type, title, message có đúng không?

3. **Check API responses:**

Các script sẽ log chi tiết responses. Tìm:
```
❌ [Tên test] thất bại
   Error message here
```

### Common Issues:

#### ❌ Login thất bại
```
Giải pháp:
1. Kiểm tra credentials
2. Tạo user account nếu chưa có
3. Check database có user không
```

#### ❌ Không tìm thấy orders
```
Giải pháp:
1. Tạo order từ website trước
2. Hoặc để script tự tạo test order
3. Check userId trong orders table
```

#### ❌ Notification không được tạo
```
Giải pháp:
1. Check logs server
2. Kiểm tra lib/notification.ts
3. Xem API /api/admin/orders có call createOrderStatusNotification() không
```

#### ❌ Unauthorized errors
```
Giải pháp:
1. Check auth headers được gửi đúng không
2. Check authenticateUser middleware
3. Xem x-user-id header có đúng không
```

## 📱 Test Manual trên UI

### 1. Test notification bell:

1. Login với user account
2. Xem góc trên phải header → có icon chuông 🔔
3. Nếu có notifications chưa đọc → badge đỏ hiển thị số
4. Click vào chuông → dropdown danh sách notifications

### 2. Test đặt hàng:

1. Thêm sản phẩm vào giỏ
2. Checkout và đặt hàng
3. Sau khi đặt hàng thành công → Check notification bell
4. Phải có notification "🎉 Đặt hàng thành công"

### 3. Test cập nhật trạng thái:

1. **Với admin:**
   - Login admin account
   - Vào `/admin/orders`
   - Chọn một đơn hàng của user
   - Thay đổi status từ dropdown
   - Xem console logs

2. **Với user:**
   - Login user account
   - Check notification bell
   - Phải có notification mới về status
   - Click notification → xem chi tiết

### 4. Test đánh dấu đã đọc:

1. Click notification bell
2. Click icon ✓ trên một notification
3. Notification chuyển từ màu xanh → trắng
4. Badge số giảm đi 1

### 5. Test xóa notification:

1. Click notification bell
2. Click icon 🗑️ trên một notification
3. Notification biến mất
4. Badge số giảm nếu notification chưa đọc

## 📊 Metrics để kiểm tra

### Performance:
- API response time < 500ms
- Notification được tạo trong < 1s sau khi update order
- UI update ngay khi có notification mới

### Accuracy:
- 100% notifications có đúng userId
- 100% notifications có đúng orderId
- 100% messages khớp với status

### User Experience:
- Badge đỏ hiển thị đúng số chưa đọc
- Notifications sắp xếp theo thời gian mới nhất
- Icon phân biệt được loại notification

## ✅ Checklist hoàn thiện

- [ ] Server chạy ổn định
- [ ] Database có bảng notifications
- [ ] User account đã tạo
- [ ] Admin account đã tạo
- [ ] Test script 1 pass
- [ ] Test script 2 pass
- [ ] UI notification bell hoạt động
- [ ] Đặt hàng tạo notification
- [ ] Cập nhật status tạo notification
- [ ] Đánh dấu đã đọc hoạt động
- [ ] Xóa notification hoạt động
- [ ] Badge số cập nhật đúng

## 🎯 Next Steps

Sau khi test thành công:

1. ✅ Test trên production environment
2. ✅ Monitor notification creation rate
3. ✅ Set up alerts cho failed notifications
4. ✅ Add more notification types (promotion, loyalty)
5. ✅ Implement push notifications (optional)
6. ✅ Add email notifications (optional)

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs (F12)
2. Check server logs
3. Check database
4. Review ORDER-NOTIFICATION-SYSTEM.md

