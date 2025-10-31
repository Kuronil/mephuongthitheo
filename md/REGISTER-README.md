# 🚀 Form Đăng Ký Tài Khoản - Hướng Dẫn Nhanh

## 📍 Truy Cập

```
URL: http://localhost:3000/account/register
```

---

## ✨ Tính Năng Mới

### 🎯 Các Cải Tiến Chính

1. **☎️ Trường Số Điện Thoại**
   - Tự động format: `0912 345 678`
   - Tùy chọn (không bắt buộc)

2. **🔐 Validation Mật Khẩu Mạnh**
   - ✅ Tối thiểu 6 ký tự
   - ✅ Ít nhất 1 chữ hoa
   - ✅ Ít nhất 1 số

3. **💪 Hiển Thị Độ Mạnh Mật Khẩu**
   - 5 cấp độ với màu sắc
   - Checklist yêu cầu real-time

4. **✉️ Kiểm Tra Email Trùng Lặp**
   - Tự động check sau 1 giây
   - Thông báo nếu email đã tồn tại

5. **📍 Địa Chỉ Bắt Buộc**
   - Không thể bỏ trống
   - Cần thiết cho giao hàng

6. **🎨 Animations & UX**
   - Shake effect khi lỗi
   - Fade-in cho thông báo
   - Real-time validation

---

## 📝 Các Trường Đăng Ký

| Trường | Bắt Buộc | Validation |
|--------|----------|------------|
| **Họ và tên** | ✅ | Không số/ký tự đặc biệt, ≥2 ký tự |
| **Email** | ✅ | Format email, unique |
| **Số điện thoại** | ❌ | 10 số, đầu số VN (03/05/07/08/09) |
| **Địa chỉ** | ✅ | Không rỗng |
| **Mật khẩu** | ✅ | ≥6 ký tự, 1 chữ hoa, 1 số |
| **Xác nhận mật khẩu** | ✅ | Khớp với mật khẩu |

---

## 🧪 Test Nhanh

### 1. Test Frontend (Trình duyệt)

```bash
# Khởi động server
npm run dev

# Truy cập
http://localhost:3000/account/register
```

**Test data hợp lệ:**
```
Họ và tên: Nguyễn Văn A
Email: test@example.com
Số điện thoại: 0912345678
Địa chỉ: 123 Đường ABC, Quận 1
Mật khẩu: Test123
Xác nhận: Test123
✅ Điều khoản
```

---

### 2. Test API (Backend)

#### Cách 1: Dùng script test
```bash
node test-register-api.js
```

#### Cách 2: Dùng curl
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "test@example.com",
    "phone": "0912345678",
    "password": "Test123",
    "address": "123 Đường ABC"
  }'
```

---

## 📚 Tài Liệu Chi Tiết

| File | Mô Tả |
|------|-------|
| `REGISTER-IMPROVEMENTS.md` | 📖 Tài liệu đầy đủ các cải tiến |
| `test-register-validation.md` | 🧪 Test cases chi tiết |
| `test-register-api.js` | 🔧 Script test API tự động |

---

## 🎯 Ví Dụ Validation

### ✅ Hợp Lệ
```
Name: "Nguyễn Văn A" ✓
Email: "test@example.com" ✓
Phone: "0912345678" → "0912 345 678" ✓
Address: "123 Street" ✓
Password: "Test123" ✓ (Strength: 3/5 - Trung bình)
```

### ❌ Không Hợp Lệ
```
Name: "User123" ✗ → "Tên không được chứa số"
Email: "invalid" ✗ → "Email không hợp lệ"
Phone: "123" ✗ → "Số điện thoại không hợp lệ"
Address: "" ✗ → "Vui lòng nhập địa chỉ"
Password: "abc" ✗ → "Mật khẩu phải có ít nhất 6 ký tự"
Password: "abcdef" ✗ → "Mật khẩu phải có ít nhất 1 chữ hoa"
Password: "Abcdef" ✗ → "Mật khẩu phải có ít nhất 1 chữ số"
```

---

## 🎨 Mật Khẩu Strength Levels

| Level | Ví Dụ | Điểm | Màu | Đánh Giá |
|-------|-------|------|-----|----------|
| 1-2 | `abcdef` | 1-2/5 | 🔴 Đỏ | Yếu |
| 3 | `Abc123` | 3/5 | 🟡 Vàng | Trung bình |
| 4-5 | `Abcd1234!` | 4-5/5 | 🟢 Xanh | Mạnh |

---

## 🔍 Debug

### Kiểm tra Console (F12)
```javascript
// Network tab - Xem API requests
// Console tab - Xem errors
// Application tab - Xem localStorage

// Check user data sau khi đăng ký
console.log(localStorage.getItem('user'))
```

### Kiểm tra Database
```bash
npx prisma studio
```

---

## 🐛 Troubleshooting

### Lỗi: "Email đã được sử dụng"
**Giải pháp:** Dùng email khác hoặc xóa user cũ trong database

### Lỗi: Server không chạy
**Giải pháp:**
```bash
npm run dev
```

### Lỗi: Validation không hoạt động
**Giải pháp:**
1. Clear browser cache (Ctrl + Shift + R)
2. Restart server
3. Kiểm tra Console errors

---

## 📱 Mobile Testing

**Responsive breakpoints:**
- 📱 Mobile: < 640px
- 📱 Tablet: 640px - 1024px  
- 💻 Desktop: > 1024px

**Test trên các thiết bị:**
- iPhone Safari
- Android Chrome
- iPad
- Desktop browsers (Chrome, Firefox, Edge)

---

## 🔐 Security Features

- ✅ Password hashing với bcrypt (12 rounds)
- ✅ Email uniqueness check
- ✅ Input sanitization
- ✅ Server-side validation
- ✅ No password in response

---

## 🎊 Success Flow

```
1. User nhập thông tin
2. Real-time validation
3. Submit form
4. API validation
5. Create user
6. Hash password
7. Save to database
8. Return user (without password)
9. Save to localStorage
10. Toast success
11. Redirect to /account/profile
```

---

## 📞 API Endpoints

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới |
| `GET` | `/api/auth/check-email?email=...` | Kiểm tra email tồn tại |

---

## ✨ Quick Tips

1. **Auto-format phone**: Nhập `0912345678` → Tự động thành `0912 345 678`
2. **Email check**: Đợi 1 giây sau khi nhập email
3. **Password strength**: Xem real-time khi gõ
4. **Toggle password**: Click icon mắt để hiện/ẩn
5. **Keyboard**: Tab để di chuyển giữa các trường

---

## 🎯 Acceptance Checklist

- [x] ☎️ Thêm trường số điện thoại
- [x] 🔐 Validation mật khẩu mạnh
- [x] 💪 Hiển thị độ mạnh mật khẩu  
- [x] ✉️ Real-time email check
- [x] 📍 Địa chỉ bắt buộc
- [x] 👤 Validation tên tiếng Việt
- [x] 🎨 Animations smooth
- [x] 📱 Mobile responsive
- [x] 🧪 Tests comprehensive
- [x] 📖 Documentation complete

---

## 🚀 Quick Start

```bash
# 1. Start server
npm run dev

# 2. Open browser
http://localhost:3000/account/register

# 3. Fill form with valid data
# 4. Click "Tạo tài khoản"
# 5. Success! Redirect to profile

# 6. (Optional) Run API tests
node test-register-api.js
```

---

**Version:** 2.0  
**Last Updated:** 28/10/2025  
**Status:** ✅ Production Ready

---

## 📖 Đọc Thêm

- [Chi tiết cải tiến](./REGISTER-IMPROVEMENTS.md)
- [Test cases đầy đủ](./test-register-validation.md)
- [API test script](./test-register-api.js)

---

**Happy Coding! 🎉**

