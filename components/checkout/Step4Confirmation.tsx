"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Truck, CreditCard, User, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { createOrder } from "@/lib/orders"

interface CheckoutData {
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  shipping: {
    method: string
    price: number
    timeSlot: string
  }
  payment: {
    method: string
  }
  order: {
    items: Array<{
      id: number
      name: string
      price: number
      qty: number
      image?: string
    }>
    subtotal: number
    discount: number
    shipping: number
    total: number
  }
}

interface Step4ConfirmationProps {
  checkoutData: CheckoutData
  cartItems: Array<{
    id: number
    name: string
    price: number
    qty: number
    image?: string
  }>
  onComplete: () => void
  onPrev: () => void
}

export default function Step4Confirmation({
  checkoutData,
  cartItems,
  onComplete,
  onPrev
}: Step4ConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePlaceOrder = async () => {
    setLoading(true)
    
    try {
      // Validate items
      const items = (checkoutData.order.items || []).filter(i => (i.qty || 0) > 0)
      if (!items.length) {
        toast.error("Giỏ hàng trống hoặc số lượng không hợp lệ")
        setLoading(false)
        return
      }

      // Get discount code ID from localStorage if applied
      let discountCodeId: number | undefined = undefined
      const appliedDiscountStr = localStorage.getItem("appliedDiscount")
      if (appliedDiscountStr) {
        try {
          const appliedDiscount = JSON.parse(appliedDiscountStr)
          discountCodeId = appliedDiscount.id
          console.log('Step4Confirmation: Found discount code ID:', discountCodeId)
        } catch (error) {
          console.error('Step4Confirmation: Error parsing applied discount:', error)
        }
      }

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          quantity: item.qty || 0,
          image: item.image
        })),
        total: checkoutData.order.total || 0,
        name: checkoutData.customerInfo.name,
        phone: checkoutData.customerInfo.phone,
        address: checkoutData.customerInfo.address,
        note: `Phương thức giao hàng: ${checkoutData.shipping.method}, Thời gian: ${checkoutData.shipping.timeSlot}`,
        paymentMethod: checkoutData.payment.method,
        discountCodeId: discountCodeId
      }

      console.log('Step4Confirmation: Order data prepared:', orderData)
      console.log('Step4Confirmation: Checkout data:', checkoutData)

      // Create order
      const order = await createOrder(orderData)
      
      // Clear cart and discount
      localStorage.removeItem('cart')
      localStorage.removeItem('checkoutData')
      localStorage.removeItem('appliedDiscount')
      
      toast.success("Đặt hàng thành công!")
      
      // Redirect based on payment method
      if (checkoutData.payment.method === 'COD') {
        router.push(`/order-tracking?orderId=${order.id}`)
      } else {
        router.push(`/payment/${order.id}`)
      }
      
      onComplete()
    } catch (error) {
      console.error('Order creation error:', error)
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đặt hàng"
      toast.error(errorMessage || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận đơn hàng</h2>
        <p className="text-gray-600">Vui lòng kiểm tra lại thông tin trước khi đặt hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Thông tin khách hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-semibold">{checkoutData.customerInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{checkoutData.customerInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-semibold">{checkoutData.customerInfo.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
              <p className="font-semibold">{checkoutData.customerInfo.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin giao hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Thông tin giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Phương thức giao hàng</p>
              <p className="font-semibold">{checkoutData.shipping.method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Thời gian giao hàng</p>
              <p className="font-semibold">{checkoutData.shipping.timeSlot}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phí giao hàng</p>
              <p className="font-semibold">
                {checkoutData.shipping.price === 0 ? 'Miễn phí' : `${checkoutData.shipping.price.toLocaleString()}đ`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phương thức thanh toán */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Phương thức thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{getPaymentMethodText(checkoutData.payment.method)}</span>
              <Badge variant={checkoutData.payment.method === 'COD' ? 'default' : 'secondary'}>
                {checkoutData.payment.method === 'COD' ? 'COD' : 'Online'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Sản phẩm đã đặt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Sản phẩm đã đặt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checkoutData.order.items && checkoutData.order.items.length > 0 ? (
                checkoutData.order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Số lượng: {item.qty || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{((item.price || 0) * (item.qty || 0)).toLocaleString()}đ</p>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Không có sản phẩm nào trong đơn hàng</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tóm tắt thanh toán */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tóm tắt thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{(checkoutData.order.subtotal || 0).toLocaleString()}đ</span>
            </div>
            
            {checkoutData.order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{(checkoutData.order.discount || 0).toLocaleString()}đ</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Phí giao hàng:</span>
              <span>
                {(checkoutData.order.shipping || 0) === 0 ? 'Miễn phí' : `${(checkoutData.order.shipping || 0).toLocaleString()}đ`}
              </span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-orange-600">{(checkoutData.order.total || 0).toLocaleString()}đ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={loading}
        >
          Quay lại
        </Button>
        
        <Button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </Button>
      </div>
    </div>
  )
}

