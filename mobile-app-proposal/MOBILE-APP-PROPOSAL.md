# Đề Xuất Tạo Mobile App cho Mê Phương Thị Thảo

## 📱 Tổng Quan Dự Án

Dự án web hiện tại là một **e-commerce platform** hoàn chỉnh cho cửa hàng thịt "Mê Phương Thị Thảo" với các tính năng:
- Quản lý sản phẩm (fresh meat, processed products)
- Đặt hàng & Thanh toán (COD + VNPay)
- Hệ thống điểm thưởng Loyalty
- Thông báo real-time
- Quản lý giỏ hàng & Wishlist
- Review & Rating sản phẩm
- Store location với Google Maps
- Admin dashboard

## 🎯 Mục Tiêu Mobile App

### Lợi Ích
1. **Trải nghiệm tốt hơn** - App native cung cấp UX mượt mà hơn web
2. **Push notifications** - Thông báo trực tiếp đến điện thoại
3. **Offline support** - Xem lại sản phẩm đã xem khi không có internet
4. **Camera integration** - Upload ảnh review dễ dàng
5. **Location-based services** - Tự động phát hiện cửa hàng gần nhất
6. **Quick checkout** - Thanh toán nhanh với biometric
7. **Loyalty card digital** - Không cần mang thẻ vật lý

## 🏗️ Kiến Trúc Đề Xuất

### **Option 1: React Native (Cross-platform) ⭐ Ưu tiên**

#### Tech Stack
- **Framework**: React Native (Expo hoặc Bare React Native)
- **State Management**: Redux Toolkit hoặc Zustand
- **Navigation**: React Navigation v6
- **API Client**: Axios + React Query / SWR
- **UI Library**: React Native Paper, NativeBase hoặc Tamagui
- **Forms**: Formik + Yup
- **Storage**: AsyncStorage + React Native MMKV
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Maps**: React Native Maps
- **Camera**: React Native Image Picker
- **Authentication**: JWT với secure storage

#### Ưu điểm
✅ Develop một lần, chạy iOS + Android  
✅ Codebase dễ maintain  
✅ Cộng đồng lớn, nhiều thư viện  
✅ Hot reload nhanh  
✅ Team hiện có thể làm web, dễ chuyển sang React Native  
✅ Performance tốt cho e-commerce app  

#### Nhược điểm
⚠️ Một số native module phải config thêm  
⚠️ Build time lâu hơn native  

### **Option 2: Flutter**

#### Tech Stack
- **Framework**: Flutter 3.x
- **State Management**: Provider, Riverpod hoặc Bloc
- **Navigation**: Go Router
- **API Client**: Dio + Riverpod Notifier
- **UI**: Material Design 3 + Custom widgets
- **Storage**: Shared Preferences + Hive
- **Push Notifications**: Firebase Cloud Messaging
- **Maps**: Google Maps Flutter
- **Camera**: Image Picker

#### Ưu điểm
✅ Performance gần như native  
✅ UI đẹp, smooth animations  
✅ Fast hot reload  
✅ Single codebase cho iOS + Android  

#### Nhược điểm
⚠️ Phải học Dart language  
⚠️ Team phải chuyển sang Flutter ecosystem  
⚠️ Ít developer Flutter hơn React Native tại VN  

### **Option 3: Native (Swift + Kotlin)**

#### Tech Stack
- **iOS**: Swift, SwiftUI
- **Android**: Kotlin, Jetpack Compose
- **Backend API**: Reuse API hiện có

#### Ưu điểm
✅ Best performance  
✅ Access to tất cả platform features  
✅ Native UX/UI  

#### Nhược điểm
❌ Phải develop 2 codebase riêng  
❌ Cost cao (2x development time)  
❌ Maintain khó hơn  

---

## 📋 Phân Tích API Hiện Có

Web app đã có **RESTful API đầy đủ**, mobile app chỉ cần connect vào:

### Authentication
- ✅ `POST /api/auth/register` - Đăng ký
- ✅ `POST /api/auth/login` - Đăng nhập
- ✅ `POST /api/auth/forgot-password` - Quên mật khẩu
- ✅ `POST /api/auth/reset-password` - Reset mật khẩu
- ✅ `GET /api/auth/me` - Lấy thông tin user

### Products
- ✅ `GET /api/products` - Danh sách sản phẩm (pagination, filters)
- ✅ `GET /api/products/[id]` - Chi tiết sản phẩm
- ✅ `POST /api/products` - Tạo sản phẩm (admin only)
- ✅ `PUT /api/products/[id]` - Update sản phẩm

### Search
- ✅ `GET /api/search/suggestions?q=...` - Search suggestions
- ✅ Search tiếng Việt có dấu/không dấu

### Cart
- ✅ `GET /api/cart` - Lấy giỏ hàng
- ✅ `POST /api/cart` - Thêm vào giỏ
- ✅ `PUT /api/cart/[id]` - Update số lượng
- ✅ `DELETE /api/cart/[id]` - Xóa item

### Orders
- ✅ `GET /api/account/orders` - Danh sách đơn hàng
- ✅ `GET /api/account/orders/[orderId]` - Chi tiết đơn
- ✅ `POST /api/orders` - Tạo đơn hàng
- ✅ Stock management tự động

### Payment
- ✅ `POST /api/vnpay/create-payment` - Tạo VNPay payment
- ✅ `POST /api/vnpay/ipn` - Callback từ VNPay
- ✅ COD support

### Loyalty
- ✅ `GET /api/loyalty` - Xem điểm thưởng
- ✅ `POST /api/loyalty` - Earn points
- ✅ `PUT /api/loyalty` - Redeem points
- ✅ Tiers: BRONZE → SILVER → GOLD → PLATINUM

### Notifications
- ✅ `GET /api/notifications` - Danh sách thông báo
- ✅ `POST /api/notifications/[id]` - Mark as read
- ✅ `PATCH /api/notifications/mark-all-read`

### Wishlist
- ✅ `GET /api/account/wishlist`
- ✅ `POST /api/account/wishlist`
- ✅ `DELETE /api/account/wishlist/[id]`

### Store Location
- ✅ `GET /api/store-location`

### Reviews
- ✅ `POST /api/products/[id]/reviews` - Tạo review
- ✅ Rating 1-5 sao

---

## 🎨 Wireframes & Features

### Screen Flow

```
🔐 Onboarding
  ↓
🔑 Login/Register
  ↓
🏠 Home
  ├─ Hero banner
  ├─ Featured products
  ├─ Flash sale
  ├─ Trending products
  ├─ Quick search
  └─ Categories
  
🔍 Products
  ├─ List/Browse
  ├─ Filters (category, price, rating)
  ├─ Sort
  └─ Detail
  
  └─ 📄 Product Detail
     ├─ Image gallery
     ├─ Price & discount
     ├─ Stock status
     ├─ Add to cart
     ├─ Add to wishlist
     ├─ Reviews & ratings
     ├─ Description
     ├─ Storage & expiry info
     └─ Recommendations
  
🛒 Cart
  ├─ Item list
  ├─ Quantity adjust
  ├─ Total calculation
  ├─ Apply discount code
  └─ Checkout button
  
💳 Checkout
  ├─ Delivery info
  ├─ Payment method (COD/VNPay)
  ├─ Order summary
  ├─ Loyalty points info
  └─ Place order
  
📦 Orders
  ├─ Order list (tabs: All, Pending, Confirmed, Shipping, Delivered)
  ├─ Order detail
  ├─ Tracking
  └─ Re-order
  
👤 Profile
  ├─ Account info
  ├─ Orders history
  ├─ Wishlist
  ├─ Loyalty program
  ├─ Notifications
  ├─ Store locations
  ├─ Settings
  └─ Logout
  
⭐ Loyalty
  ├─ Current tier & points
  ├─ Progress bar to next tier
  ├─ Tier benefits
  ├─ Transaction history
  └─ Redeem points
  
🔔 Notifications
  ├─ List (order updates, promotions)
  ├─ Mark all read
  └─ Deep links to order/product
  
📍 Store Locations
  └─ Map view with markers
  
📧 Account Settings
  ├─ Edit profile
  ├─ Change password
  ├─ Address book
  ├─ Notification settings
  └─ About
```

### Mobile-Specific Features

#### 1. **Push Notifications**
- Order status updates
- Flash sale alerts
- Promotion codes
- Loyalty points earned
- Stock replenished

#### 2. **Quick Actions**
- Voice search
- Barcode scanner (future)
- Quick re-order
- Share product

#### 3. **Offline Support**
- Cache products viewed
- Offline cart
- Browse history

#### 4. **Location Services**
- Detect nearby stores
- Delivery time estimation
- Auto-fill address

#### 5. **Biometric Auth**
- Face ID / Touch ID login
- Secure payments

#### 6. **Camera Integration**
- Upload product photos
- Review with photos

---

## 📅 Roadmap & Timeline

### Phase 1: Setup & Core Features (4-6 weeks)
**Mục tiêu**: MVP working app

- [ ] Setup React Native project
- [ ] UI/UX design implementation
- [ ] Authentication flow
- [ ] Home screen with products
- [ ] Product detail
- [ ] Cart & Checkout
- [ ] Basic orders list
- [ ] API integration

### Phase 2: Advanced Features (3-4 weeks)
**Mục tiêu**: Full-featured app

- [ ] Search & filters
- [ ] Wishlist
- [ ] Reviews & ratings
- [ ] Store locations with map
- [ ] Loyalty program UI
- [ ] Notifications
- [ ] Profile & settings
- [ ] Address management

### Phase 3: Mobile-Optimized (2-3 weeks)
**Mục tiêu**: Mobile-first experience

- [ ] Push notifications (FCM)
- [ ] Offline support
- [ ] Image caching
- [ ] Biometric auth
- [ ] Camera integration
- [ ] Deep linking
- [ ] Share functionality

### Phase 4: Polish & Launch (2 weeks)
**Mục tiêu**: Production-ready

- [ ] Testing & bug fixes
- [ ] Performance optimization
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Beta testing
- [ ] Launch campaign

**Total estimated time**: 11-15 weeks (3-4 months)

---

## 💰 Cost Estimate

### Development Team
- **1 React Native Developer** (senior): $1,500-2,000/tháng × 4 tháng = **$6,000-8,000**
- **1 UI/UX Designer** (optional): $1,000/tháng × 2 tháng = **$2,000**
- **1 QA Tester** (part-time): $500/tháng × 3 tháng = **$1,500**

### Tools & Services
- App Store Developer Account: **$99/năm** (iOS)
- Google Play Developer Account: **$25 một lần** (Android)
- Firebase (FCM, Analytics): **Free tier** đủ dùng
- Code signing certificates: **Free** với managed signing

### Infrastructure
- Backend API: **Reuse hiện có** (không tốn thêm)
- CDN cho images: Có thể cần scale up

**Total estimated cost**: **$9,500-11,500** (với team external)

**Nếu team internal**: Chỉ cần thời gian development, không cần chi phí thuê ngoài.

---

## 🚀 Recommended Approach

### **Khuyến nghị: React Native với Expo**

**Lý do:**
1. ✅ Web codebase đã tốt, chỉ cần thêm mobile layer
2. ✅ Team có thể tận dụng React skills
3. ✅ Expo giúp development nhanh hơn
4. ✅ Easier deployment & updates
5. ✅ Over-the-air updates (không cần re-submit app)

### Implementation Plan

#### Week 1-2: Setup & Design
```bash
# Initialize project
npx create-expo-app mephuong-mobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install axios react-query zustand
npm install expo-location expo-camera expo-image-picker
npm install @react-native-async-storage/async-storage
npm install @react-native-firebase/app @react-native-firebase/messaging
npm install react-native-maps
```

#### Week 3-6: Core Features
- Authentication screens
- Home, Products, Cart, Checkout
- API integration layer
- State management setup

#### Week 7-10: Advanced Features
- Search & filters
- Wishlist & loyalty
- Notifications
- Profile & settings

#### Week 11-12: Mobile Features
- Push notifications
- Biometric auth
- Camera integration
- Offline support

#### Week 13-14: Polish & Launch
- Testing
- Performance optimization
- App Store submissions
- Launch

---

## 📱 Technical Architecture

### Folder Structure
```
mephuong-mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── profile/
│   │   └── loyalty/
│   ├── components/
│   │   ├── common/
│   │   ├── product/
│   │   └── cart/
│   ├── navigation/
│   ├── services/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── storage/
│   │   └── notifications/
│   ├── store/
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   └── productsSlice.ts
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── constants/
├── assets/
├── App.tsx
└── app.json
```

### State Management Flow
```
API Response
  ↓
React Query (cache, sync, offline)
  ↓
Zustand/Redux (global state)
  ↓
Components (UI)
```

### API Integration Pattern
```typescript
// services/api/client.ts
const apiClient = axios.create({
  baseURL: 'https://your-domain.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// React Query hook
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get('/products').then(res => res.data),
  });
};
```

---

## 🔒 Security Considerations

1. **Token Storage**: Secure storage với expo-secure-store
2. **API Security**: HTTPS only, certificate pinning
3. **Input Validation**: Validate all user inputs
4. **Deep Linking**: Validate URLs to prevent phishing
5. **Biometric**: Use Face ID / Touch ID for sensitive actions
6. **Code Obfuscation**: Protect against reverse engineering

---

## 📊 Success Metrics

### KPIs
- **App Downloads**: Target 1,000 downloads/tháng đầu
- **Daily Active Users (DAU)**: 20% of downloads
- **Conversion Rate**: 5% orders từ app
- **Retention Rate**: 30% D7 retention
- **Average Order Value**: Maintain or increase vs web
- **Push Notification Open Rate**: >25%

### Analytics
- Firebase Analytics
- User journey tracking
- Crash reporting (Firebase Crashlytics)
- Performance monitoring

---

## 🎯 Next Steps

### Immediate Actions (Week 1)
1. ✅ **Approve this proposal**
2. ⏳ Setup React Native project
3. ⏳ Design UI mockups
4. ⏳ Setup CI/CD pipeline
5. ⏳ Configure Firebase project

### Team Preparation
- Assign 1-2 developers
- Training on React Native nếu cần
- Setup development environment
- Create app icons & splash screen

### Backend Preparation
- API documentation hoàn chỉnh
- Test API endpoints
- Setup CORS cho mobile domains
- Monitor API performance

---

## 📚 Resources & Documentation

### Learning Resources
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)

### Design Resources
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [NativeBase](https://nativebase.io/)
- [Figma Mobile Templates](https://www.figma.com/community)

---

## ✅ Decision Matrix

| Criteria | React Native | Flutter | Native |
|----------|--------------|---------|--------|
| Development Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Code Reusability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| Maintenance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Cost | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Team Skills Match | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Recommendation** | **✅ BEST** | ❌ | ❌ |

---

## 📞 Contact & Questions

Nếu có câu hỏi hoặc muốn thảo luận thêm, vui lòng liên hệ:
- Technical Lead: [Name]
- Product Manager: [Name]
- Design Lead: [Name]

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Status**: ✅ Ready for Review

