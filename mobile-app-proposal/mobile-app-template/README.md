# Mê Phương Thị Thảo - Mobile App

React Native mobile application for the Mê Phương Thị Thảo meat shop e-commerce platform.

## 📱 Project Overview

Cross-platform mobile app (iOS + Android) built with React Native and Expo, connected to the existing web backend API.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio emulator
- Physical device with Expo Go app

### Installation

```bash
# Clone repository (khi project sẵn sàng)
# git clone [repository-url]

# Navigate to project
cd mobile-app-template

# Install dependencies
npm install

# Start development server
npm start

# Or run on specific platform
npm run ios
npm run android
```

## 📁 Project Structure

```
mobile-app-template/
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── VerifyEmailScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── products/
│   │   │   ├── ProductListScreen.tsx
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   └── ProductSearchScreen.tsx
│   │   ├── cart/
│   │   │   └── CartScreen.tsx
│   │   ├── checkout/
│   │   │   └── CheckoutScreen.tsx
│   │   ├── orders/
│   │   │   ├── OrderListScreen.tsx
│   │   │   └── OrderDetailScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   ├── loyalty/
│   │   │   └── LoyaltyScreen.tsx
│   │   ├── wishlist/
│   │   │   └── WishlistScreen.tsx
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.tsx
│   │   └── stores/
│   │       └── StoreLocationsScreen.tsx
│   │
│   ├── components/        # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductImage.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── StockBadge.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   └── ReviewList.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── QuantitySelector.tsx
│   │   ├── order/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderStatusBadge.tsx
│   │   │   └── OrderTracking.tsx
│   │   ├── loyalty/
│   │   │   ├── LoyaltyTierCard.tsx
│   │   │   ├── PointsDisplay.tsx
│   │   │   └── PointsHistory.tsx
│   │   └── navigation/
│   │       ├── TabNavigator.tsx
│   │       ├── StackNavigator.tsx
│   │       └── Header.tsx
│   │
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   ├── StackNavigator.tsx
│   │   └── types.ts
│   │
│   ├── services/          # API & external services
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── products.ts
│   │   │   ├── auth.ts
│   │   │   ├── cart.ts
│   │   │   ├── orders.ts
│   │   │   ├── loyalty.ts
│   │   │   ├── notifications.ts
│   │   │   ├── wishlist.ts
│   │   │   └── stores.ts
│   │   ├── storage/
│   │   │   ├── AsyncStorage.service.ts
│   │   │   └── SecureStorage.service.ts
│   │   ├── notifications/
│   │   │   ├── PushNotifications.service.ts
│   │   │   └── LocalNotifications.service.ts
│   │   ├── location/
│   │   │   └── LocationService.ts
│   │   └── camera/
│   │       └── CameraService.ts
│   │
│   ├── store/             # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   ├── productStore.ts
│   │   ├── notificationStore.ts
│   │   └── index.ts
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useNotifications.ts
│   │   └── useDebounce.ts
│   │
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── utils/             # Helper functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── vietnamese.ts
│   │
│   ├── types/             # TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── navigation.types.ts
│   │
│   └── constants/         # App constants
│       ├── colors.ts
│       ├── sizes.ts
│       ├── strings.ts
│       └── config.ts
│
├── assets/                # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── splash/
│
├── App.tsx                # Root component
├── app.json               # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── .env.example
```

## 🛠️ Tech Stack

### Core
- **React Native**: 0.72+
- **Expo**: 49+
- **TypeScript**: 5.0+

### Navigation
- **@react-navigation/native**: 6.x
- **@react-navigation/bottom-tabs**: 6.x
- **@react-navigation/stack**: 6.x

### State Management
- **Zustand**: 4.x (lightweight state management)
- **@tanstack/react-query**: 5.x (server state & caching)

### UI Components
- **react-native-paper**: Material Design components
- **react-native-vector-icons**: Icons library

### Forms & Validation
- **react-hook-form**: Form handling
- **zod**: Schema validation

### HTTP Client
- **axios**: HTTP requests
- **@tanstack/react-query**: Caching & sync

### Storage
- **@react-native-async-storage/async-storage**: Local storage
- **expo-secure-store**: Secure storage for tokens

### Notifications
- **@react-native-firebase/app**: Firebase integration
- **@react-native-firebase/messaging**: Push notifications

### Location & Maps
- **react-native-maps**: Google Maps integration
- **expo-location**: Location services

### Media
- **expo-image-picker**: Camera & photo picker
- **expo-camera**: Camera access

### Authentication
- **expo-local-authentication**: Biometric auth

### Utilities
- **date-fns**: Date formatting
- **react-native-mmkv**: Fast storage (optional)

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```bash
# API Configuration
API_BASE_URL=https://your-domain.com/api
API_TIMEOUT=30000

# App Configuration
APP_NAME=Mê Phương Thị Thảo
APP_VERSION=1.0.0

# Firebase (optional)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CRASHLYTICS=true
ENABLE_PUSH_NOTIFICATIONS=true
```

### App Configuration (app.json)

```json
{
  "expo": {
    "name": "Mê Phương Thị Thảo",
    "slug": "mephuong-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mephuong.mobile",
      "infoPlist": {
        "NSCameraUsageDescription": "Allow camera access to upload product photos",
        "NSLocationWhenInUseUsageDescription": "Allow location to find nearby stores"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.mephuong.mobile",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-location",
      "expo-secure-store",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging"
    ]
  }
}
```

## 🏃 Development Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Build for production
npm run build:ios
npm run build:android

# Test
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📚 Key Features Implementation

### 1. Authentication Flow

```typescript
// src/services/api/auth.ts
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
};

// src/store/authStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    const data = await authService.login(email, password);
    await SecureStorage.set('token', data.token);
    set({ user: data, token: data.token, isLoading: false });
  },
}));
```

### 2. Product List with React Query

```typescript
// src/hooks/useProducts.ts
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// src/screens/products/ProductListScreen.tsx
export const ProductListScreen = () => {
  const { data, isLoading } = useProducts(filters);
  
  return (
    <FlatList
      data={data?.products}
      renderItem={({ item }) => <ProductCard product={item} />}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
};
```

### 3. Cart Management

```typescript
// src/store/cartStore.ts
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const existing = get().items.find(i => i.productId === product.id);
    if (existing) {
      set({ items: get().items.map(i => 
        i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
      )});
    } else {
      set({ items: [...get().items, { product, quantity: 1 }] });
    }
    cartService.sync(get().items);
  },
}));
```

### 4. Push Notifications

```typescript
// src/services/notifications/PushNotifications.service.ts
export class PushNotificationService {
  static async registerForPushNotifications() {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') return;
    
    const token = await Notifications.getExpoPushTokenAsync();
    await apiClient.post('/users/push-token', { token });
  }
  
  static setupListeners() {
    Notifications.addNotificationReceivedListener(notification => {
      NotificationStore.handleNotification(notification);
    });
  }
}
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Building & Deployment

### iOS

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler cache issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **iOS build fails**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build fails**
   - Clean gradle: `cd android && ./gradlew clean`
   - Check Java version: Should be Java 17+

## 📖 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Create Pull Request

## 📄 License

Proprietary - All rights reserved

---

**Version**: 1.0.0  
**Last Updated**: [Date]  
**Maintained by**: Mê Phương Thị Thảo Dev Team

