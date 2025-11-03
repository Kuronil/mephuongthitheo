/**
 * Caching Layer for API Responses
 * Uses LRU Cache for in-memory caching of hot data
 * 
 * Cache keys should be descriptive: e.g., "products:page:1:limit:12:category:me"
 */

import { LRUCache } from 'lru-cache'
import { loggerHelpers } from './logger'

interface CacheOptions {
  max?: number
  ttl?: number
}

// Create LRU cache instance
const cache = new LRUCache<string, any>({
  max: 500, // Maximum number of entries
  ttl: 5 * 60 * 1000, // Time to live: 5 minutes in milliseconds
  updateAgeOnGet: true // Extend TTL when item is accessed
})

/**
 * Get cached value by key
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
 * Set cache value with optional custom TTL
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in milliseconds (optional, defaults to 5 minutes)
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
 * Delete cached value by key
 */
export function deleteCached(key: string): void {
  try {
    cache.delete(key)
  } catch (error) {
    console.error(`[Cache] Error deleting key "${key}":`, error)
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  try {
    cache.clear()
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error)
  }
}

/**
 * Check if key exists in cache
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
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    remaining: 500 - cache.size,
    maxSize: 500
  }
}

/**
 * Generate cache key for products list
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
 * Generate cache key for categories
 */
export function getCategoriesCacheKey(): string {
  return 'categories:active'
}

/**
 * Generate cache key for discount codes
 */
export function getDiscountCacheKey(code?: string): string {
  return code ? `discount:code:${code.toUpperCase()}` : 'discount:all'
}

/**
 * Invalidate products cache (call after product updates)
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
 * Invalidate categories cache
 */
export function invalidateCategoriesCache(): void {
  deleteCached(getCategoriesCacheKey())
  loggerHelpers.logCache('invalidate-categories', getCategoriesCacheKey())
}

/**
 * Invalidate discount cache
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

