"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Mail, Phone, Clock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface NotificationData {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  total: number
  paymentMethod: string
  estimatedDelivery: string
}

function OrderNotificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get order data from URL params or localStorage
    const orderId = searchParams.get('orderId')
    const orderNumber = searchParams.get('orderNumber') || `MP${Date.now()}`
    const customerName = searchParams.get('customerName') || 'Khách hàng'
    const customerEmail = searchParams.get('customerEmail') || 'customer@example.com'
    const customerPhone = searchParams.get('customerPhone') || '0123456789'
    const total = parseInt(searchParams.get('total') || '250000')
    const paymentMethod = searchParams.get('paymentMethod') || 'COD'

    // Calculate estimated delivery (2 days from now)
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2)

    setNotificationData({
      orderId: orderId || '1',
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      total,
      paymentMethod,
      estimatedDelivery: estimatedDelivery.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    setLoading(false)
  }, [searchParams])

  const sendEmailNotification = async () => {
    // Mock email sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }

  const sendSMSNotification = async () => {
    // Mock SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  }

  const handleSendNotifications = async () => {
    try {
      await Promise.all([
        sendEmailNotification(),
        sendSMSNotification()
      ])
      
      // Redirect to order tracking
      router.push(`/order-tracking?orderId=${notificationData?.orderId}`)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang chuẩn bị thông báo...</p>
        </div>
      </div>
    )
  }

  if (!notificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy thông tin đơn hàng</h2>
          <Link href="/">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Chúng tôi sẽ gửi thông báo xác nhận đến email và số điện thoại của bạn.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Mã đơn hàng: #{notificationData.orderNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Thông báo Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📧 Email xác nhận đơn hàng</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Gửi đến:</strong> {notificationData.customerEmail}</p>
                  <p><strong>Tiêu đề:</strong> Xác nhận đơn hàng #{notificationData.orderNumber}</p>
                  <p><strong>Nội dung:</strong></p>
                  <div className="ml-4 space-y-1">
                    <p>• Cảm ơn bạn đã đặt hàng tại Mẹ Phương</p>
                    <p>• Mã đơn hàng: #{notificationData.orderNumber}</p>
                    <p>• Tổng tiền: {notificationData.total.toLocaleString()}₫</p>
                    <p>• Dự kiến giao hàng: {notificationData.estimatedDelivery}</p>
                    <p>• Phương thức thanh toán: {notificationData.paymentMethod}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Email sẽ được gửi tự động</span>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Thông báo SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">📱 SMS xác nhận đơn hàng</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Gửi đến:</strong> {notificationData.customerPhone}</p>
                  <p><strong>Nội dung SMS:</strong></p>
                  <div className="ml-4 bg-white p-3 rounded border text-gray-700">
                    <p className="font-mono text-xs leading-relaxed">
                      [Mẹ Phương] Cảm ơn bạn đã đặt hàng!<br/>
                      Mã đơn hàng: #{notificationData.orderNumber}<br/>
                      Tổng tiền: {notificationData.total.toLocaleString()}₫<br/>
                      Dự kiến giao: {notificationData.estimatedDelivery}<br/>
                      Theo dõi: mephuong.com/track
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">SMS sẽ được gửi tự động</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bước tiếp theo</CardTitle>
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleSendNotifications}
            className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Tiếp tục theo dõi đơn hàng
          </Button>
          
          <Link href="/products">
            <Button variant="outline">
              Tiếp tục mua sắm
            </Button>
          </Link>
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
                  <Phone className="w-4 h-4" />
                  Gọi ngay: 0123 456 789
                </a>
                <a href="mailto:support@mephuong.com" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Mail className="w-4 h-4" />
                  Email: support@mephuong.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OrderNotificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <OrderNotificationContent />
    </Suspense>
  )
}
