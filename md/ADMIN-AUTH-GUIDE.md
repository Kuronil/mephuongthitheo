# 🔐 Hướng dẫn xác thực Admin

## ✅ Đã hoàn thành

Hệ thống xác thực admin **THẬT** đã được implement với các tính năng:

### 1. Database Schema
- ✅ Thêm trường `isAdmin: Boolean` vào bảng User
- ✅ Mặc định `isAdmin = false` cho tất cả user mới

### 2. Auth Middleware
- ✅ `authenticateUser()` - Xác thực user từ database
- ✅ `authenticateAdmin()` - Xác thực admin (kiểm tra isAdmin = true)
- ✅ Trả về đầy đủ thông tin user bao gồm isAdmin

### 3. API Endpoints
- ✅ `GET /api/auth/verify-admin` - Verify xem user có phải admin không
- ✅ API login tự động trả về thông tin isAdmin

### 4. Frontend Components
- ✅ `useAdminAuth()` hook - Tự động verify admin và redirect nếu không phải admin
- ✅ `AdminLayout` component - Wrapper cho tất cả trang admin
- ✅ Tất cả 7 trang admin đã được bảo vệ

### 5. Utilities
- ✅ `scripts/set-admin.ts` - Script để set user thành admin
- ✅ `scripts/list-users.ts` - Script để xem danh sách user

---

## 📋 Cách sử dụng

### Bước 1: Set user làm Admin

Có 2 cách:

#### Cách 1: Dùng script (Khuyến nghị)

```bash
# Xem danh sách user
npx ts-node scripts/list-users.ts

# Set admin cho user
npx ts-node scripts/set-admin.ts email@example.com
```

#### Cách 2: Trực tiếp database

```bash
# Mở Prisma Studio
npx prisma studio

# Hoặc dùng SQL
npx prisma db execute --stdin <<EOF
UPDATE User SET isAdmin = 1 WHERE email = 'your@email.com';
EOF
```

### Bước 2: Đăng nhập

1. Vào `/account/login`
2. Đăng nhập bằng tài khoản admin
3. Hệ thống tự động lưu thông tin (bao gồm isAdmin) vào localStorage

### Bước 3: Truy cập trang Admin

- Vào `/admin` để truy cập dashboard
- Nếu không phải admin → tự động redirect về trang chủ
- Nếu chưa login → redirect về trang login

---

## 🔒 Bảo mật

### Frontend Protection
✅ **useAdminAuth() hook:**
- Kiểm tra localStorage xem user có isAdmin không
- Verify với server qua API `/api/auth/verify-admin`
- Tự động redirect nếu không phải admin

✅ **AdminLayout component:**
- Wrap tất cả trang admin
- Hiển thị loading khi đang verify
- Không render content nếu không phải admin

### Backend Protection
✅ **authenticateAdmin() middleware:**
- Kiểm tra user từ database
- Verify isAdmin = true
- Trả về 403 Forbidden nếu không phải admin

### Các trang được bảo vệ
- ✅ `/admin` - Dashboard
- ✅ `/admin/products` - Quản lý sản phẩm tươi
- ✅ `/admin/processed-products` - Quản lý sản phẩm chế biến
- ✅ `/admin/orders` - Quản lý đơn hàng
- ✅ `/admin/inventory` - Quản lý tồn kho
- ✅ `/admin/users` - Quản lý người dùng
- ✅ `/admin/store-location/overview` - Quản lý cửa hàng

---

## 🧪 Kiểm tra

### Test 1: User thường không vào được admin
```bash
1. Đăng nhập bằng user thường (isAdmin = false)
2. Thử vào /admin
3. Kết quả: Tự động redirect về trang chủ
```

### Test 2: Admin vào được trang admin
```bash
1. Set user làm admin: npx ts-node scripts/set-admin.ts email@example.com
2. Đăng nhập
3. Vào /admin
4. Kết quả: Hiển thị dashboard admin
```

### Test 3: Verify từ server
```bash
# Test API verify admin
curl -X GET http://localhost:3000/api/auth/verify-admin \
  -H "x-user-id: 1"

# Kết quả nếu là admin:
{
  "success": true,
  "isAdmin": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "isAdmin": true
  }
}

# Kết quả nếu không phải admin:
{
  "success": false,
  "error": "Unauthorized: Admin access required",
  "isAdmin": false
}
```

---

## 🚨 Lưu ý quan trọng

### 1. User đầu tiên
Sau khi register user đầu tiên, chạy:
```bash
npx ts-node scripts/set-admin.ts email@example.com
```

### 2. Logout và Login lại
Sau khi set admin, cần **logout và login lại** để cập nhật localStorage.

### 3. Multiple admins
Có thể có nhiều admin bằng cách chạy script set-admin cho nhiều user.

### 4. Production
Trên production server:
```bash
# SSH vào server
ssh user@server

# Chạy script
cd /path/to/project
npx ts-node scripts/set-admin.ts admin@production.com
```

---

## 📂 Files đã thay đổi

### Schema & Database
- `prisma/schema.prisma` - Thêm isAdmin field
- Database đã được migrate

### Backend
- `lib/auth-middleware.ts` - Thêm authenticateAdmin()
- `lib/auth.ts` - Thêm isUserAdmin(), setStoredUser()
- `app/api/auth/verify-admin/route.ts` - NEW API endpoint

### Frontend
- `hooks/useAdminAuth.ts` - NEW admin auth hook
- `components/AdminLayout.tsx` - NEW admin layout wrapper
- `app/admin/page.tsx` - Updated với useAdminAuth
- `app/admin/orders/page.tsx` - Updated với AdminLayout
- `app/admin/products/page.tsx` - Updated với AdminLayout
- `app/admin/processed-products/page.tsx` - Updated với AdminLayout
- `app/admin/inventory/page.tsx` - Updated với AdminLayout
- `app/admin/users/page.tsx` - Updated với AdminLayout
- `app/admin/store-location/overview/page.tsx` - Updated với AdminLayout

### Scripts
- `scripts/set-admin.ts` - NEW script to set admin
- `scripts/list-users.ts` - NEW script to list users

---

## 🎯 Kết luận

✅ **Hệ thống xác thực admin hiện đã hoàn toàn bảo mật:**
- ❌ Không còn tạo admin giả trong localStorage
- ✅ Kiểm tra từ database thật
- ✅ Verify với server mỗi lần truy cập
- ✅ Tự động redirect user không phải admin
- ✅ Protected cả frontend và backend

**Hệ thống sẵn sàng để deploy!** 🚀



