# Hướng Dẫn Tách Riêng Sản Phẩm Nổi Bật và Flash Sale

## Vấn Đề Đã Giải Quyết

Trước đây, section "Sản phẩm nổi bật" có thể hiển thị cả sản phẩm flash sale, gây nhầm lẫn cho người dùng.

## Giải Pháp Đã Thực Hiện

### 1. **Cập Nhật API Products** (`app/api/products/route.ts`)

Thêm hỗ trợ filter `false` cho `isFeatured` và `isFlashSale`:

```typescript
if (isFeatured === 'true') {
  where.isFeatured = true
} else if (isFeatured === 'false') {
  where.isFeatured = false
}

if (isFlashSale === 'true') {
  where.isFlashSale = true
} else if (isFlashSale === 'false') {
  where.isFlashSale = false
}
```

### 2. **Cập Nhật ProductRecommendations** (`components/product-recommendations.tsx`)

Thêm logic loại trừ để đảm bảo tách riêng:

```typescript
if (type === 'featured') {
  params.append('isFeatured', 'true')
  params.append('isFlashSale', 'false') // Loại trừ flash sale
} else if (type === 'flash-sale') {
  params.append('isFlashSale', 'true')
  params.append('isFeatured', 'false') // Loại trừ featured
}
```

### 3. **Sửa Dữ Liệu Seed** (`scripts/seed-products.ts`)

Đảm bảo không có sản phẩm nào vừa có `isFeatured=true` vừa có `isFlashSale=true`:

**Sản phẩm Featured (9 sản phẩm):**
- Thịt Heo Nạc Tươi
- Thịt Bò Tươi  
- Combo Thịt Healthy
- Thịt Heo Cốt Lết
- Giăm Bông Thơm
- Thịt Xông Khói
- Xúc Xích Nướng
- Thịt Gác Bếp
- Pate Gan Heo

**Sản phẩm Flash Sale (5 sản phẩm):**
- Thịt Heo Ba Chỉ
- Xúc Xích Thịt Heo
- Thịt Hộp Đóng Hộp
- Chả Chiên Thịt Heo
- Thịt Chà Bông Heo

## Cách Hoạt Động

### **Section "Sản phẩm nổi bật"**
- API call: `/api/products?isFeatured=true&isFlashSale=false`
- Chỉ hiển thị sản phẩm có `isFeatured=true` và `isFlashSale=false`
- Icon: ⭐ (màu vàng)
- Background: trắng

### **Section "⚡ Flash Sale"**
- API call: `/api/products?isFlashSale=true&isFeatured=false`
- Chỉ hiển thị sản phẩm có `isFlashSale=true` và `isFeatured=false`
- Icon: ⚡ (màu đỏ)
- Background: đỏ nhạt (`bg-red-50`)

## Quản Lý Từ Admin

### **Để tạo sản phẩm nổi bật:**
1. Vào `/admin/products`
2. Chỉnh sửa sản phẩm
3. Tick "Nổi bật" ✅
4. Đảm bảo "Flash Sale" không được tick ❌

### **Để tạo sản phẩm flash sale:**
1. Vào `/admin/products`
2. Chỉnh sửa sản phẩm
3. Tick "Flash Sale" ✅
4. Đảm bảo "Nổi bật" không được tick ❌

### **Lưu ý quan trọng:**
- **KHÔNG** được tick cả hai cùng lúc
- Một sản phẩm chỉ có thể là **HOẶC** nổi bật **HOẶC** flash sale
- Nếu tick cả hai, sản phẩm sẽ không hiển thị ở section nào

## Kiểm Tra

### **Kiểm tra sản phẩm nổi bật:**
```bash
curl "http://localhost:3000/api/products?isFeatured=true&isFlashSale=false&limit=10"
```

### **Kiểm tra sản phẩm flash sale:**
```bash
curl "http://localhost:3000/api/products?isFlashSale=true&isFeatured=false&limit=10"
```

### **Kiểm tra trang chủ:**
- Truy cập `http://localhost:3000`
- Section "Sản phẩm nổi bật" chỉ hiển thị sản phẩm featured
- Section "⚡ Flash Sale" chỉ hiển thị sản phẩm flash sale

## Lợi Ích

1. **Rõ ràng:** Người dùng biết chính xác sản phẩm nào là nổi bật, sản phẩm nào là flash sale
2. **Linh hoạt:** Admin có thể dễ dàng quản lý từng loại sản phẩm
3. **Nhất quán:** Dữ liệu từ database, không hard-coded
4. **Mở rộng:** Dễ dàng thêm logic phức tạp hơn trong tương lai

## Troubleshooting

### **Sản phẩm không hiển thị ở section nào:**
- Kiểm tra `isActive=true`
- Kiểm tra không tick cả hai flag cùng lúc
- Kiểm tra database đã được seed chưa

### **Sản phẩm hiển thị ở cả hai section:**
- Kiểm tra database có sản phẩm nào có cả hai flag=true
- Chạy lại seed script: `npx ts-node scripts/seed-products.ts`

### **API không hoạt động:**
- Kiểm tra server đang chạy: `npm run dev`
- Kiểm tra API endpoint: `/api/products`
- Kiểm tra console browser để xem lỗi

---

## Tóm Tắt

✅ **Đã tách riêng hoàn toàn** sản phẩm nổi bật và flash sale  
✅ **API hỗ trợ filter** `isFeatured=false` và `isFlashSale=false`  
✅ **Dữ liệu đã được sửa** để không có xung đột  
✅ **Trang chủ hiển thị đúng** từng section riêng biệt  

Bây giờ admin có thể quản lý dễ dàng và người dùng thấy rõ ràng từng loại sản phẩm!

