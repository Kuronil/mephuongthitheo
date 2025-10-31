# Chức Năng Thay Đổi Mật Khẩu

## Tổng Quan

Tài liệu này mô tả chức năng thay đổi mật khẩu mới được thêm vào trang thông tin cá nhân (`/account/profile`).

## Tính Năng

### 1. API Endpoint Mới

#### POST /api/user/change-password

**Mô tả:** Cho phép user thay đổi mật khẩu

**Headers:**
```
Content-Type: application/json
x-user-id: <user_id>
```

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Response (200) - Success:**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Response (400) - Validation Error:**
```json
{
  "error": "Mật khẩu mới phải có ít nhất 1 chữ hoa"
}
```

**Response (401) - Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

### 2. Validation Rules

#### Mật khẩu hiện tại:
- ✅ Bắt buộc phải nhập
- ✅ Phải khớp với mật khẩu trong database

#### Mật khẩu mới:
- ✅ Bắt buộc phải nhập
- ✅ Tối thiểu 6 ký tự
- ✅ Phải có ít nhất 1 chữ hoa
- ✅ Phải có ít nhất 1 chữ số
- ✅ Không được trùng với mật khẩu hiện tại
- ✅ Phải khớp với xác nhận mật khẩu

#### Xác nhận mật khẩu:
- ✅ Bắt buộc phải nhập
- ✅ Phải khớp với mật khẩu mới

### 3. UI/UX Features

#### Card Bảo mật
- 🔒 Icon Shield để nhận diện
- 🔒 Hiển thị mật khẩu dạng "••••••••" khi không chỉnh sửa
- 🔒 Nút "Đổi mật khẩu" để mở form

#### Form Đổi Mật Khẩu
- 👁️ **Show/Hide Password**: Toggle để hiện/ẩn mật khẩu
- 📊 **Password Strength Meter**: Thanh đo độ mạnh mật khẩu
  - 🔴 Yếu (1-2 điểm)
  - 🟡 Trung bình (3 điểm)
  - 🔵 Khá (4 điểm)
  - 🟢 Mạnh (5 điểm)
  - 🟢 Rất mạnh (6+ điểm)
- ⚠️ **Error Messages**: Hiển thị lỗi cụ thể cho từng trường
- ⏳ **Loading State**: Button disabled với text "Đang lưu..."

#### Password Strength Calculation
Mật khẩu được đánh giá dựa trên:
1. ✅ Độ dài ≥ 6 ký tự (+1 điểm)
2. ✅ Độ dài ≥ 8 ký tự (+1 điểm)
3. ✅ Có cả chữ hoa và chữ thường (+1 điểm)
4. ✅ Có chữ số (+1 điểm)
5. ✅ Có ký tự đặc biệt (+1 điểm)

## Cấu Trúc File

```
app/
├── api/
│   └── user/
│       └── change-password/
│           └── route.ts          # API endpoint
└── account/
    └── profile/
        └── page.tsx              # UI với form đổi mật khẩu

test-change-password.js           # Script test API
md/
└── CHANGE-PASSWORD-FEATURE.md    # Tài liệu này
```

## Security Features

### 1. Password Hashing
- Sử dụng `bcryptjs` để hash mật khẩu
- Salt rounds: 10
- Mật khẩu không bao giờ được lưu dạng plaintext

### 2. Password Verification
- So sánh hash của mật khẩu hiện tại với database
- Chỉ cho phép đổi mật khẩu nếu mật khẩu hiện tại đúng

### 3. Authentication
- Sử dụng middleware `authenticateUser`
- Kiểm tra user có quyền trước khi thực hiện

### 4. Validation
- Client-side validation (React)
- Server-side validation (API)
- Double validation để đảm bảo an toàn

## Hướng Dẫn Sử Dụng

### Cho User:

1. **Đăng nhập vào hệ thống**

2. **Vào trang Profile:**
   - Click vào tên user ở header
   - Chọn "Thông tin cá nhân"
   - Hoặc truy cập trực tiếp `/account/profile`

3. **Đổi mật khẩu:**
   - Tìm card "Bảo mật"
   - Click nút "Đổi mật khẩu"
   - Nhập mật khẩu hiện tại
   - Nhập mật khẩu mới (phải có ít nhất 6 ký tự, 1 chữ hoa, 1 số)
   - Nhập lại mật khẩu mới để xác nhận
   - Click "Đổi mật khẩu"
   - Chờ thông báo "Đổi mật khẩu thành công"

4. **Tips:**
   - Sử dụng mật khẩu mạnh (chữ hoa, chữ thường, số, ký tự đặc biệt)
   - Không dùng lại mật khẩu cũ
   - Đổi mật khẩu định kỳ để bảo mật

### Cho Developer:

#### 1. Test Manual

```bash
# Khởi động server
npm run dev

# Truy cập http://localhost:3000/account/profile
# Test các trường hợp:
# - Đổi mật khẩu thành công
# - Mật khẩu hiện tại sai
# - Mật khẩu mới yếu
# - Mật khẩu xác nhận không khớp
```

#### 2. Test Tự Động

```bash
# Chỉnh sửa test-change-password.js
# Cập nhật TEST_USER_ID và CURRENT_PASSWORD

# Chạy test
node test-change-password.js
```

#### 3. Test Database

Kiểm tra mật khẩu đã được hash:

```bash
npx prisma studio
# Xem bảng User, field password phải là hash string
```

## Error Messages (Tiếng Việt)

| Lỗi | Message |
|-----|---------|
| Missing fields | Vui lòng điền đầy đủ thông tin |
| Short password | Mật khẩu mới phải có ít nhất 6 ký tự |
| No uppercase | Mật khẩu mới phải có ít nhất 1 chữ hoa |
| No number | Mật khẩu mới phải có ít nhất 1 chữ số |
| Mismatch | Mật khẩu mới và xác nhận mật khẩu không khớp |
| Same as current | Mật khẩu mới không được trùng với mật khẩu hiện tại |
| Wrong password | Mật khẩu hiện tại không đúng |
| Unauthorized | Unauthorized |
| Server error | Lỗi khi đổi mật khẩu |

## API Test Results

### Test Case 1: Successful Change
```bash
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass456",
    "confirmPassword": "NewPass456"
  }'

# Expected: 200 OK
# {"message":"Đổi mật khẩu thành công"}
```

### Test Case 2: Wrong Current Password
```bash
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "currentPassword": "WrongPass",
    "newPassword": "NewPass456",
    "confirmPassword": "NewPass456"
  }'

# Expected: 400 Bad Request
# {"error":"Mật khẩu hiện tại không đúng"}
```

### Test Case 3: Weak Password
```bash
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "weak",
    "confirmPassword": "weak"
  }'

# Expected: 400 Bad Request
# {"error":"Mật khẩu mới phải có ít nhất 6 ký tự"}
# hoặc
# {"error":"Mật khẩu mới phải có ít nhất 1 chữ hoa"}
```

### Test Case 4: Password Mismatch
```bash
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass456",
    "confirmPassword": "DifferentPass789"
  }'

# Expected: 400 Bad Request
# {"error":"Mật khẩu mới và xác nhận mật khẩu không khớp"}
```

## Screenshots

### 1. Card Bảo mật (Collapsed)
```
┌────────────────────────────────────────┐
│ 🛡️ Bảo mật            [Đổi mật khẩu]   │
├────────────────────────────────────────┤
│ 🔒 Mật khẩu                            │
│    ••••••••                            │
└────────────────────────────────────────┘
```

### 2. Form Đổi Mật Khẩu (Expanded)
```
┌────────────────────────────────────────┐
│ 🛡️ Bảo mật                             │
├────────────────────────────────────────┤
│ 🔒 Mật khẩu hiện tại                   │
│ [________________] 👁️                  │
│                                        │
│ 🔒 Mật khẩu mới                        │
│ [________________] 👁️                  │
│ ████░░░░░░ Trung bình                  │
│ Gợi ý: Thêm ký tự đặc biệt             │
│                                        │
│ 🔒 Xác nhận mật khẩu mới               │
│ [________________] 👁️                  │
│                                        │
│ [Đổi mật khẩu]  [Hủy]                  │
└────────────────────────────────────────┘
```

## Best Practices

### Cho User:
1. ✅ Dùng mật khẩu dài ít nhất 8 ký tự
2. ✅ Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
3. ✅ Không dùng thông tin cá nhân trong mật khẩu
4. ✅ Đổi mật khẩu định kỳ (3-6 tháng)
5. ✅ Không chia sẻ mật khẩu với ai

### Cho Developer:
1. ✅ Luôn hash mật khẩu trước khi lưu
2. ✅ Validation cả client và server
3. ✅ Không log mật khẩu trong console
4. ✅ Sử dụng HTTPS trong production
5. ✅ Implement rate limiting để chống brute force

## Troubleshooting

### Lỗi "Mật khẩu hiện tại không đúng"
**Nguyên nhân:** Bạn nhập sai mật khẩu hiện tại
**Giải pháp:** 
- Kiểm tra Caps Lock có bật không
- Thử đăng xuất và đăng nhập lại
- Nếu quên mật khẩu, dùng chức năng "Quên mật khẩu"

### Lỗi "Mật khẩu mới phải có ít nhất 1 chữ hoa"
**Nguyên nhân:** Mật khẩu không đủ mạnh
**Giải pháp:** 
- Thêm ít nhất 1 chữ cái viết hoa (A-Z)
- Ví dụ: `newpassword123` → `Newpassword123`

### Lỗi "Unauthorized"
**Nguyên nhân:** Session hết hạn hoặc chưa đăng nhập
**Giải pháp:** 
- Đăng xuất và đăng nhập lại
- Clear cache và cookies
- Kiểm tra user ID trong localStorage

## Các Cải Tiến Tiếp Theo (Optional)

1. **Two-Factor Authentication (2FA)**: Xác thực 2 lớp với SMS/Email
2. **Password History**: Không cho phép dùng lại 5 mật khẩu gần nhất
3. **Password Expiry**: Bắt buộc đổi mật khẩu sau N tháng
4. **Forgot Password**: Link "Quên mật khẩu?" trong form
5. **Activity Log**: Ghi nhận lịch sử đổi mật khẩu
6. **Email Notification**: Gửi email thông báo khi đổi mật khẩu
7. **Biometric Auth**: Hỗ trợ Face ID / Touch ID
8. **Password Manager**: Tích hợp với 1Password, LastPass

## Kết Luận

Chức năng thay đổi mật khẩu đã được implement đầy đủ với:
- ✅ API endpoint bảo mật
- ✅ Validation chặt chẽ
- ✅ UI/UX thân thiện
- ✅ Password strength meter
- ✅ Error handling tốt
- ✅ Security best practices

User giờ đây có thể đổi mật khẩu một cách dễ dàng và an toàn từ trang profile!

