"use client"

import { useState, useEffect } from "react"
import { Package, AlertTriangle, TrendingDown, TrendingUp, Search, Filter, Plus, Minus, Edit } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import AdminLayout from "@/components/AdminLayout"

interface InventoryItem {
  id: number
  name: string
  slug: string
  category?: string
  subcategory?: string
  price: number
  stock: number
  minStock: number
  image?: string
  isActive: boolean
  updatedAt: string
  stockStatus: 'good' | 'low' | 'out'
  alertLevel: 'none' | 'warning' | 'critical'
  alertMessage: string
}

interface InventorySummary {
  totalProducts: number
  totalStock: number
  outOfStock: number
  lowStock: number
  goodStock: number
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

function InventoryContent() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [summary, setSummary] = useState<InventorySummary | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [stockStatus, setStockStatus] = useState("")
  const [sortBy, setSortBy] = useState("stock")
  const [sortOrder, setSortOrder] = useState("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editStock, setEditStock] = useState(0)
  const [editMinStock, setEditMinStock] = useState(0)

  // Fetch inventory data
  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: searchTerm,
        category: selectedCategory,
        stockStatus,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/inventory?${params}`)
      const data = await response.json()

      if (data.success) {
        setInventory(data.data.products)
        setSummary(data.data.summary)
        setPagination(data.data.pagination)
        setCurrentPage(page)
      } else {
        toast.error("Lỗi khi tải dữ liệu tồn kho")
      }
    } catch (error) {
      console.error("Fetch inventory error:", error)
      toast.error("Lỗi khi tải dữ liệu tồn kho")
    } finally {
      setLoading(false)
    }
  }

  // Update stock
  const handleUpdateStock = async (productId: number, operation: string, quantity?: number) => {
    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation,
          quantity,
          reason: `Admin ${operation} stock`
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchInventory(currentPage)
        setEditingItem(null)
      } else {
        toast.error(data.error || "Lỗi khi cập nhật tồn kho")
      }
    } catch (error) {
      console.error("Update stock error:", error)
      toast.error("Lỗi khi cập nhật tồn kho")
    }
  }

  // Quick stock operations
  const handleQuickAdd = (item: InventoryItem) => {
    handleUpdateStock(item.id, 'add', 10)
  }

  const handleQuickSubtract = (item: InventoryItem) => {
    handleUpdateStock(item.id, 'subtract', 1)
  }

  // Start editing
  const startEditing = (item: InventoryItem) => {
    setEditingItem(item)
    setEditStock(item.stock)
    setEditMinStock(item.minStock)
  }

  // Save edit
  const saveEdit = () => {
    if (editingItem) {
      handleUpdateStock(editingItem.id, 'adjust', editStock)
    }
  }

  // Search and filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventory(1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, stockStatus, sortBy, sortOrder])

  // Initial load
  useEffect(() => {
    fetchInventory()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-100'
      case 'low': return 'text-orange-600 bg-orange-100'
      case 'good': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out': return <AlertTriangle className="w-4 h-4" />
      case 'low': return <TrendingDown className="w-4 h-4" />
      case 'good': return <TrendingUp className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2"
            >
              ← Trở về Admin
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tồn kho</h1>
          <p className="text-gray-600 mt-2">Theo dõi và quản lý tồn kho sản phẩm</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tồn kho tốt</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.goodStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sắp hết hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.lowStock}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.outOfStock}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
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
                <option value="san-pham-che-bien">Sản phẩm chế biến</option>
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="good">Tồn kho tốt</option>
                <option value="low">Sắp hết hàng</option>
                <option value="out">Hết hàng</option>
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
                <option value="stock-asc">Tồn kho thấp đến cao</option>
                <option value="stock-desc">Tồn kho cao đến thấp</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="category-asc">Danh mục A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
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
                  <div className="col-span-1">Trạng thái</div>
                  <div className="col-span-3">Thao tác</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {inventory.map((item) => (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{item.slug}</p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">{item.category || '-'}</span>
                        {item.subcategory && (
                          <div className="text-xs text-gray-400">{item.subcategory}</div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-1">
                        <div className="font-semibold text-gray-900">{formatPrice(item.price)}</div>
                      </div>

                      {/* Stock */}
                      <div className="col-span-1">
                        <div className="font-semibold text-gray-900">{item.stock}</div>
                        <div className="text-xs text-gray-400">Min: {item.minStock}</div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(item.stockStatus)}`}>
                          {getStatusIcon(item.stockStatus)}
                          {item.stockStatus === 'out' ? 'Hết hàng' : 
                           item.stockStatus === 'low' ? 'Sắp hết' : 'Tốt'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex items-center gap-2">
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded transition"
                          title="Thêm 10"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickSubtract(item)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                          title="Trừ 1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditing(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                        onClick={() => fetchInventory(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <span className="px-3 py-2 text-sm">
                        Trang {pagination.page} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => fetchInventory(currentPage + 1)}
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

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Chỉnh sửa tồn kho</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sản phẩm
                  </label>
                  <p className="text-gray-900">{editingItem.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tồn kho hiện tại
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tồn kho tối thiểu
                  </label>
                  <input
                    type="number"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <AdminLayout>
      <InventoryContent />
    </AdminLayout>
  )
}
