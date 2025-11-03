# Security Improvements Summary

## ✅ Completed Security Fixes

### 1. JWT Authentication System
- **Problem**: User authentication relied on client-provided `userId` in headers, which is highly insecure and can be easily manipulated.
- **Solution**: Implemented JWT (JSON Web Token) based authentication system.
  - Tokens are generated server-side with user ID, email, and admin status
  - Tokens are signed with a secret key
  - Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
  - Tokens are stored in HTTP-only cookies AND returned in response body (for client-side access)
  - Client must send token in `Authorization: Bearer <token>` header for API requests

**Files Modified:**
- `lib/auth.ts` - JWT token generation and verification utilities
- `lib/auth-middleware.ts` - Updated to verify JWT tokens instead of accepting userId from client
- `app/api/auth/login/route.ts` - Now generates and returns JWT token
- `app/api/auth/register/route.ts` - Now generates and returns JWT token
- `app/account/login/page.tsx` - Now saves token to localStorage
- `lib/api-client.ts` - New utility for making authenticated API requests

### 2. Admin Role Checks
- **Problem**: Admin routes had commented-out admin role verification, allowing any authenticated user to access admin functions.
- **Solution**: 
  - Created `authenticateAdmin()` function in auth-middleware
  - Updated all admin routes to use `authenticateAdmin()` instead of `authenticateUser()`
  - Removed all commented-out admin checks

**Files Modified:**
- `lib/auth-middleware.ts` - Added `authenticateAdmin()` function
- `app/api/admin/discount/route.ts` - Fixed admin authentication for all methods
- `app/api/admin/orders/route.ts` - Fixed admin authentication

### 3. Prisma Client Singleton
- **Problem**: Multiple files created new PrismaClient instances instead of using the singleton from `lib/prisma.ts`, leading to potential connection pool exhaustion.
- **Solution**: Updated all API routes to import and use the singleton Prisma client.

**Files Modified:**
- `app/api/discount/route.ts`
- `app/api/cart/route.ts`
- `app/api/account/wishlist/route.ts`
- `app/api/account/profile/route.ts`
- `app/api/account/orders/route.ts`
- `app/api/admin/discount/route.ts`
- `app/api/admin/orders/route.ts`
- And many more...

## 🔐 Environment Variables Required

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**⚠️ Important**: 
- `JWT_SECRET` MUST be changed in production to a strong, random string
- Never commit `.env` file to version control
- Use different secrets for development and production

## 📝 Usage Guide

### Making Authenticated API Requests

**Option 1: Use the API client utility (Recommended)**
```typescript
import { apiGet, apiPost } from '@/lib/api-client'

// GET request with automatic token
const data = await apiGet('/api/account/profile')

// POST request with automatic token
const result = await apiPost('/api/cart', { productId: 1, quantity: 2 })
```

**Option 2: Manual fetch with token**
```typescript
import { getToken } from '@/lib/auth'

const token = getToken()
const response = await fetch('/api/account/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Accessing Token on Client
```typescript
import { getToken, setToken, clearToken } from '@/lib/auth'

// Get token
const token = getToken()

// Set token (usually done after login)
setToken(token)

// Clear token (logout)
clearToken()
```

## ✅ Rate Limiting Implementation

**Status**: Completed for all authentication endpoints

Rate limiting has been implemented using an in-memory fixed window algorithm:
- **Login**: 5 requests per 60 seconds per IP
- **Register**: 5 requests per 60 seconds per IP  
- **Forgot Password**: 3 requests per 60 minutes per IP (stricter to prevent email spam)
- **Reset Password**: 5 requests per 15 minutes per IP
- **Verify Email**: 10 requests per 15 minutes per IP

When rate limit is exceeded:
- Returns HTTP 429 (Too Many Requests)
- Includes `Retry-After` header with seconds remaining
- Returns user-friendly Vietnamese error message

**Files Modified:**
- `lib/rate-limit.ts` - Rate limiting utility
- `app/api/auth/login/route.ts` - Rate limiting added
- `app/api/auth/register/route.ts` - Rate limiting added
- `app/api/auth/forgot-password/route.ts` - Rate limiting added
- `app/api/auth/reset-password/route.ts` - Rate limiting added
- `app/api/auth/verify-email/route.ts` - Rate limiting added

**Note**: For production at scale, consider using Redis-based rate limiting (e.g., Upstash) instead of in-memory storage.

## ⚠️ Remaining Security Considerations

1. ~~**Rate Limiting**: Authentication endpoints (login, register) should have rate limiting to prevent brute force attacks.~~ ✅ **COMPLETED**
2. **HTTPS Only**: Ensure all production requests use HTTPS. Tokens in HTTP-only cookies will only be sent over HTTPS if `secure: true` is set (already done for production).
3. **Token Refresh**: Consider implementing refresh tokens for better security (tokens expire after 7 days currently).
4. **Input Validation**: Review and strengthen input validation across all API endpoints.
5. **SQL Injection**: Prisma handles this, but ensure all database queries use Prisma, not raw SQL.
6. **XSS Protection**: Ensure all user inputs are properly sanitized before rendering.
7. **CSRF Protection**: Consider adding CSRF tokens for state-changing operations.

## 🚀 Next Steps

1. ✅ JWT Authentication - **COMPLETED**
2. ✅ Admin Role Checks - **COMPLETED**
3. ✅ Prisma Client Singleton - **COMPLETED**
4. ✅ Rate Limiting (All Auth Endpoints) - **COMPLETED**
5. ⏳ Environment Variable Validation - **PENDING**
6. ⏳ Comprehensive Error Handling - **PENDING**

## Testing

After these changes:
1. Users must login/register to get JWT tokens
2. All API requests require valid JWT tokens
3. Admin routes are now properly protected
4. Old method of passing userId in headers will no longer work

**Migration Note**: Existing users will need to log in again to receive JWT tokens.

