# Hướng dẫn Debug - Tạo tài khoản mới

## Vấn đề đã được sửa:

### ✅ 1. Frontend Issues (Đã sửa)
- **Trang register**: Sửa `data.user` thành `data` 
- **Trang login**: Sửa `data.user` thành `data`
- **API response**: Cả hai API đều trả về user object trực tiếp

### ✅ 2. Database Issues (Đã kiểm tra)
- **Schema**: Đã cập nhật với trường `phone`
- **Migration**: Đã tạo và apply migration
- **Prisma Client**: Có vấn đề với quyền file trên Windows

## Cách kiểm tra:

### 1. Kiểm tra Development Server
```bash
npm run dev
```
Truy cập: http://localhost:3000/account/register

### 2. Kiểm tra API trực tiếp
```bash
# Test với curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "password123",
    "address": "Test Address"
  }'
```

### 3. Kiểm tra Database
```bash
# Xem dữ liệu trong database
npx prisma studio
```

### 4. Kiểm tra Console Logs
Mở Developer Tools (F12) và kiểm tra:
- **Network tab**: Xem request/response
- **Console tab**: Xem error messages
- **Application tab**: Xem localStorage

## Các lỗi có thể gặp:

### ❌ "Email đã được sử dụng"
- **Nguyên nhân**: Email đã tồn tại trong database
- **Giải pháp**: Sử dụng email khác hoặc xóa user cũ

### ❌ "Missing required fields"
- **Nguyên nhân**: Thiếu name, email, hoặc password
- **Giải pháp**: Kiểm tra form validation

### ❌ "Internal server error"
- **Nguyên nhân**: Lỗi database hoặc Prisma
- **Giải pháp**: Restart server và kiểm tra database

### ❌ Network Error
- **Nguyên nhân**: Server không chạy hoặc CORS
- **Giải pháp**: Đảm bảo `npm run dev` đang chạy

## Debug Steps:

1. **Kiểm tra server đang chạy**: http://localhost:3000
2. **Kiểm tra API endpoint**: http://localhost:3000/api/auth/register
3. **Kiểm tra form data**: Console log trong handleSubmit
4. **Kiểm tra response**: Network tab trong DevTools
5. **Kiểm tra database**: Prisma Studio

## Nếu vẫn không hoạt động:

1. **Restart server**: Ctrl+C và `npm run dev` lại
2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
3. **Check database**: `npx prisma studio`
4. **Check logs**: Console và Network tabs

## Test với dữ liệu mẫu:

```json
{
  "name": "Nguyễn Văn A",
  "email": "test123@example.com",
  "password": "password123",
  "address": "123 Đường ABC, Quận 1, TP.HCM"
}
```
