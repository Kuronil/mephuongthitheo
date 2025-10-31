"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  MapPin, 
  Send,
  Star,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import Footer from "@/components/footer"
import GoogleMap from "@/components/google-map"
import StoreLocationCard from "@/components/store-location-card"
import { useStoreLocation } from "@/hooks/useStoreLocation"

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

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

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const { storeLocation, loading: storeLoading } = useStoreLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock API call - thay thế bằng API thực tế
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24 giờ.")
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {storeLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin liên hệ...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Store Location Card */}
              <StoreLocationCard 
                showMap={false}
                showUserLocation={false}
                showDistance={false}
                className="h-full"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
                <p className="text-gray-600">
                  Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Chủ đề *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập chủ đề"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Tin nhắn *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập tin nhắn của bạn..."
                      rows={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gửi tin nhắn
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Vị trí cửa hàng
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Tìm đường đến cửa hàng của chúng tôi tại địa chỉ bên dưới
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
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-600">Những câu hỏi phổ biến từ khách hàng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Thời gian giao hàng là bao lâu?</h3>
                <p className="text-gray-600">
                  Chúng tôi giao hàng trong vòng 1-2 giờ đối với đơn hàng trong nội thành TP.HCM. 
                  Đối với các tỉnh thành khác, thời gian giao hàng từ 1-3 ngày.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Có phí giao hàng không?</h3>
                <p className="text-gray-600">
                  Chúng tôi miễn phí giao hàng cho tất cả đơn hàng từ 200.000đ trở lên. 
                  Đơn hàng dưới 200.000đ sẽ có phí giao hàng 30.000đ.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Làm sao để đảm bảo thịt tươi ngon?</h3>
                <p className="text-gray-600">
                  Chúng tôi sử dụng hệ thống bảo quản lạnh chuyên nghiệp và giao hàng nhanh 
                  để đảm bảo thịt luôn tươi ngon đến tay khách hàng.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Có thể đổi trả sản phẩm không?</h3>
                <p className="text-gray-600">
                  Chúng tôi chấp nhận đổi trả trong vòng 24 giờ nếu sản phẩm không đạt chất lượng 
                  hoặc không đúng với mô tả. Liên hệ hotline để được hỗ trợ.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-gray-600">Phản hồi từ những khách hàng đã tin tưởng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Chị Nguyễn Thị A",
                rating: 5,
                comment: "Thịt rất tươi ngon, giao hàng nhanh. Tôi sẽ ủng hộ thường xuyên."
              },
              {
                name: "Anh Trần Văn B",
                rating: 5,
                comment: "Chất lượng thịt vượt mong đợi, giá cả hợp lý. Rất hài lòng!"
              },
              {
                name: "Chị Lê Thị C",
                rating: 5,
                comment: "Dịch vụ chuyên nghiệp, thịt đóng gói cẩn thận. Cảm ơn shop!"
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
