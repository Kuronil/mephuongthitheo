export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  originalPrice?: number
  discount?: number
  createdAt: string
  updatedAt: string
}

export interface DiscountCode {
  id: number
  code: string
  name: string
  description?: string
  discount: number
  minAmount?: number
  maxDiscount?: number
  freeShipping: boolean
  isActive: boolean
  validFrom?: string
  validTo?: string
  usageLimit?: number
  usedCount: number
}

export interface ApplyDiscountResponse {
  success: boolean
  discountCode?: {
    id: number
    code: string
    name: string
    description?: string
    discount: number
    freeShipping: boolean
    discountAmount: number
    minAmount?: number
  }
  error?: string
}

// Cart API functions
export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : ''
      }
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return []
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || 'Failed to fetch cart items')
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Get cart items error:', error)
    return []
  }
}

export const addToCart = async (item: {
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  originalPrice?: number
  discount?: number
}): Promise<boolean> => {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : ''
      },
      body: JSON.stringify(item)
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return false
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || 'Failed to add to cart')
    }

    return true
  } catch (error) {
    console.error('Add to cart error:', error)
    return false
  }
}

export const updateCartItem = async (itemId: number, quantity: number): Promise<boolean> => {
  try {
    const response = await fetch('/api/cart', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : ''
      },
      body: JSON.stringify({ itemId, quantity })
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return false
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || 'Failed to update cart item')
    }

    return true
  } catch (error) {
    console.error('Update cart item error:', error)
    return false
  }
}

export const removeFromCart = async (itemId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/cart?itemId=${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : ''
      }
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return false
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || 'Failed to remove from cart')
    }

    return true
  } catch (error) {
    console.error('Remove from cart error:', error)
    return false
  }
}

export const clearCart = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : ''
      }
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return false
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || 'Failed to clear cart')
    }

    return true
  } catch (error) {
    console.error('Clear cart error:', error)
    return false
  }
}

// Discount API functions
export const getDiscountCode = async (code: string): Promise<DiscountCode | null> => {
  try {
    const response = await fetch(`/api/discount?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return null
    }

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.discountCode || null
  } catch (error) {
    console.error('Get discount code error:', error)
    return null
  }
}

export const applyDiscountCode = async (code: string, subtotal: number): Promise<ApplyDiscountResponse> => {
  try {
    const response = await fetch('/api/discount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : ''
      },
      body: JSON.stringify({ code, subtotal })
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return {
        success: false,
        error: 'Server error: Invalid response format'
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to apply discount code'
      }
    }

    return data
  } catch (error) {
    console.error('Apply discount code error:', error)
    return {
      success: false,
      error: 'Network error'
    }
  }
}

export const getAllDiscountCodes = async (): Promise<DiscountCode[]> => {
  try {
    const response = await fetch('/api/discount', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API returned non-JSON response:", text.substring(0, 200))
      return []
    }

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.discountCodes || []
  } catch (error) {
    console.error('Get all discount codes error:', error)
    return []
  }
}
