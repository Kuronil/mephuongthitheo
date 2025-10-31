"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Save,
  Edit,
  RefreshCw,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import GoogleMap from "@/components/google-map"

interface StoreLocation {
  id: number
  name: string
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  workingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  services: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditStoreLocationPage() {
  const router = useRouter()
  const [storeLocation, setStoreLocation] = useState<StoreLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    coordinates: { lat: 10.7769, lng: 106.6309 },
    workingHours: {
      monday: '8:00 - 18:00',
      tuesday: '8:00 - 18:00',
      wednesday: '8:00 - 18:00',
      thursday: '8:00 - 18:00',
      friday: '8:00 - 18:00',
      saturday: '8:00 - 12:00',
      sunday: 'Nghỉ'
    },
    services: ['Giao hàng tận nơi', 'Thịt tươi ngon', 'Đóng gói cẩn thận', 'Hỗ trợ 24/7']
  })

  useEffect(() => {
    fetchStoreLocation()
  }, [])

  const fetchStoreLocation = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/store-location')
      const result = await response.json()
      
      if (result.success) {
        setStoreLocation(result.data)
        setFormData({
          name: result.data.name,
          address: result.data.address,
          phone: result.data.phone,
          email: result.data.email,
          coordinates: result.data.coordinates,
          workingHours: result.data.workingHours,
          services: result.data.services
        })
      } else {
        toast.error('Không thể tải thông tin cửa hàng')
      }
    } catch (error) {
      console.error('Error fetching store location:', error)
      toast.error('Có lỗi xảy ra khi tải thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/store-location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStoreLocation(result.data)
        toast.success('Cập nhật thông tin cửa hàng thành công!')
        router.push('/admin/store-location/overview')
      } else {
        toast.error(result.error || 'Có lỗi xảy ra khi cập nhật')
      }
    } catch (error) {
      console.error('Error updating store location:', error)
      toast.error('Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleWorkingHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: value
      }
    }))
  }

  const handleServiceChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? value : service)
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, '']
    }))
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
              <p className="text-gray-600">Đang tải thông tin cửa hàng...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin cửa hàng</h1>
              <p className="text-gray-600">Cập nhật thông tin vị trí và liên hệ của cửa hàng</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/admin/store-location/overview')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Store Information Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Thông tin cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Tên cửa hàng *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên cửa hàng"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Nhập địa chỉ cửa hàng"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
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
                      />
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <Label className="text-base font-semibold">Giờ làm việc</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {Object.entries(formData.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-2">
                        <Label className="w-20 text-sm capitalize">{day}:</Label>
                        <Input
                          value={hours}
                          onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">Dịch vụ</Label>
                    <Button
                      onClick={addService}
                      variant="outline"
                      size="sm"
                    >
                      Thêm dịch vụ
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={service}
                          onChange={(e) => handleServiceChange(index, e.target.value)}
                          placeholder="Nhập dịch vụ"
                        />
                        {formData.services.length > 1 && (
                          <Button
                            onClick={() => removeService(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Xem trước bản đồ
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Bản đồ sẽ hiển thị vị trí cửa hàng với địa chỉ đã cập nhật
                </p>
              </CardHeader>
              <CardContent>
                <GoogleMap 
                  address={formData.address}
                  className="aspect-video"
                  showUserLocation={true}
                  showDistance={true}
                />
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Trạng thái cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Cửa hàng đang hoạt động</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Cập nhật lần cuối: {storeLocation?.updatedAt ? new Date(storeLocation.updatedAt).toLocaleString('vi-VN') : 'Chưa có'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
