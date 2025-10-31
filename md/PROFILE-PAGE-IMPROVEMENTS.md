# Cải Tiến Trang Thông Tin Cá Nhân

## Tổng Quan

Tài liệu này mô tả các cải tiến đã được thực hiện cho trang thông tin cá nhân (`/account/profile`), bao gồm sửa các lỗi nghiêm trọng và thêm các tính năng mới.

## Các Vấn Đề Đã Sửa

### 1. ⚠️ Lỗi Lưu Thông Tin (Nghiêm Trọng)

**Vấn đề cũ:**
- Chức năng "Lưu thay đổi" chỉ lưu vào `localStorage`
- Dữ liệu không được lưu vào database
- Dữ liệu mất khi xóa cache trình duyệt

**Giải pháp:**
- Tạo API endpoint `PUT /api/user/profile` để lưu thông tin vào database
- Sử dụng Prisma ORM để cập nhật dữ liệu an toàn
- Validation đầy đủ trước khi lưu

### 2. ⚠️ Thiếu Validation

**Vấn đề cũ:**
- Không kiểm tra định dạng email
- Không kiểm tra độ dài số điện thoại
- Không kiểm tra tên có rỗng hay không

**Giải pháp:**
- **Validation Email**: Regex kiểm tra định dạng email hợp lệ
- **Validation Số điện thoại**: Phải có 10-11 chữ số
- **Validation Tên**: Không được rỗng, tối thiểu 2 ký tự
- **Kiểm tra Email trùng**: Không cho phép email đã được user khác sử dụng
- **Hiển thị lỗi**: Thông báo lỗi rõ ràng cho từng trường

### 3. ⚠️ Thống Kê Không Chính Xác

**Vấn đề cũ:**
- "Thành viên từ" hiển thị ngày hiện tại thay vì ngày đăng ký
- Tổng đơn hàng và đã tiêu đều hardcoded là 0

**Giải pháp:**
- Tạo API endpoint `GET /api/user/stats` để lấy thống kê thực
- Hiển thị ngày đăng ký chính xác từ database
- Tính tổng đơn hàng thực tế
- Tính tổng tiền đã chi tiêu từ các đơn hàng đã hoàn thành

## API Endpoints Mới

### 1. GET /api/user/profile

**Mô tả:** Lấy thông tin chi tiết của user

**Headers:**
```
x-user-id: <user_id>
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "address": "123 Đường ABC, TP.HCM",
  "phone": "0123456789",
  "isAdmin": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "loyaltyPoints": 100,
  "loyaltyTier": "BRONZE"
}
```

### 2. PUT /api/user/profile

**Mô tả:** Cập nhật thông tin user

**Headers:**
```
Content-Type: application/json
x-user-id: <user_id>
```

**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "address": "123 Đường ABC, TP.HCM"
}
```

**Response (200):**
```json
{
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "address": "123 Đường ABC, TP.HCM",
    "phone": "0123456789",
    "isAdmin": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "loyaltyPoints": 100,
    "loyaltyTier": "BRONZE"
  }
}
```

**Response (400) - Validation Error:**
```json
{
  "error": "Email không hợp lệ"
}
```

**Validation Rules:**
- `name`: Bắt buộc, tối thiểu 2 ký tự
- `email`: Bắt buộc, định dạng email hợp lệ, không trùng với user khác
- `phone`: Không bắt buộc, nếu có phải là 10-11 chữ số
- `address`: Không bắt buộc

### 3. GET /api/user/stats

**Mô tả:** Lấy thống kê tài khoản user

**Headers:**
```
x-user-id: <user_id>
```

**Response (200):**
```json
{
  "createdAt": "2024-01-01T00:00:00.000Z",
  "totalOrders": 5,
  "totalSpent": 1500000,
  "wishlistCount": 10,
  "cartCount": 3,
  "reviewCount": 2,
  "loyaltyPoints": 100,
  "loyaltyTier": "BRONZE"
}
```

**Giải thích:**
- `createdAt`: Ngày đăng ký tài khoản
- `totalOrders`: Tổng số đơn hàng đã đặt
- `totalSpent`: Tổng tiền đã chi tiêu (chỉ tính đơn completed/delivered/shipping/confirmed)
- `wishlistCount`: Số sản phẩm trong danh sách yêu thích
- `cartCount`: Số sản phẩm trong giỏ hàng
- `reviewCount`: Số review đã viết
- `loyaltyPoints`: Điểm tích lũy
- `loyaltyTier`: Hạng thành viên (BRONZE/SILVER/GOLD/PLATINUM)

## Cải Tiến UI/UX

### 1. Hiển Thị Lỗi Validation
- Border đỏ cho trường có lỗi
- Thông báo lỗi màu đỏ bên dưới mỗi trường
- Lỗi tự động xóa khi user sửa lại

### 2. Thống Kê Chi Tiết Hơn
- **Ngày đăng ký**: Hiển thị đúng ngày tạo tài khoản
- **Tổng đơn hàng**: Đếm thực tế từ database với icon 🛍️
- **Đã tiêu**: Format tiền tệ Việt Nam, màu xanh lá
- **Yêu thích**: Số sản phẩm trong wishlist với icon ❤️
- **Điểm tích lũy**: Hiển thị điểm loyalty với icon 🏆
- **Hạng thành viên**: Badge màu theo hạng (Bronze/Silver/Gold/Platinum)

### 3. Loading States
- Spinner khi đang tải thống kê
- Button disabled khi đang save
- Text "Đang lưu..." trên button

## Cấu Trúc File

```
app/
├── api/
│   └── user/
│       ├── profile/
│       │   └── route.ts          # GET & PUT profile
│       └── stats/
│           └── route.ts          # GET stats
└── account/
    └── profile/
        └── page.tsx              # Trang profile UI

lib/
└── auth-middleware.ts            # Xác thực user

test-profile-api.js               # Script test API
```

## Hướng Dẫn Test

### 1. Test Thủ Công (Manual)

1. **Khởi động dev server:**
   ```bash
   npm run dev
   ```

2. **Đăng nhập vào hệ thống**

3. **Truy cập trang profile:**
   - Vào `/account/profile`

4. **Test các tính năng:**
   - ✅ Xem thông tin cá nhân
   - ✅ Xem thống kê (ngày đăng ký, tổng đơn hàng, đã tiêu)
   - ✅ Click "Chỉnh sửa"
   - ✅ Thay đổi tên, email, số điện thoại, địa chỉ
   - ✅ Click "Lưu thay đổi"
   - ✅ Kiểm tra dữ liệu đã được lưu (reload trang)

5. **Test validation:**
   - ❌ Nhập email không hợp lệ → Phải hiện lỗi
   - ❌ Nhập SĐT < 10 số → Phải hiện lỗi
   - ❌ Xóa tên để trống → Phải hiện lỗi
   - ✅ Sửa lại đúng → Lỗi phải biến mất

### 2. Test Tự Động (API)

1. **Chỉnh sửa `test-profile-api.js`:**
   ```javascript
   const TEST_USER_ID = '1' // Thay bằng ID user test của bạn
   ```

2. **Chạy test:**
   ```bash
   node test-profile-api.js
   ```

3. **Kết quả mong đợi:**
   - ✅ GET profile successful
   - ✅ GET stats successful
   - ✅ PUT profile successful
   - ✅ Validation working correctly
   - ✅ Phone validation working correctly

### 3. Test Database

Kiểm tra dữ liệu đã được lưu vào database:

```bash
# Sử dụng Prisma Studio
npx prisma studio
```

Hoặc truy vấn trực tiếp:
```sql
SELECT * FROM User WHERE id = 1;
```

## Checklist Hoàn Thành

- [x] Tạo API endpoint PUT /api/user/profile
- [x] Tạo API endpoint GET /api/user/stats
- [x] Thêm validation cho name, email, phone
- [x] Hiển thị lỗi validation trên UI
- [x] Hiển thị thống kê thực từ database
- [x] Format ngày tháng đúng định dạng Việt Nam
- [x] Format tiền tệ đúng định dạng Việt Nam
- [x] Thêm loading states
- [x] Sử dụng authenticateUser middleware
- [x] Tạo script test API
- [x] Viết tài liệu

## Lưu Ý Kỹ Thuật

### Authentication
- Hệ thống sử dụng `x-user-id` header để xác thực
- Không sử dụng JWT tokens
- Middleware `authenticateUser` kiểm tra user trong database

### Database
- Sử dụng Prisma ORM
- SQLite database (development)
- Model: `User` trong `prisma/schema.prisma`

### Error Handling
- Frontend: Toast notifications với `react-hot-toast`
- Backend: JSON response với status code và error message
- Validation: Client-side và server-side đều có

## Troubleshooting

### Lỗi "Unauthorized"
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra `x-user-id` header có được gửi đúng không
- Kiểm tra user có tồn tại trong database không

### Lỗi "Email đã được sử dụng"
- Email đang cố cập nhật đã được user khác sử dụng
- Kiểm tra database để xem email đó thuộc về user nào

### Thống kê không hiển thị
- Kiểm tra console log có lỗi không
- Kiểm tra API `/api/user/stats` có trả về dữ liệu không
- Kiểm tra user có đơn hàng trong database chưa

## Các Cải Tiến Tiếp Theo (Optional)

1. **Upload avatar**: Cho phép user upload ảnh đại diện
2. **Change password**: Thêm chức năng đổi mật khẩu
3. **Two-factor authentication**: Xác thực 2 lớp
4. **Activity log**: Lịch sử hoạt động của user
5. **Export data**: Export dữ liệu cá nhân
6. **Delete account**: Cho phép xóa tài khoản

## Kết Luận

Trang thông tin cá nhân đã được cải tiến toàn diện:
- ✅ Lưu dữ liệu vào database đúng cách
- ✅ Validation đầy đủ và chặt chẽ
- ✅ Thống kê chính xác và chi tiết
- ✅ UI/UX tốt hơn với loading states và error messages
- ✅ API RESTful chuẩn với error handling tốt

Người dùng giờ đây có thể quản lý thông tin cá nhân một cách tin cậy và hiệu quả.

