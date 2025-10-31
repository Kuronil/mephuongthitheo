"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Minus, Eye, Star, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import { addToCart } from "@/lib/cart"
import toast from "react-hot-toast"

interface RecommendedProduct {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  image?: string
  category?: string
  rating: number
  reviewCount: number
  isFeatured: boolean
  isFlashSale: boolean
  stock: number
}

interface ProductRecommendationsProps {
  productId?: number
  userId?: number
  type?: 'similar' | 'trending' | 'personalized' | 'mixed' | 'featured' | 'flash-sale'
  title?: string
  limit?: number
  showTitle?: boolean
  className?: string
}

export default function ProductRecommendations({
  productId,
  userId,
  type = 'mixed' as 'similar' | 'trending' | 'personalized' | 'mixed' | 'featured' | 'flash-sale',
  title,
  limit = 8,
  showTitle = true,
  className = ""
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      
      // For featured and flash-sale, use products API directly
      if (type === 'featured' || type === 'flash-sale') {
        const params = new URLSearchParams({
          limit: limit.toString(),
          isActive: 'true'
        })
        
        if (type === 'featured') {
          params.append('isFeatured', 'true')
          params.append('isFlashSale', 'false') // Loại trừ flash sale
        } else if (type === 'flash-sale') {
          params.append('isFlashSale', 'true')
          params.append('isFeatured', 'false') // Loại trừ featured
        }
        
        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data.products || [])
        } else {
          console.error("Failed to fetch products:", data.error)
        }
        return
      }
      
      // For other types, use recommendations API
      const params = new URLSearchParams({
        limit: limit.toString(),
        type
      })

      if (productId) params.append('productId', productId.toString())
      if (userId) params.append('userId', userId.toString())

      const response = await fetch(`/api/recommendations?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data)
      } else {
        console.error("Failed to fetch recommendations:", data.error)
      }
    } catch (error) {
      console.error("Fetch recommendations error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Track user behavior
  const trackBehavior = async (productId: number, action: string) => {
    try {
      await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          productId,
          action,
          metadata: {
            timestamp: new Date().toISOString(),
            type
          }
        })
      })
    } catch (error) {
      console.error("Track behavior error:", error)
    }
  }

  // Quantity management
  const getQuantity = (productId: number) => quantities[productId] || 1

  const updateQuantity = (productId: number, delta: number) => {
    const currentQty = getQuantity(productId)
    const newQty = Math.max(1, currentQty + delta)
    setQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }))
  }

  // Add to cart
  const handleAddToCart = (product: RecommendedProduct) => {
    const qty = getQuantity(product.id)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, qty)
    
    toast.success(`Đã thêm ${qty} ${product.name} vào giỏ hàng`)
    
    // Track behavior
    trackBehavior(product.id, 'add_to_cart')
    
    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }))
  }

  // View product
  const handleViewProduct = (product: RecommendedProduct) => {
    trackBehavior(product.id, 'view')
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  // Get title based on type
  const getTitle = () => {
    if (title) return title
    
    switch (type) {
      case 'similar':
        return 'Sản phẩm tương tự'
      case 'trending':
        return 'Sản phẩm đang hot'
      case 'personalized':
        return 'Dành riêng cho bạn'
      case 'featured':
        return 'Sản phẩm nổi bật'
      case 'flash-sale':
        return '⚡ Flash Sale'
      case 'mixed':
      default:
        return 'Có thể bạn sẽ thích'
    }
  }

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'similar':
        return <Eye className="w-5 h-5" />
      case 'trending':
        return <TrendingUp className="w-5 h-5" />
      case 'personalized':
        return <Sparkles className="w-5 h-5" />
      case 'featured':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'flash-sale':
        return <Sparkles className="w-5 h-5 text-red-500" />
      case 'mixed':
      default:
        return <Star className="w-5 h-5" />
    }
  }

  // Initial load
  useEffect(() => {
    fetchRecommendations()
  }, [productId, userId, type, limit])

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showTitle && (
          <div className="flex items-center gap-2">
            {getIcon()}
            <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className={`text-xl font-semibold ${
            type === 'flash-sale' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {getTitle()}
          </h2>
        </div>
      )}

      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${
        type === 'flash-sale' ? 'bg-red-50 p-4 rounded-lg' : ''
      }`}>
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="relative bg-gray-100 h-40 overflow-hidden group">
              <Link 
                href={`/product/${product.slug}`}
                onClick={() => handleViewProduct(product)}
              >
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </Link>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded font-bold">
                    Nổi bật
                  </span>
                )}
                {product.isFlashSale && (
                  <span className="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold">
                    Flash Sale
                  </span>
                )}
              </div>

              {product.discount && product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                  -{product.discount}%
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <Link 
                href={`/product/${product.slug}`}
                onClick={() => handleViewProduct(product)}
                className="block"
              >
                <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-orange-600 transition">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                {renderStars(product.rating)}
                <span className="text-xs text-gray-600">({product.reviewCount})</span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-3">
                {product.stock === 0 ? (
                  <span className="text-xs text-red-600 font-medium">Hết hàng</span>
                ) : product.stock <= 5 ? (
                  <span className="text-xs text-orange-600 font-medium">Sắp hết hàng</span>
                ) : (
                  <span className="text-xs text-green-600 font-medium">Còn hàng</span>
                )}
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-2">
                {/* Quantity Selector */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 py-1 border-x text-xs">
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

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Link 
                    href={`/product/${product.slug}`}
                    onClick={() => handleViewProduct(product)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded font-semibold flex items-center justify-center gap-1 transition text-xs"
                  >
                    <Eye className="w-3 h-3" />
                    Xem
                  </Link>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold flex items-center justify-center gap-1 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
