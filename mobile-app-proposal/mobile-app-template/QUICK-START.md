# Quick Start Guide - Mobile App Development

Hướng dẫn nhanh để bắt đầu phát triển mobile app.

## 🚀 Bước 1: Setup Môi Trường

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn
- Git

### Cài đặt Expo CLI

```bash
npm install -g expo-cli
npm install -g eas-cli  # For building production apps
```

### Cài đặt iOS Simulator (Mac only)

```bash
# Xcode từ App Store
# Sau khi cài, mở terminal:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
```

### Cài đặt Android Studio

1. Download từ [developer.android.com](https://developer.android.com/studio)
2. Install Android SDK và emulator
3. Add to PATH:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## 📱 Bước 2: Khởi Tạo Project

### Tạo Expo project

```bash
# Option 1: Expo CLI (recommended)
npx create-expo-app mephuong-mobile --template blank-typescript

# Option 2: Expo with router (advanced)
npx create-expo-app mephuong-mobile --template tabs

cd mephuong-mobile
```

### Install Dependencies

```bash
# Core navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Navigation requirements
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# State & API
npm install @tanstack/react-query zustand axios

# Storage
npm install @react-native-async-storage/async-storage expo-secure-store

# UI Components
npm install react-native-paper react-native-vector-icons

# Maps & Location
npm install react-native-maps expo-location

# Camera & Media
npm install expo-camera expo-image-picker

# Forms
npm install react-hook-form zod @hookform/resolvers

# Notifications (optional)
npm install expo-notifications

# Utilities
npm install date-fns

# Types
npm install --save-dev @types/react @types/react-native
```

## 🏗️ Bước 3: Cấu Hình Project

### Tạo folder structure

```bash
mkdir -p src/{screens,components,services,navigation,store,hooks,utils,types,constants}
mkdir -p assets/{images,icons,fonts}

# Create basic files
touch src/App.tsx
touch src/services/api/client.ts
touch src/store/index.ts
touch app.json
```

### Setup TypeScript

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### Setup Babel

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```

## 🎨 Bước 4: Setup API Integration

### Copy API configuration

Copy file `src/services/api/client.ts` từ template:

```bash
# Copy từ mobile-app-template
cp ../mobile-app-template/src/services/api/client.ts src/services/api/
```

### Update API base URL

```typescript
// src/services/api/client.ts
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-domain.com/api'; // Production
```

### Setup React Query

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
    },
  },
});
```

### Wrap App with providers

```typescript
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from './config/queryClient';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

## 📱 Bước 5: Tạo Navigation

### App Navigator

```typescript
// src/navigation/AppNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '@/store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
```

### Main Navigator (Bottom Tabs)

```typescript
// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '@/screens/home/HomeScreen';
import ProductsScreen from '@/screens/products/ProductListScreen';
import CartScreen from '@/screens/cart/CartScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'store' : 'store-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## 🔐 Bước 6: Tạo Authentication Flow

### Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/services/api/auth';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login({ email, password });
      await SecureStore.setItemAsync('auth_token', data.token);
      set({ 
        user: data, 
        token: data.token, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

### Login Screen

```typescript
// src/screens/auth/LoginScreen.tsx
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      alert('Đăng nhập thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Đăng nhập</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button 
        mode="contained" 
        onPress={handleLogin}
        loading={isLoading}
        style={styles.button}
      >
        Đăng nhập
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
```

## 🏠 Bước 7: Tạo Home Screen

```typescript
// src/screens/home/HomeScreen.tsx
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';

export default function HomeScreen() {
  const { data, isLoading } = useProducts({ limit: 8 });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      {data?.data.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

## 🏃 Bước 8: Chạy App

### Start development server

```bash
npm start
```

### Run on iOS

```bash
# Open iOS simulator
npm run ios

# Or choose from menu
# Press 'i' in terminal
```

### Run on Android

```bash
# Open Android emulator first
npm run android

# Or choose from menu
# Press 'a' in terminal
```

### Run on physical device

1. Install **Expo Go** app từ App Store/Play Store
2. Scan QR code từ terminal
3. App sẽ load trên device

## 📦 Bước 9: Testing

### Unit tests

```bash
npm test
```

### Manual testing checklist

- [ ] Login/Register flow
- [ ] Home screen loads products
- [ ] Product detail view
- [ ] Add to cart
- [ ] Checkout flow
- [ ] Order history
- [ ] Profile settings
- [ ] Notifications

## 🚀 Bước 10: Build for Production

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configure build

```bash
eas build:configure
```

### Build for iOS

```bash
eas build --platform ios --profile production
```

### Build for Android

```bash
eas build --platform android --profile production
```

### Submit to stores

```bash
eas submit --platform ios
eas submit --platform android
```

## 📋 Next Steps

1. ✅ Implement remaining screens
2. ✅ Add push notifications
3. ✅ Setup analytics
4. ✅ Performance optimization
5. ✅ Beta testing
6. ✅ Launch!

---

## 🆘 Troubleshooting

### Metro bundler issues

```bash
npm start -- --reset-cache
```

### iOS build fails

```bash
cd ios && pod install && cd ..
```

### Android build fails

```bash
cd android && ./gradlew clean && cd ..
```

### Clear all caches

```bash
expo start -c
```

---

**Need help?** Check full documentation in `MOBILE-APP-PROPOSAL.md`

