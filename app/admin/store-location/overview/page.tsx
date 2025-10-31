"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  MapPin, 
  Store, 
  Settings, 
  Eye, 
  Edit, 
  Phone, 
  Mail, 
  Clock,
  Navigation,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StoreLocationCard from "@/components/store-location-card"
import GoogleMap from "@/components/google-map"
import AdminLayout from "@/components/AdminLayout"

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

function AdminStoreLocationOverviewContent() {
  const router = useRouter()
  const [storeLocation, setStoreLocation] = useState<StoreLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'map'>('overview')

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
      } else {
        console.error('Failed to fetch store location:', result.error)
      }
    } catch (error) {
      console.error('Error fetching store location:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentDayHours = () => {
    if (!storeLocation) return 'Nghỉ'
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[new Date().getDay()]
    return storeLocation.workingHours[today as keyof typeof storeLocation.workingHours]
  }

  const isOpenNow = () => {
    const hours = getCurrentDayHours()
    if (hours === 'Nghỉ') return false
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    // Simple check - assumes format like "8:00 - 18:00"
    const [openTime, closeTime] = hours.split(' - ')
    const [openHour, openMin] = openTime.split(':').map(Number)
    const [closeHour, closeMin] = closeTime.split(':').map(Number)
    
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin
    
    return currentTime >= openMinutes && currentTime <= closeMinutes
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h1>
              <p className="text-gray-600">Quản lý thông tin vị trí và liên hệ cửa hàng</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Về Dashboard
              </Button>
              <Button onClick={() => router.push('/admin/store-location/edit')}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="mx-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Tổng quan
            </Button>
            <Button
              onClick={() => setActiveTab('map')}
              variant={activeTab === 'map' ? 'default' : 'ghost'}
              className="mx-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Bản đồ
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Store Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Trạng thái cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {isOpenNow() ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Trạng thái</h3>
                    <Badge className={isOpenNow() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {isOpenNow() ? "Đang mở" : "Đã đóng"}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Giờ làm việc</h3>
                    <p className="text-sm text-gray-600">{getCurrentDayHours()}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cập nhật cuối</h3>
                    <p className="text-sm text-gray-600">
                      {storeLocation?.updatedAt ? new Date(storeLocation.updatedAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StoreLocationCard 
                showMap={false}
                className="h-full"
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Thao tác nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`tel:${storeLocation?.phone}`, '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Gọi điện thoại cửa hàng
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`mailto:${storeLocation?.email}`, '_self')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Gửi email
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeLocation?.address || '')}`, '_blank')}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Mở trong Google Maps
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push('/admin/store-location/edit')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa thông tin
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Bản đồ cửa hàng
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Xem vị trí cửa hàng trên bản đồ với các tính năng tương tác
                </p>
              </CardHeader>
              <CardContent>
                <GoogleMap 
                  address={storeLocation?.address || "211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM"}
                  className="aspect-video"
                  showUserLocation={true}
                  showDistance={true}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminStoreLocationOverviewPage() {
  return (
    <AdminLayout>
      <AdminStoreLocationOverviewContent />
    </AdminLayout>
  )
}
