# API Integration Guide

Hướng dẫn tích hợp API từ web app vào mobile app.

## 📋 API Base Configuration

### 1. API Client Setup

Tạo file `src/services/api/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          await SecureStore.deleteItemAsync('auth_token');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  get = <T = any>(url: string, config?: any) => 
    this.client.get<T>(url, config);
  
  post = <T = any>(url: string, data?: any, config?: any) => 
    this.client.post<T>(url, data, config);
  
  put = <T = any>(url: string, data?: any, config?: any) => 
    this.client.put<T>(url, data, config);
  
  patch = <T = any>(url: string, data?: any, config?: any) => 
    this.client.patch<T>(url, data, config);
  
  delete = <T = any>(url: string, config?: any) => 
    this.client.delete<T>(url, config);
}

export const apiClient = new ApiClient();
```

## 🔐 Authentication API

### Login

```typescript
// src/services/api/auth.ts
import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
```

### Usage with React Query

```typescript
// src/hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '@/services/api/auth';
import * as SecureStore from 'expo-secure-store';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('auth_token', data.token);
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: !!SecureStore.getItemAsync('auth_token'),
  });
};
```

## 📦 Products API

### Product List

```typescript
// src/services/api/products.ts
export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  category?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isFlashSale: boolean;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export const productService = {
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<ProductsResponse>(`/products?${params}`);
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  searchSuggestions: async (query: string): Promise<any> => {
    const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};
```

### Usage Example

```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productService, ProductFilters } from '@/services/api/products';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    keepPreviousData: true,
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};
```

## 🛒 Cart API

```typescript
// src/services/api/cart.ts
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  originalPrice?: number;
  discount?: number;
}

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const response = await apiClient.get('/cart');
    return response.data.items;
  },

  addToCart: async (item: Partial<CartItem>): Promise<CartItem> => {
    const response = await apiClient.post('/cart', item);
    return response.data.item;
  },

  updateCartItem: async (id: number, quantity: number): Promise<CartItem> => {
    const response = await apiClient.put(`/cart/${id}`, { quantity });
    return response.data.item;
  },

  removeFromCart: async (id: number): Promise<void> => {
    await apiClient.delete(`/cart/${id}`);
  },

  clearCart: async (): Promise<void> => {
    const items = await cartService.getCart();
    await Promise.all(items.map(item => cartService.removeFromCart(item.id)));
  },
};
```

## 📦 Orders API

```typescript
// src/services/api/orders.ts
export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: number;
  total: number;
  name: string;
  phone: string;
  address: string;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams(params as any);
    const response = await apiClient.get(`/account/orders?${queryParams}`);
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/account/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: {
    items: any[];
    total: number;
    name: string;
    phone: string;
    address: string;
    note?: string;
    paymentMethod: string;
    discountCodeId?: number;
  }): Promise<Order> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },
};
```

## 🎁 Loyalty API

```typescript
// src/services/api/loyalty.ts
export interface LoyaltyInfo {
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  tierBenefits: {
    name: string;
    discount: number;
    freeShipping: boolean;
    prioritySupport: boolean;
    birthdayBonus: number;
  };
  nextTier?: {
    tier: string;
    minPoints: number;
  };
  pointsToNextTier: number;
  recentTransactions: any[];
}

export const loyaltyService = {
  getLoyalty: async (): Promise<LoyaltyInfo> => {
    const response = await apiClient.get('/loyalty');
    return response.data.data;
  },

  redeemPoints: async (points: number, description: string): Promise<void> => {
    await apiClient.put('/loyalty', { points, description });
  },
};
```

## 🔔 Notifications API

```typescript
// src/services/api/notifications.ts
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'LOYALTY';
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    unreadOnly?: boolean;
  }): Promise<any> => {
    const queryParams = new URLSearchParams(params as any);
    const response = await apiClient.get(`/notifications?${queryParams}`);
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/notifications/${id}`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/mark-all-read');
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await notificationService.getNotifications({ unreadOnly: true, limit: 1 });
    return response.data.unreadCount;
  },
};
```

## 💳 VNPay Integration

```typescript
// src/services/api/payment.ts
export const paymentService = {
  createVNPayPayment: async (orderId: number, amount: number): Promise<{ paymentUrl: string }> => {
    const response = await apiClient.post('/vnpay/create-payment', {
      orderId,
      amount,
    });
    return response.data;
  },

  // Handle VNPay return (already implemented in web)
  // Mobile app just redirects to payment URL
};
```

## 📍 Store Locations API

```typescript
// src/services/api/stores.ts
export interface StoreLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
}

export const storeService = {
  getStores: async (): Promise<StoreLocation[]> => {
    const response = await apiClient.get('/store-location');
    return response.data;
  },
};
```

## 🔍 Search with Vietnamese Support

API đã hỗ trợ tìm kiếm tiếng Việt có dấu/không dấu:

```typescript
// Usage example
const { data } = useQuery({
  queryKey: ['products', 'search', searchQuery],
  queryFn: () => productService.getProducts({ search: searchQuery }),
});

// Works with:
// "thịt heo", "thit heo", "THỊT HEO" - all same results
```

## 🔄 Error Handling

```typescript
// src/utils/errorHandler.ts
import { AxiosError } from 'axios';

export const handleApiError = (error: AxiosError): string => {
  if (!error.response) {
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
  }

  const status = error.response.status;
  const message = (error.response.data as any)?.error;

  switch (status) {
    case 400:
      return message || 'Dữ liệu không hợp lệ';
    case 401:
      return 'Phiên đăng nhập đã hết hạn';
    case 403:
      return 'Bạn không có quyền truy cập';
    case 404:
      return 'Không tìm thấy';
    case 429:
      return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
    case 500:
      return 'Lỗi server. Vui lòng thử lại sau.';
    default:
      return message || 'Đã xảy ra lỗi';
  }
};

// Usage in component
try {
  await orderService.createOrder(data);
} catch (error) {
  const message = handleApiError(error as AxiosError);
  Alert.alert('Lỗi', message);
}
```

## 🌐 Offline Support Strategy

### 1. React Query Configuration

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst', // Try cache first
    },
  },
});
```

### 2. Persist Cache

```typescript
// src/utils/cacheManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client-storage';
import { queryClient } from '@/config/queryClient';

persistQueryClient({
  queryClient,
  persister: {
    save: async (key, value) => {
      await AsyncStorage.setItem(key, value);
    },
    restore: async (key) => {
      return await AsyncStorage.getItem(key);
    },
    remove: async (key) => {
      await AsyncStorage.removeItem(key);
    },
  },
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});
```

## 📊 API Usage Summary

| Endpoint | Method | Auth Required | Cached | Use Case |
|----------|--------|--------------|--------|----------|
| `/auth/login` | POST | No | No | Login user |
| `/auth/register` | POST | No | No | Register user |
| `/auth/me` | GET | Yes | Yes | Get current user |
| `/products` | GET | No | Yes | List products |
| `/products/[id]` | GET | No | Yes | Product detail |
| `/cart` | GET | Yes | No | Get cart items |
| `/cart` | POST | Yes | No | Add to cart |
| `/account/orders` | GET | Yes | Yes | List orders |
| `/orders` | POST | Yes | No | Create order |
| `/loyalty` | GET | Yes | Yes | Loyalty info |
| `/notifications` | GET | Yes | Yes | Get notifications |
| `/store-location` | GET | No | Yes | Store locations |

---

**Note**: Tất cả API endpoints đã sẵn sàng từ web app, chỉ cần tích hợp vào mobile app.

