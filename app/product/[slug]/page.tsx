"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, ShoppingCart, Plus, Minus, Heart, Share2, Package, Truck, Shield } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductReviews from "@/components/product-reviews"
import ProductRecommendations from "@/components/product-recommendations"
import StockAlert from "@/components/stock-alert"
import { addToCart } from "@/lib/cart"
import { addToWishlist, removeFromWishlist } from "@/lib/wishlist"
import { useAuth } from "@/hooks/useAuth"
import toast from "react-hot-toast"

interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  originalPrice?: number
  discount?: number
  image?: string
  images: string[]
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
  tags: string[]
  nutrition?: any
  storage?: string
  expiry?: number
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const { user } = useAuth(false)
  const params = useParams()
  const productId = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [currentUserId, setCurrentUserId] = useState<number | undefined>()
  const [isInWishlist, setIsInWishlist] = useState(false)

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      
      // Kiểm tra content-type trước khi parse JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("API returned non-JSON response:", text.substring(0, 200))
        toast.error("Lỗi khi tải sản phẩm. Vui lòng thử lại sau.")
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API error response:", errorData)
        toast.error(errorData.error || "Không tìm thấy sản phẩm")
        return
      }

      const data = await response.json()

      if (data.success) {
        setProduct(data.data)
      } else {
        toast.error("Không tìm thấy sản phẩm")
      }
    } catch (error) {
      console.error("Fetch product error:", error)
      toast.error("Lỗi khi tải sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  // Add to cart
  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, quantity)

    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`)
    setQuantity(1)
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
            className={`w-5 h-5 ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  // Initial load
  useEffect(() => {
    fetchProduct()
  }, [productId])

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user?.id || !product?.id) return
      
      try {
        const response = await fetch('/api/account/wishlist', {
          headers: {
            'x-user-id': user.id.toString()
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const inWishlist = data.data.items.some((item: any) => item.productId === product.id)
          setIsInWishlist(inWishlist)
        }
      } catch (error) {
        console.error('Error checking wishlist:', error)
      }
    }
    
    checkWishlist()
  }, [user, product])

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích')
      return
    }

    if (!product) return

    if (isInWishlist) {
      // Remove from wishlist
      const success = await removeFromWishlist(product.id, user.id)
      if (success) {
        setIsInWishlist(false)
        toast.success('Đã xóa khỏi danh sách yêu thích')
      } else {
        toast.error('Không thể xóa khỏi danh sách yêu thích')
      }
    } else {
      // Add to wishlist
      const success = await addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        originalPrice: product.originalPrice,
        discount: product.discount,
        rating: product.rating,
        reviews: product.reviewCount
      }, user.id)
      
      if (success) {
        setIsInWishlist(true)
        toast.success('Đã thêm vào danh sách yêu thích')
      } else {
        toast.error('Không thể thêm vào danh sách yêu thích')
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải sản phẩm...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h1>
            <p className="text-gray-500">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const allImages = product.image ? [product.image, ...product.images] : product.images

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={allImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600">
              <span>Trang chủ</span>
              <span className="mx-2">/</span>
              <span>Sản phẩm</span>
              {product.category && (
                <>
                  <span className="mx-2">/</span>
                  <span>{product.category}</span>
                </>
              )}
            </nav>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                {renderStars(product.rating)}
                <span className="text-gray-600">({product.reviewCount} đánh giá)</span>
                {product.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Nổi bật</span>
                )}
                {product.isFlashSale && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">Flash Sale</span>
                )}
                </div>
              </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-orange-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                      -{product.discount}%
                </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Alert */}
            <StockAlert productId={product.id} />

            {/* Product Details */}
            <div className="space-y-4">
              {product.brand && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Thương hiệu:</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Trọng lượng:</span>
                  <span className="font-medium">{product.weight} {product.unit}</span>
                </div>
              )}
              {product.storage && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Bảo quản:</span>
                  <span className="font-medium">{product.storage}</span>
                </div>
              )}
              {product.expiry && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Hạn sử dụng:</span>
                  <span className="font-medium">{product.expiry} ngày</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
            <div>
                <span className="text-gray-600 mb-2 block">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                ))}
              </div>
            </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
            <div className="flex items-center gap-4">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center border rounded">
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                    onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-lg transition ${
                    isInWishlist
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Đã sao chép link sản phẩm')
                  }}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Chia sẻ sản phẩm"
                >
                  <Share2 className="w-5 h-5" />
                </button>
            </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Giao hàng nhanh</p>
                  <p className="text-sm text-gray-600">1-3 ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Đảm bảo chất lượng</p>
                  <p className="text-sm text-gray-600">Tươi ngon</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Đóng gói cẩn thận</p>
                  <p className="text-sm text-gray-600">An toàn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Mô tả' },
                { id: 'nutrition', label: 'Thông tin dinh dưỡng' },
                { id: 'reviews', label: `Đánh giá (${product.reviewCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
              </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
            <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Sản phẩm chất lượng cao, tươi ngon và đảm bảo an toàn thực phẩm."}
                </p>
              </div>
            )}

            {activeTab === 'nutrition' && product.nutrition && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin dinh dưỡng</h3>
                  <div className="space-y-3">
                    {Object.entries(product.nutrition).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                </div>
                    ))}
                </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Bảo quản trong tủ lạnh ở nhiệt độ 0-4°C</li>
                    <li>• Sử dụng trong vòng {product.expiry || 3} ngày kể từ ngày mua</li>
                    <li>• Rửa sạch trước khi chế biến</li>
                    <li>• Nấu chín kỹ trước khi sử dụng</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviews 
                productId={product.id} 
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>

        {/* Product Recommendations */}
          <div className="mt-12">
          <ProductRecommendations
            productId={product.id}
            userId={currentUserId}
            type="similar"
            title="Sản phẩm tương tự"
            limit={4}
                        />
                      </div>
      </div>

      <Footer />
    </main>
  )
}