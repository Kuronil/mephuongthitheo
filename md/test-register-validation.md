# 🧪 Test Cases - Form Đăng Ký Tài Khoản

## Hướng Dẫn Test

### Khởi động server:
```bash
npm run dev
```

Truy cập: http://localhost:3000/account/register

---

## ✅ Test Cases Chi Tiết

### 1. Test Trường "Họ và Tên"

#### Test Case 1.1: Tên hợp lệ
| Input | Expected Result |
|-------|----------------|
| "Nguyễn Văn A" | ✅ Pass - Border xanh |
| "Trần Thị Bình" | ✅ Pass - Border xanh |
| "Lê Hoàng Đức" | ✅ Pass - Border xanh |
| "Mai Anh" | ✅ Pass - Border xanh |

#### Test Case 1.2: Tên không hợp lệ
| Input | Error Message | Visual |
|-------|--------------|--------|
| "123" | "Tên không được chứa số hoặc ký tự đặc biệt" | 🔴 Border đỏ + shake |
| "Nguyen123" | "Tên không được chứa số hoặc ký tự đặc biệt" | 🔴 Border đỏ + shake |
| "User@123" | "Tên không được chứa số hoặc ký tự đặc biệt" | 🔴 Border đỏ + shake |
| "A" | "Tên phải có ít nhất 2 ký tự" | 🔴 Border đỏ + shake |
| "" (empty) | HTML5 required validation | 🔴 Browser tooltip |

---

### 2. Test Trường "Email"

#### Test Case 2.1: Email format hợp lệ
| Input | Expected Result |
|-------|----------------|
| "test@example.com" | ✅ Wait 1s → Check existence |
| "user@gmail.com" | ✅ Wait 1s → Check existence |
| "admin@company.vn" | ✅ Wait 1s → Check existence |

#### Test Case 2.2: Email format không hợp lệ
| Input | Error Message | Visual |
|-------|--------------|--------|
| "invalid" | "Email không hợp lệ" | 🔴 Border đỏ |
| "@test.com" | "Email không hợp lệ" | 🔴 Border đỏ |
| "test@" | "Email không hợp lệ" | 🔴 Border đỏ |
| "test" | "Email không hợp lệ" | 🔴 Border đỏ |

#### Test Case 2.3: Email đã tồn tại
| Action | Expected Result |
|--------|----------------|
| 1. Đăng ký với "test@example.com" | ✅ Success |
| 2. Đăng ký lại với "test@example.com" | 🔴 "Email đã được sử dụng" |
| 3. Nhập "test@example.com" và đợi 1s | ⏳ Loading spinner → 🔴 Error message |

#### Test Case 2.4: Email checking loading
| Action | Expected Result |
|--------|----------------|
| Nhập email và đợi < 1s | ⏳ Không có spinner |
| Nhập email và đợi > 1s | ⏳ Spinner xuất hiện → Check API |

---

### 3. Test Trường "Số Điện Thoại"

#### Test Case 3.1: Phone hợp lệ
| Input | Auto-format | Expected Result |
|-------|------------|----------------|
| "0912345678" | "0912 345 678" | ✅ Pass |
| "0987654321" | "0987 654 321" | ✅ Pass |
| "0356789012" | "0356 789 012" | ✅ Pass |
| "0788888888" | "0788 888 888" | ✅ Pass |
| "" (empty) | "" | ✅ Pass (Optional) |

#### Test Case 3.2: Phone không hợp lệ
| Input | Error Message | Visual |
|-------|--------------|--------|
| "123" | "Số điện thoại không hợp lệ" | 🔴 Border đỏ |
| "0212345678" | "Số điện thoại không hợp lệ" | 🔴 Border đỏ |
| "abc" | (Auto-removed) | - |
| "091234567" | "Số điện thoại không hợp lệ" | 🔴 Border đỏ (9 số) |
| "09123456789" | (Max 10 số) | - |

#### Test Case 3.3: Phone auto-format
| Input | Expected Display |
|-------|-----------------|
| "0" | "0" |
| "091" | "091" |
| "0912" | "0912" |
| "09123" | "0912 3" |
| "0912345" | "0912 345" |
| "091234567" | "0912 345 67" |
| "0912345678" | "0912 345 678" |

---

### 4. Test Trường "Địa Chỉ"

#### Test Case 4.1: Địa chỉ hợp lệ
| Input | Expected Result |
|-------|----------------|
| "123 Đường ABC, Quận 1" | ✅ Pass |
| "Số 10 Nguyễn Huệ, TP.HCM" | ✅ Pass |
| "Chung cư XYZ, Tầng 5" | ✅ Pass |

#### Test Case 4.2: Địa chỉ không hợp lệ
| Input | Error Message | Visual |
|-------|--------------|--------|
| "" (empty) | "Vui lòng nhập địa chỉ" | 🔴 Toast error on submit |
| "   " (spaces) | "Vui lòng nhập địa chỉ" | 🔴 Toast error on submit |

---

### 5. Test Trường "Mật Khẩu"

#### Test Case 5.1: Password strength levels
| Input | Length | Uppercase | Number | Special | Strength | Color | Text |
|-------|--------|-----------|--------|---------|----------|-------|------|
| "abc" | ❌ | ❌ | ❌ | ❌ | 0/5 | - | - |
| "abcdef" | ✅ | ❌ | ❌ | ❌ | 1/5 | 🔴 Red | "Mật khẩu yếu" |
| "Abcdef" | ✅ | ✅ | ❌ | ❌ | 2/5 | 🔴 Red | "Mật khẩu yếu" |
| "Abc123" | ✅ | ✅ | ✅ | ❌ | 3/5 | 🟡 Yellow | "Mật khẩu trung bình" |
| "Abcdef123" | ✅✅ | ✅ | ✅ | ❌ | 4/5 | 🟢 Green | "Mật khẩu mạnh" |
| "Abc123!@" | ✅✅ | ✅ | ✅ | ✅ | 5/5 | 🟢 Green | "Mật khẩu mạnh" |

#### Test Case 5.2: Password requirements visual
| Input | Requirement | Visual |
|-------|-------------|--------|
| "" | All requirements | ○ Gray circle (all) |
| "abc" | < 6 chars | ○ Gray circle (all) |
| "abcdef" | ≥ 6 chars | ✓ Green check (1st only) |
| "Abcdef" | + Uppercase | ✓ Green check (1st, 2nd) |
| "Abc123" | + Number | ✓ Green check (all) |

#### Test Case 5.3: Password validation errors
| Input | Error Message | When |
|-------|--------------|------|
| "abc" | "Mật khẩu phải có ít nhất 6 ký tự" | On submit |
| "abcdef" | "Mật khẩu phải có ít nhất 1 chữ hoa" | On submit |
| "Abcdef" | "Mật khẩu phải có ít nhất 1 chữ số" | On submit |
| "Abc123" | ✅ No error | - |

#### Test Case 5.4: Password visibility toggle
| Action | Expected Result |
|--------|----------------|
| Click Eye icon | Password text visible |
| Click EyeOff icon | Password text hidden |
| Toggle multiple times | Works smoothly |

---

### 6. Test Trường "Xác Nhận Mật Khẩu"

#### Test Case 6.1: Password match
| Password | Confirm Password | Expected Result |
|----------|------------------|----------------|
| "Abc123" | "Abc123" | ✅ Pass |
| "Test123" | "Test123" | ✅ Pass |

#### Test Case 6.2: Password mismatch
| Password | Confirm Password | Error Message |
|----------|------------------|--------------|
| "Abc123" | "Abc124" | "Mật khẩu xác nhận không khớp" |
| "Test123" | "test123" | "Mật khẩu xác nhận không khớp" |
| "Password1" | "" | "Mật khẩu xác nhận không khớp" |

---

### 7. Test Checkbox "Điều Khoản"

#### Test Case 7.1: Checkbox required
| Action | Expected Result |
|--------|----------------|
| Submit without checking | 🔴 HTML5 validation error |
| Check and submit | ✅ Proceed to next validation |

---

### 8. Test Submit Button States

#### Test Case 8.1: Button disabled states
| Condition | Button State |
|-----------|-------------|
| Loading | Disabled + Spinner + "Đang tạo tài khoản..." |
| Checking email | Disabled |
| Normal | Enabled + "Tạo tài khoản" |

#### Test Case 8.2: Loading animation
| Action | Expected Result |
|--------|----------------|
| Click submit | Spinner appears + Text changes |
| Wait for response | Button enabled after response |

---

## 🎯 Integration Tests

### Integration Test 1: Successful Registration Flow
```
Steps:
1. Nhập "Nguyễn Văn A" → Name field
2. Nhập "newuser@test.com" → Email field
3. Đợi 1s → Email check passes ✅
4. Nhập "0912345678" → Phone field → Auto-format to "0912 345 678"
5. Nhập "123 Đường ABC, Quận 1" → Address field
6. Nhập "Test123" → Password field
7. Check requirements: ✓ ≥6 chars, ✓ Uppercase, ✓ Number
8. Nhập "Test123" → Confirm password field
9. Check "Điều khoản" checkbox
10. Click "Tạo tài khoản"

Expected:
- Loading spinner appears
- Toast: "Đăng ký thành công!"
- Redirect to /account/profile
- User data in localStorage
```

### Integration Test 2: Registration with Existing Email
```
Steps:
1. Register with "test@example.com" (assume exists)
2. Fill all fields correctly
3. Email check shows "Email đã được sử dụng"
4. Try to submit

Expected:
- Cannot submit (error toast)
- Border red on email field
- Error message displayed
```

### Integration Test 3: Registration with Weak Password
```
Steps:
1. Fill all fields correctly
2. Enter "abc" as password
3. Try to submit

Expected:
- Toast error: "Mật khẩu phải có ít nhất 6 ký tự"
- Form not submitted
- Password field highlighted
```

### Integration Test 4: Registration without Address
```
Steps:
1. Fill all fields except address
2. Try to submit

Expected:
- Toast error: "Vui lòng nhập địa chỉ"
- Form not submitted
```

---

## 🔄 Backend Validation Tests

### Test API directly with curl:

#### Test 1: Successful registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "test123@example.com",
    "phone": "0912345678",
    "password": "Test123",
    "address": "123 Đường ABC"
  }'

Expected: 201 Created + User object (without password)
```

#### Test 2: Missing required fields
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'

Expected: 400 Bad Request + "Missing required fields"
```

#### Test 3: Invalid email format
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "Test123",
    "address": "123 Street"
  }'

Expected: 400 Bad Request + "Email không hợp lệ"
```

#### Test 4: Weak password
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "abc",
    "address": "123 Street"
  }'

Expected: 400 Bad Request + "Mật khẩu phải có ít nhất 6 ký tự"
```

#### Test 5: Invalid phone
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123456",
    "password": "Test123",
    "address": "123 Street"
  }'

Expected: 400 Bad Request + "Số điện thoại không hợp lệ"
```

#### Test 6: Check email exists
```bash
curl http://localhost:3000/api/auth/check-email?email=test@example.com

Expected: { "exists": true/false }
```

---

## 📱 Mobile Testing

### Responsive breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Test on mobile:
1. Font sizes adjust correctly
2. Padding/margins responsive
3. Buttons are touch-friendly
4. Form inputs are large enough
5. No horizontal scroll
6. Animations smooth

---

## 🎨 Visual/Animation Tests

### Test Case V1: Shake animation on error
```
Steps:
1. Enter "123" in name field
2. Click outside

Expected: 
- Border turns red
- Input shakes left-right
- Error message fades in
```

### Test Case V2: Fade-in animation for errors
```
Steps:
1. Trigger any validation error

Expected:
- Error message appears with fade-in effect
- Smooth transition from transparent to visible
```

### Test Case V3: Password strength indicator
```
Steps:
1. Type "a" → 0 bars
2. Type "abcdef" → 1 red bar
3. Type "Abcdef" → 2 red bars
4. Type "Abc123" → 3 yellow bars
5. Type "Abcdef12" → 4 green bars
6. Type "Abc123!@" → 5 green bars

Expected:
- Smooth color transitions
- Bars fill from left to right
- Text updates accordingly
```

### Test Case V4: Loading states
```
Steps:
1. Click submit with valid data

Expected:
- Button shows spinner
- Text changes to "Đang tạo tài khoản..."
- Button is disabled
- Smooth animation
```

---

## 📊 Performance Tests

### Test P1: Email check debouncing
```
Action: Type email quickly

Expected:
- No API calls while typing
- API call only after 1s pause
- Only one API call per pause
```

### Test P2: Real-time validation performance
```
Action: Type in all fields rapidly

Expected:
- No lag
- Smooth updates
- No excessive re-renders
```

---

## 🐛 Edge Cases

### Edge Case 1: Copy-paste behavior
```
Test: Copy "0912345678" and paste into phone field

Expected: Auto-format to "0912 345 678"
```

### Edge Case 2: Autofill behavior
```
Test: Use browser autofill

Expected: 
- Fields populate correctly
- Validation triggers
- No errors
```

### Edge Case 3: Back button
```
Test: Fill form → Navigate away → Back button

Expected:
- Form data may or may not persist (browser behavior)
- No JavaScript errors
```

### Edge Case 4: Network error
```
Test: Disconnect internet → Submit form

Expected:
- Error message
- User-friendly error
- Can retry
```

---

## ✅ Acceptance Criteria

All features must pass:
- ✅ All required fields validate correctly
- ✅ Optional phone field works with/without input
- ✅ Password strength indicator shows correctly
- ✅ Email uniqueness check works
- ✅ Animations smooth and pleasant
- ✅ Mobile responsive
- ✅ API validation matches frontend
- ✅ Error messages clear and helpful
- ✅ Success flow completes properly
- ✅ No console errors
- ✅ No accessibility issues

---

## 📝 Testing Checklist

```
[ ] Test all valid inputs
[ ] Test all invalid inputs
[ ] Test edge cases
[ ] Test mobile responsive
[ ] Test animations
[ ] Test loading states
[ ] Test API endpoints
[ ] Test backend validation
[ ] Test with existing email
[ ] Test password strength levels
[ ] Test phone auto-format
[ ] Test real-time validation
[ ] Test debounced email check
[ ] Test error messages
[ ] Test success flow
[ ] Test browser compatibility
[ ] Test with autofill
[ ] Test copy-paste
[ ] Test keyboard navigation
[ ] Test screen readers (accessibility)
```

---

**Happy Testing! 🚀**

