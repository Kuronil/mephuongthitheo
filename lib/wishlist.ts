/**
 * Wishlist helper functions
 */

export interface WishlistProduct {
  id: number
  name: string
  price: number
  image?: string
  originalPrice?: number
  discount?: number
  rating?: number
  reviews?: number
}

/**
 * Add product to wishlist via API
 */
export async function addToWishlist(product: WishlistProduct, userId: number): Promise<boolean> {
  try {
    const response = await fetch('/api/account/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId.toString()
      },
      body: JSON.stringify({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || null,
        originalPrice: product.originalPrice || null,
        discount: product.discount || null,
        rating: product.rating || null,
        reviews: product.reviews || null
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      return true
    } else {
      console.error('Add to wishlist failed:', data.error)
      return false
    }
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return false
  }
}

/**
 * Remove product from wishlist via API
 */
export async function removeFromWishlist(productId: number, userId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/account/wishlist?productId=${productId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId.toString()
      }
    })

    if (response.ok) {
      return true
    } else {
      const data = await response.json()
      console.error('Remove from wishlist failed:', data.error)
      return false
    }
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return false
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId: number, userId: number): Promise<boolean> {
  try {
    const response = await fetch('/api/account/wishlist', {
      headers: {
        'x-user-id': userId.toString()
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.data.items.some((item: any) => item.productId === productId)
    }
    return false
  } catch (error) {
    console.error('Check wishlist error:', error)
    return false
  }
}

