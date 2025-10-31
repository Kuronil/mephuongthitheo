# 🧪 Test Cases - Form Đăng Ký Cải Tiến

## 📋 Hướng Dẫn Test

### Cách Test:
1. Khởi động server: `npm run dev`
2. Truy cập: `http://localhost:3000/account/register`
3. Thử các test cases dưới đây

---

## ✅ Test Cases - Happy Path

### Test 1: Đăng ký thành công với đầy đủ thông tin
```
Họ và tên: Nguyễn Văn An
Email: nguyenvanan@gmail.com
Số điện thoại: 0912345678 (sẽ auto-format thành: 0912 345 678)
Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP.HCM
Mật khẩu: Password123
Xác nhận mật khẩu: Password123

✅ Kết quả mong đợi:
- Password strength indicator hiển thị "Mật khẩu mạnh" (màu xanh)
- Tất cả checkmarks (✓) đều xanh
- Submit thành công
- Redirect về /account/profile
```

### Test 2: Đăng ký không có số điện thoại (optional)
```
Họ và tên: Trần Thị Bình
Email: tranthib@gmail.com
Số điện thoại: (để trống)
Địa chỉ: 456 Nguyễn Huệ, Quận 1, TP.HCM
Mật khẩu: MyPass123
Xác nhận mật khẩu: MyPass123

✅ Kết quả mong đợi:
- Submit thành công (phone là optional)
- Không có lỗi về phone
```

### Test 3: Tên tiếng Việt có dấu
```
Họ và tên: Nguyễn Thị Hằng Nga
Email: hangnganh@gmail.com
Số điện thoại: 0987654321
Địa chỉ: 789 Trần Hưng Đạo, Quận 5, TP.HCM
Mật khẩu: VietNam2024
Xác nhận mật khẩu: VietNam2024

✅ Kết quả mong đợi:
- Tên có dấu được chấp nhận
- Submit thành công
```

---

## ❌ Test Cases - Error Handling

### Test 4: Tên có số
```
Họ và tên: Nguyen123
Email: test@gmail.com

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Tên không được chứa số hoặc ký tự đặc biệt"
- Border input màu đỏ + shake animation
- Không cho submit
```

### Test 5: Tên có ký tự đặc biệt
```
Họ và tên: Nguyen@#$
Email: test@gmail.com

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Tên không được chứa số hoặc ký tự đặc biệt"
- Border input màu đỏ
```

### Test 6: Tên quá ngắn
```
Họ và tên: A
Email: test@gmail.com

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Tên phải có ít nhất 2 ký tự"
```

### Test 7: Email không hợp lệ
```
Email: notanemail

❌ Kết quả mong đợi:
- Hiển thị lỗi real-time: "Email không hợp lệ"
- Border màu đỏ + shake
- Không hiển thị loading spinner
```

### Test 8: Email đã tồn tại
```
Email: admin@admin.com (giả sử đã có trong DB)

❌ Kết quả mong đợi:
- Hiển thị loading spinner trong 1 giây
- Sau đó hiển thị lỗi: "Email đã được sử dụng"
- Border màu đỏ
- Không cho submit
```

### Test 9: Số điện thoại không hợp lệ
```
Số điện thoại: 123456

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Số điện thoại không hợp lệ"
- Border màu đỏ
```

### Test 10: Mật khẩu quá ngắn
```
Mật khẩu: 12345

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Mật khẩu phải có ít nhất 6 ký tự"
- Password strength hiển thị "Mật khẩu yếu" (màu đỏ)
- Checklist chỉ có "○ Ít nhất 6 ký tự" màu xám
```

### Test 11: Mật khẩu không có chữ hoa
```
Mật khẩu: password123

❌ Kết quả mong đợi:
- Hiển thị lỗi khi submit: "Mật khẩu phải có ít nhất 1 chữ hoa"
- Password strength "Mật khẩu trung bình" (màu vàng)
- Checklist: ✓ 6 ký tự, ✓ 1 số, ○ 1 chữ hoa
```

### Test 12: Mật khẩu không có số
```
Mật khẩu: Password

❌ Kết quả mong đợi:
- Hiển thị lỗi khi submit: "Mật khẩu phải có ít nhất 1 chữ số"
- Checklist: ✓ 6 ký tự, ✓ 1 chữ hoa, ○ 1 số
```

### Test 13: Mật khẩu xác nhận không khớp
```
Mật khẩu: Password123
Xác nhận mật khẩu: Password456

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Mật khẩu xác nhận không khớp"
- Toast notification màu đỏ
```

### Test 14: Địa chỉ trống
```
Địa chỉ: (để trống hoặc chỉ có spaces)

❌ Kết quả mong đợi:
- Hiển thị lỗi: "Vui lòng nhập địa chỉ"
- Không cho submit
```

### Test 15: Chưa tick "Đồng ý điều khoản"
```
Điền đầy đủ thông tin nhưng không tick checkbox

❌ Kết quả mong đợi:
- HTML5 validation hiển thị: "Please check this box"
- Không cho submit
```

---

## 🎨 Test Cases - UI/UX

### Test 16: Auto-focus
```
Hành động: Mở trang register

✅ Kết quả mong đợi:
- Focus tự động vào trường "Họ và tên"
- Có thể gõ ngay không cần click
```

### Test 17: Auto-format số điện thoại
```
Nhập: 0912345678

✅ Kết quả mong đợi:
- Tự động format thành: 0912 345 678
- Giới hạn 12 ký tự (10 số + 2 spaces)
```

### Test 18: Password strength indicator
```
Test các mức độ:
- "12345" → 1 thanh đỏ, "Mật khẩu yếu"
- "password" → 2 thanh đỏ, "Mật khẩu yếu"
- "Password" → 3 thanh vàng, "Mật khẩu trung bình"
- "Password123" → 4 thanh xanh, "Mật khẩu mạnh"
- "Password123!" → 5 thanh xanh, "Mật khẩu mạnh"

✅ Kết quả mong đợi:
- Thanh màu thay đổi real-time
- Text mô tả chính xác
- Checklist cập nhật real-time
```

### Test 19: Email check debouncing
```
Hành động:
1. Nhập email: "test@gmail.com"
2. Dừng gõ

✅ Kết quả mong đợi:
- Đợi 1 giây
- Hiển thị loading spinner
- Sau đó hiển thị kết quả (exists hoặc OK)
```

### Test 20: Loading states
```
Hành động: Click "Tạo tài khoản"

✅ Kết quả mong đợi:
- Button hiển thị spinner + "Đang tạo tài khoản..."
- Button disabled
- Không thể click lại
- Form inputs vẫn hiển thị giá trị
```

### Test 21: Responsive design
```
Test trên các kích thước:
- Mobile (375px): Form full width, spacing nhỏ hơn
- Tablet (768px): Form có max-width, spacing vừa
- Desktop (1024px+): Form centered, spacing lớn

✅ Kết quả mong đợi:
- Layout responsive
- Không bị vỡ giao diện
- Buttons và inputs dễ nhấn trên mobile
```

### Test 22: Animations
```
Test animations:
- Input có lỗi → Shake animation (0.5s)
- Error message xuất hiện → Fade-in (0.3s)
- Button hover → Scale 1.02
- Button active → Scale 0.98

✅ Kết quả mong đợi:
- Animations mượt mà
- Không laggy
- Enhance UX, không làm phiền
```

### Test 23: Keyboard navigation
```
Hành động: Chỉ dùng phím Tab và Enter

✅ Kết quả mong đợi:
- Tab di chuyển qua các fields theo thứ tự
- Enter submit form
- Focus states rõ ràng
```

---

## 🔒 Test Cases - Security

### Test 24: XSS Prevention
```
Họ và tên: <script>alert('XSS')</script>

✅ Kết quả mong đợi:
- Bị reject bởi name validation regex
- Không thực thi script
```

### Test 25: SQL Injection (Backend)
```
Email: admin'--@gmail.com

✅ Kết quả mong đợi:
- Prisma ORM tự động escape
- Không có SQL injection
```

### Test 26: Password hashing
```
Mật khẩu: Password123

✅ Kết quả mong đợi:
- Lưu vào DB dạng hash (bcrypt)
- Không lưu plain text
- Check trong database: password field là hash dài
```

---

## 🌐 Test Cases - API

### Test 27: POST /api/auth/register (Success)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "phone": "0912345678",
    "password": "Password123",
    "address": "Test Address"
  }'

✅ Kết quả mong đợi:
- Status: 201 Created
- Response: User object (không có password)
- User được tạo trong database
```

### Test 28: POST /api/auth/register (Invalid Email)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalidemail",
    "password": "Password123",
    "address": "Test Address"
  }'

❌ Kết quả mong đợi:
- Status: 400 Bad Request
- Response: { "error": "Email không hợp lệ" }
```

### Test 29: GET /api/auth/check-email (Exists)
```bash
curl "http://localhost:3000/api/auth/check-email?email=admin@admin.com"

✅ Kết quả mong đợi:
- Status: 200 OK
- Response: { "exists": true }
```

### Test 30: GET /api/auth/check-email (Not Exists)
```bash
curl "http://localhost:3000/api/auth/check-email?email=newemail@example.com"

✅ Kết quả mong đợi:
- Status: 200 OK
- Response: { "exists": false }
```

---

## 📱 Test Cases - Mobile Specific

### Test 31: Touch targets
```
Thiết bị: iPhone SE (375px)

✅ Kết quả mong đợi:
- Inputs cao đủ (py-3) dễ chạm
- Buttons lớn, dễ nhấn
- Icons không quá nhỏ
- Spacing hợp lý
```

### Test 32: Virtual keyboard
```
Test trên mobile:
1. Focus vào input
2. Keyboard mở lên

✅ Kết quả mong đợi:
- Form scroll lên khi keyboard mở
- Input đang focus visible
- Không bị che khuất
```

### Test 33: Portrait & Landscape
```
Test xoay màn hình

✅ Kết quả mong đợi:
- Layout adjust tốt cả 2 chiều
- Không bị vỡ giao diện
```

---

## 🐛 Edge Cases

### Test 34: Very long name
```
Họ và tên: Nguyễn Thị Hoa Mai Phương Liên (30 ký tự)

✅ Kết quả mong đợi:
- Accept (không có max length)
- Hiển thị đầy đủ trong input
```

### Test 35: Special email domains
```
Email: user@subdomain.company.co.uk

✅ Kết quả mong đợi:
- Email regex accept
- Submit thành công
```

### Test 36: Phone with spaces
```
Số điện thoại: 091 234 5678 (user nhập có spaces)

✅ Kết quả mong đợi:
- Auto-format lại thành: 0912 345 678
- Validation pass
```

### Test 37: Copy-paste password
```
Hành động: Copy "Password123" và paste vào cả 2 ô password

✅ Kết quả mong đợi:
- Password strength indicator cập nhật ngay
- Validation pass
- Submit thành công
```

### Test 38: Browser autofill
```
Hành động: Dùng Chrome autofill để điền form

✅ Kết quả mong đợi:
- Autocomplete attributes hoạt động
- Validations chạy sau khi autofill
```

---

## 📊 Performance Tests

### Test 39: Multiple rapid typing
```
Hành động: Gõ rất nhanh vào email field

✅ Kết quả mong đợi:
- Debounce hoạt động (chỉ check sau 1s)
- Không gửi nhiều API requests
- UI không lag
```

### Test 40: Animation performance
```
Hành động: Trigger nhiều animations liên tiếp

✅ Kết quả mong đợi:
- Animations mượt 60fps
- Không drop frames
- CPU usage hợp lý
```

---

## ✅ Acceptance Criteria

Form đăng ký được coi là **PASS** nếu:

1. ✅ Tất cả happy path test cases pass
2. ✅ Error handling hoạt động đúng
3. ✅ UI/UX responsive và mượt mà
4. ✅ Security measures hoạt động
5. ✅ API endpoints trả về đúng
6. ✅ Mobile experience tốt
7. ✅ Edge cases được xử lý
8. ✅ Performance tốt

---

## 🎯 Quick Test Script

Test nhanh với 5 test cases cơ bản:

```
✅ Test 1: Happy path - Đăng ký thành công
✅ Test 2: Email đã tồn tại
✅ Test 3: Mật khẩu yếu
✅ Test 4: Auto-format phone
✅ Test 5: Responsive mobile
```

Nếu 5 tests này pass → Form ready for production! 🚀

---

**Created:** 28/10/2025
**Version:** 2.0

