# Hướng dẫn Admin Panel - Quản lý Cửa hàng

## 🎯 **Tổng quan**

Admin panel đã được tích hợp hoàn chỉnh với hệ thống quản lý vị trí cửa hàng, bao gồm:

- ✅ **Dashboard tổng quan** với thông tin cửa hàng
- ✅ **Quản lý vị trí cửa hàng** với giao diện thân thiện
- ✅ **Bản đồ tương tác** với tính năng xác định vị trí
- ✅ **Thao tác nhanh** trong dashboard

## 🚀 **Cách truy cập**

### 1. **Admin Dashboard chính**
```
http://localhost:3000/admin
```

### 2. **Quản lý cửa hàng**
```
http://localhost:3000/admin/store-location
```
*Tự động redirect đến `/admin/store-location/overview`*

### 3. **Các trang con**
- **Tổng quan**: `/admin/store-location/overview`
- **Chỉnh sửa**: `/admin/store-location/edit`

## 📋 **Tính năng Dashboard**

### **Stats Cards**
- Tổng đơn hàng
- Doanh thu
- Số khách hàng
- Số sản phẩm

### **Thông tin cửa hàng**
- Card hiển thị thông tin cửa hàng
- Trạng thái mở/đóng
- Giờ làm việc
- Dịch vụ

### **Thao tác nhanh**
- Quản lý sản phẩm tươi
- Quản lý sản phẩm chế biến
- **Quản lý cửa hàng** (mới)
- Đơn hàng
- Kiểm kê kho
- Người dùng

## 🏪 **Quản lý Cửa hàng**

### **Trang Tổng quan** (`/admin/store-location/overview`)

#### **Trạng thái cửa hàng**
- ✅ **Trạng thái**: Đang mở / Đã đóng
- ⏰ **Giờ làm việc**: Hiển thị giờ làm việc hôm nay
- 🔄 **Cập nhật cuối**: Thời gian cập nhật gần nhất

#### **Thông tin cửa hàng**
- 📍 **Địa chỉ**
- 📞 **Số điện thoại**
- 📧 **Email**
- ⏰ **Giờ làm việc** (từng ngày)
- 🛍️ **Dịch vụ**

#### **Thao tác nhanh**
- 📞 **Gọi điện thoại cửa hàng**
- 📧 **Gửi email**
- 🗺️ **Mở trong Google Maps**
- ✏️ **Chỉnh sửa thông tin**

### **Trang Bản đồ** (`/admin/store-location/overview?tab=map`)

#### **Bản đồ tương tác**
- 🗺️ **Hiển thị vị trí cửa hàng**
- 📍 **Xác định vị trí admin**
- 📏 **Tính khoảng cách**
- 🛣️ **Đường kết nối**
- ℹ️ **Info window với thông tin chi tiết**

### **Trang Chỉnh sửa** (`/admin/store-location/edit`)

#### **Thông tin cơ bản**
- 🏪 **Tên cửa hàng**
- 📍 **Địa chỉ**
- 📞 **Số điện thoại**
- 📧 **Email**

#### **Giờ làm việc**
- Thứ 2 - Thứ 6: 8:00 - 18:00
- Thứ 7: 8:00 - 12:00
- Chủ nhật: Nghỉ

#### **Dịch vụ**
- ➕ **Thêm dịch vụ**
- ✏️ **Chỉnh sửa dịch vụ**
- 🗑️ **Xóa dịch vụ**

#### **Xem trước bản đồ**
- 🗺️ **Bản đồ real-time**
- 📍 **Marker cửa hàng**
- 🔄 **Tự động cập nhật khi thay đổi địa chỉ**

## 🔧 **API Endpoints**

### **GET /api/store-location**
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

### **PUT /api/store-location**
Cập nhật thông tin cửa hàng

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

## 🎨 **Components**

### **StoreLocationCard**
```tsx
<StoreLocationCard 
  showMap={false}           // Hiển thị bản đồ
  showUserLocation={true}   // Hiển thị vị trí người dùng
  showDistance={true}       // Hiển thị khoảng cách
  className="h-full"         // CSS class
/>
```

### **GoogleMap**
```tsx
<GoogleMap 
  address="211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM"
  className="aspect-video"
  showUserLocation={true}   // Xác định vị trí người dùng
  showDistance={true}        // Tính khoảng cách
/>
```

## 🔐 **Bảo mật**

### **Authentication**
- Hiện tại chưa có authentication thực tế
- Trong production cần thêm:
  - JWT token validation
  - Role-based access control
  - Admin permission check

### **API Security**
- Cần thêm middleware authentication
- Rate limiting
- Input validation

## 📱 **Responsive Design**

### **Mobile**
- Touch-friendly controls
- Optimized layout
- Swipe gestures

### **Desktop**
- Full feature set
- Keyboard shortcuts
- Multi-window support

## 🚀 **Cách sử dụng**

### **1. Truy cập Admin Dashboard**
```bash
# Khởi động server
npm run dev

# Truy cập admin
http://localhost:3000/admin
```

### **2. Quản lý cửa hàng**
1. Click nút **"Quản lý cửa hàng"** trong header
2. Hoặc click **"Quản lý cửa hàng"** trong thao tác nhanh
3. Xem tổng quan hoặc chỉnh sửa thông tin

### **3. Chỉnh sửa thông tin**
1. Vào trang tổng quan
2. Click **"Chỉnh sửa"**
3. Cập nhật thông tin
4. Click **"Lưu thay đổi"**

### **4. Xem bản đồ**
1. Vào trang tổng quan
2. Click tab **"Bản đồ"**
3. Test các tính năng tương tác

## 🔧 **Cấu hình**

### **Google Maps API**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### **Environment Variables**
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_key_here"
```

## 🐛 **Troubleshooting**

### **Bản đồ không hiển thị**
- Kiểm tra API key Google Maps
- Đảm bảo domain được whitelist
- Kiểm tra console errors

### **Không lấy được vị trí**
- Kiểm tra HTTPS
- Yêu cầu permission từ browser
- Fallback về địa chỉ IP

### **API không hoạt động**
- Kiểm tra server status
- Kiểm tra network connection
- Kiểm tra console errors

## 📈 **Tương lai**

### **Tính năng có thể thêm:**
- [ ] Multiple store locations
- [ ] Store analytics dashboard
- [ ] Real-time notifications
- [ ] Store performance metrics
- [ ] Customer location analytics
- [ ] Delivery zone management
- [ ] Store comparison tools

---

**Lưu ý**: Đây là phiên bản demo với dữ liệu hardcode. Trong production, cần tích hợp với database thực tế và thêm authentication đầy đủ.
