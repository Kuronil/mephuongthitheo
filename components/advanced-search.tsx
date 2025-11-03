"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, ChevronDown, Clock, TrendingUp } from "lucide-react"
import SearchSuggestions from "./search-suggestions"

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onReset: () => void
  loading?: boolean
}

interface SearchFilters {
  search: string
  category: string
  subcategory: string
  minPrice: number
  maxPrice: number
  minRating: number
  maxRating: number
  inStock: boolean
  isFeatured: boolean
  isFlashSale: boolean
  sortBy: string
  sortOrder: string
}

const defaultFilters: SearchFilters = {
  search: "",
  category: "",
  subcategory: "",
  minPrice: 0,
  maxPrice: 1000000,
  minRating: 0,
  maxRating: 5,
  inStock: false,
  isFeatured: false,
  isFlashSale: false,
  sortBy: "createdAt",
  sortOrder: "desc"
}

export default function AdvancedSearch({ onSearch, onReset, loading = false }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [categories, setCategories] = useState<Array<{name: string, slug: string}>>([])
  const [subcategories, setSubcategories] = useState<Array<{name: string, slug: string}>>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])

  // Lấy danh mục và từ khóa tìm kiếm phổ biến
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.success && data.data) {
          setCategories(data.data.categories || [])
          setSubcategories(data.data.subcategories || [])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    
    const fetchPopularSearches = () => {
      setPopularSearches([
        "thịt heo nạc",
        "thịt ba chỉ",
        "sườn heo",
        "thịt xay",
        "thịt heo tươi"
      ])
    }
    
    fetchCategories()
    fetchPopularSearches()
  }, [])

  // Danh mục con hiện được tải từ API cùng với danh mục
  // Không cần useEffect riêng để cập nhật nữa

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleQuickSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    onReset()
  }

  const hasActiveFilters = () => {
    return filters.search || 
           filters.category || 
           filters.subcategory ||
           filters.minPrice > 0 ||
           filters.maxPrice < 1000000 ||
           filters.minRating > 0 ||
           filters.maxRating < 5 ||
           filters.inStock ||
           filters.isFeatured ||
           filters.isFlashSale
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Tìm kiếm cơ bản */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchSuggestions 
            className="w-full"
            onClose={() => {}}
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
          <ChevronDown className={`w-4 h-4 transition ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Tìm kiếm phổ biến */}
      {popularSearches.length > 0 && !showAdvanced && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Tìm kiếm phổ biến:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleQuickSearch(search)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bộ lọc đang hoạt động */}
      {hasActiveFilters() && (
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
            {filters.search && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                Tìm kiếm: "{filters.search}"
                <button onClick={() => handleFilterChange('search', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                Danh mục: {categories.find(c => c.slug === filters.category)?.name}
                <button onClick={() => handleFilterChange('category', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.inStock && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                Còn hàng
                <button onClick={() => handleFilterChange('inStock', false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.isFeatured && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
                Nổi bật
                <button onClick={() => handleFilterChange('isFeatured', false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.isFlashSale && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1">
                Flash Sale
                <button onClick={() => handleFilterChange('isFlashSale', false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition"
            >
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* Bộ lọc nâng cao */}
      {showAdvanced && (
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Danh mục con */}
            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục con
                </label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Tất cả</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.slug} value={subcategory.slug}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Khoảng giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.maxPrice === 1000000 ? '' : filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 1000000)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Khoảng đánh giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={0}>Từ 0 sao</option>
                  <option value={1}>Từ 1 sao</option>
                  <option value={2}>Từ 2 sao</option>
                  <option value={3}>Từ 3 sao</option>
                  <option value={4}>Từ 4 sao</option>
                  <option value={5}>Từ 5 sao</option>
                </select>
                <select
                  value={filters.maxRating}
                  onChange={(e) => handleFilterChange('maxRating', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={5}>Đến 5 sao</option>
                  <option value={4}>Đến 4 sao</option>
                  <option value={3}>Đến 3 sao</option>
                  <option value={2}>Đến 2 sao</option>
                  <option value={1}>Đến 1 sao</option>
                </select>
              </div>
            </div>

            {/* Sắp xếp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  handleFilterChange('sortBy', field)
                  handleFilterChange('sortOrder', order)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
                <option value="rating-asc">Đánh giá thấp nhất</option>
              </select>
            </div>
          </div>

          {/* Tùy chọn chọn (checkbox) */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Chỉ hiện sản phẩm còn hàng</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isFeatured}
                  onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Sản phẩm nổi bật</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isFlashSale}
                  onChange={(e) => handleFilterChange('isFlashSale', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Flash Sale</span>
              </label>
            </div>
          </div>

          {/* Nút thao tác */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Đặt lại
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? "Đang tìm..." : "Áp dụng bộ lọc"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
