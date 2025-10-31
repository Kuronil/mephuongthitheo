"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, AlertTriangle, Download } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import AdminLayout from "@/components/AdminLayout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

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
  minStock: number
  isActive: boolean
  isFeatured: boolean
  isFlashSale: boolean
  rating: number
  reviewCount: number
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Fetch products (excluding processed products)
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        sortOrder,
        isActive: (!showInactive).toString(),
        excludeCategory: "Thịt chế biến" // Loại trừ sản phẩm chế biến
      })

      const response = await fetch(`/api/products?${params}`)
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

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return
    }

    try {
      setDeletingId(productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE"
      })
      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchProducts(currentPage)
      } else {
        toast.error(data.error || "Lỗi khi xóa sản phẩm")
      }
    } catch (error) {
      console.error("Delete product error:", error)
      toast.error("Lỗi khi xóa sản phẩm")
    } finally {
      setDeletingId(null)
    }
  }

  // Export products
  const handleExportProducts = async () => {
    try {
      setExporting(true)
      
      const params = new URLSearchParams()
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      params.append('format', 'csv')
      
      const response = await fetch(`/api/admin/products/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to export products')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Đã xuất sản phẩm thành công')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Không thể xuất sản phẩm')
    } finally {
      setExporting(false)
    }
  }

  // Toggle product status
  const handleToggleStatus = async (productId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive: !isActive })
      })
      const data = await response.json()

      if (data.success) {
        toast.success(`Sản phẩm đã được ${!isActive ? 'kích hoạt' : 'vô hiệu hóa'}`)
        fetchProducts(currentPage)
      } else {
        toast.error(data.error || "Lỗi khi cập nhật trạng thái")
      }
    } catch (error) {
      console.error("Toggle status error:", error)
      toast.error("Lỗi khi cập nhật trạng thái")
    }
  }

  // Search and filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, sortBy, sortOrder, showInactive])

  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: "out", color: "text-red-600", icon: AlertTriangle }
    if (stock <= minStock) return { status: "low", color: "text-orange-600", icon: AlertTriangle }
    return { status: "good", color: "text-green-600", icon: Package }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/admin"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2"
                >
                  ← Trở về Admin
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm tươi</h1>
              <p className="text-gray-600 mt-2">Quản lý danh sách sản phẩm thịt tươi và tồn kho</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportProducts}
                disabled={exporting || loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {exporting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {exporting ? 'Đang xuất...' : 'Xuất CSV'}
              </button>
              <Link
                href="/admin/products/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm sản phẩm tươi
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm tươi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả danh mục</option>
                <option value="thit-heo">Thịt heo</option>
                <option value="thit-bo">Thịt bò</option>
                <option value="thit-ga">Thịt gà</option>
                <option value="combo">Combo</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Show Inactive */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Hiện sản phẩm ẩn</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600">
                  <div className="col-span-4">Sản phẩm</div>
                  <div className="col-span-2">Danh mục</div>
                  <div className="col-span-1">Giá</div>
                  <div className="col-span-1">Tồn kho</div>
                  <div className="col-span-1">Đánh giá</div>
                  <div className="col-span-1">Trạng thái</div>
                  <div className="col-span-2">Thao tác</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock)
                  const StockIcon = stockStatus.icon

                  return (
                    <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{product.slug}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.isFeatured && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Nổi bật</span>
                              )}
                              {product.isFlashSale && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Flash Sale</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600">{product.category || '-'}</span>
                          {product.subcategory && (
                            <div className="text-xs text-gray-400">{product.subcategory}</div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="col-span-1">
                          <div className="font-semibold text-gray-900">{formatPrice(product.price)}</div>
                          {product.originalPrice && (
                            <div className="text-sm text-gray-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="col-span-1">
                          <div className={`flex items-center gap-1 ${stockStatus.color}`}>
                            <StockIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{product.stock}</span>
                          </div>
                          {product.stock <= product.minStock && (
                            <div className="text-xs text-orange-600">Cảnh báo</div>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="col-span-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Hoạt động' : 'Ẩn'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition"
                            title="Xem sản phẩm"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-gray-400 hover:text-green-600 transition"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(product.id, product.isActive)}
                            className={`p-2 transition ${
                              product.isActive 
                                ? 'text-gray-400 hover:text-orange-600' 
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                            title={product.isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                          >
                            <Filter className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                            title="Xóa sản phẩm"
                          >
                            {deletingId === product.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} trong tổng số {pagination.totalCount} sản phẩm
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchProducts(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <span className="px-3 py-2 text-sm">
                        Trang {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => fetchProducts(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <AdminProductsContent />
    </AdminLayout>
  )
}
