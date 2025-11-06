"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { CreditCard, QrCode, Clock, CheckCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"

interface Order {
  id: number
  orderNumber: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  items: Array<{ id: number; name: string; price: number; quantity: number; image?: string }>
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/account/login")
      return
    }

    // Chỉ fetch khi có orderId hợp lệ
    const currentOrderId = (params as any)?.orderId
    if (!currentOrderId) return

    fetchOrder(String(currentOrderId))
  }, [user, router, params])

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/account/orders/${orderId}`)
      if (!response.ok) {
        // Hiển thị thông báo theo từng mã lỗi phổ biến
        if (response.status === 400) {
          toast.error("Mã đơn hàng không hợp lệ")
        } else if (response.status === 404) {
          toast.error("Không tìm thấy đơn hàng")
        } else if (response.status === 401) {
          toast.error("Bạn cần đăng nhập để xem đơn hàng")
        } else if (response.status === 403) {
          toast.error("Bạn không có quyền xem đơn hàng này")
        } else {
          toast.error("Có lỗi xảy ra khi tải đơn hàng")
        }
        return
      }
      
      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error("Fetch order error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVNPayPayment = async () => {
    if (!order) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/vnpay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id
        })
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.error || "Không thể tạo link thanh toán")
      }
    } catch (error) {
      console.error("VNPay payment error:", error)
      toast.error("Có lỗi xảy ra khi tạo link thanh toán")
    } finally {
      setLoading(false)
    }
  }

  const getPaymentInstructions = () => {
    if (!order) return null

    switch (order.paymentMethod) {
      case "VNPAY":
        return {
          title: "Thanh toán qua VNPay",
          instructions: [
            "Nhấn nút bên dưới để chuyển đến trang thanh toán VNPay",
            "Chọn ngân hàng và phương thức thanh toán phù hợp",
            "Hoàn tất thanh toán theo hướng dẫn",
            `Số tiền: ${order.total.toLocaleString()}đ`,
            `Mã đơn hàng: ${order.orderNumber}`
          ],
          isVNPay: true
        }
      case "BANKING":
        return {
          title: "Chuyển khoản ngân hàng",
          instructions: [
            "Chuyển khoản đến tài khoản: 1234567890",
            "Ngân hàng: Vietcombank",
            "Chủ tài khoản: CÔNG TY TNHH THỊT HEOMẸ PHƯƠNG",
            `Số tiền: ${order.total.toLocaleString()}đ`,
            `Nội dung: ${order.orderNumber}`
          ],
          qrCode: "/api/qr-code?data=banking&amount=" + order.total
        }
      case "MOMO":
        return {
          title: "Thanh toán qua MoMo",
          instructions: [
            "Quét QR code bên dưới bằng ứng dụng MoMo",
            "Hoặc chuyển khoản đến số điện thoại: 0901234567",
            `Số tiền: ${order.total.toLocaleString()}đ`,
            `Nội dung: ${order.orderNumber}`
          ],
          qrCode: "/api/qr-code?data=momo&amount=" + order.total
        }
      case "ZALOPAY":
        return {
          title: "Thanh toán qua ZaloPay",
          instructions: [
            "Quét QR code bên dưới bằng ứng dụng ZaloPay",
            "Hoặc chuyển khoản đến số điện thoại: 0901234567",
            `Số tiền: ${order.total.toLocaleString()}đ`,
            `Nội dung: ${order.orderNumber}`
          ],
          qrCode: "/api/qr-code?data=zalopay&amount=" + order.total
        }
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <Button onClick={() => router.push("/account/login")}>
            Đăng nhập
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-8">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập</p>
          <Button onClick={() => router.push("/account/orders")}>
            Xem đơn hàng của tôi
          </Button>
        </div>
      </div>
    )
  }

  const paymentInfo = getPaymentInstructions()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán đơn hàng</h1>
          <p className="text-gray-600 mt-2">Mã đơn hàng: {order.orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thông tin thanh toán */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Mã đơn hàng:</span>
                    <span className="font-mono">{order.orderNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Số tiền:</span>
                    <span className="text-xl font-bold text-orange-600">
                      {order.total.toLocaleString()}đ
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Trạng thái:</span>
                    <Badge variant={order.status === "AWAITING_PAYMENT" ? "destructive" : "default"}>
                      {order.status === "AWAITING_PAYMENT" ? "Chờ thanh toán" : order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Phương thức:</span>
                    <span>{paymentInfo?.title}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Hướng dẫn thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">{paymentInfo.title}</h4>
                      <ul className="space-y-1 text-sm text-blue-800">
                        {paymentInfo.instructions.map((instruction, index) => (
                          <li key={index}>• {instruction}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {paymentInfo.isVNPay ? (
                      <div className="text-center">
                        <Button
                          onClick={handleVNPayPayment}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                          size="lg"
                        >
                          {loading ? "Đang xử lý..." : "Thanh toán qua VNPay"}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                          <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">QR Code thanh toán</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sử dụng ứng dụng {order.paymentMethod === "BANKING" ? "ngân hàng" : order.paymentMethod} để quét
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chi tiết đơn hàng */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
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
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price * item.quantity).toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{order.total.toLocaleString()}đ</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span>Miễn phí</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-600">{order.total.toLocaleString()}đ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  toast.success("Đã gửi thông báo xác nhận thanh toán!")
                  // Có thể thêm logic gửi email/SMS xác nhận
                  router.push(`/order-tracking?orderId=${order.id}`)
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tôi đã thanh toán
              </Button>
              
              <div className="text-center space-y-2">
                <Link href="/account/orders">
                  <Button variant="outline" className="w-full">
                    Xem đơn hàng của tôi
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button variant="ghost" className="w-full">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
