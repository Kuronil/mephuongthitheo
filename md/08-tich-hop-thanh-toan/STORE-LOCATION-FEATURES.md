# Tính năng Xác định Vị trí Cửa hàng và Hiển thị Kết quả trên Bản đồ

## Tổng quan

Dự án đã được nâng cấp với hệ thống quản lý vị trí cửa hàng hoàn chỉnh, bao gồm:

- ✅ **API quản lý vị trí cửa hàng** - Endpoint để lấy và cập nhật thông tin
- ✅ **Xác định vị trí người dùng** - Tự động lấy vị trí hiện tại
- ✅ **Tính khoảng cách** - Hiển thị khoảng cách và thời gian di chuyển
- ✅ **Bản đồ tương tác** - Marker, đường kết nối và thông tin chi tiết
- ✅ **Trang quản lý admin** - Giao diện để cập nhật thông tin cửa hàng
- ✅ **Component tái sử dụng** - StoreLocationCard để hiển thị thông tin

## Cấu trúc Files

### API Endpoints
```
app/api/store-location/route.ts
```
- `GET /api/store-location` - Lấy thông tin cửa hàng
- `PUT /api/store-location` - Cập nhật thông tin cửa hàng (admin only)

### Components
```
components/google-map.tsx
components/store-location-card.tsx
```
- **GoogleMap**: Component bản đồ với tính năng tương tác
- **StoreLocationCard**: Card hiển thị thông tin cửa hàng

### Pages
```
app/contact/page.tsx                    # Trang liên hệ với bản đồ tương tác
app/admin/store-location/page.tsx      # Trang quản lý admin
app/store-location-demo/page.tsx       # Trang demo các tính năng
```

## Tính năng chính

### 1. GoogleMap Component

#### Props
```typescript
interface GoogleMapProps {
  address: string                    // Địa chỉ cửa hàng
  className?: string                 // CSS class
  showUserLocation?: boolean        // Hiển thị vị trí người dùng
  showDistance?: boolean            // Hiển thị khoảng cách
}
```

#### Tính năng
- **Geocoding**: Chuyển đổi địa chỉ thành tọa độ
- **User Location**: Xác định vị trí người dùng qua GPS
- **Distance Calculation**: Tính khoảng cách và thời gian di chuyển
- **Interactive Markers**: Marker cho cửa hàng và vị trí người dùng
- **Route Line**: Đường kết nối giữa người dùng và cửa hàng
- **Info Window**: Popup hiển thị thông tin chi tiết
- **Fallback UI**: Giao diện thay thế khi không load được bản đồ

#### Sử dụng
```tsx
// Bản đồ cơ bản
<GoogleMap address="211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM" />

// Bản đồ tương tác
<GoogleMap 
  address="211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM"
  showUserLocation={true}
  showDistance={true}
/>
```

### 2. StoreLocationCard Component

#### Props
```typescript
interface StoreLocationCardProps {
  className?: string
  showMap?: boolean                 // Hiển thị bản đồ
  showUserLocation?: boolean        // Hiển thị vị trí người dùng
  showDistance?: boolean           // Hiển thị khoảng cách
}
```

#### Tính năng
- **Store Information**: Hiển thị thông tin cửa hàng
- **Working Hours**: Giờ làm việc và trạng thái mở/đóng
- **Services**: Danh sách dịch vụ
- **Action Buttons**: Gọi điện và chỉ đường
- **Map Integration**: Tích hợp GoogleMap component

#### Sử dụng
```tsx
// Card cơ bản
<StoreLocationCard />

// Card với bản đồ tương tác
<StoreLocationCard 
  showMap={true}
  showUserLocation={true}
  showDistance={true}
/>
```

### 3. API Store Location

#### GET /api/store-location
Lấy thông tin cửa hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Thịt Heo Mẹ Phương",
    "address": "211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM",
    "phone": "0902 759 466",
    "email": "support@mephuong.com",
    "coordinates": {
      "lat": 10.7769,
      "lng": 106.6309
    },
    "workingHours": {
      "monday": "8:00 - 18:00",
      "tuesday": "8:00 - 18:00",
      "wednesday": "8:00 - 18:00",
      "thursday": "8:00 - 18:00",
      "friday": "8:00 - 18:00",
      "saturday": "8:00 - 12:00",
      "sunday": "Nghỉ"
    },
    "services": [
      "Giao hàng tận nơi",
      "Thịt tươi ngon",
      "Đóng gói cẩn thận",
      "Hỗ trợ 24/7"
    ],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/store-location
Cập nhật thông tin cửa hàng (admin only)

**Request Body:**
```json
{
  "name": "Thịt Heo Mẹ Phương",
  "address": "211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM",
  "phone": "0902 759 466",
  "email": "support@mephuong.com",
  "coordinates": {
    "lat": 10.7769,
    "lng": 106.6309
  },
  "workingHours": {
    "monday": "8:00 - 18:00",
    "tuesday": "8:00 - 18:00",
    "wednesday": "8:00 - 18:00",
    "thursday": "8:00 - 18:00",
    "friday": "8:00 - 18:00",
    "saturday": "8:00 - 12:00",
    "sunday": "Nghỉ"
  },
  "services": [
    "Giao hàng tận nơi",
    "Thịt tươi ngon",
    "Đóng gói cẩn thận",
    "Hỗ trợ 24/7"
  ]
}
```

## Cách sử dụng

### 1. Trang Contact
Truy cập `/contact` để xem bản đồ tương tác với:
- Xác định vị trí người dùng
- Tính khoảng cách đến cửa hàng
- Hiển thị thông tin chi tiết

### 2. Trang Admin
Truy cập `/admin/store-location` để:
- Cập nhật thông tin cửa hàng
- Xem trước bản đồ
- Quản lý giờ làm việc và dịch vụ

### 3. Trang Demo
Truy cập `/store-location-demo` để:
- Xem tất cả tính năng
- Hướng dẫn sử dụng
- Test các component

## Cấu hình

### Google Maps API Key
Cần cấu hình API key trong file `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Permissions
- **Geolocation**: Cần permission để lấy vị trí người dùng
- **HTTPS**: Geolocation chỉ hoạt động trên HTTPS

## Tính năng nâng cao

### 1. Responsive Design
- Tối ưu cho mobile và desktop
- Fallback UI khi không load được bản đồ
- Touch-friendly controls

### 2. Error Handling
- Xử lý lỗi khi không có API key
- Fallback khi không có permission location
- Loading states và error messages

### 3. Performance
- Lazy loading Google Maps API
- Caching geocoding results
- Optimized re-renders

### 4. Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode

## Troubleshooting

### 1. Bản đồ không hiển thị
- Kiểm tra API key Google Maps
- Đảm bảo domain được whitelist
- Kiểm tra console errors

### 2. Không lấy được vị trí
- Kiểm tra HTTPS
- Yêu cầu permission từ user
- Fallback về địa chỉ IP

### 3. Tính khoảng cách không chính xác
- Kiểm tra địa chỉ cửa hàng
- Sử dụng tọa độ chính xác
- Kiểm tra Distance Matrix API quota

## Tương lai

### Tính năng có thể thêm:
- [ ] Multiple store locations
- [ ] Store finder với radius search
- [ ] Real-time traffic information
- [ ] Store hours với timezone
- [ ] Multi-language support
- [ ] Offline map support
- [ ] Store analytics và insights

---

**Lưu ý**: Đây là phiên bản demo với dữ liệu hardcode. Trong production, cần tích hợp với database thực tế và thêm authentication cho admin features.
