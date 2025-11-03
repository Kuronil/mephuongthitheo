# 📧 Email Verification - Quick Start

## ⚡ Setup Nhanh (3 Phút)

### 1️⃣ Tạo App Password Gmail

```
https://myaccount.google.com/apppasswords
```

1. Bật **2-Step Verification** (nếu chưa có)
2. Click **Generate** → Chọn **Mail** → **Other**
3. Copy password **16 ký tự**

### 2️⃣ Cập Nhật File `.env`

Tạo file `.env` trong thư mục gốc:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME="Mẹ Phương Thị Theo"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Thay:**
- `SMTP_USER` → Email Gmail của bạn
- `SMTP_PASS` → App Password vừa copy

### 3️⃣ Restart Server

```bash
npm run dev
```

---

## 🧪 Test

### Option 1: Test SMTP Connection

```bash
# 1. Mở file test-smtp.js
# 2. Thay email và password
# 3. Run:
node test-smtp.js
```

**Expected:**
```
✅ SMTP Connection SUCCESSFUL!
```

### Option 2: Test Đăng Ký

```
1. http://localhost:3000/account/register
2. Đăng ký với email thật
3. Check email inbox
4. Click link verify
```

---

## 📚 Docs

| File | Mô Tả |
|------|-------|
| `HUONG-DAN-SETUP-SMTP-GMAIL.md` | **Hướng dẫn chi tiết có troubleshooting** |
| `EMAIL-VERIFICATION-SUMMARY.md` | Tổng quan tính năng |
| `EMAIL-VERIFICATION-README.md` | Quick start (file này) |

---

## 🔥 Features

- ✅ Auto gửi email xác thực khi đăng ký
- ✅ Link verify có hiệu lực 24 giờ
- ✅ Gửi lại email nếu cần
- ✅ Không thể login nếu chưa verify
- ✅ Welcome email sau khi verify thành công

---

## 🐛 Troubleshooting

### Email không gửi?

**Check console logs:**
```
✅ Verification email sent to: user@example.com
```

**Nếu thấy error:**
1. Check `.env` có đúng không
2. Check SMTP_USER và SMTP_PASS
3. Run `node test-smtp.js`
4. Đọc `HUONG-DAN-SETUP-SMTP-GMAIL.md`

### Email vào Spam?

✅ OK - đây là bình thường khi test

---

## 📞 Need Help?

Đọc hướng dẫn chi tiết:
👉 **`HUONG-DAN-SETUP-SMTP-GMAIL.md`**

---

**Status:** ✅ Ready to Use  
**Setup Time:** ~3 phút

