/**
 * Lớp bộ nhớ đệm (cache) cho phản hồi API
 * Sử dụng LRU Cache để lưu trữ trong bộ nhớ cho dữ liệu truy cập nhiều
 * 
 * Khóa cache nên có ý nghĩa: ví dụ, "products:page:1:limit:12:category:me"
 */

import { LRUCache } from 'lru-cache'
import { loggerHelpers } from './logger'

interface CacheOptions {
  max?: number
  ttl?: number
}

// Tạo instance LRU cache
const cache = new LRUCache<string, any>({
  max: 500, // Số lượng mục tối đa
  ttl: 5 * 60 * 1000, // Thời gian sống: 5 phút (millisecond)
  updateAgeOnGet: true // Gia hạn TTL khi mục được truy cập
})

/**
 * Lấy giá trị từ cache theo key
 */
export function getCached<T = any>(key: string): T | undefined {
  try {
    const value = cache.get(key) as T | undefined
    loggerHelpers.logCache('get', key, value !== undefined)
    return value
  } catch (error) {
    loggerHelpers.logError(`Error getting cache key "${key}"`, error)
    return undefined
  }
}

/**
 * Ghi giá trị vào cache với TTL tùy chọn
 * @param key Khóa cache
 * @param value Giá trị cần lưu
 * @param ttl Thời gian sống theo millisecond (tùy chọn, mặc định 5 phút)
 */
export function setCached(key: string, value: any, ttl?: number): void {
  try {
    cache.set(key, value, { ttl: ttl || 5 * 60 * 1000 })
    loggerHelpers.logCache('set', key)
  } catch (error) {
    loggerHelpers.logError(`Error setting cache key "${key}"`, error)
  }
}

/**
 * Xóa một mục cache theo key
 */
export function deleteCached(key: string): void {
  try {
    cache.delete(key)
  } catch (error) {
    console.error(`[Cache] Error deleting key "${key}":`, error)
  }
}

/**
 * Xóa toàn bộ cache
 */
export function clearCache(): void {
  try {
    cache.clear()
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error)
  }
}

/**
 * Kiểm tra key có tồn tại trong cache hay không
 */
export function hasCached(key: string): boolean {
  try {
    return cache.has(key)
  } catch (error) {
    console.error(`[Cache] Error checking key "${key}":`, error)
    return false
  }
}

/**
 * Lấy thống kê cache
 */
export function getCacheStats() {
  return {
    size: cache.size,
    remaining: 500 - cache.size,
    maxSize: 500
  }
}

/**
 * Tạo khóa cache cho danh sách sản phẩm
 */
export function getProductsCacheKey(params: {
  page?: number
  limit?: number
  search?: string
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
  isFeatured?: string
  isFlashSale?: string
  inStock?: string
}): string {
  const parts: string[] = ['products']
  
  if (params.search) parts.push(`search:${params.search.toLowerCase()}`)
  if (params.category) parts.push(`cat:${params.category}`)
  if (params.subcategory) parts.push(`subcat:${params.subcategory}`)
  if (params.minPrice) parts.push(`minp:${params.minPrice}`)
  if (params.maxPrice && params.maxPrice < 999999999) parts.push(`maxp:${params.maxPrice}`)
  if (params.sortBy) parts.push(`sort:${params.sortBy}`)
  if (params.sortOrder) parts.push(`order:${params.sortOrder}`)
  if (params.isFeatured) parts.push(`featured:${params.isFeatured}`)
  if (params.isFlashSale) parts.push(`flash:${params.isFlashSale}`)
  if (params.inStock) parts.push(`stock:${params.inStock}`)
  
  parts.push(`page:${params.page || 1}`)
  parts.push(`limit:${params.limit || 12}`)
  
  return parts.join(':')
}

/**
 * Tạo khóa cache cho danh mục
 */
export function getCategoriesCacheKey(): string {
  return 'categories:active'
}

/**
 * Tạo khóa cache cho mã giảm giá
 */
export function getDiscountCacheKey(code?: string): string {
  return code ? `discount:code:${code.toUpperCase()}` : 'discount:all'
}

/**
 * Vô hiệu hóa cache sản phẩm (gọi sau khi cập nhật sản phẩm)
 */
export function invalidateProductsCache(): void {
  const keysToDelete: string[] = []
  
  for (const key of cache.keys()) {
    if (key.startsWith('products:')) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key))
  loggerHelpers.logCache('invalidate-products', '', false, { count: keysToDelete.length })
}

/**
 * Vô hiệu hóa cache danh mục
 */
export function invalidateCategoriesCache(): void {
  deleteCached(getCategoriesCacheKey())
  loggerHelpers.logCache('invalidate-categories', getCategoriesCacheKey())
}

/**
 * Vô hiệu hóa cache mã giảm giá
 */
export function invalidateDiscountCache(code?: string): void {
  if (code) {
    deleteCached(getDiscountCacheKey(code))
    loggerHelpers.logCache('invalidate-discount', `code:${code}`)
  } else {
    deleteCached(getDiscountCacheKey())
    loggerHelpers.logCache('invalidate-discount', 'all')
  }
}

