# Hướng dẫn Debug Internal Server Error

## Các bước kiểm tra khi gặp lỗi Internal Server Error:

### 1. Kiểm tra log của server
Chạy lệnh sau để xem log chi tiết:
```bash
npm run dev
```

### 2. Kiểm tra biến môi trường
Chạy script kiểm tra:
```bash
node check-server-errors.js
```

### 3. Kiểm tra database connection
- Xác nhận file database tồn tại (nếu dùng SQLite)
- Kiểm tra DATABASE_URL trong file .env
- Đảm bảo Prisma Client đã được generate: `npx prisma generate`

### 4. Kiểm tra các vấn đề thường gặp:

#### a) JWT_SECRET chưa được thiết lập
- Đảm bảo JWT_SECRET trong .env có ít nhất 32 ký tự
- Không dùng giá trị mặc định "your-secret-key-change-in-production"

#### b) Database chưa migrate
Chạy migrations nếu cần:
```bash
npx prisma migrate dev
```

#### c) Prisma Client chưa generate
```bash
npx prisma generate
```

#### d) Missing dependencies
```bash
npm install
```

### 5. Kiểm tra các API routes
- Xem console log để biết API route nào gây lỗi
- Kiểm tra xem request có gửi đúng format không
- Kiểm tra authentication tokens

### 6. Common fixes đã được áp dụng:

✅ **Error handling trong env.ts**: Nếu validation fail, app sẽ dùng fallback values thay vì crash
✅ **Prisma client error handling**: Database connection được test khi start
✅ **Middleware**: Đã thêm middleware để handle requests tốt hơn

### 7. Nếu vẫn gặp lỗi:

1. Xem log chi tiết trong terminal khi chạy `npm run dev`
2. Kiểm tra Network tab trong browser DevTools để xem request nào fail
3. Kiểm tra Response body của failed request để biết error message cụ thể

### 8. Các API routes quan trọng cần kiểm tra:
- `/api/products` - Lấy danh sách sản phẩm
- `/api/auth/login` - Đăng nhập
- `/api/auth/register` - Đăng ký
- `/api/recommendations` - Gợi ý sản phẩm

