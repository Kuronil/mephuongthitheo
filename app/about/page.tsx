import Header from "@/components/header"
import Footer from "@/components/footer"

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <Header /> 

      {/* Hero Section */}
      <section className="bg-linear-gradient-to-br from-orange-500 to-orange-600 text-amber-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Thịt Heo Mẹ Phương</h1>
          <p className="text-lg md:text-xl opacity-90">
            Chúng tôi cam kết cung cấp thịt heo tươi, chất lượng cao nhất cho gia đình bạn
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Câu Chuyện Của Chúng Tôi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Thịt Heo Mẹ Phương được thành lập với mục đích mang đến cho các gia đình Việt Nam những sản phẩm thịt heo
              tươi, an toàn và chất lượng cao nhất.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Với hơn 10 năm kinh nghiệm trong ngành, chúng tôi đã xây dựng được uy tín và lòng tin từ hàng nghìn khách
              hàng trên khắp thành phố.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Mỗi sản phẩm của chúng tôi đều được chọn lọc kỹ lưỡng, đảm bảo tươi ngon và an toàn cho sức khỏe gia đình
              bạn.
            </p>
          </div>
          <div className="bg-orange-100 rounded-lg h-80 flex items-center justify-center">
            <img
              src="/fresh-pork-meat.jpg"
              alt="Thịt heo tươi"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Giá Trị Cốt Lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-orange-50 p-8 rounded-lg border-l-4 border-orange-600">
              <h3 className="text-xl font-bold text-orange-600 mb-3">Chất Lượng</h3>
              <p className="text-gray-600">
                Chúng tôi chỉ cung cấp thịt heo từ những trang trại uy tín, được kiểm dịch kỹ lưỡng.
              </p>
            </div>
            <div className="bg-orange-50 p-8 rounded-lg border-l-4 border-orange-600">
              <h3 className="text-xl font-bold text-orange-600 mb-3">Tươi Ngon</h3>
              <p className="text-gray-600">
                Sản phẩm được giao đến tay khách hàng trong vòng 24 giờ, đảm bảo độ tươi tối đa.
              </p>
            </div>
            <div className="bg-orange-50 p-8 rounded-lg border-l-4 border-orange-600">
              <h3 className="text-xl font-bold text-orange-600 mb-3">Tin Cậy</h3>
              <p className="text-gray-600">
                Với dịch vụ khách hàng 24/7, chúng tôi luôn sẵn sàng hỗ trợ bạn bất kỳ lúc nào.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-linear-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h2>
          <p className="text-lg mb-6 opacity-90">Có câu hỏi? Chúng tôi rất vui lòng được nghe từ bạn!</p>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <div>
              <p className="font-semibold mb-2">Điện Thoại</p>
              <p className="text-lg">0902 759 466</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Email</p>
              <p className="text-lg">info@thitheomephuong.com</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Địa Chỉ</p>
              <p className="text-lg">211 Đường Lê Lâm P.Phú Thạnh Q.Tân Phú, TP.HCM</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
