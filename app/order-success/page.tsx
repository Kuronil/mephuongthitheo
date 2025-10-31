"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Truck, CreditCard, ArrowRight, Home, ShoppingBag, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface Order {
  id: number
  orderNumber: string
  total: number
  status: string
  paymentMethod: string
  name: string
  phone: string
  address: string
  createdAt: string
  items: {
    name: string
    price: number
    quantity: number
    image?: string
  }[]
}

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (orderId) {
      fetchOrderDetails(orderId)
    } else {
      // Redirect to home if no order ID
      router.push('/')
    }
  }, [searchParams, router])

  const fetchOrderDetails = async (orderId: string) => {
    try {
      // Mock data - thay thế bằng API call thực tế
      const mockOrder: Order = {
        id: parseInt(orderId),
        orderNumber: `MP${Date.now()}`,
        total: 250000,
        status: 'PENDING',
        paymentMethod: 'COD',
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        createdAt: new Date().toISOString(),
        items: [
          {
            name: 'Thịt ba rọi tươi ngon',
            price: 120000,
            quantity: 1,
            image: '/fresh-pork-meat.jpg'
          },
          {
            name: 'Thịt nạc dăm',
            price: 130000,
            quantity: 1,
            image: '/fresh-lean-pork-meat.jpg'
          }
        ]
      }

      setOrder(mockOrder)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          text: 'Đang xử lý',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Package className="w-4 h-4" />
        }
      case 'AWAITING_PAYMENT':
        return {
          text: 'Chờ thanh toán',
          color: 'bg-blue-100 text-blue-800',
          icon: <CreditCard className="w-4 h-4" />
        }
      case 'COMPLETED':
        return {
          text: 'Hoàn thành',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        }
      default:
        return {
          text: status,
          color: 'bg-gray-100 text-gray-800',
          icon: <Package className="w-4 h-4" />
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h1>
          <p className="text-gray-600 mb-4">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          <Link href="/">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Cảm ơn bạn đã mua sắm tại Mẹ Phương. Chúng tôi sẽ xử lý đơn hàng của bạn ngay.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.text}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã đơn hàng</p>
                    <p className="font-semibold">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày đặt</p>
                    <p className="font-semibold">
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

                {/* Customer Info */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin giao hàng</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Họ tên:</span> {order.name}</p>
                    <p><span className="font-medium">Số điện thoại:</span> {order.phone}</p>
                    <p><span className="font-medium">Địa chỉ:</span> {order.address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm đã đặt</h3>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
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
                            {((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Actions */}
          <div className="space-y-6">
            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{order.items.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}₫</span>
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
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-medium">{getPaymentMethodText(order.paymentMethod)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Bước tiếp theo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-orange-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Xác nhận đơn hàng</p>
                      <p className="text-sm text-gray-600">Chúng tôi sẽ gọi điện xác nhận trong 15 phút</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-gray-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Chuẩn bị hàng</p>
                      <p className="text-sm text-gray-600">Thời gian chuẩn bị: 30-60 phút</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-gray-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Giao hàng</p>
                      <p className="text-sm text-gray-600">Thời gian giao hàng: 1-2 giờ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href={`/order-tracking?orderId=${order.id}`} className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Package className="w-4 h-4 mr-2" />
                  Theo dõi đơn hàng
                </Button>
              </Link>
              
              <Link href={`/account/orders/${order.id}`} className="block">
                <Button className="w-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Xem chi tiết đơn hàng
                </Button>
              </Link>
              
              <Link href="/account/orders" className="block">
                <Button className="w-full" variant="outline">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Lịch sử đơn hàng
                </Button>
              </Link>
              
              <Link href="/" className="block">
                <Button className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cần hỗ trợ?
              </h3>
              <p className="text-gray-600 mb-6">
                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:0123456789" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <span>📞</span>
                  Gọi ngay: 0123 456 789
                </a>
                <a href="mailto:support@mephuong.com" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <span>✉️</span>
                  Email: support@mephuong.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
