"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/hooks/useAuth"
import { Heart, ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Search } from "lucide-react"
import { addToCart } from "@/lib/cart"

interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
  originalPrice?: number
  discount?: number
  rating?: number
  reviews?: number
}

export default function WishlistPage() {
  const { user, isLoading } = useAuth(true, '/account/login')
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    if (user?.id) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/account/wishlist', {
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Map productId to id for frontend compatibility
        const items = data.data.items.map((item: any) => ({
          ...item,
          id: item.productId
        }))
        setWishlist(items)
      } else {
        console.error("Failed to fetch wishlist:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await fetch(`/api/account/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id?.toString() || ''
        }
      })
      
      if (response.ok) {
        const updatedWishlist = wishlist.filter(item => item.id !== productId)
        setWishlist(updatedWishlist)
        toast.success("Đã xóa khỏi danh sách yêu thích")
      } else {
        const data = await response.json()
        toast.error(data.error || "Không thể xóa sản phẩm")
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  const addToCartFromWishlist = (product: WishlistItem) => {
    const qty = quantities[product.id] || 1
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, qty)
    
    toast.success(`Đã thêm ${qty} ${product.name} vào giỏ hàng`)
    
    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }))
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

  const filteredWishlist = wishlist.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang cá nhân
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
          <p className="mt-2 text-gray-600">Các sản phẩm bạn đã lưu để mua sau</p>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm trong danh sách yêu thích..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Wishlist Items */}
        {filteredWishlist.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {wishlist.length === 0 ? "Danh sách yêu thích trống" : "Không tìm thấy sản phẩm"}
            </h3>
            <p className="text-gray-600 mb-6">
              {wishlist.length === 0 
                ? "Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng mua sắm sau này"
                : "Thử thay đổi từ khóa tìm kiếm"
              }
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <Heart className="w-4 h-4" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((item) => (
              <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition">
                {/* Product Image */}
                <div className="relative bg-gray-100 h-48 overflow-hidden group">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.discount && (
                    <div className="absolute top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                      -{item.discount}%
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.name}</h3>

                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(item.rating!) ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                      {item.reviews && (
                        <span className="text-sm text-gray-600">({item.reviews})</span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-orange-600">
                        {item.price.toLocaleString()}₫
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {item.originalPrice.toLocaleString()}₫
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 border-x text-sm">
                        {getQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCartFromWishlist(item)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredWishlist.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Tổng cộng {filteredWishlist.length} sản phẩm yêu thích
                </h3>
                <p className="text-sm text-gray-600">
                  Tổng giá trị: {filteredWishlist.reduce((sum, item) => sum + item.price, 0).toLocaleString()}₫
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    filteredWishlist.forEach(item => {
                      addToCartFromWishlist(item)
                    })
                    toast.success("Đã thêm tất cả vào giỏ hàng")
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Thêm tất cả vào giỏ
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
                      return
                    }
                    
                    try {
                      // Delete all items one by one
                      await Promise.all(
                        filteredWishlist.map(item => 
                          fetch(`/api/account/wishlist?productId=${item.id}`, {
                            method: 'DELETE',
                            headers: {
                              'x-user-id': user?.id?.toString() || ''
                            }
                          })
                        )
                      )
                      setWishlist([])
                      toast.success("Đã xóa tất cả khỏi danh sách yêu thích")
                    } catch (error) {
                      console.error("Error deleting all:", error)
                      toast.error("Có lỗi xảy ra")
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
