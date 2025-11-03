# 📊 Cấu trúc Database SQLite - Mẹ Phương Thịt Heo

## 🏗️ Tổng quan

Database sử dụng **SQLite** với **13 bảng** chính:
- User Management (1 bảng)
- Product Management (2 bảng)
- Order Management (4 bảng)
- Loyalty & Discount (2 bảng)
- Notification & Logging (4 bảng)

---

## 📋 Chi tiết các bảng

### 1️⃣ **User** - Quản lý người dùng

```sql
CREATE TABLE "User" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    isAdmin INTEGER DEFAULT 0,
    emailVerified INTEGER DEFAULT 0,
    verificationToken TEXT,
    verificationTokenExpiry DATETIME,
    resetPasswordToken TEXT,
    resetPasswordTokenExpiry DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    loyaltyPoints INTEGER DEFAULT 0,
    loyaltyTier TEXT DEFAULT 'BRONZE'
);
```

**Indexes:**
- `email`
- `createdAt`
- `isAdmin`

**Trạng thái Loyalty:**
- `BRONZE` - Đồng (mặc định)
- `SILVER` - Bạc
- `GOLD` - Vàng
- `PLATINUM` - Bạch kim

**Relationships:**
- `orders: Order[]` - Các đơn hàng
- `wishlist: WishlistItem[]` - Danh sách yêu thích
- `cart: CartItem[]` - Giỏ hàng
- `statusLogs: OrderStatusLog[]` - Lịch sử trạng thái đơn hàng
- `reviews: ProductReview[]` - Đánh giá sản phẩm
- `loyaltyTransactions: LoyaltyTransaction[]` - Giao dịch tích điểm
- `notifications: Notification[]` - Thông báo
- `adminLogs: AdminLog[]` - Nhật ký admin
- `productHistory: ProductHistory[]` - Lịch sử thay đổi sản phẩm
- `orderHistory: OrderHistory[]` - Lịch sử thay đổi đơn hàng

---

### 2️⃣ **Product** - Sản phẩm

```sql
CREATE TABLE "Product" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    originalPrice REAL,
    discount INTEGER,
    image TEXT,
    images TEXT,                    -- JSON array
    category TEXT,
    subcategory TEXT,
    brand TEXT,
    weight REAL,                    -- Khối lượng (gram)
    unit TEXT,                      -- kg, g, piece
    stock INTEGER DEFAULT 0,
    minStock INTEGER DEFAULT 5,     -- Cảnh báo khi hết hàng
    isActive INTEGER DEFAULT 1,
    isFeatured INTEGER DEFAULT 0,
    isFlashSale INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,          -- 0-5
    reviewCount INTEGER DEFAULT 0,
    tags TEXT,                      -- JSON array
    nutrition TEXT,                 -- JSON
    storage TEXT,                   -- Hướng dẫn bảo quản
    expiry INTEGER,                 -- Số ngày hết hạn
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `slug`
- `category`
- `isActive`
- `isFeatured`
- `isFlashSale`
- `category, isActive` (composite)
- `createdAt`

**Relationships:**
- `orderItems: OrderItem[]`
- `wishlistItems: WishlistItem[]`
- `cartItems: CartItem[]`
- `reviews: ProductReview[]`
- `history: ProductHistory[]`

---

### 3️⃣ **Order** - Đơn hàng

```sql
CREATE TABLE "Order" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    total REAL NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    note TEXT,
    paymentMethod TEXT NOT NULL,
    status TEXT NOT NULL,
    discountCodeId INTEGER,        -- Mã giảm giá sử dụng
    
    -- VNPay fields
    vnpayTransactionNo TEXT,
    vnpayBankCode TEXT,
    vnpayCardType TEXT,
    vnpayPayDate TEXT,
    vnpayResponseCode TEXT,
    vnpayResponseMessage TEXT,
    paidAt DATETIME,
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES "User"(id),
    FOREIGN KEY (discountCodeId) REFERENCES "DiscountCode"(id)
);
```

**Indexes:**
- `userId`
- `status`
- `createdAt`
- `paymentMethod`
- `status, createdAt` (composite)
- `discountCodeId`

**Relationships:**
- `items: OrderItem[]`
- `statusLogs: OrderStatusLog[]`
- `loyaltyTransactions: LoyaltyTransaction[]`
- `history: OrderHistory[]`
- `discountCode: DiscountCode?`
- `user: User?`

**Payment Methods:**
- `COD` - Thanh toán khi nhận hàng
- `VNPAY` - Thanh toán online qua VNPay

**Status:**
- `pending` - Chờ xử lý
- `confirmed` - Đã xác nhận
- `processing` - Đang xử lý
- `shipping` - Đang giao hàng
- `delivered` - Đã giao
- `cancelled` - Đã hủy

---

### 4️⃣ **OrderItem** - Chi tiết đơn hàng

```sql
CREATE TABLE "OrderItem" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT,
    
    FOREIGN KEY (orderId) REFERENCES "Order"(id),
    FOREIGN KEY (productId) REFERENCES "Product"(id)
);
```

**Indexes:**
- `orderId`
- `productId`

**Relationships:**
- `order: Order`
- `product: Product`

---

### 5️⃣ **CartItem** - Giỏ hàng

```sql
CREATE TABLE "CartItem" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT,
    originalPrice REAL,
    discount INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES "User"(id),
    FOREIGN KEY (productId) REFERENCES "Product"(id)
);
```

**Indexes:**
- `userId`
- `productId`
- `userId, productId` (unique composite)

**Relationships:**
- `user: User`
- `product: Product`

---

### 6️⃣ **WishlistItem** - Yêu thích

```sql
CREATE TABLE "WishlistItem" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    originalPrice REAL,
    discount INTEGER,
    rating REAL,
    reviews INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES "User"(id),
    FOREIGN KEY (productId) REFERENCES "Product"(id)
);
```

**Indexes:**
- `userId`
- `productId`
- `userId, productId` (unique composite)

**Relationships:**
- `user: User`
- `product: Product`

---

### 7️⃣ **DiscountCode** - Mã giảm giá

```sql
CREATE TABLE "DiscountCode" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    discount INTEGER NOT NULL,      -- Phần trăm giảm giá
    minAmount REAL,                 -- Số tiền tối thiểu
    maxDiscount REAL,               -- Giảm tối đa
    freeShipping INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    validFrom DATETIME,
    validTo DATETIME,
    usageLimit INTEGER,             -- Giới hạn số lần dùng
    usedCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `code`
- `isActive`
- `validFrom, validTo` (composite)

**Relationships:**
- `orders: Order[]`

---

### 8️⃣ **OrderStatusLog** - Lịch sử trạng thái đơn hàng

```sql
CREATE TABLE "OrderStatusLog" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    changedBy INTEGER NOT NULL,
    changedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orderId) REFERENCES "Order"(id),
    FOREIGN KEY (changedBy) REFERENCES "User"(id)
);
```

**Relationships:**
- `order: Order`
- `user: User`

---

### 9️⃣ **ProductReview** - Đánh giá sản phẩm

```sql
CREATE TABLE "ProductReview" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    rating INTEGER NOT NULL,        -- 1-5 sao
    title TEXT,
    comment TEXT,
    images TEXT,                    -- JSON array
    isVerified INTEGER DEFAULT 0,
    helpful INTEGER DEFAULT 0,      -- Số lượt thích
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (productId) REFERENCES "Product"(id),
    FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

**Indexes:**
- `productId`
- `userId`
- `productId, createdAt` (composite)

**Relationships:**
- `product: Product`
- `user: User`

---

### 🔟 **LoyaltyTransaction** - Giao dịch tích điểm

```sql
CREATE TABLE "loyalty_transactions" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    orderId INTEGER,
    type TEXT NOT NULL,             -- EARN, REDEEM, EXPIRED, BONUS
    points INTEGER NOT NULL,        -- Dương khi kiếm, âm khi đổi
    description TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME,
    
    FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (orderId) REFERENCES "Order"(id)
);
```

**Types:**
- `EARN` - Kiếm điểm
- `REDEEM` - Đổi điểm
- `EXPIRED` - Hết hạn điểm
- `BONUS` - Điểm thưởng

**Relationships:**
- `user: User`
- `order: Order?`

---

### 1️⃣1️⃣ **Notification** - Thông báo

```sql
CREATE TABLE "notifications" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,             -- ORDER, PROMOTION, SYSTEM, LOYALTY
    isRead INTEGER DEFAULT 0,
    data TEXT,                      -- JSON
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
```

**Indexes:**
- `userId`
- `userId, isRead` (composite)
- `userId, createdAt` (composite)

**Types:**
- `ORDER` - Thông báo đơn hàng
- `PROMOTION` - Khuyến mãi
- `SYSTEM` - Hệ thống
- `LOYALTY` - Tích điểm

**Relationships:**
- `user: User?`

---

### 1️⃣2️⃣ **AdminLog** - Nhật ký Admin

```sql
CREATE TABLE "admin_logs" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adminId INTEGER NOT NULL,
    action TEXT NOT NULL,           -- CREATE, UPDATE, DELETE, EXPORT
    entity TEXT NOT NULL,           -- PRODUCT, ORDER, USER
    entityId INTEGER,
    description TEXT NOT NULL,
    oldData TEXT,                   -- JSON snapshot
    newData TEXT,                   -- JSON snapshot
    ipAddress TEXT,
    userAgent TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (adminId) REFERENCES "User"(id)
);
```

**Actions:**
- `CREATE` - Tạo mới
- `UPDATE` - Cập nhật
- `DELETE` - Xóa
- `EXPORT` - Xuất dữ liệu

**Entities:**
- `PRODUCT` - Sản phẩm
- `ORDER` - Đơn hàng
- `USER` - Người dùng
- `DISCOUNT` - Mã giảm giá

**Relationships:**
- `admin: User`

---

### 1️⃣3️⃣ **ProductHistory** - Lịch sử sản phẩm

```sql
CREATE TABLE "product_history" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    changedBy INTEGER NOT NULL,
    field TEXT NOT NULL,
    oldValue TEXT,                  -- JSON nếu phức tạp
    newValue TEXT,                  -- JSON nếu phức tạp
    reason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (productId) REFERENCES "Product"(id),
    FOREIGN KEY (changedBy) REFERENCES "User"(id)
);
```

**Relationships:**
- `product: Product`
- `changer: User`

---

### 1️⃣4️⃣ **OrderHistory** - Lịch sử đơn hàng

```sql
CREATE TABLE "order_history" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    changedBy INTEGER NOT NULL,
    field TEXT NOT NULL,
    oldValue TEXT,
    newValue TEXT,
    reason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orderId) REFERENCES "Order"(id),
    FOREIGN KEY (changedBy) REFERENCES "User"(id)
);
```

**Relationships:**
- `order: Order`
- `changer: User`

---

## 🔗 Sơ đồ quan hệ (ERD)

```
User
  ├── Orders (1:N)
  ├── CartItems (1:N)
  ├── WishlistItems (1:N)
  ├── ProductReviews (1:N)
  ├── LoyaltyTransactions (1:N)
  ├── Notifications (1:N)
  ├── AdminLogs (1:N)
  ├── ProductHistory (1:N)
  └── OrderHistory (1:N)

Product
  ├── OrderItems (1:N)
  ├── CartItems (1:N)
  ├── WishlistItems (1:N)
  ├── ProductReviews (1:N)
  └── ProductHistory (1:N)

Order
  ├── OrderItems (1:N)
  ├── OrderStatusLogs (1:N)
  ├── LoyaltyTransactions (1:N)
  ├── OrderHistory (1:N)
  └── DiscountCode (N:1)

DiscountCode
  └── Orders (1:N)
```

---

## 📊 Thống kê

| Nhóm | Số bảng | Mô tả |
|------|---------|-------|
| **User Management** | 1 | Quản lý người dùng, xác thực |
| **Product Management** | 2 | Sản phẩm, đánh giá |
| **Order Management** | 4 | Đơn hàng, giỏ hàng, yêu thích, log trạng thái |
| **Loyalty & Discount** | 2 | Mã giảm giá, tích điểm |
| **Notification & Logging** | 4 | Thông báo, nhật ký admin, lịch sử thay đổi |
| **TỔNG** | **13** | |

---

## 🎯 Đặc điểm nổi bật

### ✅ Security
- Email verification
- Password reset với token có hạn
- Admin logs tracking
- Audit trail cho Product & Order

### ✅ E-commerce Features
- Full shopping cart
- Wishlist
- Multiple payment methods (COD, VNPay)
- Discount codes with validation
- Product reviews & ratings

### ✅ Customer Engagement
- Loyalty points system
- 4-tier loyalty program (Bronze/Silver/Gold/Platinum)
- Notifications (Order, Promotion, System, Loyalty)
- Flash sales support

### ✅ Inventory Management
- Stock tracking
- Minimum stock alerts
- Product variants (weight, unit)
- Active/Featured/FlashSale flags

### ✅ Admin Features
- Complete order management
- Product history tracking
- Order history tracking
- Discount code management
- Export functionality logging

### ✅ Advanced Features
- JSON fields for flexible data (images, tags, nutrition, specifications)
- Expiry tracking for products
- Storage instructions
- Vietnamese text search support

---

## 🚀 Sử dụng

### Xem cấu trúc database:
```bash
cd mephuongthitheo
npx prisma studio
```

### Reset database:
```bash
npx prisma migrate reset
```

### Tạo migration mới:
```bash
npx prisma migrate dev --name migration_name
```

### Generate Prisma Client:
```bash
npx prisma generate
```

---

**📅 Cập nhật:** Dựa trên schema Prisma hiện tại  
**📦 Database:** SQLite  
**🔧 ORM:** Prisma
