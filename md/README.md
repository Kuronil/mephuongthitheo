# Cart Backend API Documentation

## Overview
Backend API cho hệ thống giỏ hàng với đầy đủ tính năng CRUD, mã giảm giá và quản lý đơn hàng.

## Database Schema

### CartItem
```sql
model CartItem {
  id            Int      @id @default(autoincrement())
  userId        Int
  productId     Int
  name          String
  price         Float
  quantity      Int
  image         String?
  originalPrice Float?
  discount      Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
}
```

### DiscountCode
```sql
model DiscountCode {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  description String?
  discount    Int      // Phần trăm giảm giá
  minAmount   Float?   // Số tiền tối thiểu để áp dụng
  maxDiscount Float?   // Số tiền giảm tối đa
  freeShipping Boolean @default(false)
  isActive    Boolean  @default(true)
  validFrom   DateTime?
  validTo     DateTime?
  usageLimit  Int?     // Giới hạn số lần sử dụng
  usedCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### 1. Cart Management

#### GET /api/cart
Lấy danh sách sản phẩm trong giỏ hàng của user.

**Headers:**
- `x-user-id`: ID của user

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "productId": 123,
      "name": "Thịt Heo Nạc",
      "price": 100000,
      "quantity": 2,
      "image": "/product1.jpg",
      "originalPrice": 120000,
      "discount": 17,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/cart
Thêm sản phẩm vào giỏ hàng.

**Headers:**
- `x-user-id`: ID của user

**Body:**
```json
{
  "productId": 123,
  "name": "Thịt Heo Nạc",
  "price": 100000,
  "quantity": 1,
  "image": "/product1.jpg",
  "originalPrice": 120000,
  "discount": 17
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": 1,
    "userId": 1,
    "productId": 123,
    "name": "Thịt Heo Nạc",
    "price": 100000,
    "quantity": 1,
    "image": "/product1.jpg",
    "originalPrice": 120000,
    "discount": 17,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Item added to cart"
}
```

#### PUT /api/cart
Cập nhật số lượng sản phẩm trong giỏ hàng.

**Headers:**
- `x-user-id`: ID của user

**Body:**
```json
{
  "itemId": 1,
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": 1,
    "quantity": 3,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Cart item updated"
}
```

#### DELETE /api/cart
Xóa sản phẩm khỏi giỏ hàng hoặc xóa toàn bộ giỏ hàng.

**Headers:**
- `x-user-id`: ID của user

**Query Parameters:**
- `itemId` (optional): ID của sản phẩm cần xóa. Nếu không có, sẽ xóa toàn bộ giỏ hàng.

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 2. Discount Code Management

#### GET /api/discount
Lấy thông tin mã giảm giá.

**Query Parameters:**
- `code` (optional): Mã giảm giá cụ thể. Nếu không có, trả về tất cả mã active.

**Response (specific code):**
```json
{
  "success": true,
  "discountCode": {
    "id": 1,
    "code": "WELCOME10",
    "name": "Chào mừng khách hàng mới",
    "description": "Giảm 10% cho khách hàng mới",
    "discount": 10,
    "minAmount": 0,
    "maxDiscount": 50000,
    "freeShipping": false,
    "isActive": true,
    "validFrom": null,
    "validTo": null,
    "usageLimit": 1000,
    "usedCount": 0
  }
}
```

#### POST /api/discount
Áp dụng mã giảm giá cho đơn hàng.

**Headers:**
- `x-user-id`: ID của user

**Body:**
```json
{
  "code": "WELCOME10",
  "subtotal": 500000
}
```

**Response:**
```json
{
  "success": true,
  "discountCode": {
    "id": 1,
    "code": "WELCOME10",
    "name": "Chào mừng khách hàng mới",
    "description": "Giảm 10% cho khách hàng mới",
    "discount": 10,
    "freeShipping": false,
    "discountAmount": 50000,
    "minAmount": 0
  }
}
```

### 3. Admin Discount Management

#### GET /api/admin/discount
Lấy tất cả mã giảm giá (admin only).

**Headers:**
- `x-user-id`: ID của admin user

**Response:**
```json
{
  "success": true,
  "discountCodes": [
    {
      "id": 1,
      "code": "WELCOME10",
      "name": "Chào mừng khách hàng mới",
      "description": "Giảm 10% cho khách hàng mới",
      "discount": 10,
      "minAmount": 0,
      "maxDiscount": 50000,
      "freeShipping": false,
      "isActive": true,
      "validFrom": null,
      "validTo": null,
      "usageLimit": 1000,
      "usedCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/admin/discount
Tạo mã giảm giá mới (admin only).

**Headers:**
- `x-user-id`: ID của admin user

**Body:**
```json
{
  "code": "NEWCODE",
  "name": "Mã giảm giá mới",
  "description": "Mô tả mã giảm giá",
  "discount": 15,
  "minAmount": 200000,
  "maxDiscount": 100000,
  "freeShipping": false,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validTo": "2024-12-31T23:59:59.000Z",
  "usageLimit": 500
}
```

**Response:**
```json
{
  "success": true,
  "discountCode": {
    "id": 6,
    "code": "NEWCODE",
    "name": "Mã giảm giá mới",
    "description": "Mô tả mã giảm giá",
    "discount": 15,
    "minAmount": 200000,
    "maxDiscount": 100000,
    "freeShipping": false,
    "isActive": true,
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validTo": "2024-12-31T23:59:59.000Z",
    "usageLimit": 500,
    "usedCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Discount code created successfully"
}
```

## Error Responses

Tất cả API đều trả về error response với format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400`: Bad Request - Dữ liệu đầu vào không hợp lệ
- `401`: Unauthorized - Chưa đăng nhập
- `403`: Forbidden - Không có quyền truy cập
- `404`: Not Found - Không tìm thấy resource
- `500`: Internal Server Error - Lỗi server

## Sample Discount Codes

Hệ thống đã được seed với các mã giảm giá mẫu:

1. **WELCOME10**: Giảm 10% cho khách hàng mới
2. **SAVE20**: Giảm 20% cho đơn hàng từ 300,000đ
3. **FREESHIP**: Miễn phí giao hàng
4. **VIP15**: Giảm 15% cho khách hàng VIP (đơn từ 500k)
5. **FLASH30**: Flash sale giảm 30% (có thời hạn)

## Frontend Integration

Sử dụng thư viện `lib/cart-api.ts` để tích hợp với frontend:

```typescript
import { getCartItems, addToCart, applyDiscountCode } from '@/lib/cart-api'

// Lấy danh sách giỏ hàng
const cartItems = await getCartItems()

// Thêm sản phẩm vào giỏ hàng
await addToCart({
  productId: 123,
  name: "Thịt Heo Nạc",
  price: 100000,
  quantity: 1
})

// Áp dụng mã giảm giá
const result = await applyDiscountCode("WELCOME10", 500000)
```
