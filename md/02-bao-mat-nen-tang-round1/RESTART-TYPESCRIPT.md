# Hướng dẫn Restart TypeScript Server trong Cursor

## Cách 1: Command Palette (Khuyến nghị)

1. **Mở Command Palette:**
   - Nhấn `Ctrl + Shift + P` (Windows/Linux)
   - Hoặc `Cmd + Shift + P` (Mac)

2. **Tìm lệnh:**
   - Gõ: `TypeScript: Restart TS Server`
   - Hoặc: `TypeScript: Khởi động lại máy chủ`

3. **Chọn và Enter:**
   - Click vào "TypeScript: Restart TS Server"
   - Hoặc nhấn Enter

## Cách 2: Keyboard Shortcut

Trong một số phiên bản Cursor/VS Code:
- `Ctrl + Shift + P` → Gõ `restart ts` → Enter

## Cách 3: Reload Window

1. Nhấn `Ctrl + Shift + P`
2. Gõ: `Developer: Reload Window`
3. Enter

## Sau khi Restart

Kiểm tra xem lỗi đã biến mất chưa:
- Mở file `lib/admin-log.ts`
- Xem các dòng 73, 106, 136
- Lỗi `Property 'adminLog' does not exist` sẽ biến mất

## Xác nhận

Nếu vẫn còn lỗi sau khi restart:
1. Đóng hoàn toàn Cursor
2. Mở lại
3. Hoặc xem file `FIX-TYPESCRIPT-ERRORS.md` để biết thêm

