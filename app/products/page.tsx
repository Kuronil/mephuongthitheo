"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ShoppingCart, Plus, Minus, Eye, Search, Filter, Heart } from "lucide-react"
import { addToCart } from "@/lib/cart"
import { addToWishlist, removeFromWishlist } from "@/lib/wishlist"
import { useAuth } from "@/hooks/useAuth"
import StockAlert from "@/components/stock-alert"
import AdvancedSearch from "@/components/advanced-search"
import toast from "react-hot-toast"

interface Product {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  discount?: number
  image?: string
  category?: string
  subcategory?: string
  stock: number
  rating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
  isFlashSale: boolean
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function ProductsPage() {
  const { user } = useAuth(false)
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [advancedFilters, setAdvancedFilters] = useState<any>({})
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set())

  // Fetch products from API
  const fetchProducts = async (page = 1, filters = advancedFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: filters.search || searchTerm,
        category: filters.category || selectedCategory,
        subcategory: filters.subcategory || "",
        minPrice: (filters.minPrice || 0).toString(),
        maxPrice: (filters.maxPrice || 999999999).toString(),
        minRating: (filters.minRating || 0).toString(),
        maxRating: (filters.maxRating || 5).toString(),
        sortBy: filters.sortBy || sortBy,
        sortOrder: filters.sortOrder || sortOrder,
        isActive: "true",
        inStock: filters.inStock ? "true" : "",
        isFeatured: filters.isFeatured ? "true" : "",
        isFlashSale: filters.isFlashSale ? "true" : "",
        excludeCategory: "Thịt chế biến" // Loại trừ sản phẩm chế biến
      })

      const response = await fetch(`/api/products?${params}`)
      
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
        setProducts(data.data.products)
        setPagination(data.data.pagination)
        setCurrentPage(page)
      } else {
        toast.error("Lỗi khi tải danh sách sản phẩm")
      }
    } catch (error) {
      console.error("Fetch products error:", error)
      toast.error("Lỗi khi tải danh sách sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  // Handle advanced search
  const handleAdvancedSearch = (filters: any) => {
    setAdvancedFilters(filters)
    fetchProducts(1, filters)
  }

  const handleResetSearch = () => {
    setAdvancedFilters({})
    setSearchTerm("")
    setSelectedCategory("")
    setSortBy("createdAt")
    setSortOrder("desc")
    fetchProducts(1, {})
  }

  // Search and filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, sortBy, sortOrder])

  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user?.id) return
    
    try {
      const response = await fetch('/api/account/wishlist', {
        headers: {
          'x-user-id': user.id.toString()
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const itemIds = new Set<number>(data.data.items.map((item: any) => item.productId as number))
        setWishlistItems(itemIds)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const handleToggleWishlist = async (product: Product) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích')
      return
    }

    const isInWishlist = wishlistItems.has(product.id)
    
    if (isInWishlist) {
      // Remove from wishlist
      const success = await removeFromWishlist(product.id, user.id)
      if (success) {
        setWishlistItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
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
        setWishlistItems(prev => new Set(prev).add(product.id))
        toast.success('Đã thêm vào danh sách yêu thích')
      } else {
        toast.error('Không thể thêm vào danh sách yêu thích')
      }
    }
  }

  const getQuantity = (productId: number) => quantities[productId] || 1

  const updateQuantity = (productId: number, delta: number) => {
    const currentQty = getQuantity(productId)
    const newQty = Math.max(1, currentQty + delta)
    setQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }))
  }

  const handleAddToCart = (product: Product) => {
    const qty = getQuantity(product.id)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, qty)
    
    toast.success(`Đã thêm ${qty} ${product.name} vào giỏ hàng`)
    
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Thịt tươi ngon</h1>
          <p className="text-orange-100">Chọn từ các sản phẩm thịt tươi chất lượng cao, không qua chế biến</p>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdvancedSearch 
          onSearch={handleAdvancedSearch}
          onReset={handleResetSearch}
          loading={loading}
        />
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {pagination ? `Hiển thị ${pagination.totalCount} sản phẩm` : 'Đang tải...'}
          </span>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchProducts(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchProducts(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative bg-gray-100 h-48 overflow-hidden group">
                <Link 
                  href={`/product/${product.slug}`}
                  className="block w-full h-full cursor-pointer"
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
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleWishlist(product)
                  }}
                  className={`absolute top-3 left-3 p-2 rounded-full shadow-lg transition-all ${
                    wishlistItems.has(product.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title={wishlistItems.has(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  <Heart
                    className={`w-5 h-5 ${wishlistItems.has(product.id) ? 'fill-current' : ''}`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>

                  {/* Category */}
                  {product.category && (
                    <div className="text-xs text-gray-500 mb-2">{product.category}</div>
                  )}

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

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-orange-600">{formatPrice(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Stock Alert */}
                  <div className="mb-4">
                    <StockAlert productId={product.id} />
                </div>

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
