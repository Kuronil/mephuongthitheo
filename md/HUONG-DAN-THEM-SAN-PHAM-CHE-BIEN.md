# Hướng Dẫn Thêm Sản Phẩm Vào Danh Mục Sản Phẩm Chế Biến

## Tổng Quan

Danh mục **"Thịt chế biến"** hiển thị các sản phẩm thịt đã được chế biến như giăm bông, xúc xích, thịt xông khói, pate, v.v.

**Đường dẫn trang:** `/processed-products` hoặc `/admin/processed-products`

## Cách 1: Sử Dụng Trang Admin (Dễ Nhất) ⭐

### Bước 1: Truy cập trang admin
```
http://localhost:3000/admin/processed-products
```

### Bước 2: Click nút "Thêm sản phẩm chế biến"

### Bước 3: Điền thông tin sản phẩm

**Các trường bắt buộc:**
- **Tên sản phẩm:** Ví dụ: "Chả lụa thịt heo"
- **Giá:** Ví dụ: 55000
- **Danh mục:** Chọn "Thịt chế biến" (đã tự động điền)
- **Tồn kho:** Số lượng có sẵn

**Các trường quan trọng khác:**
- **Giá gốc:** Nếu có giảm giá (originalPrice)
- **Phần trăm giảm giá:** Tính tự động từ giá và giá gốc
- **Hình ảnh:** Đường dẫn đến file trong thư mục `/public`
- **Mô tả:** Mô tả chi tiết sản phẩm
- **Loại:** Tên loại sản phẩm (subcategory) như "Giăm bông", "Xúc xích", v.v.
- **Thương hiệu:** Ví dụ: "Mẹ Phương"
- **Trọng lượng:** Ví dụ: 500
- **Đơn vị:** Ví dụ: "g" hoặc "kg"
- **Tồn kho tối thiểu:** Khi nào cảnh báo hết hàng
- **Tags:** Các từ khóa tìm kiếm (JSON array)
- **Dinh dưỡng:** Thông tin dinh dưỡng (JSON object)
- **Bảo quản:** Hướng dẫn bảo quản
- **Hạn sử dụng:** Số ngày

### Bước 4: Click "Lưu"

---

## Cách 2: Thêm Vào Script Seed

### Bước 1: Mở file `scripts/seed-products.ts`

### Bước 2: Thêm object sản phẩm mới vào mảng `sampleProducts`

**Cấu trúc mẫu:**
```typescript
{
  name: "Tên sản phẩm",
  slug: "ten-san-pham-khong-dau",
  description: "Mô tả sản phẩm...",
  price: 55000,
  originalPrice: 75000, // Optional
  discount: 27, // Phần trăm giảm giá
  image: "/ten-hinh-anh.jpg", // File trong thư mục /public
  category: "Thịt chế biến", // QUAN TRỌNG: Phải là "Thịt chế biến"
  subcategory: "Tên loại", // Ví dụ: "Giăm bông", "Xúc xích"
  brand: "Mẹ Phương",
  weight: 500,
  unit: "g",
  stock: 40,
  minStock: 8,
  isActive: true, // Hiển thị trên website
  isFeatured: false, // Sản phẩm nổi bật
  isFlashSale: false, // Flash sale
  tags: JSON.stringify(["Tag1", "Tag2", "Tag3"]),
  nutrition: JSON.stringify({
    calories: 280,
    protein: 25,
    fat: 18,
    carbs: 2,
    fiber: 0
  }),
  storage: "Bảo quản trong tủ lạnh 0-4°C",
  expiry: 14 // Số ngày
}
```

### Bước 3: Thêm hình ảnh vào thư mục `/public`

Ví dụ:
```
/public/ten-hinh-anh.jpg
```

### Bước 4: Chạy script seed
```bash
npx ts-node scripts/seed-products.ts
```

---

## Cách 3: Sử Dụng API Trực Tiếp

### Gửi POST request đến `/api/products`

**Body JSON:**
```json
{
  "name": "Tên sản phẩm",
  "slug": "ten-san-pham-khong-dau",
  "description": "Mô tả sản phẩm",
  "price": 55000,
  "originalPrice": 75000,
  "image": "/ten-hinh-anh.jpg",
  "category": "Thịt chế biến",
  "subcategory": "Tên loại",
  "brand": "Mẹ Phương",
  "weight": 500,
  "unit": "g",
  "stock": 40,
  "minStock": 8,
  "isActive": true,
  "isFeatured": false,
  "isFlashSale": false,
  "tags": ["Tag1", "Tag2"],
  "nutrition": {
    "calories": 280,
    "protein": 25,
    "fat": 18
  },
  "storage": "Bảo quản trong tủ lạnh",
  "expiry": 14
}
```

---

## Ví Dụ Các Loại Sản Phẩm Chế Biến

- **Giăm bông** (Ham)
- **Xúc xích** (Sausage)
- **Thịt xông khói** (Smoked meat)
- **Chả lụa** (Vietnamese pork roll)
- **Thịt đóng hộp** (Canned meat)
- **Pate** (Liver pate)
- **Thịt gác bếp** (Dried meat)
- **Chả chiên** (Fried pork cake)
- **Thịt chà bông** (Shredded pork)
- **Xúc xích nướng** (Grilled sausage)

---

## Các Sản Phẩm Hiện Có (18 sản phẩm)

1. Giăm Bông Thơm
2. Xúc Xích Thịt Heo
3. Thịt Xông Khói
4. Chả Lụa Thịt Heo
5. Thịt Hộp Đóng Hộp
6. Xúc Xích Nướng
7. Thịt Gác Bếp
8. Chả Chiên Thịt Heo
9. Thịt Chà Bông Heo (Mới thêm)
10. Pate Gan Heo (Mới thêm)

---

## Lưu Ý Quan Trọng

### 1. Trường `category` phải là "Thịt chế biến"
Đây là điều bắt buộc để sản phẩm hiển thị trên trang `/processed-products`

### 2. Slug phải là duy nhất
Slug được dùng để tạo URL: `/product/slug`

### 3. Hình ảnh
- Đặt file trong thư mục `/public`
- Sử dụng định dạng: `/ten-file.jpg`
- Kích thước khuyến nghị: 500x500px trở lên

### 4. JSON trong Prisma
Các trường `tags`, `nutrition`, `images` phải được stringify:
```typescript
tags: JSON.stringify(["tag1", "tag2"])
nutrition: JSON.stringify({ calories: 200 })
```

### 5. Giá
- **price:** Giá bán thực tế
- **originalPrice:** Giá gốc (nếu có khuyến mãi)
- **discount:** Phần trăm giảm giá (tính tự động)

---

## Kiểm Tra Sản Phẩm

### 1. Xem trên trang chính
```
http://localhost:3000/processed-products
```

### 2. Xem trong admin
```
http://localhost:3000/admin/processed-products
```

### 3. Xem chi tiết sản phẩm
```
http://localhost:3000/product/[slug]
```

---

## Troubleshooting

### Sản phẩm không hiển thị
1. Kiểm tra `category` có đúng là "Thịt chế biến"?
2. Kiểm tra `isActive` có phải `true`?
3. Kiểm tra database đã được seed chưa?

### Lỗi duplicate slug
- Slug đã tồn tại. Thay đổi slug hoặc xóa sản phẩm cũ.

### Hình ảnh không hiển thị
1. Kiểm tra file có tồn tại trong `/public`
2. Kiểm tra đường dẫn có chính xác?
3. Thử copy đường dẫn và mở trong browser

---

## Tóm Tắt

✅ **Cách dễ nhất:** Sử dụng giao diện admin tại `/admin/processed-products`

✅ **Cách nhanh nhất:** Thêm vào `scripts/seed-products.ts` và chạy seed script

✅ **Cách chuyên nghiệp:** Sử dụng API POST request

Tất cả 3 cách đều hoạt động tốt. Chọn cách phù hợp với nhu cầu của bạn!


