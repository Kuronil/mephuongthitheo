"use client"

import { useState, useEffect } from "react"
import { CreditCard, QrCode, Smartphone, Banknote, Tag, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { applyDiscountCode } from "@/lib/cart-api"

interface PaymentData {
  method: string
  discountCode?: string
  discountAmount: number
}

interface Step3Props {
  data: PaymentData
  onUpdate: (data: Partial<PaymentData>) => void
  onNext: () => void
  onPrev: () => void
  subtotal: number
  shippingPrice: number
}

const paymentMethods = [
  {
    id: "COD",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    icon: Banknote,
    features: ["Không cần thẻ", "An toàn tuyệt đối", "Kiểm tra hàng trước"]
  },
  {
    id: "VNPAY",
    name: "VNPay",
    description: "Thanh toán qua cổng VNPay (ATM/Visa/MasterCard/QR)",
    icon: CreditCard,
    features: ["Bảo mật cao", "Hỗ trợ nhiều ngân hàng", "Thanh toán nhanh chóng"],
    badge: "Phổ biến"
  },
  {
    id: "BANKING",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua ngân hàng",
    icon: CreditCard,
    features: ["Bảo mật cao", "Nhanh chóng", "Hỗ trợ nhiều ngân hàng"]
  },
  {
    id: "MOMO",
    name: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: Smartphone,
    features: ["Tiện lợi", "Nhanh chóng", "Bảo mật"]
  },
  {
    id: "ZALOPAY",
    name: "Ví ZaloPay",
    description: "Thanh toán qua ví điện tử ZaloPay",
    icon: QrCode,
    features: ["Dễ sử dụng", "Tích hợp Zalo", "Ưu đãi hấp dẫn"]
  }
]

const discountCodes = [
  { code: "SAVE5", description: "Giảm 5% cho đơn hàng từ 500,000đ" },
  { code: "FREESHIP", description: "Miễn phí giao hàng" }
]

export default function Step3Payment({ data, onUpdate, onNext, onPrev, subtotal, shippingPrice }: Step3Props) {
  const [selectedMethod, setSelectedMethod] = useState(data.method || "")
  const [discountCode, setDiscountCode] = useState(data.discountCode || "")
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load discount từ localStorage khi component mount
  useEffect(() => {
    const savedDiscount = localStorage.getItem("appliedDiscount")
    if (savedDiscount) {
      try {
        const discount = JSON.parse(savedDiscount)
        setAppliedDiscount(discount)
        setDiscountCode(discount.code)
        onUpdate({
          discountCode: discount.code,
          discountAmount: discount.discountAmount
        })
      } catch (error) {
        console.error("Error loading saved discount:", error)
      }
    }
  }, [])

  const total = subtotal + shippingPrice - (appliedDiscount?.discountAmount || 0)

  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId)
    onUpdate({ method: methodId })
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá")
      return
    }

    setLoading(true)
    try {
      const result = await applyDiscountCode(discountCode, subtotal)
      
      if (result.success && result.discountCode) {
        const discountData = result.discountCode
        setAppliedDiscount(discountData)
        // Lưu vào localStorage để đồng bộ với cart
        localStorage.setItem("appliedDiscount", JSON.stringify(discountData))
        onUpdate({
          discountCode: discountData.code,
          discountAmount: discountData.discountAmount
        })
        toast.success(`Đã áp dụng mã giảm giá: ${discountData.description || discountData.name}`)
      } else {
        toast.error(result.error || "Mã giảm giá không hợp lệ")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi áp dụng mã giảm giá")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
    // Xóa khỏi localStorage
    localStorage.removeItem("appliedDiscount")
    onUpdate({ discountCode: "", discountAmount: 0 })
    toast.success("Đã xóa mã giảm giá")
  }

  const handleNext = () => {
    if (!selectedMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Phương thức thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Phương thức thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMethodChange(method.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className="h-5 w-5 text-orange-600" />
                          <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                            {method.name}
                          </Label>
                          {method.badge && (
                            <Badge variant="default" className="text-xs bg-orange-600">
                              {method.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {method.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Mã giảm giá */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Mã giảm giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!appliedDiscount ? (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleApplyDiscount()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyDiscount} 
                  disabled={!discountCode.trim() || loading}
                >
                  {loading ? "Đang áp dụng..." : "Áp dụng"}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-2">Mã khả dụng:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {discountCodes.map((code) => (
                    <div key={code.code} className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {code.code}
                      </Badge>
                      <span className="text-xs">{code.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
              <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800">{appliedDiscount.code}</p>
                  <p className="text-sm text-green-600">
                    {appliedDiscount.description || appliedDiscount.name}
                  </p>
                  {appliedDiscount.discountAmount > 0 && (
                    <p className="text-xs text-green-700 mt-1">
                      Tiết kiệm: {appliedDiscount.discountAmount.toLocaleString()}đ
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDiscount}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tóm tắt thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </div>
            
            <div className="flex justify-between">
              <span>Phí giao hàng:</span>
              <span>
                {shippingPrice === 0 ? 'Miễn phí' : `${shippingPrice.toLocaleString()}đ`}
              </span>
            </div>
            
            {appliedDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({appliedDiscount.code}):</span>
                <span>-{appliedDiscount.discountAmount.toLocaleString()}đ</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-orange-600">{total.toLocaleString()}đ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Quay lại
        </Button>
        <Button 
          onClick={handleNext}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Tiếp tục
        </Button>
      </div>
    </div>
  )
}
