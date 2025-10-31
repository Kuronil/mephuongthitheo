"use client"

import { useState } from "react"
import { MapPin, Navigation, Users, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"
import GoogleMap from "@/components/google-map"
import StoreLocationCard from "@/components/store-location-card"

export default function StoreLocationDemoPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'interactive' | 'admin'>('basic')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tính năng vị trí cửa hàng</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá các tính năng mới để xác định vị trí và hiển thị khoảng cách đến cửa hàng
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              onClick={() => setActiveTab('basic')}
              variant={activeTab === 'basic' ? 'default' : 'ghost'}
              className="mx-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Bản đồ cơ bản
            </Button>
            <Button
              onClick={() => setActiveTab('interactive')}
              variant={activeTab === 'interactive' ? 'default' : 'ghost'}
              className="mx-1"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Tương tác
            </Button>
            <Button
              onClick={() => setActiveTab('admin')}
              variant={activeTab === 'admin' ? 'default' : 'ghost'}
              className="mx-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Quản lý
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Basic Map Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Bản đồ cơ bản
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Hiển thị vị trí cửa hàng với marker và thông tin cơ bản
                  </p>
                </CardHeader>
                <CardContent>
                  <GoogleMap 
                    address="211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM"
                    className="aspect-video"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Thông tin cửa hàng
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Card hiển thị thông tin chi tiết về cửa hàng
                  </p>
                </CardHeader>
                <CardContent>
                  <StoreLocationCard 
                    showMap={false}
                    className="h-full"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Interactive Map Tab */}
          {activeTab === 'interactive' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Bản đồ tương tác với vị trí người dùng
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Xác định vị trí của bạn và tính khoảng cách đến cửa hàng
                  </p>
                </CardHeader>
                <CardContent>
                  <GoogleMap 
                    address="211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM"
                    className="aspect-video"
                    showUserLocation={true}
                    showDistance={true}
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tính năng chính</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Xác định vị trí</p>
                        <p className="text-sm text-gray-600">Tự động lấy vị trí hiện tại của bạn</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tính khoảng cách</p>
                        <p className="text-sm text-gray-600">Hiển thị khoảng cách và thời gian di chuyển</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Marker tương tác</p>
                        <p className="text-sm text-gray-600">Marker cho cửa hàng và vị trí của bạn</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hướng dẫn sử dụng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
                      <p className="text-sm">Click nút "Vị trí của tôi" để xác định vị trí hiện tại</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
                      <p className="text-sm">Click "Tính khoảng cách" để xem khoảng cách đến cửa hàng</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
                      <p className="text-sm">Sử dụng "Mở trong Google Maps" để chỉ đường</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quản lý vị trí cửa hàng
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Cập nhật thông tin cửa hàng và xem trước bản đồ
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Trang quản lý admin</h3>
                    <p className="text-gray-600 mb-6">
                      Truy cập trang quản lý để cập nhật thông tin cửa hàng
                    </p>
                    <Button
                      onClick={() => window.open('/admin/store-location', '_blank')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Mở trang quản lý
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <code className="text-sm">
                        GET /api/store-location
                      </code>
                      <p className="text-xs text-gray-600 mt-1">Lấy thông tin cửa hàng</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <code className="text-sm">
                        PUT /api/store-location
                      </code>
                      <p className="text-xs text-gray-600 mt-1">Cập nhật thông tin cửa hàng</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Components</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <code className="text-sm">GoogleMap</code>
                      <p className="text-xs text-gray-600 mt-1">Component bản đồ với tính năng tương tác</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <code className="text-sm">StoreLocationCard</code>
                      <p className="text-xs text-gray-600 mt-1">Card hiển thị thông tin cửa hàng</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Features Summary */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng đã hoàn thành</h2>
            <p className="text-gray-600">Tất cả các tính năng quản lý vị trí cửa hàng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">API Quản lý</h3>
                <p className="text-sm text-gray-600">
                  Endpoint để lấy và cập nhật thông tin vị trí cửa hàng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Xác định vị trí</h3>
                <p className="text-sm text-gray-600">
                  Tự động lấy vị trí người dùng và hiển thị trên bản đồ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Tính khoảng cách</h3>
                <p className="text-sm text-gray-600">
                  Hiển thị khoảng cách và thời gian di chuyển đến cửa hàng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trang Admin</h3>
                <p className="text-sm text-gray-600">
                  Giao diện quản lý để cập nhật thông tin cửa hàng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Bản đồ tương tác</h3>
                <p className="text-sm text-gray-600">
                  Marker, đường kết nối và thông tin chi tiết
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Component tái sử dụng</h3>
                <p className="text-sm text-gray-600">
                  StoreLocationCard để hiển thị thông tin cửa hàng
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
