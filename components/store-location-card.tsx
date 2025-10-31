"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import GoogleMap from "@/components/google-map"

interface StoreLocationInfo {
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
}

interface StoreLocationCardProps {
  className?: string
  showMap?: boolean
  showUserLocation?: boolean
  showDistance?: boolean
}

export default function StoreLocationCard({ 
  className = "",
  showMap = true,
  showUserLocation = false,
  showDistance = false
}: StoreLocationCardProps) {
  const [storeLocation, setStoreLocation] = useState<StoreLocationInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStoreLocation()
  }, [])

  const fetchStoreLocation = async () => {
    try {
      const response = await fetch('/api/store-location')
      const result = await response.json()
      
      if (result.success) {
        setStoreLocation(result.data)
      }
    } catch (error) {
      console.error('Error fetching store location:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!storeLocation) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Không thể tải thông tin cửa hàng</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCurrentDayHours = () => {
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

  return (
    <div className={className}>
      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            {storeLocation.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Địa chỉ</p>
              <p className="text-gray-600 text-sm">{storeLocation.address}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Điện thoại</p>
              <p className="text-gray-600 text-sm">{storeLocation.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Email</p>
              <p className="text-gray-600 text-sm">{storeLocation.email}</p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-medium">Giờ làm việc</p>
              <div className="text-sm text-gray-600">
                <p className="mb-1">
                  <span className="font-medium">Hôm nay:</span> {getCurrentDayHours()}
                  {isOpenNow() ? (
                    <span className="ml-2 text-green-600 font-semibold">• Đang mở</span>
                  ) : (
                    <span className="ml-2 text-red-600 font-semibold">• Đã đóng</span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <p>T2-T6: {storeLocation.workingHours.monday}</p>
                  <p>T7: {storeLocation.workingHours.saturday}</p>
                  <p>CN: {storeLocation.workingHours.sunday}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-gray-700 font-medium mb-2">Dịch vụ</p>
            <div className="flex flex-wrap gap-2">
              {storeLocation.services.map((service, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => window.open(`tel:${storeLocation.phone}`, '_self')}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Gọi ngay
            </Button>
            <Button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeLocation.address)}`, '_blank')}
              variant="outline"
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Chỉ đường
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      {showMap && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Vị trí cửa hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMap 
              address={storeLocation.address}
              className="aspect-video"
              showUserLocation={showUserLocation}
              showDistance={showDistance}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
