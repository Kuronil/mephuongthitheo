"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { updateOrderStatus } from "@/lib/orders"
import toast from "react-hot-toast"
import { Package, Clock, CheckCircle, XCircle, Eye, ArrowLeft, MapPin, Phone, Mail, CreditCard, Truck } from "lucide-react"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  id: number
  orderNumber?: string
  total: number
  status: string
  paymentMethod: string
  name: string
  phone: string
  address: string
  note?: string
  createdAt: string
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const { user, isLoading } = useAuth(true, '/account/login')
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState(false)

  useEffect(() => {
    if (user?.id && orderId) {
      fetchOrderDetail()
    }
  }, [user, orderId])

  const fetchOrderDetail = async () => {
    try {
      console.log('Fetching order detail for orderId:', orderId)
      console.log('User ID:', user?.id)
      console.log('User data:', user)
      console.log('URL:', `/api/account/orders/${orderId}`)
      
      const response = await fetch(`/api/account/orders/${orderId}`, {
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('Order data received:', data)
        setOrder(data.order)
      } else {
        const errorData = await response.json()
        console.log('Error response:', errorData)
        setError(`Không thể tải chi tiết đơn hàng: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error fetching order detail:", error)
      setError(`Có lỗi xảy ra khi tải chi tiết đơn hàng: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return
    }
    
    try {
      setCancellingOrder(true)
      await updateOrderStatus(order!.id, "CANCELLED", "Khách hàng yêu cầu hủy đơn hàng")
      toast.success("Đơn hàng đã được hủy thành công")
      // Refresh order data
      await fetchOrderDetail()
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setCancellingOrder(false)
    }
  }

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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'COD': return 'Thanh toán khi nhận hàng'
      case 'BANKING': return 'Chuyển khoản ngân hàng'
      case 'MOMO': return 'Ví MoMo'
      case 'ZALOPAY': return 'ZaloPay'
      default: return method
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: {orderId}</p>
          <p className="text-sm text-gray-500">User ID: {user?.id}</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-4">{error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem"}</p>
            <div className="text-sm text-gray-500 mb-8">
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Order ID Type:</strong> {typeof orderId}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>User ID Type:</strong> {typeof user?.id}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            </div>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
          <p className="mt-2 text-gray-600">Thông tin chi tiết về đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin đơn hàng */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin khách hàng */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Thông tin giao hàng
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-semibold">{order.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="font-semibold">{order.address}</p>
                </div>
                {order.note && (
                  <div>
                    <p className="text-sm text-gray-600">Ghi chú</p>
                    <p className="font-semibold">{order.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sản phẩm đã đặt */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Sản phẩm đã đặt
              </h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name || 'Sản phẩm không xác định'}</h3>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.price?.toLocaleString()}₫/sản phẩm
                      </p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Không có sản phẩm nào trong đơn hàng</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="space-y-6">
            {/* Trạng thái đơn hàng */}
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

            {/* Phương thức thanh toán */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Phương thức thanh toán
              </h2>
              <p className="font-medium">{getPaymentMethodText(order.paymentMethod)}</p>
            </div>

            {/* Tóm tắt thanh toán */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt thanh toán</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{order.items ? order.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0).toLocaleString() : '0'}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-600">{order.total.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hành động */}
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
          </div>
        </div>
      </div>
    </div>
  )
}
