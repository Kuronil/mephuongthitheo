# 🔍 Hướng Dẫn Sử Dụng Tính Năng Tìm Kiếm

## ✅ **Vấn Đề Đã Được Giải Quyết**

Tính năng tìm kiếm sản phẩm đã hoạt động hoàn hảo! Bạn có thể:

### **1. Tìm Kiếm Cơ Bản**
- Gõ tên sản phẩm vào thanh tìm kiếm ở header
- Ví dụ: "thịt", "heo", "bò", "combo"
- Sẽ hiển thị gợi ý tự động khi gõ

### **2. Gợi Ý Tự Động**
Khi gõ từ khóa, hệ thống sẽ hiển thị:
- ✅ **Sản phẩm**: Tên, hình ảnh, giá, danh mục
- ✅ **Danh mục**: "Danh mục: thit-heo"
- ✅ **Thương hiệu**: "Thương hiệu: Mẹ Phương"
- ✅ **Lịch sử**: Tìm kiếm gần đây

### **3. Các Sản Phẩm Có Sẵn**
Hệ thống đã có 8 sản phẩm:
1. **Thịt Heo Nạc Tươi** - 89.000đ
2. **Thịt Heo Ba Chỉ** - 95.000đ
3. **Thịt Heo Sườn** - 105.000đ
4. **Thịt Bò Tươi** - 150.000đ
5. **Combo Thịt Healthy** - 159.000đ
6. **Thịt Heo Xay** - 75.000đ
7. **Thịt Heo Chân** - 45.000đ
8. **Thịt Heo Cốt Lết** - 125.000đ

## 🎯 **Cách Sử Dụng**

### **A. Tìm Kiếm Trong Header**
1. Click vào thanh tìm kiếm ở header
2. Gõ từ khóa (ví dụ: "thịt")
3. Chọn từ gợi ý hoặc nhấn Enter
4. Sẽ chuyển đến trang `/search` với kết quả

### **B. Tìm Kiếm Trên Trang Sản Phẩm**
1. Vào trang `/products`
2. Sử dụng component tìm kiếm nâng cao
3. Có thể áp dụng bộ lọc: giá, danh mục, đánh giá

### **C. Tìm Kiếm Nhanh Trên Trang Chủ**
1. Vào trang chủ `/`
2. Sử dụng component tìm kiếm lớn
3. Click vào từ khóa phổ biến hoặc danh mục nhanh

## 🔧 **Tính Năng Nâng Cao**

### **1. Điều Hướng Bằng Bàn Phím**
- `↑/↓`: Di chuyển giữa gợi ý
- `Enter`: Chọn gợi ý hoặc tìm kiếm
- `Escape`: Đóng dropdown

### **2. Lưu Lịch Sử**
- Tự động lưu 5 tìm kiếm gần nhất
- Hiển thị trong dropdown gợi ý
- Có thể xóa từng mục

### **3. Bộ Lọc Nâng Cao**
- **Danh mục**: thit-heo, thit-bo, combo
- **Khoảng giá**: Từ - Đến
- **Đánh giá**: 1-5 sao
- **Sắp xếp**: Mới nhất, giá, đánh giá
- **Trạng thái**: Còn hàng, nổi bật, flash sale

## 📱 **Responsive Design**

### **Desktop**
- Thanh tìm kiếm trong header
- Dropdown gợi ý đầy đủ
- Bộ lọc nâng cao

### **Mobile**
- Nút tìm kiếm thu gọn
- Panel tìm kiếm mở rộng
- Giao diện thân thiện

## 🚀 **API Endpoints**

### **1. Tìm Kiếm Gợi Ý**
```
GET /api/search/suggestions?q=từ-khóa&limit=8
```

### **2. Tìm Kiếm Sản Phẩm**
```
GET /api/products?search=từ-khóa&category=danh-mục&minPrice=0&maxPrice=1000000
```

## 🎉 **Kết Quả**

Tính năng tìm kiếm đã hoạt động hoàn hảo với:
- ✅ Gợi ý tự động
- ✅ Tìm kiếm đa trường
- ✅ Lưu lịch sử
- ✅ Responsive design
- ✅ API hoạt động ổn định

**Bây giờ bạn có thể tìm kiếm sản phẩm một cách dễ dàng và nhanh chóng!** 🎯
