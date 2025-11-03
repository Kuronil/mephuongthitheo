# 🚀 Setup Email Verification - 5 Phút

## Bước 1: Cấu Hình Gmail SMTP (2 phút)

### 1.1 Tạo App Password

1. Truy cập: https://myaccount.google.com/apppasswords
2. Đăng nhập với Gmail của bạn
3. Click **"Select app"** → Choose **"Mail"**
4. Click **"Select device"** → Choose **"Other (Custom name)"**
5. Nhập: "Mẹ Phương Thị Theo Website"
6. Click **"Generate"**
7. Copy password (16 ký tự, dạng: `xxxx xxxx xxxx xxxx`)

### 1.2 Cập Nhật File `.env`

Tạo hoặc cập nhật file `.env` trong thư mục gốc project:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com          # ← Thay bằng email của bạn
SMTP_PASS=xxxx xxxx xxxx xxxx           # ← Paste App Password ở đây
SMTP_FROM_NAME="Mẹ Phương Thị Theo"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important:** 
- Không commit file `.env` lên Git
- `.env` đã có trong `.gitignore`

---

## Bước 2: Restart Server (30 giây)

```bash
# Stop server hiện tại (Ctrl + C)

# Start lại
npm run dev
```

---

## Bước 3: Test (2 phút)

### 3.1 Đăng Ký Tài Khoản Mới

1. Truy cập: http://localhost:3000/account/register
2. Điền thông tin:
   ```
   Họ và tên: Test User
   Email: your-real-email@gmail.com  ← Dùng email thật để test
   Số điện thoại: 0912345678
   Địa chỉ: 123 Test Street
   Mật khẩu: Test123
   Xác nhận: Test123
   ✓ Điều khoản
   ```
3. Click **"Tạo tài khoản"**
4. Thấy thông báo: "📧 Vui lòng kiểm tra email..."
5. Redirect đến trang `/account/verify-pending`

### 3.2 Kiểm Tra Email

1. Mở Gmail inbox
2. Tìm email từ **"Mẹ Phương Thị Theo"**
3. Subject: **"✅ Xác Thực Email - Mẹ Phương Thị Theo"**
4. Click nút **"✅ Xác Thực Email"** (màu cam)

### 3.3 Xác Thực Thành Công

1. Trang mới mở: `/auth/verify-email?token=...`
2. Loading... (vài giây)
3. Thấy checkmark xanh ✅
4. Thông báo: "Email đã được xác thực thành công!"
5. Auto redirect đến `/account/login` sau 3 giây

### 3.4 Kiểm Tra Welcome Email

1. Quay lại Gmail inbox
2. Thấy email mới: **"🎉 Chào Mừng Đến Với Mẹ Phương Thị Theo!"**
3. Email chúc mừng đã verify thành công

### 3.5 Đăng Nhập

1. Truy cập: http://localhost:3000/account/login
2. Đăng nhập với email vừa đăng ký
3. ✅ Thành công!

---

## ✅ Xong!

Nếu tất cả các bước trên hoạt động → Email verification đã setup thành công! 🎉

---

## 🐛 Troubleshooting

### Problem: Không nhận được email

**Check 1: Console logs**
```bash
# Trong terminal chạy npm run dev
# Should see:
✅ Verification email sent to: user@example.com
```

**Check 2: Gmail Spam folder**
- Kiểm tra thư mục Spam/Junk

**Check 3: SMTP credentials**
```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',  // Thay email thật
    pass: 'your-app-password'       // Thay app password thật
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Error:', error);
  } else {
    console.log('✅ SMTP Ready!');
  }
});
"
```

**Check 4: .env file location**
```bash
# File .env phải ở thư mục gốc project
# Cùng level với package.json

C:\Users\Admin\Desktop\mephuongthitheo\
  ├── .env          ← Ở đây
  ├── package.json
  ├── prisma/
  ├── app/
  └── ...
```

### Problem: Link verify không hoạt động

**Check: NEXT_PUBLIC_APP_URL**
```env
# Phải match với URL đang chạy
NEXT_PUBLIC_APP_URL=http://localhost:3000  ✅
# KHÔNG phải:
# NEXT_PUBLIC_APP_URL=http://localhost:3001  ❌
```

### Problem: Token expired

**Solution: Gửi lại email**
1. Ở trang verify-pending
2. Click "Gửi Lại Email"
3. Nhập email
4. Click "Gửi"
5. Check email mới

---

## 🎯 Alternative: Mailtrap (For Testing)

Nếu không muốn dùng Gmail, dùng Mailtrap:

### Setup Mailtrap

1. Đăng ký: https://mailtrap.io (free)
2. Vào **Email Testing** → **Inboxes**
3. Click **"Show Credentials"**
4. Copy SMTP credentials

### Update `.env`

```env
SMTP_HOST=smtp.mailtrap.io  # hoặc sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
SMTP_FROM_NAME="Mẹ Phương Thị Theo"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**✅ Advantages:**
- Không cần App Password
- Dễ setup
- Good for development
- Email không thật sự gửi đi (safe)

**❌ Disadvantages:**
- Chỉ dùng cho testing
- Production phải dùng real SMTP

---

## 📝 Quick Commands

```bash
# Restart server
npm run dev

# Run tests
node test-email-verification.js

# Check database
npx prisma studio

# Regenerate Prisma Client (nếu có lỗi)
npx prisma generate
```

---

## 📚 Documentation

| File | When to Read |
|------|--------------|
| `EMAIL-VERIFICATION-README.md` | Quick overview |
| `EMAIL-VERIFICATION-GUIDE.md` | Full technical details |
| `EMAIL-VERIFICATION-SUMMARY.md` | Feature highlights |
| `SETUP-EMAIL-VERIFICATION.md` | Setup guide (this file) |

---

## 🎉 Success Checklist

- [ ] App Password created
- [ ] `.env` file configured
- [ ] Server restarted
- [ ] Registered test account
- [ ] Received verification email
- [ ] Clicked verify link
- [ ] Saw success page
- [ ] Received welcome email
- [ ] Can login

**All checked?** → You're ready! 🚀

---

## 💡 Pro Tips

### Tip 1: Use Mailtrap for Development
```env
# Development
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=mailtrap-user
SMTP_PASS=mailtrap-pass
```

### Tip 2: Use SendGrid for Production
```env
# Production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Tip 3: Environment-specific Config
```javascript
// Use different SMTP based on environment
const smtpConfig = {
  host: process.env.NODE_ENV === 'production' 
    ? 'smtp.sendgrid.net' 
    : 'smtp.mailtrap.io',
  // ...
};
```

---

## 🔐 Security Notes

### DO:
- ✅ Use App Password (not main password)
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different passwords for dev/prod
- ✅ Rotate passwords regularly

### DON'T:
- ❌ Commit `.env` to Git
- ❌ Share App Password
- ❌ Use main Gmail password
- ❌ Hardcode credentials in code

---

## 📞 Need Help?

1. Read `EMAIL-VERIFICATION-GUIDE.md`
2. Run `node test-email-verification.js`
3. Check console logs
4. Check database with `npx prisma studio`
5. Try Mailtrap instead of Gmail

---

**Total Setup Time: ~5 minutes** ⏱️

**Status: Ready to Use!** ✅

---

_Version: 1.0_  
_Updated: 28/10/2025_

