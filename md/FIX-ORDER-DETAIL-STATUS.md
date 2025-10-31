# Cải tiến trang chi tiết đơn hàng - Hiển thị trạng thái và tính năng hủy đơn

## Tổng quan

Đã cải tiến trang chi tiết đơn hàng (`/account/orders/[orderId]`) với các tính năng mới:

### ✅ Các cải tiến đã thực hiện

1. **Hiển thị trạng thái đơn hàng rõ ràng hơn**
   - Thêm icon cho từng trạng thái
   - Thêm mô tả chi tiết cho từng trạng thái
   - Cải thiện giao diện hiển thị với màu sắc phân biệt
   - Hiển thị mã đơn hàng và ngày đặt hàng rõ ràng

2. **Thêm tính năng hủy đơn hàng**
   - Nút hủy đơn hàng xuất hiện khi trạng thái là PENDING
   - Xác nhận trước khi hủy
   - Hiển thị trạng thái đang xử lý khi hủy
   - Thông báo thành công/thất bại
   - Tự động làm mới dữ liệu sau khi hủy

3. **Thêm các trạng thái đơn hàng mới**
   - SHIPPING (Đang giao hàng)
   - DELIVERED (Đã giao hàng)
   - Cải thiện hiển thị cho tất cả trạng thái

4. **Thêm các hành động theo trạng thái**
   - Thanh toán ngay (AWAITING_PAYMENT)
   - Hủy đơn hàng (PENDING)
   - Theo dõi đơn hàng (SHIPPING, DELIVERED)
   - Liên hệ hỗ trợ (tất cả trạng thái)

## Chi tiết thay đổi

### 1. Import thêm các thư viện cần thiết

```typescript
import { updateOrderStatus } from "@/lib/orders"
import toast from "react-hot-toast"
```

### 2. Thêm state quản lý việc hủy đơn hàng

```typescript
const [cancellingOrder, setCancellingOrder] = useState(false)
```

### 3. Thêm hàm xử lý hủy đơn hàng

```typescript
const handleCancelOrder = async () => {
  if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
    return
  }
  
  try {
    setCancellingOrder(true)
    await updateOrderStatus(order!.id, "CANCELLED", "Khách hàng yêu cầu hủy đơn hàng")
    toast.success("Đơn hàng đã được hủy thành công")
    await fetchOrderDetail()
  } catch (error) {
    console.error("Error cancelling order:", error)
    toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
  } finally {
    setCancellingOrder(false)
  }
}
```

### 4. Cải thiện hàm getStatusInfo

Thêm mô tả chi tiết và các trạng thái mới:

```typescript
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        text: 'Hoàn thành',
        color: 'bg-green-100 text-green-800',
        description: 'Đơn hàng đã hoàn tất'
      }
    case 'PENDING':
      return {
        icon: <Clock className="w-5 h-5" />,
        text: 'Đang xử lý',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Đơn hàng đang được xử lý'
      }
    case 'AWAITING_PAYMENT':
      return {
        icon: <Clock className="w-5 h-5" />,
        text: 'Chờ thanh toán',
        color: 'bg-blue-100 text-blue-800',
        description: 'Vui lòng thanh toán để hoàn tất đơn hàng'
      }
    case 'SHIPPING':
      return {
        icon: <Truck className="w-5 h-5" />,
        text: 'Đang giao hàng',
        color: 'bg-purple-100 text-purple-800',
        description: 'Đơn hàng đang được giao đến bạn'
      }
    case 'DELIVERED':
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        text: 'Đã giao hàng',
        color: 'bg-green-100 text-green-800',
        description: 'Đơn hàng đã được giao thành công'
      }
    case 'CANCELLED':
      return {
        icon: <XCircle className="w-5 h-5" />,
        text: 'Đã hủy',
        color: 'bg-red-100 text-red-800',
        description: 'Đơn hàng đã bị hủy'
      }
    default:
      return {
        icon: <Clock className="w-5 h-5" />,
        text: status,
        color: 'bg-gray-100 text-gray-800',
        description: 'Trạng thái không xác định'
      }
  }
}
```

### 5. Cải thiện giao diện hiển thị trạng thái

```tsx
<div className="bg-white shadow rounded-lg p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
    <Package className="w-5 h-5 mr-2" />
    Trạng thái đơn hàng
  </h2>
  <div className="space-y-4">
    <div className={`flex items-center gap-3 p-4 rounded-lg ${statusInfo.color}`}>
      <div className="shrink-0">
        {statusInfo.icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{statusInfo.text}</p>
        <p className="text-sm mt-1">{statusInfo.description}</p>
      </div>
    </div>
    <div className="pt-3 border-t border-gray-200 space-y-2 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>Mã đơn hàng:</span>
        <span className="font-medium text-gray-900">#{order.orderNumber || `MP${order.id}`}</span>
      </div>
      <div className="flex justify-between">
        <span>Ngày đặt:</span>
        <span className="font-medium text-gray-900">
          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  </div>
</div>
```

### 6. Thêm các hành động theo trạng thái

```tsx
<div className="bg-white shadow rounded-lg p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h2>
  <div className="space-y-3">
    {/* Thanh toán nếu đang chờ thanh toán */}
    {order.status === 'AWAITING_PAYMENT' && (
      <Link
        href={`/payment/${order.id}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
      >
        <CreditCard className="w-4 h-4" />
        Thanh toán ngay
      </Link>
    )}
    
    {/* Hủy đơn hàng nếu đang xử lý */}
    {order.status === 'PENDING' && (
      <button
        onClick={handleCancelOrder}
        disabled={cancellingOrder}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {cancellingOrder ? (
          <>
            <div className="w-4 h-4 border-2 border-red-300 border-b-transparent rounded-full animate-spin"></div>
            Đang hủy...
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            Hủy đơn hàng
          </>
        )}
      </button>
    )}
    
    {/* Theo dõi đơn hàng */}
    {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
      <Link
        href={`/order-tracking?orderId=${order.id}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        <Truck className="w-4 h-4" />
        Theo dõi đơn hàng
      </Link>
    )}
    
    {/* Quay lại danh sách */}
    <Link
      href="/account/orders"
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Quay lại danh sách
    </Link>
    
    {/* Liên hệ hỗ trợ */}
    <div className="pt-3 border-t border-gray-200 text-center">
      <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
      <a 
        href="tel:0123456789"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Phone className="w-4 h-4" />
        Liên hệ: 0123-456-789
      </a>
    </div>
  </div>
</div>
```

## Các trạng thái đơn hàng và hành động tương ứng

| Trạng thái | Icon | Màu sắc | Mô tả | Hành động |
|------------|------|---------|-------|-----------|
| PENDING | 🕐 Clock | 🟡 Vàng | Đơn hàng đang được xử lý | ✅ Hủy đơn hàng |
| AWAITING_PAYMENT | 🕐 Clock | 🔵 Xanh dương | Vui lòng thanh toán để hoàn tất đơn hàng | 💳 Thanh toán ngay |
| SHIPPING | 🚚 Truck | 🟣 Tím | Đơn hàng đang được giao đến bạn | 📍 Theo dõi đơn hàng |
| DELIVERED | ✅ CheckCircle | 🟢 Xanh lá | Đơn hàng đã được giao thành công | 📍 Theo dõi đơn hàng |
| COMPLETED | ✅ CheckCircle | 🟢 Xanh lá | Đơn hàng đã hoàn tất | - |
| CANCELLED | ❌ XCircle | 🔴 Đỏ | Đơn hàng đã bị hủy | - |

## Cách test các tính năng mới

### 1. Test hiển thị trạng thái

1. Tạo đơn hàng với các trạng thái khác nhau
2. Truy cập `/account/orders/[orderId]`
3. Kiểm tra:
   - Icon hiển thị đúng
   - Màu sắc phù hợp
   - Mô tả rõ ràng
   - Mã đơn hàng và ngày đặt hiển thị đúng

### 2. Test tính năng hủy đơn hàng

1. Tạo đơn hàng với trạng thái PENDING
2. Truy cập trang chi tiết đơn hàng
3. Click nút "Hủy đơn hàng"
4. Xác nhận hủy đơn
5. Kiểm tra:
   - Hiển thị loading khi đang xử lý
   - Thông báo thành công
   - Trạng thái đơn hàng chuyển sang CANCELLED
   - Nút hủy đơn hàng biến mất

### 3. Test các hành động theo trạng thái

#### AWAITING_PAYMENT
- Kiểm tra nút "Thanh toán ngay" xuất hiện
- Click vào nút và chuyển đến trang thanh toán

#### PENDING
- Kiểm tra nút "Hủy đơn hàng" xuất hiện
- Test chức năng hủy đơn hàng

#### SHIPPING/DELIVERED
- Kiểm tra nút "Theo dõi đơn hàng" xuất hiện
- Click vào nút và chuyển đến trang theo dõi

### 4. Test liên hệ hỗ trợ

1. Kiểm tra link số điện thoại hiển thị
2. Click vào link và kiểm tra mở ứng dụng gọi điện

## Lợi ích của các cải tiến

### 1. Trải nghiệm người dùng tốt hơn
- Hiển thị trạng thái rõ ràng, dễ hiểu
- Mô tả chi tiết giúp người dùng biết đơn hàng đang ở giai đoạn nào
- Các hành động phù hợp với từng trạng thái

### 2. Tính năng đầy đủ hơn
- Người dùng có thể hủy đơn hàng khi cần
- Theo dõi đơn hàng đang giao
- Liên hệ hỗ trợ dễ dàng

### 3. Giao diện đẹp hơn
- Sử dụng màu sắc phân biệt rõ ràng
- Icon trực quan
- Layout cải thiện với spacing hợp lý

### 4. Xử lý lỗi tốt hơn
- Xác nhận trước khi hủy đơn
- Hiển thị loading state
- Thông báo lỗi rõ ràng
- Tự động làm mới dữ liệu

## Các cải tiến có thể thực hiện tiếp

### 1. Thêm timeline trạng thái
- Hiển thị lịch sử thay đổi trạng thái
- Thời gian từng bước
- Người thực hiện thay đổi

### 2. Thêm tính năng đánh giá
- Đánh giá đơn hàng sau khi hoàn thành
- Đánh giá sản phẩm
- Đánh giá dịch vụ giao hàng

### 3. Thêm tính năng mua lại
- Nút "Mua lại" cho đơn hàng đã hoàn thành
- Tự động thêm sản phẩm vào giỏ hàng

### 4. Thêm thông tin vận chuyển
- Mã vận đơn
- Đơn vị vận chuyển
- Link tracking từ đơn vị vận chuyển

### 5. Thêm tính năng in hóa đơn
- Xuất PDF hóa đơn
- In hóa đơn trực tiếp

## Kết luận

Trang chi tiết đơn hàng đã được cải tiến đáng kể với:
- ✅ Hiển thị trạng thái rõ ràng hơn
- ✅ Thêm tính năng hủy đơn hàng
- ✅ Thêm các trạng thái mới (SHIPPING, DELIVERED)
- ✅ Các hành động phù hợp với từng trạng thái
- ✅ Giao diện đẹp và trực quan hơn
- ✅ Xử lý lỗi tốt hơn

Người dùng giờ đây có thể:
- Xem trạng thái đơn hàng rõ ràng
- Hủy đơn hàng khi cần
- Thanh toán trực tiếp từ trang chi tiết
- Theo dõi đơn hàng đang giao
- Liên hệ hỗ trợ dễ dàng
