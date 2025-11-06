"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ShoppingCart, Plus, Minus, Eye, Search, Filter, X, Star, Clock, Loader2 } from "lucide-react"
import { addToCart } from "@/lib/cart"
import StockAlert from "@/components/stock-alert"
import SearchSuggestions from "@/components/search-suggestions"
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

interface SearchResult {
  products: Product[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  searchTerm: string
  filters: any
}

function SearchContent() {
  const searchParams = useSearchParams()
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const searchTerm = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Fetch search results
  const fetchSearchResults = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: searchTerm,
        category: category,
        minPrice: minPrice || "0",
        maxPrice: maxPrice || "999999999",
        sortBy: sortBy,
        sortOrder: sortOrder,
        isActive: "true"
      })

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        setSearchResult({
          products: data.data.products,
          pagination: data.data.pagination,
          searchTerm,
          filters: { category, minPrice, maxPrice, sortBy, sortOrder }
        })
        setCurrentPage(page)
      } else {
        toast.error("Lỗi khi tìm kiếm sản phẩm")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Lỗi khi tìm kiếm sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults()
    }
  }, [searchTerm, category, minPrice, maxPrice, sortBy, sortOrder])

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

  const clearFilters = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('category')
    url.searchParams.delete('minPrice')
    url.searchParams.delete('maxPrice')
    url.searchParams.delete('sortBy')
    url.searchParams.delete('sortOrder')
    window.location.href = url.toString()
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Page Header */}
      <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : "Tìm kiếm sản phẩm"}
          </h1>
          <p className="text-orange-100">
            {searchResult?.pagination.totalCount 
              ? `Tìm thấy ${searchResult.pagination.totalCount} sản phẩm`
              : "Tìm kiếm sản phẩm thịt tươi ngon"
            }
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <SearchSuggestions className="w-full" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
            </button>
          </div>

          {/* Active Filters */}
          {(category || minPrice || maxPrice) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
                {category && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                    Danh mục: {category}
                    <button onClick={() => {
                      const url = new URL(window.location.href)
                      url.searchParams.delete('category')
                      window.location.href = url.toString()
                    }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                    Giá: {minPrice && `${formatPrice(parseInt(minPrice))}`} - {maxPrice && `${formatPrice(parseInt(maxPrice))}`}
                    <button onClick={clearFilters}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {loading ? 'Đang tìm kiếm...' : 
             searchResult ? `Hiển thị ${searchResult.pagination.totalCount} sản phẩm` : 
             'Không có kết quả'}
          </span>
          {searchResult && searchResult.pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchSearchResults(currentPage - 1)}
                disabled={!searchResult.pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-sm">
                Trang {searchResult.pagination.page} / {searchResult.pagination.totalPages}
              </span>
              <button
                onClick={() => fetchSearchResults(currentPage + 1)}
                disabled={!searchResult.pagination.hasNext}
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
            <p className="text-gray-600 mt-4">Đang tìm kiếm sản phẩm...</p>
          </div>
        ) : !searchResult || searchResult.products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-4">Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <Search className="w-4 h-4" />
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResult.products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="relative bg-gray-100 h-48 overflow-hidden group">
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
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : ""}`}
                        />
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
