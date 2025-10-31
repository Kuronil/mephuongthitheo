"use client"

import { useState } from "react"
import { MapPin, User, Phone, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface CustomerInfo {
  name: string
  phone: string
  email: string
  address: string
  note?: string
}

interface Step1Props {
  data: CustomerInfo
  onUpdate: (data: Partial<CustomerInfo>) => void
  onNext: () => void
}

export default function Step1InfoAddress({ data, onUpdate, onNext }: Step1Props) {
  const [formData, setFormData] = useState<CustomerInfo>(data)
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof CustomerInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<CustomerInfo> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Họ tên là bắt buộc"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc"
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onUpdate(formData)
      onNext()
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Thông tin giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Họ và tên *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Nhập email"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="address">Địa chỉ giao hàng *</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Nhập địa chỉ đầy đủ (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
            rows={3}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
        </div>

        <div>
          <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
          <Textarea
            id="note"
            name="note"
            value={formData.note || ""}
            onChange={handleInputChange}
            placeholder="Ghi chú thêm cho đơn hàng..."
            rows={2}
          />
        </div>

        {/* Address Suggestions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Gợi ý địa chỉ</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ghi rõ số nhà, tên đường</li>
            <li>• Bao gồm phường/xã, quận/huyện</li>
            <li>• Thêm tên tỉnh/thành phố</li>
            <li>• Có thể thêm hướng dẫn địa điểm nổi bật</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Tiếp tục
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
