# Hướng dẫn Quản lý Người dùng cho Admin

## 📍 Truy cập

**URL:** `/admin/users`

Hoặc từ Admin Dashboard → Click nút **"Người dùng"** trong phần "Thao tác nhanh"

---

## ✨ Các tính năng

### 1. **Xem danh sách người dùng**
- Hiển thị bảng đầy đủ thông tin người dùng
- Thống kê tổng quan (4 cards):
  - Tổng người dùng
  - Người dùng hoạt động
  - Người dùng mới tháng này
  - Thành viên VIP (Gold/Platinum)

### 2. **Tìm kiếm và lọc**
- Tìm kiếm theo: Tên, Email, Số điện thoại
- Lọc theo cấp độ thành viên: Bronze, Silver, Gold, Platinum

### 3. **Thao tác với từng người dùng**

#### 👁️ **Xem chi tiết** (nút Eye)
- Xem đầy đủ thông tin người dùng
- Hiển thị: Điểm tích lũy, Tổng đơn hàng, Tổng chi tiêu

#### ✏️ **Chỉnh sửa** (nút Edit)
- Sửa thông tin người dùng (đang phát triển)

#### ⚠️ **Vô hiệu hóa** (nút cam XCircle)
- Vô hiệu hóa tài khoản
- Người dùng không thể đăng nhập
- Dữ liệu lịch sử được giữ lại

#### 🗑️ **Xóa vĩnh viễn** (nút đỏ Trash)
- **CẢNH BÁO:** Không thể hoàn tác!
- Xóa người dùng và TẤT CẢ dữ liệu liên quan:
  - ✅ Đơn hàng và lịch sử đặt hàng
  - ✅ Chi tiết đơn hàng
  - ✅ Giỏ hàng
  - ✅ Danh sách yêu thích
  - ✅ Đánh giá sản phẩm
  - ✅ Điểm tích lũy và giao dịch
  - ✅ Thông báo
  - ✅ Lịch sử trạng thái đơn hàng

---

## 🔥 Tính năng mới: Xóa hàng loạt

### **Nút "Xóa tất cả người dùng"** (màu đỏ)

Vị trí: Header trang quản lý người dùng

**Chức năng:**
- Xóa TẤT CẢ người dùng không phải admin
- Chỉ giữ lại tài khoản admin

**Quy trình:**

1. **Bước 1:** Click nút "Xóa tất cả người dùng"

2. **Bước 2:** Xác nhận lần 1
   ```
   🗑️ XÓA TẤT CẢ NGƯỜI DÙNG
   
   Bạn có chắc chắn muốn xóa TẤT CẢ người dùng không phải admin?
   
   📊 Sẽ xóa: X người dùng
   
   ⚠️ CẢNH BÁO CỰC MẠNH:
   • Thao tác này KHÔNG THỂ HOÀN TÁC
   • Tất cả X người dùng sẽ bị xóa vĩnh viễn
   • Tất cả dữ liệu liên quan sẽ bị xóa
   
   Chỉ tài khoản ADMIN sẽ được giữ lại.
   ```

3. **Bước 3:** Xác nhận lần 2 (Double confirmation)
   ```
   Để xác nhận xóa X người dùng, vui lòng nhập: DELETE ALL
   ```

4. **Bước 4:** Hệ thống xử lý
   - Xóa từng người dùng và dữ liệu liên quan
   - Hiển thị kết quả:
     - Số người dùng đã xóa thành công
     - Số người dùng thất bại (nếu có)

---

## 🛡️ Bảo vệ Admin

- **Không thể xóa tài khoản admin**
- API sẽ từ chối nếu cố gắng xóa admin
- Thông báo lỗi: "Cannot delete admin user"

---

## 🔌 API Endpoints

### 1. **Lấy danh sách người dùng**
```
GET /api/admin/users
```

**Query Parameters:**
- `page`: Trang (mặc định: 1)
- `limit`: Số lượng/trang (mặc định: 10)
- `search`: Tìm kiếm theo tên/email/phone
- `tier`: Lọc theo cấp độ (BRONZE, SILVER, GOLD, PLATINUM)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    },
    "stats": {
      "totalUsers": 50,
      "activeUsers": 48,
      "newUsersThisMonth": 5,
      "topTierUsers": 3
    }
  }
}
```

### 2. **Xóa người dùng**
```
DELETE /api/admin/users/{id}
```

**Quy trình xóa:**
1. Kiểm tra user tồn tại
2. Kiểm tra không phải admin
3. Xóa product reviews
4. Xóa cart items
5. Xóa wishlist items
6. Xóa loyalty transactions
7. Xóa notifications
8. Xóa order status logs
9. Xóa order items
10. Xóa orders
11. Xóa user

**Response thành công:**
```json
{
  "success": true,
  "message": "User deleted successfully with all related data"
}
```

**Response lỗi:**
```json
{
  "success": false,
  "error": "Cannot delete admin user"
}
```

---

## 📝 Script Command Line

### **Xóa tất cả người dùng trừ admin (từ terminal)**

```bash
npx ts-node scripts/delete-user.ts --delete-all-except-admin
```

**Các lệnh khác:**

```bash
# Xóa theo ID
npx ts-node scripts/delete-user.ts --id=1

# Xóa theo Email
npx ts-node scripts/delete-user.ts --email=test@example.com

# Xóa tất cả user test
npx ts-node scripts/delete-user.ts --delete-test-users

# Liệt kê tất cả users
npx ts-node scripts/list-users.ts
```

---

## ⚠️ Lưu ý quan trọng

### **Khi nào nên XÓA người dùng:**
- ✅ Tài khoản spam
- ✅ Tài khoản test
- ✅ Yêu cầu xóa từ người dùng (GDPR)
- ✅ Tài khoản vi phạm chính sách

### **Khi nào NÊN VÔ HIỆU HÓA thay vì XÓA:**
- ✅ Người dùng có đơn hàng cũ (cần giữ lịch sử)
- ✅ Tạm thời chặn tài khoản
- ✅ Chưa chắc chắn muốn xóa vĩnh viễn

### **Khuyến nghị:**
> 💡 **Vô hiệu hóa** là lựa chọn an toàn hơn vì có thể khôi phục lại.
> 
> 🗑️ **Xóa vĩnh viễn** chỉ nên dùng khi thực sự cần thiết.

---

## 🎯 Tóm tắt

**Trang quản lý người dùng** (`/admin/users`) hiện đã có đầy đủ chức năng:

- ✅ Xem danh sách và thống kê
- ✅ Tìm kiếm và lọc
- ✅ Xem chi tiết người dùng
- ✅ Vô hiệu hóa tài khoản
- ✅ Xóa từng người dùng
- ✅ **Xóa hàng loạt tất cả người dùng** (NEW!)
- ✅ Bảo vệ tài khoản admin
- ✅ Xóa cascade tất cả dữ liệu liên quan

---

**Cập nhật:** 28/10/2025


