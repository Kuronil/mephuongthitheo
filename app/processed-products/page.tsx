"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ShoppingCart, Plus, Minus, Eye } from "lucide-react"
import { addToCart } from "@/lib/cart"
import toast from "react-hot-toast"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  image?: string
  images?: string[]
  category?: string
  subcategory?: string
  brand?: string
  weight?: number
  unit?: string
  stock: number
  minStock: number
  rating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
  isFlashSale: boolean
  description?: string
  nutrition?: any
  storage?: string
  expiry?: number
  tags: string[]
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
export default function ProcessedProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [advancedFilters, setAdvancedFilters] = useState<any>({})
  
  // Fetch processed products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?category=Thịt chế biến')
        
        // Kiểm tra content-type trước khi parse JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("API returned non-JSON response:", text.substring(0, 200))
          toast.error("Lỗi khi tải danh sách sản phẩm. Vui lòng thử lại sau.")
          return
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          console.error("API error response:", errorData)
          toast.error(errorData.error || "Lỗi khi tải danh sách sản phẩm")
          return
        }

        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data.products || [])
        } else {
          toast.error("Lỗi khi tải danh sách sản phẩm")
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error("Lỗi khi tải danh sách sản phẩm")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const updateQuantity = (productId: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change)
    }))
  }

  const getQuantity = (productId: number) => {
    return quantities[productId] || 0
  }

  const handleAddToCart = async (product: Product) => {
    const quantity = getQuantity(product.id)
    if (quantity === 0) {
      toast.error("Vui lòng chọn số lượng")
      return
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      }, quantity)
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`)
      setQuantities(prev => ({ ...prev, [product.id]: 0 }))
    } catch (error) {
      toast.error("Lỗi khi thêm vào giỏ hàng")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải sản phẩm...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Sản phẩm chế biến</h1>
          <p className="text-orange-100">Các sản phẩm thịt chế biến thơm ngon, tiện lợi</p>
        </div>
      </div>

     

      
      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có sản phẩm chế biến</h3>
            <p className="text-gray-500">Hiện tại chưa có sản phẩm chế biến nào</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <Link 
                href={`/product/${product.slug}`}
                className="relative bg-gray-100 h-48 overflow-hidden group cursor-pointer block"
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.discount && product.discount > 0 && (
                  <div className="absolute top-3 right-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.discount}%
                  </div>
                )}
                {product.isFlashSale && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    Flash Sale
                  </div>
                )}
                {product.isFeatured && (
                  <div className="absolute bottom-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Nổi bật
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>

                {/* Category & Brand */}
                <div className="flex items-center gap-2 mb-2">
                  {product.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                  )}
                  {product.brand && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">{product.brand}</span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviewCount})</span>
                </div>

                {/* Price & Weight */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-orange-600">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.weight && (
                    <div className="text-sm text-gray-600">
                      {product.weight} {product.unit}
                    </div>
                  )}
                </div>

                {/* Stock Alert */}
                {product.stock <= product.minStock && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    ⚠️ Chỉ còn {product.stock} sản phẩm
                  </div>
                )}

                {/* Add to Cart Section */}
                <div className="space-y-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 border-x">
                        {getQuantity(product.id)}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/product/${product.slug}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <Footer />
    </main>
  )
}