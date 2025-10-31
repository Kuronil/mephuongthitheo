"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, MapPin, Clock } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Sản phẩm
  {
    id: 1,
    question: "Thịt heo của cửa hàng có tươi không?",
    answer: "Tất cả thịt heo của chúng tôi đều được nhập từ các trang trại uy tín, đảm bảo tươi ngon và chất lượng cao. Thịt được giữ lạnh từ khâu giết mổ đến khi giao hàng.",
    category: "Sản phẩm"
  },
  {
    id: 2,
    question: "Có những loại thịt heo nào?",
    answer: "Chúng tôi cung cấp đầy đủ các loại thịt heo: nạc vai, ba chỉ, sườn, cốt lết, chân giò, thịt xay và các sản phẩm chế biến như giăm bông, xúc xích, thịt xông khói.",
    category: "Sản phẩm"
  },
  {
    id: 3,
    question: "Thịt có được đóng gói như thế nào?",
    answer: "Thịt được đóng gói trong túi chuyên dụng, có tem nhãn ghi rõ ngày sản xuất, hạn sử dụng và thông tin sản phẩm. Đảm bảo vệ sinh an toàn thực phẩm.",
    category: "Sản phẩm"
  },
  {
    id: 4,
    question: "Có thể chọn trọng lượng thịt không?",
    answer: "Có, bạn có thể chọn trọng lượng theo nhu cầu từ 0.5kg đến 5kg. Chúng tôi sẽ cắt thịt theo yêu cầu và đóng gói cẩn thận.",
    category: "Sản phẩm"
  },

  // Đặt hàng & Giao hàng
  {
    id: 5,
    question: "Làm thế nào để đặt hàng?",
    answer: "Bạn có thể đặt hàng qua website, gọi điện trực tiếp hoặc đến cửa hàng. Đơn hàng online sẽ được xử lý trong vòng 30 phút và giao hàng trong ngày.",
    category: "Đặt hàng & Giao hàng"
  },
  {
    id: 6,
    question: "Phí giao hàng là bao nhiêu?",
    answer: "Miễn phí giao hàng cho đơn hàng từ 200,000đ trong bán kính 5km. Đơn hàng dưới 200,000đ phí giao hàng 15,000đ. Ngoài bán kính 5km phí giao hàng 25,000đ.",
    category: "Đặt hàng & Giao hàng"
  },
  {
    id: 7,
    question: "Thời gian giao hàng là bao lâu?",
    answer: "Giao hàng trong ngày cho đơn hàng đặt trước 14h. Đơn hàng đặt sau 14h sẽ được giao vào ngày hôm sau. Thời gian giao hàng: 8h-18h các ngày trong tuần.",
    category: "Đặt hàng & Giao hàng"
  },
  {
    id: 8,
    question: "Có giao hàng vào cuối tuần không?",
    answer: "Có, chúng tôi giao hàng cả thứ 7 và chủ nhật. Thời gian giao hàng cuối tuần: 8h-16h.",
    category: "Đặt hàng & Giao hàng"
  },

  // Thanh toán
  {
    id: 9,
    question: "Các phương thức thanh toán nào được chấp nhận?",
    answer: "Chúng tôi chấp nhận thanh toán COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay) và thẻ tín dụng.",
    category: "Thanh toán"
  },
  {
    id: 10,
    question: "Có được trả góp không?",
    answer: "Hiện tại chúng tôi chưa hỗ trợ thanh toán trả góp. Tất cả đơn hàng cần thanh toán đầy đủ khi đặt hàng hoặc khi nhận hàng.",
    category: "Thanh toán"
  },
  {
    id: 11,
    question: "Có mã giảm giá không?",
    answer: "Có, chúng tôi thường xuyên có các chương trình khuyến mãi và mã giảm giá. Theo dõi website và fanpage để cập nhật các ưu đãi mới nhất.",
    category: "Thanh toán"
  },

  // Chính sách & Bảo hành
  {
    id: 12,
    question: "Chính sách đổi trả như thế nào?",
    answer: "Chúng tôi cam kết đổi trả 100% nếu sản phẩm không đúng chất lượng hoặc bị hỏng trong quá trình vận chuyển. Liên hệ hotline để được hỗ trợ.",
    category: "Chính sách & Bảo hành"
  },
  {
    id: 13,
    question: "Thịt có bảo hành không?",
    answer: "Thịt tươi có hạn sử dụng 3-5 ngày trong tủ lạnh. Chúng tôi đảm bảo chất lượng sản phẩm đến tay khách hàng. Nếu có vấn đề về chất lượng, vui lòng liên hệ ngay.",
    category: "Chính sách & Bảo hành"
  },
  {
    id: 14,
    question: "Có chứng nhận vệ sinh an toàn thực phẩm không?",
    answer: "Có, cửa hàng có đầy đủ giấy phép kinh doanh và chứng nhận vệ sinh an toàn thực phẩm. Tất cả sản phẩm đều được kiểm định chất lượng.",
    category: "Chính sách & Bảo hành"
  },

  // Khác
  {
    id: 15,
    question: "Có dịch vụ cắt thịt theo yêu cầu không?",
    answer: "Có, chúng tôi cung cấp dịch vụ cắt thịt theo yêu cầu của khách hàng. Bạn có thể yêu cầu cắt thành miếng nhỏ, lát mỏng hoặc theo hình dạng mong muốn.",
    category: "Khác"
  },
  {
    id: 16,
    question: "Có tư vấn cách chế biến thịt không?",
    answer: "Có, đội ngũ nhân viên của chúng tôi sẵn sàng tư vấn cách chế biến thịt ngon và phù hợp với từng loại thịt. Liên hệ để được hỗ trợ.",
    category: "Khác"
  },
  {
    id: 17,
    question: "Có bán sỉ không?",
    answer: "Có, chúng tôi có chính sách giá sỉ cho các nhà hàng, quán ăn và khách hàng mua số lượng lớn. Liên hệ để được báo giá chi tiết.",
    category: "Khác"
  },
  {
    id: 18,
    question: "Giờ mở cửa của cửa hàng?",
    answer: "Cửa hàng mở cửa từ 6h-20h các ngày trong tuần và 6h-18h cuối tuần. Dịch vụ giao hàng hoạt động từ 8h-18h các ngày trong tuần.",
    category: "Khác"
  }
]

const categories = ["Tất cả", "Sản phẩm", "Đặt hàng & Giao hàng", "Thanh toán", "Chính sách & Bảo hành", "Khác"]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const filteredFAQs = selectedCategory === "Tất cả" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Câu Hỏi Thường Gặp</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tìm hiểu thông tin về sản phẩm, dịch vụ và chính sách của cửa hàng thịt heo Mẹ Phương Thị Thị
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category 
                    ? "bg-orange-600 text-white hover:bg-orange-700" 
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="border border-gray-200 hover:border-orange-300 transition-colors">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleExpanded(faq.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {faq.category}
                    </Badge>
                    <CardTitle className="text-lg text-gray-900 hover:text-orange-600 transition-colors">
                      {faq.question}
                    </CardTitle>
                  </div>
                  {expandedItems.includes(faq.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              
              {expandedItems.includes(faq.id) && (
                <CardContent className="pt-0">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="bg-linear-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy câu trả lời?
              </h2>
              <p className="text-gray-600">
                Liên hệ với chúng tôi để được hỗ trợ trực tiếp
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Gọi điện</h3>
                <p className="text-gray-600 mb-3">Hotline 24/7</p>
                <a 
                  href="tel:0123456789" 
                  className="text-orange-600 font-semibold hover:text-orange-700"
                >
                  0123 456 789
                </a>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-3">Phản hồi trong 24h</p>
                <a 
                  href="mailto:support@mephuongthitheo.com" 
                  className="text-orange-600 font-semibold hover:text-orange-700"
                >
                  support@mephuongthitheo.com
                </a>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Địa chỉ</h3>
                <p className="text-gray-600 mb-3">Đến cửa hàng</p>
                <p className="text-orange-600 font-semibold">
                  123 Đường ABC, Quận XYZ, TP.HCM
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Giờ làm việc: 6h-20h (T2-T7), 6h-18h (CN)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
