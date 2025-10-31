# 🚀 Quick Start - Admin Authentication

## ⚠️ Bước quan trọng SAU KHI CẬP NHẬT

### 1. Restart Development Server

```bash
# Dừng server hiện tại (Ctrl + C)
# Sau đó chạy lại:
npm run dev
```

### 2. Generate Prisma Client (nếu có lỗi TypeScript)

```bash
# Đóng dev server trước
# Sau đó chạy:
npx prisma generate

# Chạy lại dev server
npm run dev
```

---

## 🎯 Cách tạo Admin đầu tiên

### Bước 1: Đăng ký tài khoản (nếu chưa có)

1. Vào http://localhost:3000/account/register
2. Đăng ký tài khoản mới
3. Nhớ email vừa đăng ký

### Bước 2: Set làm Admin

```bash
# Xem danh sách users
npx ts-node scripts/list-users.ts

# Set admin (thay your@email.com bằng email thật)
npx ts-node scripts/set-admin.ts your@email.com
```

Kết quả:
```
🔍 Looking for user with email: your@email.com
✅ Successfully set Your Name (your@email.com) as admin
   User ID: 1
```

### Bước 3: Login lại

1. Logout (nếu đang login)
2. Vào http://localhost:3000/account/login
3. Đăng nhập lại bằng tài khoản admin

### Bước 4: Truy cập Admin

Vào http://localhost:3000/admin

✅ Nếu thành công: Hiển thị Admin Dashboard
❌ Nếu thất bại: Redirect về trang chủ

---

## 🔧 Troubleshooting

### Lỗi: TypeScript không nhận isAdmin

```bash
# Solution 1: Restart TypeScript Server
Trong VSCode: Ctrl + Shift + P > "TypeScript: Restart TS Server"

# Solution 2: Generate lại Prisma
# Đóng dev server, sau đó:
npx prisma generate
npm run dev
```

### Lỗi: "Unauthorized: Admin access required"

```bash
# Kiểm tra user có phải admin không:
npx ts-node scripts/list-users.ts

# Nếu chưa phải admin, set lại:
npx ts-node scripts/set-admin.ts your@email.com

# Logout và login lại
```

### Lỗi: Vẫn bị redirect về trang chủ

1. Mở DevTools (F12)
2. Vào tab Console
3. Kiểm tra localStorage:
```javascript
console.log(JSON.parse(localStorage.getItem('user')))
// Phải có: isAdmin: true
```

4. Nếu chưa có isAdmin hoặc isAdmin: false:
   - Logout
   - Login lại
   - Kiểm tra lại localStorage

---

## 🎭 Demo nhanh

```bash
# 1. Tạo user admin nhanh (nếu đã có user id=1)
npx prisma studio
# Mở User table > Edit user có id=1 > Set isAdmin = true > Save

# 2. Hoặc dùng SQL
echo "UPDATE User SET isAdmin = 1 WHERE id = 1;" | npx prisma db execute --stdin

# 3. Login lại và test
```

---

## 📝 Checklist

- [ ] Restart dev server
- [ ] Generate Prisma Client (nếu cần)
- [ ] Tạo/Đăng ký user
- [ ] Set user làm admin bằng script
- [ ] Logout
- [ ] Login lại
- [ ] Vào /admin để test
- [ ] Kiểm tra localStorage có isAdmin: true

---

## ✅ Xác nhận thành công

Khi vào `/admin`, bạn sẽ thấy:
- 📊 Dashboard với thống kê
- 📦 4 card thống kê (Đơn hàng, Doanh thu, Khách hàng, Sản phẩm)
- 📋 Đơn hàng gần đây
- ⚠️ Sản phẩm sắp hết hàng
- 🏪 Thông tin cửa hàng
- 🔘 6 nút thao tác nhanh

**Nếu thấy màn hình trên = THÀNH CÔNG!** 🎉



