# Tính Năng Tìm Kiếm Sản Phẩm

## Tổng Quan
Hệ thống tìm kiếm sản phẩm đã được cải thiện với nhiều tính năng nâng cao để giúp khách hàng dễ dàng tìm thấy sản phẩm mong muốn.

## Các Tính Năng Chính

### 1. Tìm Kiếm Thông Minh với Gợi Ý Tự Động
- **Vị trí**: Header (desktop) và trang sản phẩm
- **Chức năng**: 
  - Gợi ý sản phẩm, danh mục, thương hiệu khi gõ
  - Lưu lịch sử tìm kiếm gần đây
  - Điều hướng bằng phím mũi tên và Enter
- **API**: `/api/search/suggestions`

### 2. Tìm Kiếm Nâng Cao
- **Vị trí**: Trang sản phẩm và trang tìm kiếm
- **Bộ lọc có sẵn**:
  - Từ khóa tìm kiếm
  - Danh mục sản phẩm
  - Danh mục con
  - Khoảng giá (từ - đến)
  - Đánh giá (1-5 sao)
  - Sắp xếp (mới nhất, giá, đánh giá, tên)
  - Trạng thái (còn hàng, nổi bật, flash sale)

### 3. Trang Tìm Kiếm Chuyên Dụng
- **URL**: `/search?q=từ-khóa`
- **Tính năng**:
  - Hiển thị kết quả tìm kiếm chi tiết
  - Bộ lọc động
  - Phân trang
  - Thống kê kết quả

### 4. Tìm Kiếm Nhanh Trang Chủ
- **Vị trí**: Trang chủ
- **Tính năng**:
  - Thanh tìm kiếm lớn
  - Tìm kiếm phổ biến
  - Danh mục nhanh
  - Lưu lịch sử

## Cách Sử Dụng

### Tìm Kiếm Cơ Bản
1. Gõ từ khóa vào thanh tìm kiếm
2. Chọn từ gợi ý hoặc nhấn Enter
3. Xem kết quả trên trang tìm kiếm

### Tìm Kiếm Nâng Cao
1. Nhấn nút "Bộ lọc" để mở panel
2. Chọn các tiêu chí lọc
3. Nhấn "Áp dụng bộ lọc"

### Tìm Kiếm Theo Danh Mục
1. Sử dụng các nút danh mục nhanh
2. Hoặc chọn từ dropdown danh mục
3. Kết hợp với các bộ lọc khác

## API Endpoints

### `/api/products`
- **Method**: GET
- **Parameters**:
  - `search`: Từ khóa tìm kiếm
  - `category`: Danh mục
  - `subcategory`: Danh mục con
  - `minPrice`, `maxPrice`: Khoảng giá
  - `minRating`, `maxRating`: Khoảng đánh giá
  - `sortBy`: Trường sắp xếp
  - `sortOrder`: Thứ tự (asc/desc)
  - `page`, `limit`: Phân trang
  - `isActive`, `inStock`, `isFeatured`, `isFlashSale`: Bộ lọc trạng thái

### `/api/search/suggestions`
- **Method**: GET
- **Parameters**:
  - `q`: Từ khóa tìm kiếm
  - `limit`: Số lượng gợi ý
- **Response**: Gợi ý sản phẩm, danh mục, thương hiệu

## Cải Tiến So Với Phiên Bản Cũ

### 1. Tìm Kiếm Thông Minh Hơn
- Tìm kiếm đa trường (tên, mô tả, tags, danh mục, thương hiệu)
- Hỗ trợ tìm kiếm nhiều từ khóa
- Gợi ý tự động với hình ảnh và giá

### 2. Giao Diện Tốt Hơn
- Responsive design cho mobile
- Tìm kiếm nhanh trên trang chủ
- Bộ lọc trực quan với tags

### 3. Trải Nghiệm Người Dùng
- Lưu lịch sử tìm kiếm
- Điều hướng bằng bàn phím
- Loading states và error handling

### 4. Hiệu Suất
- Debounce cho tìm kiếm
- Pagination cho kết quả lớn
- Caching cho gợi ý

## Cấu Trúc File

```
app/
├── api/
│   ├── products/route.ts (cải tiến)
│   └── search/suggestions/route.ts (mới)
├── search/page.tsx (mới)
└── page.tsx (cập nhật)

components/
├── search-suggestions.tsx (mới)
├── quick-search.tsx (mới)
├── advanced-search.tsx (cải tiến)
└── header.tsx (cập nhật)
```

## Tương Lai

### Tính Năng Có Thể Thêm
1. **Tìm kiếm bằng giọng nói**
2. **Tìm kiếm bằng hình ảnh**
3. **Gợi ý cá nhân hóa**
4. **Phân tích tìm kiếm**
5. **Tìm kiếm đa ngôn ngữ**

### Tối Ưu Hóa
1. **Elasticsearch** cho tìm kiếm nâng cao
2. **Redis** cho caching gợi ý
3. **Analytics** cho tracking tìm kiếm
4. **A/B Testing** cho UI/UX

## Kết Luận
Hệ thống tìm kiếm mới cung cấp trải nghiệm tìm kiếm toàn diện và thân thiện với người dùng, giúp khách hàng dễ dàng tìm thấy sản phẩm mong muốn một cách nhanh chóng và chính xác.
