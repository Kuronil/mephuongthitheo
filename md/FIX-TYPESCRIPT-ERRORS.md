# Cách khắc phục lỗi TypeScript với Prisma Models

## Vấn đề
TypeScript hiển thị lỗi:
- `Property 'adminLog' does not exist on type 'PrismaClient'`
- `Property 'productHistory' does not exist on type 'PrismaClient'`
- `Property 'orderHistory' does not exist on type 'PrismaClient'`

## Nguyên nhân
Đây là **lỗi cache của TypeScript server**, không phải lỗi thực sự trong code. Prisma Client đã được generate đúng và code sẽ chạy bình thường.

## Giải pháp

### 1. Restart TypeScript Server trong Cursor/VS Code

**Cách 1: Command Palette**
1. Nhấn `Ctrl+Shift+P` (hoặc `Cmd+Shift+P` trên Mac)
2. Gõ: `TypeScript: Restart TS Server`
3. Chọn và nhấn Enter

**Cách 2: Command Palette (tìm theo tiếng Việt)**
1. Nhấn `Ctrl+Shift+P`
2. Gõ: `TypeScript: Khởi động lại máy chủ`
3. Chọn và nhấn Enter

### 2. Đóng và mở lại Cursor/VS Code
- Đóng hoàn toàn Cursor/VS Code
- Mở lại workspace

### 3. Xóa cache và rebuild (nếu cần)

```bash
# Xóa TypeScript build cache
Remove-Item tsconfig.tsbuildinfo -ErrorAction SilentlyContinue

# Regenerate Prisma Client (nếu cần)
npx prisma generate
```

### 4. Restart TypeScript từ Terminal
Nếu dùng VS Code/Cursor với terminal tích hợp, có thể thử restart thủ công nhưng cách Command Palette sẽ đơn giản hơn.

## Xác nhận đã fix
Sau khi restart TypeScript server, lỗi sẽ biến mất và bạn sẽ thấy IntelliSense hoạt động bình thường với:
- `prisma.adminLog`
- `prisma.productHistory`
- `prisma.orderHistory`

## Lưu ý
- Code sẽ **chạy đúng** ngay cả khi TypeScript hiển thị lỗi (đây chỉ là cache issue)
- Nếu vẫn còn lỗi sau khi restart, có thể cần:
  - Kiểm tra `node_modules/.prisma/client` có tồn tại
  - Chạy `npm install` hoặc `pnpm install` lại
  - Kiểm tra `tsconfig.json` có đúng cấu hình

