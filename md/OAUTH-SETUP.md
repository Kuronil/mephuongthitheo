# Cấu hình đăng nhập Google OAuth

## Biến môi trường cần thiết
Thêm các biến sau vào môi trường chạy (ví dụ `.env.local` hoặc cấu hình server):

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI (tùy chọn, mặc định: https://your-domain/api/auth/google/callback)

Lưu ý: Nếu không cấu hình REDIRECT_URI, hệ thống sẽ tự tính dựa trên origin của request.

## Luồng hoạt động
- Nút trên `app/account/login/page.tsx` chuyển hướng đến:
  - `/api/auth/google/init`
- Sau khi xác thực thành công, callback sẽ:
  - Tạo/cập nhật người dùng trong Prisma (đánh dấu emailVerified=true)
  - Sinh mật khẩu ngẫu nhiên cho tài khoản Google (để phù hợp schema hiện tại)
  - Trả về trang HTML nhỏ lưu `user` vào `localStorage` rồi chuyển về `/`

## Kiểm thử nhanh
- Khởi chạy app, truy cập `/account/login` và bấm "Tiếp tục với Google".
- Đảm bảo app được đăng ký đúng domain, đường dẫn callback trùng với cấu hình trong Google Cloud Console.

## Bảo mật & Ghi chú
- Luồng hiện dùng `localStorage` tương tự login thường của app hiện tại.
- Nếu muốn dùng cookie/JWT httpOnly, cần thay đổi cơ chế lưu phiên toàn cục của ứng dụng.

