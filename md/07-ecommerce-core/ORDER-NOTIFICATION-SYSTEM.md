# Hệ thống thông báo trạng thái đơn hàng

## 🎯 Tính năng

Hệ thống thông báo tự động cho người dùng khi:
1. ✅ **Đặt hàng thành công** - Thông báo ngay khi tạo đơn hàng
2. 🔄 **Cập nhật trạng thái** - Thông báo khi admin thay đổi trạng thái đơn hàng
3. 🔔 **Hiển thị real-time** - Notification bell trên header với số lượng chưa đọc
4. 📱 **Responsive** - Hoạt động tốt trên mọi thiết bị

## 📊 Các loại thông báo

### 1. Thông báo đơn hàng (ORDER)
- Đặt hàng thành công
- Cập nhật trạng thái đơn hàng

### 2. Thông báo khuyến mãi (PROMOTION)
- Mã giảm giá mới
- Chương trình khuyến mãi

### 3. Thông báo điểm thưởng (LOYALTY)
- Nhận điểm thưởng
- Đổi điểm thưởng

### 4. Thông báo hệ thống (SYSTEM)
- Bảo trì hệ thống
- Thông báo quan trọng

## 🗂️ Cấu trúc Database

### Bảng Notification

```prisma
model Notification {
  id          Int      @id @default(autoincrement())
  userId      Int?
  title       String
  message     String
  type        String   // ORDER, PROMOTION, SYSTEM, LOYALTY
  isRead      Boolean  @default(false)
  data        String?  // JSON data for additional info
  createdAt   DateTime @default(now())
  
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("notifications")
}
```

### Trường `data` (JSON)

Ví dụ cho thông báo ORDER:
```json
{
  "orderId": 123,
  "orderNumber": "MP1234567890",
  "oldStatus": "PENDING",
  "newStatus": "SHIPPING",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Components & APIs

### 1. Frontend Component

**`components/notification-bell.tsx`**
- Hiển thị icon chuông với số lượng thông báo chưa đọc
- Dropdown danh sách thông báo
- Đánh dấu đã đọc / Xóa thông báo
- Auto-refresh mỗi 30 giây

### 2. API Endpoints

#### GET `/api/notifications`
Lấy danh sách thông báo của user

**Query Parameters:**
- `page` - Trang (default: 1)
- `limit` - Số lượng (default: 20)
- `type` - Lọc theo loại (ORDER, PROMOTION, LOYALTY, SYSTEM)
- `unreadOnly` - Chỉ lấy chưa đọc (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "unreadCount": 5
  }
}
```

#### PUT `/api/notifications/[id]`
Đánh dấu một thông báo đã đọc

#### DELETE `/api/notifications/[id]`
Xóa một thông báo

#### PUT `/api/notifications/mark-all-read`
Đánh dấu tất cả thông báo đã đọc

### 3. Helper Functions

**`lib/notification.ts`**

#### `createNotification()`
Tạo thông báo chung
```typescript
await createNotification({
  userId: 1,
  title: "Tiêu đề",
  message: "Nội dung thông báo",
  type: "ORDER",
  data: { orderId: 123 }
})
```

#### `createOrderStatusNotification()`
Tạo thông báo cập nhật trạng thái đơn hàng
```typescript
await createOrderStatusNotification(
  userId,
  orderId,
  orderNumber,
  oldStatus,
  newStatus
)
```

#### `createNewOrderNotification()`
Tạo thông báo đơn hàng mới
```typescript
await createNewOrderNotification(
  userId,
  orderId,
  orderNumber,
  total
)
```

#### `createPromotionNotification()`
Tạo thông báo khuyến mãi
```typescript
await createPromotionNotification(
  userId,
  "Mã giảm giá mới",
  "Giảm 20% cho đơn hàng từ 500k",
  { code: "SALE20" }
)
```

#### `createLoyaltyNotification()`
Tạo thông báo điểm thưởng
```typescript
await createLoyaltyNotification(
  userId,
  100,
  "EARN",
  "Bạn nhận được 100 điểm từ đơn hàng #MP123"
)
```

## 📝 Nội dung thông báo theo trạng thái

### PENDING - Đang xử lý
```
Tiêu đề: ✅ Đơn hàng đang xử lý
Nội dung: Đơn hàng #MP123 của bạn đang được xử lý. 
         Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
```

### AWAITING_PAYMENT - Chờ thanh toán
```
Tiêu đề: ⏳ Chờ thanh toán
Nội dung: Đơn hàng #MP123 đang chờ thanh toán. 
         Vui lòng hoàn tất thanh toán để tiếp tục xử lý đơn hàng.
```

### SHIPPING - Đang giao hàng
```
Tiêu đề: 🚚 Đang giao hàng
Nội dung: Đơn hàng #MP123 đang được giao đến bạn. 
         Vui lòng chú ý điện thoại để nhận hàng.
```

### DELIVERED - Đã giao hàng
```
Tiêu đề: 📦 Đã giao hàng
Nội dung: Đơn hàng #MP123 đã được giao thành công. 
         Cảm ơn bạn đã mua hàng!
```

### COMPLETED - Hoàn thành
```
Tiêu đề: ✨ Hoàn thành
Nội dung: Đơn hàng #MP123 đã hoàn thành. 
         Cảm ơn bạn đã tin tưởng Mẹ Phương!
```

### CANCELLED - Đã hủy
```
Tiêu đề: ❌ Đơn hàng đã hủy
Nội dung: Đơn hàng #MP123 đã bị hủy. 
         Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.
```

## 🔄 Luồng hoạt động

### 1. Khi khách hàng đặt hàng

```
User đặt hàng
    ↓
API /api/orders (POST)
    ↓
Tạo order trong database
    ↓
createNewOrderNotification()
    ↓
Lưu notification vào database
    ↓
User nhận thông báo "🎉 Đặt hàng thành công"
```

### 2. Khi admin cập nhật trạng thái

```
Admin thay đổi status
    ↓
API /api/admin/orders (PUT)
    ↓
Update order status
    ↓
createOrderStatusNotification()
    ↓
Lưu notification vào database
    ↓
User nhận thông báo theo status mới
```

### 3. User xem thông báo

```
User click vào chuông notification
    ↓
API /api/notifications (GET)
    ↓
Hiển thị danh sách notifications
    ↓
User click "đánh dấu đã đọc"
    ↓
API /api/notifications/[id] (PUT)
    ↓
Update isRead = true
```

## 🎨 UI/UX Features

### Notification Bell
- 🔴 Badge đỏ hiển thị số lượng chưa đọc
- 📋 Dropdown danh sách notifications
- 🎨 Highlight notifications chưa đọc (nền xanh nhạt)
- ⏱️ Hiển thị thời gian tương đối (vừa xong, 5 phút trước...)
- 🎯 Icon khác nhau theo loại notification

### Notification Item
- ✅ Nút đánh dấu đã đọc
- 🗑️ Nút xóa notification
- 📱 Click vào để xem chi tiết
- 🔗 Link đến trang liên quan (order detail)

### Auto-refresh
- Tự động kiểm tra notifications mới mỗi 30 giây
- Không cần reload trang
- Real-time updates

## 🧪 Testing

### Test thủ công

1. **Test đặt hàng:**
   ```
   1. Login với user account
   2. Thêm sản phẩm vào giỏ
   3. Đặt hàng
   4. Kiểm tra notification bell → Có thông báo mới
   5. Click xem → Thấy "🎉 Đặt hàng thành công"
   ```

2. **Test cập nhật trạng thái:**
   ```
   1. Login với admin account
   2. Vào /admin/orders
   3. Chọn một đơn hàng và đổi status
   4. Logout admin, login user
   5. Kiểm tra notification bell → Có thông báo mới
   6. Click xem → Thấy thông báo cập nhật status
   ```

3. **Test đánh dấu đã đọc:**
   ```
   1. Click vào notification bell
   2. Click icon ✓ trên một notification
   3. Notification chuyển từ màu xanh sang trắng
   4. Số badge giảm 1
   ```

4. **Test xóa notification:**
   ```
   1. Click vào notification bell
   2. Click icon 🗑️ trên một notification
   3. Notification biến mất khỏi danh sách
   4. Số badge giảm nếu notification chưa đọc
   ```

5. **Test đánh dấu tất cả đã đọc:**
   ```
   1. Có nhiều notifications chưa đọc
   2. Click "Đánh dấu tất cả đã đọc"
   3. Tất cả notifications chuyển sang đã đọc
   4. Badge biến mất (số = 0)
   ```

## 📊 Database Queries

### Lấy notifications của user
```sql
SELECT * FROM notifications 
WHERE userId = ? 
ORDER BY createdAt DESC 
LIMIT 20;
```

### Đếm notifications chưa đọc
```sql
SELECT COUNT(*) FROM notifications 
WHERE userId = ? AND isRead = false;
```

### Đánh dấu tất cả đã đọc
```sql
UPDATE notifications 
SET isRead = true 
WHERE userId = ? AND isRead = false;
```

## 🚀 Deployment

### Production Checklist
- ✅ Database có bảng `notifications`
- ✅ API endpoints hoạt động
- ✅ Notification bell xuất hiện trên header
- ✅ Auto-refresh được bật
- ✅ Error handling đầy đủ
- ✅ Logging để debug

### Environment Variables
Không cần thêm ENV vars mới, sử dụng DATABASE_URL hiện có.

## 🔐 Security

- ✅ Authentication required cho tất cả notification APIs
- ✅ User chỉ thấy notifications của mình
- ✅ User chỉ có thể đánh dấu/xóa notifications của mình
- ✅ Admin không cần permission đặc biệt để tạo notification

## 📈 Performance

### Optimizations
- Index trên `userId` và `isRead`
- Pagination để tránh load quá nhiều
- Auto-refresh 30s (không quá thường xuyên)
- Lazy loading notifications dropdown

### Database Indexes
```prisma
@@index([userId, isRead])
@@index([userId, createdAt])
```

## 🛠️ Future Enhancements

1. **Push Notifications** - Web Push API
2. **Email Notifications** - Gửi email khi có thông báo quan trọng
3. **SMS Notifications** - Gửi SMS cho trạng thái quan trọng
4. **Sound/Vibration** - Âm thanh khi có thông báo mới
5. **Notification Preferences** - User chọn loại thông báo muốn nhận
6. **Rich Notifications** - Thêm hình ảnh, nút action
7. **Notification History** - Trang xem tất cả notifications cũ

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console logs (F12)
2. Kiểm tra database có bảng `notifications`
3. Kiểm tra API responses
4. Kiểm tra authentication

## ✨ Kết luận

Hệ thống thông báo đã hoàn thiện với:
- ✅ Backend APIs
- ✅ Frontend UI
- ✅ Database models
- ✅ Helper functions
- ✅ Auto-refresh
- ✅ Error handling
- ✅ User-friendly messages

Người dùng sẽ luôn được cập nhật về trạng thái đơn hàng của mình một cách tự động và real-time! 🎉

