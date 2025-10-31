"use client"

import { useState, useEffect } from "react"
import { Truck, Clock, MapPin, Package, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ShippingData {
  method: string
  price: number
  estimatedDays: string
  timeSlot: string
  discountCode?: string
}

interface Step2Props {
  data: ShippingData
  onUpdate: (data: Partial<ShippingData>) => void
  onNext: () => void
  onPrev: () => void
}

const timeSlots = [
  { id: "morning", label: "Sáng (8:00 - 12:00)", description: "Giao hàng buổi sáng" },
  { id: "afternoon", label: "Chiều (13:00 - 17:00)", description: "Giao hàng buổi chiều" },
  { id: "evening", label: "Tối (18:00 - 21:00)", description: "Giao hàng buổi tối" },
  { id: "anytime", label: "Bất kỳ lúc nào", description: "Không giới hạn thời gian" }
]

export default function Step2Shipping({ data, onUpdate, onNext, onPrev }: Step2Props) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(data.timeSlot || "")
  const [discountCode, setDiscountCode] = useState(data.discountCode || "")
  const [appliedCode, setAppliedCode] = useState(data.discountCode || "")
  
  // Calculate shipping price based on discount code
  const shippingPrice = appliedCode.toUpperCase() === "FREESHIP" ? 0 : 15000
  const shippingMethod = appliedCode.toUpperCase() === "FREESHIP" 
    ? "Miễn phí giao hàng" 
    : "Giao hàng tiêu chuẩn"

  // Update shipping info when applied code changes
  useEffect(() => {
    onUpdate({
      method: shippingMethod,
      price: shippingPrice,
      estimatedDays: "1-2 ngày",
      discountCode: appliedCode
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCode, shippingPrice, shippingMethod])

  const handleTimeSlotChange = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot)
    onUpdate({ timeSlot })
  }

  const handleApplyCode = () => {
    const code = discountCode.trim().toUpperCase()
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá")
      return
    }
    
    if (code === "FREESHIP") {
      setAppliedCode(code)
      toast.success("✅ Đã áp dụng mã FREESHIP - Miễn phí giao hàng!")
    } else {
      toast.error("Mã giảm giá không hợp lệ. Sử dụng mã 'FREESHIP' để miễn phí ship.")
    }
  }

  const handleRemoveCode = () => {
    setDiscountCode("")
    setAppliedCode("")
    toast.success("Đã xóa mã giảm giá")
  }

  const handleNext = () => {
    if (!selectedTimeSlot) {
      toast.error("Vui lòng chọn thời gian giao hàng")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Phương thức giao hàng */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Phương thức giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{shippingMethod}</h3>
                  <p className="text-sm text-gray-600">Thời gian giao hàng: 1-2 ngày</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {shippingPrice === 0 ? 'Miễn phí' : `${shippingPrice.toLocaleString()}đ`}
                </p>
              </div>
            </div>
            
            {appliedCode && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">
                      Đã áp dụng mã: {appliedCode}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Tiết kiệm {(15000).toLocaleString()}đ
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Mã giảm giá giao hàng */}
          <div className="mt-6">
            <Label className="text-base font-semibold mb-3 block">
              <Tag className="h-4 w-4 inline mr-2" />
              Mã giảm giá giao hàng
            </Label>
            
            {!appliedCode ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã FREESHIP"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyCode}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  Áp dụng
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleRemoveCode}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Xóa mã giảm giá
              </Button>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              💡 Sử dụng mã <strong className="text-orange-600">FREESHIP</strong> để được miễn phí giao hàng
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Thời gian giao hàng */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Thời gian giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedTimeSlot} onValueChange={handleTimeSlotChange}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTimeSlot === slot.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTimeSlotChange(slot.id)}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={slot.id} id={slot.id} />
                    <div>
                      <Label htmlFor={slot.id} className="font-semibold cursor-pointer">
                        {slot.label}
                      </Label>
                      <p className="text-sm text-gray-600">{slot.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Thông tin bổ sung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Thông tin giao hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📦 Thông tin giao hàng</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Chúng tôi sẽ gọi điện xác nhận trước khi giao hàng</li>
              <li>• Thời gian giao hàng có thể thay đổi tùy theo tình hình thực tế</li>
              <li>• Vui lòng đảm bảo có người nhận hàng tại địa chỉ đã cung cấp</li>
              <li>• Liên hệ hotline: 1900-xxxx nếu cần hỗ trợ</li>
            </ul>
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
