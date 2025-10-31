# Hướng dẫn tích hợp VNPay - Mẹ Phương Thịt Heo

## 📋 Tổng quan

VNPay đã được tích hợp thành công vào hệ thống thanh toán. Khách hàng có thể thanh toán qua:
- **ATM Card** (Thẻ nội địa)
- **Credit/Debit Card** (Visa, MasterCard, JCB)
- **QR Code** (VNPAYQR)
- **Internet Banking**

---

## 🔧 Các bước đã hoàn thành

### ✅ 1. Cấu hình VNPay (`lib/vnpay.ts`)

File này chứa:
- Config VNPay (TMN Code, Hash Secret, URLs)
- Các hàm tạo payment URL
- Xác thực chữ ký (signature)
- Danh sách ngân hàng hỗ trợ
- Parse response code từ VNPay

### ✅ 2. API Endpoints

#### **a) Tạo Payment URL** (`/api/vnpay/create-payment`)
- Method: `POST`
- Body: `{ orderId: number, bankCode?: string }`
- Response: `{ success: true, paymentUrl: string, orderId: number }`
- Chức năng: Tạo URL thanh toán và redirect khách hàng đến VNPay

#### **b) Return URL** (`/api/vnpay/return`)
- Method: `GET`
- Params: VNPay redirect params
- Chức năng: Xử lý khi khách hàng quay lại từ VNPay
- Cập nhật trạng thái đơn hàng
- Redirect đến `/payment-result`

#### **c) IPN (Instant Payment Notification)** (`/api/vnpay/ipn`)
- Method: `GET`
- Params: VNPay webhook params
- Chức năng: Nhận thông báo từ VNPay về kết quả thanh toán
- Response: `{ RspCode: '00', Message: 'Confirm Success' }`

### ✅ 3. Frontend Updates

#### **a) Step3Payment** (Checkout Step 3)
- Thêm option "VNPay" với badge "Phổ biến"
- Hiển thị features: Bảo mật cao, Hỗ trợ nhiều ngân hàng, Thanh toán nhanh chóng

#### **b) Payment Page** (`/payment/[orderId]`)
- Xử lý phương thức VNPay
- Nút "Thanh toán qua VNPay" để redirect
- Loading state khi đang xử lý

#### **c) Payment Result Page** (`/payment-result`)
- Hiển thị kết quả thanh toán
- Auto-redirect sau 10 giây nếu thành công
- Các nút hành động phù hợp

### ✅ 4. Database Schema

Đã thêm các trường vào `Order` model:
```prisma
vnpayTransactionNo   String?
vnpayBankCode        String?
vnpayCardType        String?
vnpayPayDate         String?
vnpayResponseCode    String?
vnpayResponseMessage String?
paidAt               DateTime?
```

---

## 🚀 Cách sử dụng

### **Bước 1: Đăng ký tài khoản VNPay**

1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản merchant (sandbox cho test)
3. Lấy thông tin:
   - `vnp_TmnCode`: Mã website
   - `vnp_HashSecret`: Chuỗi bí mật
   - `vnp_Url`: URL thanh toán

### **Bước 2: Cấu hình môi trường**

Tạo file `.env` hoặc `.env.local` và thêm:

```env
# VNPay Configuration
VNPAY_TMN_CODE=YOUR_TMN_CODE_HERE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET_HERE
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/vnpay/return
VNPAY_IPN_URL=http://localhost:3000/api/vnpay/ipn
```

**Lưu ý:**
- Với **Sandbox**: Dùng URL `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Với **Production**: Dùng URL `https://vnpayment.vn/paymentv2/vpcpay.html`
- `VNPAY_RETURN_URL` và `VNPAY_IPN_URL` phải là URL công khai (không dùng localhost khi production)

### **Bước 3: Chạy migration database**

```bash
npx prisma migrate dev --name add_vnpay_fields
```

Hoặc nếu đã có database production:

```bash
npx prisma db push
```

### **Bước 4: Test thanh toán**

1. **Tạo đơn hàng** và chọn phương thức "VNPay"
2. **Trang payment** sẽ hiển thị nút "Thanh toán qua VNPay"
3. Click nút → Redirect đến VNPay
4. **Thông tin test** (Sandbox):
   - Ngân hàng: NCB
   - Số thẻ: `9704198526191432198`
   - Tên chủ thẻ: `NGUYEN VAN A`
   - Ngày phát hành: `07/15`
   - Mật khẩu OTP: `123456`

5. Sau khi thanh toán → Redirect về `/payment-result`
6. Kiểm tra trạng thái đơn hàng → Đã chuyển thành `PAID`

---

## 📊 Luồng thanh toán VNPay

```
1. Khách hàng chọn VNPay → Tạo đơn hàng (Status: AWAITING_PAYMENT)
2. Click "Thanh toán qua VNPay"
3. API tạo payment URL → Redirect đến VNPay
4. Khách hàng nhập thông tin thẻ/chọn ngân hàng
5. VNPay xử lý thanh toán
6. VNPay gửi IPN (webhook) → Server cập nhật đơn hàng
7. VNPay redirect khách về Return URL
8. Return URL xử lý → Redirect đến payment-result
9. Hiển thị kết quả cho khách hàng
```

---

## 🔐 Bảo mật

### **1. Signature Verification**
Mọi request từ VNPay đều được xác thực bằng HMAC-SHA512:
```typescript
const isValid = verifyReturnUrl(vnp_Params)
if (!isValid) {
  return error "Invalid signature"
}
```

### **2. Amount Verification**
Kiểm tra số tiền từ VNPay khớp với đơn hàng:
```typescript
if (amount !== order.total) {
  return error "Amount mismatch"
}
```

### **3. Order Ownership**
Chỉ user sở hữu đơn hàng mới có thể thanh toán:
```typescript
if (order.userId !== user.id) {
  return error "Unauthorized"
}
```

---

## 🛠️ Xử lý lỗi

### **Response Codes từ VNPay:**

| Code | Ý nghĩa |
|------|---------|
| `00` | Giao dịch thành công |
| `07` | Trừ tiền thành công, giao dịch bị nghi ngờ |
| `09` | Thẻ/Tài khoản chưa đăng ký Internet Banking |
| `10` | Xác thực sai quá 3 lần |
| `11` | Hết hạn chờ thanh toán (15 phút) |
| `12` | Thẻ/Tài khoản bị khóa |
| `13` | Nhập sai OTP |
| `24` | Khách hàng hủy giao dịch |
| `51` | Tài khoản không đủ số dư |
| `65` | Vượt quá hạn mức giao dịch |
| `75` | Ngân hàng bảo trì |
| `99` | Lỗi khác |

### **Xử lý trong code:**
```typescript
const message = getResponseMessage(responseCode)
if (responseCode === '00') {
  // Success
  await updateOrderStatus('PAID')
} else {
  // Failed
  await updateOrderStatus('AWAITING_PAYMENT')
  showError(message)
}
```

---

## 🌐 Deploy lên Production

### **1. Cấu hình domain và SSL**
VNPay yêu cầu HTTPS cho Return URL và IPN URL:
```env
VNPAY_RETURN_URL=https://yourdomain.com/api/vnpay/return
VNPAY_IPN_URL=https://yourdomain.com/api/vnpay/ipn
```

### **2. Đăng ký URLs với VNPay**
- Login vào VNPay merchant portal
- Thêm Return URL và IPN URL vào whitelist
- Chờ VNPay approve (thường 1-2 ngày làm việc)

### **3. Chuyển sang Production**
```env
VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=YOUR_PRODUCTION_TMN_CODE
VNPAY_HASH_SECRET=YOUR_PRODUCTION_HASH_SECRET
```

### **4. Test kỹ trước khi go-live**
- Test với số tiền nhỏ
- Test các ngân hàng khác nhau
- Test trường hợp timeout
- Test trường hợp hủy thanh toán
- Kiểm tra IPN có nhận đúng không

---

## 📝 Logs và Monitoring

### **Console Logs**
```typescript
console.log('Created VNPay payment URL for order', orderId)
console.log('VNPay IPN received:', vnp_Params)
console.log('Order payment successful:', orderId)
```

### **Database Logs**
Mọi transaction được lưu trong `Order` table với các trường:
- `vnpayTransactionNo`: Mã giao dịch VNPay
- `vnpayBankCode`: Ngân hàng thanh toán
- `vnpayResponseCode`: Kết quả
- `paidAt`: Thời gian thanh toán

---

## 🎯 TODO List (Tùy chọn)

- [ ] Gửi email xác nhận khi thanh toán thành công
- [ ] Gửi SMS thông báo cho khách hàng
- [ ] Dashboard admin để xem thống kê thanh toán VNPay
- [ ] Hỗ trợ refund qua VNPay
- [ ] Cho phép khách chọn ngân hàng trước khi redirect
- [ ] Lưu lịch sử thanh toán chi tiết

---

## 🆘 Troubleshooting

### **Lỗi: Invalid signature**
- Kiểm tra `VNPAY_HASH_SECRET` có đúng không
- Đảm bảo không có khoảng trắng thừa trong secret
- Kiểm tra params có bị encode sai không

### **Lỗi: Payment expired**
- VNPay timeout sau 15 phút
- Tạo payment URL mới cho khách hàng

### **IPN không được gọi**
- Kiểm tra IPN URL có public không (không dùng localhost)
- Kiểm tra firewall/security group
- Kiểm tra logs server có nhận request không
- Verify URL đã đăng ký với VNPay chưa

### **Return URL redirect sai**
- Kiểm tra `VNPAY_RETURN_URL` trong .env
- Đảm bảo URL có protocol (http:// hoặc https://)
- Kiểm tra routing của Next.js

---

## 📞 Hỗ trợ

- **VNPay Hotline**: 1900 55 55 77
- **VNPay Email**: support@vnpay.vn
- **Tài liệu API**: https://sandbox.vnpayment.vn/apis/docs/
- **Sandbox Test**: https://sandbox.vnpayment.vn/

---

## ✅ Checklist triển khai

- [x] Tạo file config VNPay
- [x] Tạo API tạo payment URL
- [x] Tạo API xử lý return URL
- [x] Tạo API webhook IPN
- [x] Cập nhật UI checkout
- [x] Cập nhật payment page
- [x] Tạo payment result page
- [x] Cập nhật database schema
- [ ] Thêm biến môi trường vào .env
- [ ] Chạy migration database
- [ ] Test với VNPay sandbox
- [ ] Đăng ký production với VNPay
- [ ] Deploy lên production
- [ ] Test trên production

---

*Tài liệu này được tạo cho dự án Mẹ Phương Thịt Heo*
*Cập nhật lần cuối: ${new Date().toLocaleDateString('vi-VN')}*



