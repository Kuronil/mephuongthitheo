"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  UserPlus, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function NewUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    loyaltyTier: 'BRONZE'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Thành công",
          description: "Đã tạo người dùng mới thành công",
        })
        router.push('/admin/users')
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Có lỗi xảy ra khi tạo người dùng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo người dùng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng mới</h1>
              <p className="text-gray-600">Tạo tài khoản người dùng mới trong hệ thống</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Thông tin người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên đầy đủ *</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nhập tên đầy đủ"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Nhập địa chỉ email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Thông tin liên hệ</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <Textarea
                      id="address"
                      placeholder="Nhập địa chỉ đầy đủ"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Loyalty Program */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Chương trình thành viên</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="loyaltyTier">Cấp độ thành viên</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Select
                      value={formData.loyaltyTier}
                      onValueChange={(value) => handleInputChange('loyaltyTier', value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Chọn cấp độ thành viên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRONZE">Bronze - 0 điểm</SelectItem>
                        <SelectItem value="SILVER">Silver - 500 điểm</SelectItem>
                        <SelectItem value="GOLD">Gold - 1500 điểm</SelectItem>
                        <SelectItem value="PLATINUM">Platinum - 3000 điểm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-500">
                    Người dùng mới sẽ bắt đầu với cấp độ Bronze và 0 điểm tích lũy
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/users')}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Tạo người dùng
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
