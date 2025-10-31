"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { vietnameseUtils } from "@/lib/vietnamese-utils"

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand'
  text: string
  category?: string
  brand?: string
  price?: number
  image?: string
  slug?: string
  id?: number
}

interface SearchSuggestionsProps {
  onClose?: () => void
  className?: string
}

export default function SearchSuggestions({ onClose, className = "" }: SearchSuggestionsProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error("Error parsing recent searches:", error)
      }
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Fetch search suggestions
  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=8`)
        const data = await response.json()
        
        if (data.success) {
          setSuggestions(data.data.suggestions || [])
          setShowSuggestions(true)
        } else {
          console.error("API returned error:", data.error)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
  }

  // Handle search
  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query.trim()
    if (!term) return

    saveRecentSearch(term)
    setShowSuggestions(false)
    
    // Navigate to search page with search query
    router.push(`/search?q=${encodeURIComponent(term)}`)
    
    if (onClose) {
      onClose()
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'product':
        // Navigate directly to product detail page
        if (suggestion.slug) {
          router.push(`/product/${suggestion.slug}`)
        } else {
          // Fallback to search if no slug
          handleSearch(suggestion.text)
        }
        break
      case 'category':
        const categoryTerm = suggestion.category || suggestion.text.replace('Danh mục: ', '')
        handleSearch(categoryTerm)
        break
      case 'brand':
        const brandTerm = suggestion.brand || suggestion.text.replace('Thương hiệu: ', '')
        handleSearch(brandTerm)
        break
    }
    
    if (onClose) {
      onClose()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length + recentSearches.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex])
          } else {
            const recentIndex = selectedIndex - suggestions.length
            handleSearch(recentSearches[recentIndex])
          }
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Remove recent search
  const removeRecentSearch = (index: number) => {
    const updated = recentSearches.filter((_, i) => i !== index)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Highlight matching text in suggestions
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const normalizedText = vietnameseUtils.removeAccents(text).toLowerCase()
    const normalizedQuery = vietnameseUtils.removeAccents(query).toLowerCase()
    
    const index = normalizedText.indexOf(normalizedQuery)
    if (index === -1) return text
    
    const beforeMatch = text.substring(0, index)
    const match = text.substring(index, index + query.length)
    const afterMatch = text.substring(index + query.length)
    
    return (
      <>
        {beforeMatch}
        <mark className="bg-yellow-200 px-1 rounded">{match}</mark>
        {afterMatch}
      </>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="absolute right-3 top-2.5 flex items-center gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Search className="text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                Gợi ý tìm kiếm
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition flex items-center gap-3 ${
                    selectedIndex === index ? 'bg-gray-50' : ''
                  }`}
                >
                  {suggestion.type === 'product' && suggestion.image && (
                    <img
                      src={suggestion.image}
                      alt={suggestion.text}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {highlightText(suggestion.text, query)}
                    </div>
                    {suggestion.type === 'product' && suggestion.price && (
                      <div className="text-xs text-orange-600 font-semibold">
                        {formatPrice(suggestion.price)}
                      </div>
                    )}
                    {suggestion.category && (
                      <div className="text-xs text-gray-500">
                        {suggestion.category}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="border-t p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Tìm kiếm gần đây
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 transition ${
                    selectedIndex === suggestions.length + index ? 'bg-gray-50' : ''
                  }`}
                >
                  <button
                    onClick={() => handleSearch(search)}
                    className="flex-1 text-left text-sm text-gray-700"
                  >
                    {search}
                  </button>
                  <button
                    onClick={() => removeRecentSearch(index)}
                    className="text-gray-400 hover:text-gray-600 transition p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {suggestions.length === 0 && recentSearches.length === 0 && query && !isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không tìm thấy gợi ý nào
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mx-auto"></div>
              <div className="mt-2">Đang tìm kiếm...</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
