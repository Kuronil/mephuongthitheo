"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface StatusLog {
  id: number
  status: string
  reason?: string
  changedAt: string
  changedBy: number
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
  updatedAt: string
  items: OrderItem[]
  statusLogs: StatusLog[]
}

const ORDER_STATUS_FLOW = [
  { status: 'PENDING', label: 'Đang xử lý', description: 'Đơn hàng đã được tiếp nhận', icon: Clock },
  { status: 'AWAITING_PAYMENT', label: 'Chờ thanh toán', description: 'Chờ khách hàng thanh toán', icon: CreditCard },
  { status: 'SHIPPING', label: 'Đang giao hàng', description: 'Đơn hàng đang được giao', icon: Truck },
  { status: 'DELIVERED', label: 'Đã giao hàng', description: 'Đơn hàng đã được giao thành công', icon: CheckCircle },
  { status: 'COMPLETED', label: 'Hoàn thành', description: 'Đơn hàng đã hoàn tất', icon: CheckCircle },
  { status: 'CANCELLED', label: 'Đã hủy', description: 'Đơn hàng đã bị hủy', icon: XCircle }
]

export default function OrderTrackingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/account/login")
      return
    }
    
    // Get order ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('orderId') || localStorage.getItem('lastOrderId')
    
    if (orderId) {
      fetchOrderDetail(orderId)
    } else {
      router.push("/account/orders")
    }
  }, [user, router])

  const fetchOrderDetail = async (orderId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/account/orders/${orderId}`, {
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else {
        toast.error("Không thể tải thông tin đơn hàng")
        router.push("/account/orders")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      toast.error("Có lỗi xảy ra khi tải đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  const refreshOrder = async () => {
    if (!order) return
    
    setRefreshing(true)
    await fetchOrderDetail(order.id.toString())
    setRefreshing(false)
    toast.success("Đã cập nhật thông tin đơn hàng")
  }

  const getStatusInfo = (status: string) => {
    const statusInfo = ORDER_STATUS_FLOW.find(s => s.status === status)
    if (!statusInfo) {
      return {
        icon: Clock,
        label: status,
        description: 'Trạng thái không xác định',
        color: 'bg-gray-100 text-gray-800'
      }
    }

    const Icon = statusInfo.icon
    let color = 'bg-gray-100 text-gray-800'
    
    switch (status) {
      case 'PENDING':
        color = 'bg-yellow-100 text-yellow-800'
        break
      case 'AWAITING_PAYMENT':
        color = 'bg-blue-100 text-blue-800'
        break
      case 'SHIPPING':
        color = 'bg-purple-100 text-purple-800'
        break
      case 'DELIVERED':
      case 'COMPLETED':
        color = 'bg-green-100 text-green-800'
        break
      case 'CANCELLED':
        color = 'bg-red-100 text-red-800'
        break
    }

    return {
      icon: Icon,
      label: statusInfo.label,
      description: statusInfo.description,
      color
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

  const getEstimatedDeliveryTime = () => {
    if (!order) return null
    
    const orderDate = new Date(order.createdAt)
    const estimatedDelivery = new Date(orderDate.getTime() + (2 * 24 * 60 * 60 * 1000)) // +2 days
    
    return estimatedDelivery.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-8">Đơn hàng không tồn tại hoặc bạn không có quyền xem</p>
          <Link href="/account/orders">
            <Button>Quay lại danh sách đơn hàng</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách đơn hàng
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Theo dõi đơn hàng</h1>
              <p className="text-gray-600">Mã đơn hàng: #{order.orderNumber || `MP${order.id}`}</p>
            </div>
            <Button
              variant="outline"
              onClick={refreshOrder}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Trạng thái hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-3 rounded-full ${statusInfo.color}`}>
                    <statusInfo.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{statusInfo.label}</h3>
                    <p className="text-gray-600">{statusInfo.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cập nhật lần cuối: {new Date(order.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusLogs && order.statusLogs.length > 0 ? (
                    order.statusLogs.map((log, index) => {
                      const logStatusInfo = getStatusInfo(log.status)
                      const LogIcon = logStatusInfo.icon
                      
                      return (
                        <div key={log.id} className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${logStatusInfo.color} flex-shrink-0`}>
                            <LogIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{logStatusInfo.label}</h4>
                              <Badge variant="outline" className="text-xs">
                                {new Date(log.changedAt).toLocaleString('vi-VN')}
                              </Badge>
                            </div>
                            {log.reason && (
                              <p className="text-sm text-gray-600">{log.reason}</p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Chưa có lịch sử cập nhật</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.price.toLocaleString()}₫/sản phẩm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Người nhận</p>
                  <p className="font-semibold">{order.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-semibold">{order.address}</p>
                </div>
                {order.note && (
                  <div>
                    <p className="text-sm text-gray-600">Ghi chú</p>
                    <p className="font-semibold">{order.note}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Dự kiến giao hàng</p>
                  <p className="font-semibold text-orange-600">
                    {getEstimatedDeliveryTime()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span>Miễn phí</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-orange-600">{order.total.toLocaleString()}₫</span>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="font-medium">{getPaymentMethodText(order.paymentMethod)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.status === 'AWAITING_PAYMENT' && (
                  <Link href={`/payment/${order.id}`} className="block">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Thanh toán ngay
                    </Button>
                  </Link>
                )}
                
                {order.status === 'DELIVERED' && (
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Star className="w-4 h-4 mr-2" />
                    Đánh giá đơn hàng
                  </Button>
                )}
                
                <Link href="/account/orders" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                  </Button>
                </Link>
                
                <div className="text-center">
                  <a 
                    href={`tel:0123456789`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Phone className="w-4 h-4" />
                    Liên hệ hỗ trợ
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
