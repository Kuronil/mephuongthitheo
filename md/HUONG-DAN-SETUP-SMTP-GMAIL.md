# 📧 HƯỚNG DẪN SETUP SMTP GMAIL - CHI TIẾT TỪNG BƯỚC

## 🎯 Mục Đích

Hướng dẫn này sẽ giúp bạn cấu hình SMTP Gmail để gửi email xác thực tự động khi người dùng đăng ký tài khoản.

**Thời gian**: ~10 phút

---

## 📋 Yêu Cầu

- ✅ Tài khoản Gmail (miễn phí)
- ✅ Quyền truy cập Google Account
- ✅ Internet connection

---

## 🚀 BƯỚC 1: BẬT 2-STEP VERIFICATION

### Tại sao cần bước này?
Gmail yêu cầu bật **2-Step Verification** trước khi có thể tạo App Password.

### Các bước thực hiện:

#### 1.1 Truy cập Google Account Security

1. Mở trình duyệt web
2. Truy cập: **https://myaccount.google.com/security**
3. Đăng nhập với Gmail của bạn

#### 1.2 Tìm "2-Step Verification"

1. Cuộn xuống phần **"How you sign in to Google"**
2. Tìm mục **"2-Step Verification"**

#### 1.3 Bật 2-Step Verification

**Nếu thấy "OFF":**
```
1. Click vào "2-Step Verification"
2. Click nút "GET STARTED" hoặc "Turn On"
3. Nhập mật khẩu Gmail để xác nhận
4. Chọn phương thức nhận mã:
   - Thông báo trên điện thoại (khuyến nghị)
   - SMS text message
   - Phone call
5. Nhập số điện thoại
6. Nhận và nhập mã xác thực
7. Click "Turn On"
```

**Nếu thấy "ON":**
```
✅ Bạn đã bật rồi! Chuyển sang Bước 2
```

#### 1.4 Kiểm tra

- Quay lại https://myaccount.google.com/security
- Kiểm tra "2-Step Verification" có status **"ON"** ✅

---

## 🔑 BƯỚC 2: TẠO APP PASSWORD

### App Password là gì?
App Password là mật khẩu đặc biệt (16 ký tự) được Google tạo ra cho các ứng dụng bên thứ 3. Nó an toàn hơn việc dùng mật khẩu Gmail chính.

### Các bước thực hiện:

#### 2.1 Truy cập App Passwords

**Cách 1 (Trực tiếp):**
```
https://myaccount.google.com/apppasswords
```

**Cách 2 (Từ Security Page):**
```
1. Vào https://myaccount.google.com/security
2. Tìm "2-Step Verification" → Click vào
3. Cuộn xuống tìm "App passwords"
4. Click vào "App passwords"
```

#### 2.2 Tạo App Password Mới

1. **Select app dropdown:**
   - Click vào dropdown
   - Chọn **"Mail"**

2. **Select device dropdown:**
   - Click vào dropdown
   - Chọn **"Other (Custom name)"**
   - Nhập tên: **"Website Me Phuong Thi Theo"**

3. **Generate:**
   - Click nút **"GENERATE"**

#### 2.3 Copy App Password

Một popup sẽ hiện lên với password **16 ký tự** (dạng: `xxxx xxxx xxxx xxxx`)

**VÍ DỤ:**
```
abcd efgh ijkl mnop
```

⚠️ **LƯU Ý QUAN TRỌNG:**
- **COPY ngay password này** (chỉ hiện 1 lần!)
- Giữ nguyên khoảng trắng
- Không đóng popup cho đến khi đã copy xong

**Cách copy:**
```
Windows: Ctrl + C
Mac: Cmd + C

Hoặc click nút "Copy" trong popup
```

#### 2.4 Lưu App Password

**Option 1: Paste vào Notepad ngay**
```
1. Mở Notepad
2. Paste password (Ctrl + V)
3. Save file tạm (để tránh mất)
```

**Option 2: Paste trực tiếp vào file .env (Bước 3)**

---

## 📝 BƯỚC 3: CẤU HÌNH FILE `.env`

### 3.1 Kiểm tra file `.env` đã tồn tại chưa

```
Thư mục: C:\Users\Admin\Desktop\mephuongthitheo\
File: .env
```

**Nếu chưa có file `.env`:**
```
1. Mở thư mục project
2. Click phải → New → Text Document
3. Đổi tên từ "New Text Document.txt" thành ".env"
4. Windows sẽ cảnh báo → Click Yes
```

### 3.2 Mở file `.env`

```
Right-click file .env → Open with → Notepad (hoặc VS Code)
```

### 3.3 Thêm/Cập nhật nội dung

Copy và paste đoạn sau vào file `.env`:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# ===== EMAIL CONFIGURATION (SMTP) =====
# Cấu hình để gửi email xác thực tự động

# SMTP Server của Gmail
SMTP_HOST=smtp.gmail.com

# Port của Gmail SMTP (587 cho TLS)
SMTP_PORT=587

# Không dùng SSL (dùng TLS thay thế)
SMTP_SECURE=false

# Email Gmail của bạn
SMTP_USER=your-email@gmail.com

# App Password (16 ký tự) vừa tạo ở Bước 2
SMTP_PASS=abcd efgh ijkl mnop

# Tên người gửi (hiển thị trong email)
SMTP_FROM_NAME="Mẹ Phương Thị Theo"

# ===== APPLICATION URL =====
# URL của website (localhost khi develop)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===== VNPAY (Nếu có) =====
# VNPAY_TMN_CODE=your_code
# VNPAY_HASH_SECRET=your_secret
```

### 3.4 Thay thế thông tin thực

**Cần thay:**

1. **`SMTP_USER`** - Thay bằng email Gmail của bạn
   ```env
   SMTP_USER=john.doe@gmail.com
   ```

2. **`SMTP_PASS`** - Thay bằng App Password 16 ký tự
   ```env
   SMTP_PASS=abcd efgh ijkl mnop
   ```

**VÍ DỤ HOÀN CHỈNH:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM_NAME="Mẹ Phương Thị Theo"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.5 Lưu file

```
File → Save (hoặc Ctrl + S)
```

⚠️ **LƯU Ý:**
- File `.env` đã có trong `.gitignore` → an toàn, không commit lên Git
- Giữ nguyên khoảng trắng trong App Password
- Không dùng dấu ngoặc kép cho password

---

## 🔄 BƯỚC 4: RESTART SERVER

Server cần restart để load biến môi trường mới từ file `.env`

### 4.1 Stop server hiện tại

Trong terminal đang chạy `npm run dev`:
```
Nhấn: Ctrl + C
```

### 4.2 Start lại server

```bash
npm run dev
```

### 4.3 Kiểm tra console

Server khởi động thành công nếu thấy:
```
✓ Ready in 2.5s
○ Local:    http://localhost:3000
```

---

## 🧪 BƯỚC 5: TEST GỬI EMAIL

### 5.1 Đăng ký tài khoản test

1. Truy cập: **http://localhost:3000/account/register**

2. Điền thông tin (dùng **email thật** để test):
   ```
   Họ và tên: Test User
   Email: your-real-email@gmail.com  ← Dùng email thật!
   Số điện thoại: 0912345678
   Địa chỉ: 123 Test Street
   Mật khẩu: Test123
   Xác nhận: Test123
   ✓ Điều khoản
   ```

3. Click **"Tạo tài khoản"**

### 5.2 Kiểm tra thông báo

Sau khi submit:
```
✅ Toast: "Đăng ký thành công!"
✅ Toast: "📧 Vui lòng kiểm tra email..."
✅ Redirect to: /account/verify-pending
```

### 5.3 Kiểm tra Console Logs

Trong terminal đang chạy `npm run dev`, tìm dòng:
```
✅ Verification email sent to: your-email@gmail.com
```

**Nếu thấy dòng này** → Email đã được gửi thành công! ✅

**Nếu thấy lỗi:**
```
❌ Error sending verification email: [error message]
```
→ Xem phần **Troubleshooting** bên dưới

### 5.4 Kiểm tra Email Inbox

1. Mở Gmail inbox
2. Tìm email từ **"Mẹ Phương Thị Theo"**
3. Subject: **"✅ Xác Thực Email - Mẹ Phương Thị Theo"**

**Không thấy email?**
- Check thư mục **Spam/Junk**
- Đợi 1-2 phút (có thể delay)
- Xem phần Troubleshooting

### 5.5 Verify Email

1. Mở email
2. Click nút **"✅ Xác Thực Email"** (màu cam)
3. Trang mới mở: `/auth/verify-email?token=...`
4. Loading... → ✅ "Email đã được xác thực thành công!"
5. Auto redirect to `/account/login` sau 3 giây

### 5.6 Kiểm tra Welcome Email

1. Quay lại Gmail inbox
2. Email mới: **"🎉 Chào Mừng Đến Với Mẹ Phương Thị Theo!"**

**Thấy 2 emails (Verification + Welcome)** → ✅ HOÀN HẢO!

### 5.7 Đăng nhập

1. Truy cập: **http://localhost:3000/account/login**
2. Đăng nhập với email vừa đăng ký
3. ✅ Thành công!

---

## 🐛 TROUBLESHOOTING

### Vấn Đề 1: "Error sending verification email"

#### Kiểm tra Console Logs

Trong terminal, tìm error message chi tiết:

```
❌ Error sending verification email: Invalid login: 535-5.7.8 Username and Password not accepted
```

#### Lỗi: "Invalid login" hoặc "Username and Password not accepted"

**Nguyên nhân:**
- `SMTP_USER` hoặc `SMTP_PASS` sai

**Giải pháp:**
```
1. Check SMTP_USER có đúng email không?
   ✅ Đúng: john.doe@gmail.com
   ❌ Sai: john.doe (thiếu @gmail.com)

2. Check SMTP_PASS có phải App Password không?
   ✅ Đúng: App Password 16 ký tự
   ❌ Sai: Mật khẩu Gmail bình thường

3. Copy lại App Password từ Google
   - Vào https://myaccount.google.com/apppasswords
   - Generate password mới
   - Copy chính xác (giữ nguyên khoảng trắng)
   - Paste vào .env

4. Restart server
   - Ctrl + C
   - npm run dev
```

#### Lỗi: "Connection timeout" hoặc "ETIMEDOUT"

**Nguyên nhân:**
- Firewall/network blocking
- VPN interference
- ISP blocking port 587

**Giải pháp:**
```
1. Disable VPN (nếu có)
2. Check firewall settings
3. Try different network (mobile hotspot)
4. Check SMTP_PORT=587 (không phải 465 hay 25)
```

#### Lỗi: "Less secure app access"

**Nguyên nhân:**
- Chưa bật 2-Step Verification
- Chưa tạo App Password

**Giải pháp:**
```
1. Bật 2-Step Verification (Bước 1)
2. Tạo App Password mới (Bước 2)
3. Update .env với password mới
4. Restart server
```

---

### Vấn Đề 2: Email vào Spam

**Nguyên nhân:**
- Gmail chưa trust sender mới
- Email có nội dung spam-like

**Giải pháp:**
```
1. Check spam folder
2. Đánh dấu "Not Spam"
3. Thêm sender vào Contacts
4. Reply email (optional)

Development: OK nếu vào Spam
Production: Cần setup SPF/DKIM records
```

---

### Vấn Đề 3: File `.env` không hoạt động

#### Kiểm tra vị trí file

```
✅ Đúng:
C:\Users\Admin\Desktop\mephuongthitheo\.env  ← Cùng level với package.json

❌ Sai:
C:\Users\Admin\Desktop\mephuongthitheo\app\.env  ← Sai thư mục
C:\Users\Admin\Desktop\.env  ← Sai vị trí
```

#### Kiểm tra tên file

```
✅ Đúng: .env
❌ Sai: .env.txt
❌ Sai: env.txt
❌ Sai: .env.local
```

**Cách kiểm tra trên Windows:**
```
1. File Explorer
2. View → Show → File name extensions
3. Check tên file chính xác là ".env"
```

#### Kiểm tra nội dung

```
✅ Đúng:
SMTP_USER=john@gmail.com

❌ Sai (có khoảng trắng thừa):
SMTP_USER = john@gmail.com

❌ Sai (có dấu ngoặc không cần):
SMTP_USER="john@gmail.com"
```

---

### Vấn Đề 4: Server không load biến môi trường

**Giải pháp:**
```
1. Stop server: Ctrl + C
2. Start lại: npm run dev
3. Check console logs

Nếu vẫn không work:
4. Delete node_modules/.cache (nếu có)
5. npm run dev lại
```

---

## 🧪 TEST SMTP CONNECTION

Script test SMTP để verify credentials:

### Tạo file `test-smtp.js`

```javascript
// test-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',      // THAY EMAIL CỦA BẠN
    pass: 'abcd efgh ijkl mnop'        // THAY APP PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Error:', error.message);
  } else {
    console.log('✅ SMTP Ready! Server is ready to send emails');
  }
});
```

### Chạy test

```bash
node test-smtp.js
```

### Kết quả

**Thành công:**
```
✅ SMTP Ready! Server is ready to send emails
```

**Thất bại:**
```
❌ SMTP Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
→ Check lại email và App Password

---

## 📚 FAQ

### Q1: Có thể dùng email khác Gmail không?

**A:** Có! Bạn có thể dùng:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Q2: App Password có hết hạn không?

**A:** Không, App Password không hết hạn. Nhưng bạn có thể revoke bất cứ lúc nào.

### Q3: Có thể tạo nhiều App Password không?

**A:** Có! Mỗi app/device nên có App Password riêng để dễ quản lý.

### Q4: Làm sao xóa App Password cũ?

**A:**
```
1. Vào https://myaccount.google.com/apppasswords
2. Tìm password cần xóa
3. Click dấu X hoặc "Remove"
4. Confirm
```

### Q5: Gmail có giới hạn gửi email không?

**A:** Có:
- **Free Gmail**: 500 emails/ngày
- **Google Workspace**: 2000 emails/ngày

Đủ cho website nhỏ. Website lớn nên dùng SendGrid/AWS SES.

### Q6: Production nên dùng gì?

**A:** Khuyến nghị:
- **Small/Medium**: SendGrid (100 emails/day free)
- **Large**: AWS SES ($0.10/1000 emails)
- **Gmail**: OK cho startup/testing

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Bật 2-Step Verification Gmail
- [ ] Tạo App Password
- [ ] Copy App Password (16 ký tự)
- [ ] Tạo/Cập nhật file `.env`
- [ ] Thay `SMTP_USER` với email thật
- [ ] Thay `SMTP_PASS` với App Password
- [ ] Restart server (npm run dev)
- [ ] Test đăng ký tài khoản
- [ ] Check console log: "✅ Verification email sent"
- [ ] Check email inbox (hoặc spam)
- [ ] Click link verify trong email
- [ ] Thấy "✅ Xác Thực Thành Công"
- [ ] Nhận welcome email
- [ ] Đăng nhập thành công

**Tất cả đã check?** → 🎉 HOÀN TẤT!

---

## 📞 Cần Hỗ Trợ?

**Nếu vẫn gặp vấn đề:**

1. **Check lại từng bước** trong hướng dẫn này
2. **Đọc phần Troubleshooting** kỹ
3. **Run test script** `test-smtp.js`
4. **Check console logs** trong terminal
5. **Google error message** cụ thể

---

## 🎯 TÓM TẮT NHANH

```
1. Bật 2-Step Verification: 
   https://myaccount.google.com/security

2. Tạo App Password: 
   https://myaccount.google.com/apppasswords
   → Mail → Other → Generate

3. Copy password (16 ký tự)

4. Cập nhật .env:
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx

5. Restart server:
   Ctrl + C → npm run dev

6. Test:
   Đăng ký → Check email → Verify → Done!
```

---

**Thời gian setup:** ~10 phút

**Độ khó:** ⭐⭐☆☆☆ (Dễ)

**Status:** ✅ Ready to use!

---

_Cập nhật lần cuối: 28/10/2025_

