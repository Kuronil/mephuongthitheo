"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  const success = searchParams.get('success') === 'true'
  const orderId = searchParams.get('orderId')
  const message = searchParams.get('message')

  useEffect(() => {
    // Đếm ngược và tự động chuyển hướng
    if (success && orderId) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push(`/order-tracking?orderId=${orderId}`)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [success, orderId, router])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="text-center">
              {success ? (
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
              
              <CardTitle className="text-2xl">
                {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Thông báo */}
            <div className="text-center">
              <p className="text-gray-600">
                {success 
                  ? 'Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.'
                  : message || 'Giao dịch thanh toán không thành công. Vui lòng thử lại.'
                }
              </p>
            </div>

            {/* Thông tin đơn hàng */}
            {orderId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-gray-900">{orderId}</span>
                </div>
              </div>
            )}

            {/* Countdown cho trường hợp thành công */}
            {success && orderId && countdown > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">
                    Tự động chuyển hướng trong <span className="font-bold">{countdown}</span> giây...
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              {success && orderId ? (
                <>
                  <Link href={`/order-tracking?orderId=${orderId}`} className="block">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      <span>Theo dõi đơn hàng</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  
                  <Link href="/account/orders" className="block">
                    <Button variant="outline" className="w-full">
                      Xem tất cả đơn hàng
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {orderId && (
                    <Link href={`/payment/${orderId}`} className="block">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Thử thanh toán lại
                      </Button>
                    </Link>
                  )}
                  
                  <Link href="/cart" className="block">
                    <Button variant="outline" className="w-full">
                      Quay lại giỏ hàng
                    </Button>
                  </Link>
                </>
              )}
              
              <Link href="/products" className="block">
                <Button variant="ghost" className="w-full">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>

            {/* Hỗ trợ */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Cần hỗ trợ? Liên hệ: 
                <a href="tel:0901234567" className="text-orange-600 hover:underline ml-1">
                  0901234567
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <PaymentResultContent />
    </Suspense>
  )
}



