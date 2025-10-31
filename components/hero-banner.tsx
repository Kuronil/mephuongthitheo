"use client"
import { useState } from "react"

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "ĐẶT SĂN DEAL MÊ LY",
      subtitle: "Thịt tươi, chất lượng cao",
      offers: [
        { label: "VOUCHER GIẢM ĐẾN", value: "70K" },
        { label: "ĐÓNG GIÁ PHI SHIP", value: "15K" },
      ],
    },
  ]

  return (
    <div className="relative bg-linear-gradient-to-br from-orange-300 to-orange-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl font-black mb-4 text-orange-600 drop-shadow-lg">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg mb-8 text-gray-700">{slides[currentSlide].subtitle}</p>

            {/* Offers */}
            <div className="flex gap-4 flex-wrap">
              {slides[currentSlide].offers.map((offer, idx) => (
                <div key={idx} className="bg-orange-600 text-white px-6 py-4 rounded-lg font-bold text-center">
                  <div className="text-sm">{offer.label}</div>
                  <div className="text-3xl">{offer.value}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-600 mt-6">
              *Áp dụng cho đơn hàng từ 248k khu vực TP
              <br />
              **Đơn hàng giao sau 2-3 ngày
            </p>
          </div>

          {/* Right Image */}
          <div className="relative h-80 md:h-96 bg-white rounded-lg overflow-hidden">
            <div className="w-full h-full bg-linear-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              <img
                src="/meat-deli-fresh-meat-products.jpg"
                alt="Meat products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[0].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition ${currentSlide === idx ? "bg-orange-600" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
