"use client"

import { ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { addToCart } from "@/lib/cart"
import toast from "react-hot-toast"

export default function HotProducts() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const getQuantity = (productId: number) => quantities[productId] || 1

  const updateQuantity = (productId: number, delta: number) => {
    const currentQty = getQuantity(productId)
    const newQty = Math.max(1, currentQty + delta)
    setQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }))
  }

  const handleAddToCart = (product: typeof products[0]) => {
    const qty = getQuantity(product.id)
    const numericPrice = parseInt(product.price.replace(/[^\d]/g, ''))
    
    addToCart({
      id: product.id,
      name: product.name,
      price: numericPrice,
      image: product.image,
    }, qty)
    
    toast.success(`Đã thêm ${qty} ${product.name} vào giỏ hàng`)
    
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }))
  }

  const products = [
    {
      id: 1,
      name: "[MỤA 0Đ CHO ĐƠN TỪ 248K] Mua 1 tặng Combo Healthy",
      price: "159.000đ",
      oldPrice: "227.000đ",
      discount: "-16%",
      image: "/healthy-meat-combo.jpg",
    },
    {
      id: 2,
      name: "[HSD đến 09/11] Mua 1 tặng Combo Healthy",
      price: "59.000đ",
      oldPrice: "130.000đ",
      discount: "-55%",
      image: "/meat-combo-deal.jpg",
    },
    {
      id: 3,
      name: "Combo Healthy",
      price: "159.000đ",
      oldPrice: "227.000đ",
      discount: "-33%",
      image: "/healthy-combo.jpg",
    },
    {
      id: 4,
      name: "Combo Cuối",
      price: "340.000đ",
      oldPrice: "435.000đ",
      discount: "-19%",
      image: "/meat-combo.jpg",
    },
    {
      id: 5,
      name: "Combo Lại Rai",
      price: "266.000đ",
      oldPrice: "344.000đ",
      discount: "-23%",
      image: "/special-combo.jpg",
    },
  ]

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold">🔥 SẢN PHẨM HOT</div>
            <div className="hidden md:block">
              <img src="/meat-deli-hot-products-banner.jpg" alt="Hot products" className="h-20 object-cover rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
                <span className="absolute top-3 left-3 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                  {product.discount}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3 line-clamp-2 h-10">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-orange-600 font-bold text-lg">{product.price}</span>
                  <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>
                </div>
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 py-1 border-x text-sm">
                      {getQuantity(product.id)}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Eye className="w-3 h-3" />
                    Xem
                  </Link>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
