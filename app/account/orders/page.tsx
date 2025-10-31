"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { updateOrderStatus } from "@/lib/orders"
import toast from "react-hot-toast"
import { Package, Clock, CheckCircle, XCircle, Eye, ArrowLeft, Search, Filter } from "lucide-react"

interface Order {
  id: number
  orderNumber: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  items: {
    name: string
    price: number
    quantity: number
    image?: string
  }[]
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth(true, '/account/login')
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/account/orders', {
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Orders data received:', data)
        const ordersData = Array.isArray(data.data?.orders) ? data.data.orders : Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : []
        console.log('Processed orders:', ordersData)
        setOrders(ordersData)
      } else {
        console.error("Failed to fetch orders:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return
    }
    
    try {
      setCancellingOrderId(orderId)
      await updateOrderStatus(orderId, "CANCELLED", "Customer requested cancellation")
      await fetchOrders()
      toast.success("Đơn hàng đã được hủy thành công")
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Không thể hủy đơn hàng")
    } finally {
      setCancellingOrderId(null)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Hoàn thành',
          color: 'bg-green-100 text-green-800'
        }
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Đang xử lý',
          color: 'bg-yellow-100 text-yellow-800'
        }
      case 'AWAITING_PAYMENT':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Chờ thanh toán',
          color: 'bg-blue-100 text-blue-800'
        }
      case 'CANCELLED':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Đã hủy',
          color: 'bg-red-100 text-red-800'
        }
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: status,
          color: 'bg-gray-100 text-gray-800'
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

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  }) : []

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải lịch sử đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang cá nhân
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <p className="mt-2 text-gray-600">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PENDING">Đang xử lý</option>
                <option value="AWAITING_PAYMENT">Chờ thanh toán</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {(orders?.length || 0) === 0 ? "Chưa có đơn hàng nào" : "Không tìm thấy đơn hàng"}
            </h3>
            <p className="text-gray-600 mb-6">
              {(orders?.length || 0) === 0 
                ? "Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn"
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              }
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <Package className="w-4 h-4" />
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              return (
                <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Đơn hàng #{order.orderNumber || `MP${order.id}`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center gap-4">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-600">
                            {order.total.toLocaleString()}₫
                          </div>
                          <div className="text-sm text-gray-600">
                            {getPaymentMethodText(order.paymentMethod)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sản phẩm đã đặt:</h4>
                    <div className="space-y-2">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => {
                          console.log('Rendering item:', item)
                          return (
                            <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.name || 'Sản phẩm không xác định'}</p>
                                <p className="text-xs text-gray-600">Số lượng: {item.quantity || 0}</p>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Không có sản phẩm nào trong đơn hàng</p>
                          <p className="text-xs mt-1">Debug: items = {JSON.stringify(order.items)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </Link>
                    {order.status === 'AWAITING_PAYMENT' && (
                      <Link
                        href={`/payment/${order.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        Thanh toán
                      </Link>
                    )}
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingOrderId === order.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-300 border-b-transparent rounded-full animate-spin"></div>
                            Đang hủy...
                          </>
                        ) : (
                          'Hủy đơn hàng'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination would go here in a real app */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredOrders.length} trong tổng số {orders?.length || 0} đơn hàng
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
