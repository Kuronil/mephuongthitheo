import { Truck, Shield, Clock } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Truck,
      title: "Đóng giá vận chuyển 15k",
      description: "Giao hàng nhanh chóng",
    },
    {
      icon: Shield,
      title: "Ưu đãi từ nhà máy đến tay bạn",
      description: "Chất lượng đảm bảo",
    },
    {
      icon: Clock,
      title: "Đảm bảo tươi mới, giao hàng 1-2-3 ngày",
      description: "Thịt tươi mỗi ngày",
    },
  ]

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-100 p-4 rounded-full">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
