export interface CartItem {
  id: number
  name: string
  price: number
  qty: number
  image?: string
  originalPrice?: number
  discount?: number
}

const read = (): CartItem[] => {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]")
  } catch {
    return []
  }
}

const write = (cart: CartItem[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("cart", JSON.stringify(cart))
}

export const getCart = (): CartItem[] => read()

export const getCartCount = (): number =>
  read().reduce((s, it) => s + (it.qty || 0), 0)

export const getSubtotal = (): number =>
  read().reduce((s, it) => s + it.price * it.qty, 0)

export const addToCart = (item: Omit<CartItem, "qty">, qty = 1): CartItem[] => {
  const cart = read()
  const idx = cart.findIndex((c) => c.id === item.id)
  if (idx > -1) {
    cart[idx].qty = (cart[idx].qty || 0) + qty
  } else {
    cart.push({ ...item, qty })
  }
  write(cart)
  // phát event để Header / trang khác cập nhật trong cùng tab
  window.dispatchEvent(new Event("storage"))
  return cart
}

export const updateQty = (id: number, qty: number): CartItem[] => {
  const cart = read()
  const next = cart.map((c) => (c.id === id ? { ...c, qty } : c)).filter(c => c.qty > 0)
  write(next)
  window.dispatchEvent(new Event("storage"))
  return next
}

export const removeFromCart = (id: number): CartItem[] => {
  const next = read().filter((c) => c.id !== id)
  write(next)
  window.dispatchEvent(new Event("storage"))
  return next
}

export const clearCart = (): void => {
  write([])
  window.dispatchEvent(new Event("storage"))
}

export const getCartItems = (): CartItem[] => read()

export const updateCartItem = (id: number, qty: number): CartItem[] => {
  if (qty <= 0) {
    return removeFromCart(id)
  }
  return updateQty(id, qty)
}