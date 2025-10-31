# Hướng dẫn kiểm tra lịch sử đặt hàng

## Tổng quan hệ thống

Hệ thống lịch sử đặt hàng của ứng dụng bao gồm các tính năng chính:

### 1. Trang lịch sử đơn hàng (`/account/orders`)
- Hiển thị danh sách tất cả đơn hàng của người dùng
- Tìm kiếm đơn hàng theo mã đơn hàng hoặc tên sản phẩm
- Lọc đơn hàng theo trạng thái
- Hủy đơn hàng (nếu đang ở trạng thái PENDING)
- Xem chi tiết từng đơn hàng

### 2. Trang chi tiết đơn hàng (`/account/orders/[orderId]`)
- Thông tin chi tiết về đơn hàng
- Thông tin giao hàng
- Danh sách sản phẩm đã đặt
- Trạng thái đơn hàng
- Phương thức thanh toán
- Tóm tắt thanh toán

### 3. Trang theo dõi đơn hàng (`/order-tracking`)
- Timeline trạng thái đơn hàng
- Lịch sử cập nhật trạng thái
- Thông tin giao hàng chi tiết
- Dự kiến thời gian giao hàng

## Cách kiểm tra lịch sử đặt hàng

### Bước 1: Truy cập trang lịch sử đơn hàng

1. **Đăng nhập vào tài khoản**
   ```
   URL: /account/login
   ```

2. **Truy cập trang lịch sử đơn hàng**
   ```
   URL: /account/orders
   ```

### Bước 2: Sử dụng các tính năng tìm kiếm và lọc

#### Tìm kiếm đơn hàng
- **Theo mã đơn hàng**: Nhập mã đơn hàng (ví dụ: MP1234567890)
- **Theo tên sản phẩm**: Nhập tên sản phẩm trong đơn hàng

#### Lọc theo trạng thái
- **Tất cả trạng thái**: Hiển thị tất cả đơn hàng
- **Đang xử lý** (PENDING): Đơn hàng đã được tiếp nhận
- **Chờ thanh toán** (AWAITING_PAYMENT): Chờ khách hàng thanh toán
- **Hoàn thành** (COMPLETED): Đơn hàng đã hoàn tất
- **Đã hủy** (CANCELLED): Đơn hàng đã bị hủy

### Bước 3: Xem chi tiết đơn hàng

1. **Từ danh sách đơn hàng**
   - Click vào nút "Xem chi tiết" của đơn hàng muốn xem
   - Hoặc truy cập trực tiếp: `/account/orders/[orderId]`

2. **Thông tin hiển thị**
   - Mã đơn hàng
   - Ngày đặt hàng
   - Trạng thái hiện tại
   - Thông tin giao hàng (tên, số điện thoại, địa chỉ)
   - Danh sách sản phẩm đã đặt
   - Phương thức thanh toán
   - Tổng tiền

### Bước 4: Theo dõi đơn hàng

1. **Truy cập trang theo dõi**
   ```
   URL: /order-tracking?orderId=[orderId]
   ```

2. **Thông tin theo dõi**
   - Timeline trạng thái đơn hàng
   - Lịch sử cập nhật trạng thái
   - Dự kiến thời gian giao hàng
   - Thông tin liên hệ hỗ trợ

## Các trạng thái đơn hàng

### 1. PENDING (Đang xử lý)
- **Mô tả**: Đơn hàng đã được tiếp nhận và đang được xử lý
- **Hành động**: Có thể hủy đơn hàng
- **Màu sắc**: Vàng

### 2. AWAITING_PAYMENT (Chờ thanh toán)
- **Mô tả**: Chờ khách hàng thanh toán
- **Hành động**: Có thể thanh toán ngay
- **Màu sắc**: Xanh dương

### 3. SHIPPING (Đang giao hàng)
- **Mô tả**: Đơn hàng đang được giao
- **Hành động**: Theo dõi trạng thái
- **Màu sắc**: Tím

### 4. DELIVERED (Đã giao hàng)
- **Mô tả**: Đơn hàng đã được giao thành công
- **Hành động**: Có thể đánh giá đơn hàng
- **Màu sắc**: Xanh lá

### 5. COMPLETED (Hoàn thành)
- **Mô tả**: Đơn hàng đã hoàn tất
- **Hành động**: Xem lịch sử
- **Màu sắc**: Xanh lá

### 6. CANCELLED (Đã hủy)
- **Mô tả**: Đơn hàng đã bị hủy
- **Hành động**: Xem lịch sử
- **Màu sắc**: Đỏ

## API Endpoints

### 1. Lấy danh sách đơn hàng
```
GET /api/account/orders
Headers: x-user-id: [userId]
Query params:
- page: Số trang (mặc định: 1)
- limit: Số đơn hàng mỗi trang (mặc định: 10)
- status: Lọc theo trạng thái
- search: Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm
```

### 2. Lấy chi tiết đơn hàng
```
GET /api/account/orders/[orderId]
Headers: x-user-id: [userId]
```

### 3. Cập nhật trạng thái đơn hàng
```
PUT /api/orders/[orderId]/status
Body: {
  status: "CANCELLED",
  reason: "Customer requested cancellation"
}
```

## Cách test hệ thống

### 1. Tạo đơn hàng test
```javascript
// Sử dụng script test-order-notification.js
node test-order-notification.js
```

### 2. Kiểm tra lịch sử đơn hàng
1. Đăng nhập với tài khoản đã tạo đơn hàng
2. Truy cập `/account/orders`
3. Kiểm tra danh sách đơn hàng hiển thị
4. Test tính năng tìm kiếm và lọc
5. Xem chi tiết từng đơn hàng

### 3. Test các trạng thái đơn hàng
1. Tạo đơn hàng với phương thức COD (trạng thái PENDING)
2. Tạo đơn hàng với phương thức BANKING (trạng thái AWAITING_PAYMENT)
3. Test hủy đơn hàng PENDING
4. Test thanh toán đơn hàng AWAITING_PAYMENT

## Troubleshooting

### 1. Không hiển thị đơn hàng
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra header `x-user-id` có được gửi không
- Kiểm tra database có đơn hàng không

### 2. Lỗi 401 Unauthorized
- Kiểm tra authentication middleware
- Kiểm tra session/cookie
- Kiểm tra user context

### 3. Lỗi 404 Not Found
- Kiểm tra orderId có đúng không
- Kiểm tra đơn hàng có thuộc về user không
- Kiểm tra database connection

### 4. Lỗi hiển thị sản phẩm
- Kiểm tra cấu trúc dữ liệu items
- Kiểm tra field mapping (qty vs quantity)
- Kiểm tra null/undefined values

## Cải tiến có thể thực hiện

### 1. Thêm tính năng
- Xuất PDF hóa đơn
- In hóa đơn
- Đánh giá sản phẩm
- Mua lại đơn hàng
- Theo dõi vận chuyển real-time

### 2. Cải thiện UX
- Thêm pagination
- Thêm sorting
- Thêm filter theo ngày
- Thêm notification real-time
- Thêm search suggestions

### 3. Cải thiện performance
- Cache đơn hàng
- Lazy loading
- Virtual scrolling cho danh sách dài
- Optimize database queries

## Kết luận

Hệ thống lịch sử đặt hàng đã được thiết kế khá đầy đủ với các tính năng cơ bản:
- Xem danh sách đơn hàng
- Tìm kiếm và lọc
- Xem chi tiết đơn hàng
- Theo dõi trạng thái
- Hủy đơn hàng
- Thanh toán

Để kiểm tra hệ thống, bạn có thể:
1. Tạo đơn hàng test
2. Đăng nhập và truy cập `/account/orders`
3. Test các tính năng tìm kiếm, lọc, xem chi tiết
4. Test các hành động như hủy đơn hàng, thanh toán
