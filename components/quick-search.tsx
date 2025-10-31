"use client"

import { useState } from "react"
import { Search, TrendingUp, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface QuickSearchProps {
  className?: string
}

export default function QuickSearch({ className = "" }: QuickSearchProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const popularSearches = [
    "thịt heo nạc",
    "thịt ba chỉ", 
    "sườn heo",
    "thịt xay",
    "thịt heo tươi"
  ]

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query.trim()
    if (!term) return

    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    const updated = [term, ...recentSearches.filter((s: string) => s !== term)].slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    // Navigate to search page
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Tìm kiếm sản phẩm</h2>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Nhập tên sản phẩm bạn muốn tìm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-2 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Popular Searches */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-gray-700">Tìm kiếm phổ biến</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => handleSearch(search)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition text-sm font-medium"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-gray-700">Danh mục nhanh</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/products?category=thit-heo')}
            className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition text-left"
          >
            <div className="font-semibold text-gray-800">Thịt Heo</div>
            <div className="text-sm text-gray-600">Tươi ngon, chất lượng cao</div>
          </button>
          <button
            onClick={() => router.push('/products?category=san-pham-che-bien')}
            className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:from-red-100 hover:to-red-200 transition text-left"
          >
            <div className="font-semibold text-gray-800">Sản Phẩm Chế Biến</div>
            <div className="text-sm text-gray-600">Đa dạng, tiện lợi</div>
          </button>
        </div>
      </div>
    </div>
  )
}
