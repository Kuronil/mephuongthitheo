# 📋 DANH SÁCH FILE FRONT-END TRONG DỰ ÁN

## 📁 1. PAGES (App Router - Next.js 16)

### 🏠 Trang chính & Landing
- `app/page.tsx` - Trang chủ chính
- `app/about/page.tsx` - Trang giới thiệu
- `app/contact/page.tsx` - Trang liên hệ
- `app/faq/page.tsx` - Trang câu hỏi thường gặp

### 🛍️ E-commerce Pages
- `app/products/page.tsx` - Trang danh sách sản phẩm
- `app/product/[slug]/page.tsx` - Trang chi tiết sản phẩm (dynamic route)
- `app/processed-products/page.tsx` - Trang sản phẩm chế biến
- `app/cart/page.tsx` - Trang giỏ hàng
- `app/checkout/page.tsx` - Trang thanh toán
- `app/search/page.tsx` - Trang tìm kiếm

### 👤 Account & Authentication
- `app/account/login/page.tsx` - Đăng nhập
- `app/account/register/page.tsx` - Đăng ký
- `app/account/profile/page.tsx` - Hồ sơ người dùng
- `app/account/forgot-password/page.tsx` - Quên mật khẩu
- `app/account/reset-password/page.tsx` - Đặt lại mật khẩu
- `app/account/verify-pending/page.tsx` - Chờ xác thực email
- `app/auth/verify-email/page.tsx` - Xác thực email

### 📦 Orders & Payments
- `app/account/orders/page.tsx` - Danh sách đơn hàng
- `app/account/orders/[orderId]/page.tsx` - Chi tiết đơn hàng
- `app/account/wishlist/page.tsx` - Danh sách yêu thích
- `app/checkout/page.tsx` - Thanh toán
- `app/payment/[orderId]/page.tsx` - Trang thanh toán VNPay
- `app/payment-result/page.tsx` - Kết quả thanh toán
- `app/order-success/page.tsx` - Đặt hàng thành công
- `app/order-tracking/page.tsx` - Theo dõi đơn hàng
- `app/order-notification/page.tsx` - Thông báo đơn hàng

### 🎁 Loyalty Program
- `app/loyalty/page.tsx` - Trang chương trình tích điểm

### 👨‍💼 Admin Pages
- `app/admin/page.tsx` - Dashboard admin
- `app/admin/products/page.tsx` - Quản lý sản phẩm
- `app/admin/products/new/page.tsx` - Tạo sản phẩm mới
- `app/admin/products/[id]/edit/page.tsx` - Chỉnh sửa sản phẩm
- `app/admin/processed-products/page.tsx` - Quản lý sản phẩm chế biến
- `app/admin/orders/page.tsx` - Quản lý đơn hàng
- `app/admin/inventory/page.tsx` - Quản lý kho
- `app/admin/users/page.tsx` - Quản lý người dùng
- `app/admin/users/new/page.tsx` - Tạo người dùng mới
- `app/admin/store-location/page.tsx` - Quản lý địa điểm cửa hàng
- `app/admin/store-location/edit/page.tsx` - Chỉnh sửa địa điểm
- `app/admin/store-location/overview/page.tsx` - Tổng quan địa điểm

### 📄 SEO & Metadata
- `app/sitemap.ts` - Sitemap tự động (TypeScript)

---

## 🧩 2. COMPONENTS (React Components)

### 🎨 UI Components (Shadcn/ui)
**Location:** `components/ui/`

#### Basic Components
- `alert.tsx` - Component cảnh báo
- `alert-dialog.tsx` - Dialog cảnh báo
- `avatar.tsx` - Avatar người dùng
- `badge.tsx` - Badge/Tag
- `button.tsx` - Nút bấm
- `button-group.tsx` - Nhóm nút
- `card.tsx` - Card container
- `separator.tsx` - Dải phân cách

#### Form Components
- `checkbox.tsx` - Checkbox
- `input.tsx` - Input text
- `textarea.tsx` - Textarea
- `select.tsx` - Dropdown select
- `radio-group.tsx` - Radio buttons
- `switch.tsx` - Toggle switch
- `slider.tsx` - Slider input
- `input-otp.tsx` - OTP input
- `form.tsx` - Form wrapper
- `field.tsx` - Form field
- `input-group.tsx` - Input group
- `label.tsx` - Label

#### Navigation Components
- `breadcrumb.tsx` - Breadcrumb navigation
- `navigation-menu.tsx` - Navigation menu
- `menubar.tsx` - Menu bar
- `dropdown-menu.tsx` - Dropdown menu
- `context-menu.tsx` - Context menu
- `pagination.tsx` - Pagination
- `tabs.tsx` - Tabs component

#### Overlay Components
- `dialog.tsx` - Modal dialog
- `drawer.tsx` - Drawer/Sidebar
- `sheet.tsx` - Sheet/Modal
- `popover.tsx` - Popover
- `tooltip.tsx` - Tooltip
- `hover-card.tsx` - Hover card

#### Feedback Components
- `toast.tsx` - Toast notification
- `toaster.tsx` - Toast container
- `sonner.tsx` - Sonner toast
- `progress.tsx` - Progress bar
- `skeleton.tsx` - Loading skeleton
- `spinner.tsx` - Loading spinner
- `loading-spinner.tsx` - Custom loading spinner
- `empty.tsx` - Empty state

#### Data Display
- `table.tsx` - Data table
- `chart.tsx` - Chart component
- `calendar.tsx` - Calendar picker
- `aspect-ratio.tsx` - Aspect ratio container
- `carousel.tsx` - Carousel slider

#### Interactive Components
- `collapsible.tsx` - Collapsible content
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Toggle group
- `command.tsx` - Command palette
- `scroll-area.tsx` - Scrollable area
- `resizable.tsx` - Resizable panels
- `sidebar.tsx` - Sidebar component

#### Utility Components
- `kbd.tsx` - Keyboard shortcut display
- `item.tsx` - List item component
- `use-toast.ts` - Toast hook (TypeScript)

### 🏗️ Feature Components
**Location:** `components/`

#### Core Features
- `header.tsx` - Header navigation
- `footer.tsx` - Footer
- `hero-banner.tsx` - Banner hero
- `features.tsx` - Tính năng nổi bật
- `hot-products.tsx` - Sản phẩm hot
- `product-recommendations.tsx` - Gợi ý sản phẩm
- `product-reviews.tsx` - Đánh giá sản phẩm
- `stock-alert.tsx` - Cảnh báo tồn kho

#### Search & Discovery
- `quick-search.tsx` - Tìm kiếm nhanh
- `advanced-search.tsx` - Tìm kiếm nâng cao
- `search-suggestions.tsx` - Gợi ý tìm kiếm

#### Location & Maps
- `google-map.tsx` - Google Maps integration
- `store-location-card.tsx` - Card địa điểm cửa hàng

#### Checkout Components
**Location:** `components/checkout/`
- `Step1InfoAddress.tsx` - Bước 1: Thông tin & địa chỉ
- `Step2Shipping.tsx` - Bước 2: Vận chuyển
- `Step3Payment.tsx` - Bước 3: Thanh toán
- `Step4Confirmation.tsx` - Bước 4: Xác nhận

#### Admin Components
- `AdminLayout.tsx` - Layout admin
- `admin/revenue-chart.tsx` - Biểu đồ doanh thu

#### Other Components
- `analytics.tsx` - Analytics tracking
- `client-providers.tsx` - Client-side providers
- `theme-provider.tsx` - Theme provider
- `notification-bell.tsx` - Thông báo
- `loyalty-program.tsx` - Chương trình tích điểm

---

## 🎯 3. LAYOUTS & PROVIDERS

- `app/layout.tsx` - Root layout (Next.js App Router)
- `components/AdminLayout.tsx` - Layout cho admin panel
- `components/client-providers.tsx` - Providers (Theme, Toast, etc.)
- `components/theme-provider.tsx` - Dark/Light theme provider

---

## 🔗 4. CONTEXTS & HOOKS

### Contexts
**Location:** `contexts/`
- `UserContext.tsx` - Context quản lý user state

### Custom Hooks
**Location:** `hooks/`
- `useAuth.ts` - Hook xác thực người dùng
- `useAdminAuth.ts` - Hook xác thực admin
- `useStoreLocation.tsx` - Hook quản lý địa điểm cửa hàng
- `use-toast.ts` - Hook toast notifications
- `use-mobile.ts` - Hook phát hiện mobile device

---

## 🎨 5. STYLES (CSS)

- `app/globals.css` - Global styles + Tailwind CSS imports
  - Import Tailwind CSS v4
  - CSS Variables (colors, themes)
  - Custom animations
  - Base layer styles

---

## ⚙️ 6. CONFIGURATION FILES

### Next.js Config
- `next.config.mjs` - Next.js configuration
  - TypeScript settings
  - Image optimization
  - Output mode (standalone)
  - External packages

### PostCSS Config
- `postcss.config.mjs` - PostCSS configuration
  - Tailwind CSS v4 plugin

### Tailwind Config
- Không có file `tailwind.config.js` (Tailwind v4 sử dụng CSS-first approach)
- Config trong `globals.css` với `@theme inline`

### Component Config
- `components.json` - Shadcn/ui configuration
  - Style: new-york
  - RSC: true
  - Path aliases
  - Icon library: lucide

### TypeScript Config
- `tsconfig.json` - TypeScript configuration
- `next-env.d.ts` - Next.js type definitions

---

## 📊 7. TỔNG KẾT SỐ LƯỢNG

### Pages (App Router)
- **Trang người dùng:** ~20 pages
- **Trang admin:** ~12 pages
- **Dynamic routes:** ~5 routes
- **Tổng:** ~37 pages

### Components
- **UI Components (Shadcn):** ~56 components
- **Feature Components:** ~15 components
- **Checkout Components:** 4 components
- **Admin Components:** 2 components
- **Tổng:** ~77 components

### Hooks & Contexts
- **Contexts:** 1 file
- **Custom Hooks:** 5 hooks
- **Tổng:** 6 files

### Styles
- **CSS Files:** 1 file (globals.css)

### Configuration
- **Config Files:** 5 files

---

## 🏗️ 8. KIẾN TRÚC FRONT-END

```
mephuongthitheo/
├── app/                    # Next.js App Router (Pages)
│   ├── page.tsx           # Trang chủ
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── account/           # Account pages
│   ├── admin/             # Admin pages
│   ├── api/               # API routes (Backend)
│   └── [other pages]/
│
├── components/             # React Components
│   ├── ui/                # Shadcn/ui components (56 files)
│   ├── checkout/          # Checkout components (4 files)
│   ├── admin/             # Admin components (1 file)
│   └── [feature components]/ # Feature components (15 files)
│
├── contexts/               # React Contexts
│   └── UserContext.tsx
│
├── hooks/                  # Custom Hooks
│   ├── useAuth.ts
│   ├── useAdminAuth.ts
│   ├── useStoreLocation.tsx
│   ├── use-toast.ts
│   └── use-mobile.ts
│
├── lib/                    # Utilities (Backend/Frontend)
│   ├── utils.ts           # Frontend utilities
│   └── [other libs]/
│
└── public/                 # Static assets
    ├── images/
    └── [other assets]/
```

---

## 📝 9. GHI CHÚ

### Framework & Libraries
- **Framework:** Next.js 16 (App Router)
- **UI Library:** Shadcn/ui (Radix UI + Tailwind)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **State Management:** React Context API
- **Charts:** Recharts
- **Maps:** Google Maps API

### File Naming Conventions
- **Pages:** `page.tsx` (Next.js App Router)
- **Components:** `kebab-case.tsx` hoặc `PascalCase.tsx`
- **Hooks:** `use-*.ts` hoặc `use*.ts`
- **Types:** `*.ts` hoặc `*.d.ts`

### Code Organization
- **Pages:** Theo route structure trong `app/`
- **Components:** Tách biệt UI và Feature components
- **Hooks:** Tái sử dụng logic
- **Contexts:** Quản lý global state

---

**Tổng số file front-end:** ~120+ files
**Framework:** Next.js 16 + React 19
**Styling:** Tailwind CSS v4

