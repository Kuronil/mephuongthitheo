"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { getCartItems, updateCartItem, removeFromCart, clearCart } from "@/lib/cart"
import { applyDiscountCode } from "@/lib/cart-api"
import { ShoppingCart, Plus, Minus, Trash2, Tag, Truck, CreditCard, Package, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"

interface CartItem {
  id: number
  name: string
  price: number
  image?: string
  qty: number
  originalPrice?: number
  discount?: number
}

interface ValidationResult {
  productId: number
  name: string
  isValid: boolean
  isActive: boolean
  stock: number
  requestedQuantity: number
  issue?: 'not_found' | 'inactive' | 'out_of_stock' | 'insufficient_stock'
  message?: string
}

export default function CartPage() {
  const router = useRouter()
  const { user } = useUser()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [validationResults, setValidationResults] = useState<Record<number, ValidationResult>>({})
  const [validating, setValidating] = useState(false)

  // Validate cart items
  const validateCartItems = useCallback(async () => {
    if (!user || cartItems.length === 0) {
      setValidationResults({})
      return
    }

    setValidating(true)
    try {
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.qty,
            name: item.name
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        const resultsMap: Record<number, ValidationResult> = {}
        data.results?.forEach((result: ValidationResult) => {
          resultsMap[result.productId] = result
        })
        setValidationResults(resultsMap)

        // Show toast for invalid items
        const invalidItems = data.results?.filter((r: ValidationResult) => !r.isValid) || []
        if (invalidItems.length > 0) {
          invalidItems.forEach((item: ValidationResult) => {
            toast.error(item.message || `Sản phẩm ${item.name} không khả dụng`)
          })
        }
      }
    } catch (error) {
      console.error('Error validating cart items:', error)
    } finally {
      setValidating(false)
    }
  }, [user, cartItems])

  useEffect(() => {
    const items = getCartItems()
    setCartItems(items)
    
    // Load discount từ localStorage nếu có và validate
    const savedDiscount = localStorage.getItem("appliedDiscount")
    if (savedDiscount) {
      try {
        const discount = JSON.parse(savedDiscount)
        
        // Tính subtotal hiện tại
        const currentSubtotal = items.reduce((total, item) => total + (item.price * item.qty), 0)
        
        // Validate minAmount
        if (discount.minAmount && currentSubtotal < discount.minAmount) {
          // Không đủ điều kiện, xóa discount
          console.log(`Discount ${discount.code} không còn hợp lệ (yêu cầu tối thiểu ${discount.minAmount}, hiện tại ${currentSubtotal})`)
          localStorage.removeItem("appliedDiscount")
          toast.info(`Mã ${discount.code} đã được xóa do đơn hàng không đủ điều kiện tối thiểu ${discount.minAmount.toLocaleString()}đ`)
        } else {
          // Còn hợp lệ, apply
          setAppliedDiscount(discount)
          setDiscountCode(discount.code)
        }
      } catch (error) {
        console.error("Error loading saved discount:", error)
        localStorage.removeItem("appliedDiscount")
      }
    }
  }, [])

  // Validate cart items when user changes or cart items change
  useEffect(() => {
    if (user && cartItems.length > 0) {
      validateCartItems()
    } else {
      setValidationResults({})
    }
  }, [user, cartItems, validateCartItems])

  // Validate discount khi cart items hoặc subtotal thay đổi
  useEffect(() => {
    if (!appliedDiscount) return

    const subtotal = getSubtotal()
    
    // Kiểm tra minAmount của discount code
    if (appliedDiscount.minAmount && subtotal < appliedDiscount.minAmount) {
      // Không đủ điều kiện nữa, xóa discount
      toast.error(`Mã ${appliedDiscount.code} yêu cầu đơn hàng tối thiểu ${appliedDiscount.minAmount.toLocaleString()}đ`)
      setAppliedDiscount(null)
      setDiscountCode("")
      localStorage.removeItem("appliedDiscount")
    }
  }, [cartItems, appliedDiscount])

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(id)
      setCartItems(prev => prev.filter(item => item.id !== id))
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
    } else {
      updateCartItem(id, newQty)
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, qty: newQty } : item
      ))
    }
  }

  const removeItem = (id: number) => {
    removeFromCart(id)
    setCartItems(prev => prev.filter(item => item.id !== id))
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
  }

  const clearAllItems = () => {
    clearCart()
    setCartItems([])
    toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng")
  }

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase()
    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá")
      return
    }

    setLoading(true)
    try {
      const subtotal = getSubtotal()
      const result = await applyDiscountCode(code, subtotal)
      
      if (result.success && result.discountCode) {
        const discountData = result.discountCode
        setAppliedDiscount(discountData)
        // Lưu vào localStorage để giữ khi chuyển sang checkout
        localStorage.setItem("appliedDiscount", JSON.stringify(discountData))
        toast.success(`✅ Đã áp dụng mã giảm giá: ${discountData.description || discountData.name}`)
      } else {
        toast.error(result.error || "Mã giảm giá không hợp lệ")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi áp dụng mã giảm giá")
    } finally {
      setLoading(false)
    }
  }

  const removeDiscountCode = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
    // Xóa khỏi localStorage
    localStorage.removeItem("appliedDiscount")
    toast.success("Đã xóa mã giảm giá")
  }

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0)
  }

  const getDiscountAmount = () => {
    return appliedDiscount?.discountAmount || 0
  }

  const getShippingPrice = () => {
    // Nếu có mã giảm giá với freeShipping → phí ship = 0
    // Ngược lại → phí ship = 15,000đ
    if (appliedDiscount?.freeShipping) {
      return 0
    }
    return 15000
  }

  const getTotal = () => {
    const subtotal = getSubtotal()
    const discount = getDiscountAmount()
    const shipping = getShippingPrice()
    
    return subtotal - discount + shipping
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán")
      router.push("/account/login")
      return
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống")
      return
    }

    // Validate cart items before checkout
    setValidating(true)
    try {
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.qty,
            name: item.name
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        const invalidItems = data.results?.filter((r: ValidationResult) => !r.isValid) || []
        
        if (invalidItems.length > 0) {
          // Show detailed error messages
          invalidItems.forEach((item: ValidationResult) => {
            toast.error(item.message || `Sản phẩm ${item.name} không khả dụng`, {
              duration: 5000
            })
          })
          return // Don't proceed to checkout
        }
      }
    } catch (error) {
      console.error('Error validating cart before checkout:', error)
      toast.error("Không thể xác thực giỏ hàng. Vui lòng thử lại.")
      return
    } finally {
      setValidating(false)
    }

    // Validate discount một lần nữa trước khi checkout
    if (appliedDiscount && appliedDiscount.minAmount) {
      const subtotal = getSubtotal()
      if (subtotal < appliedDiscount.minAmount) {
        toast.error(`Mã ${appliedDiscount.code} yêu cầu đơn hàng tối thiểu ${appliedDiscount.minAmount.toLocaleString()}đ`)
        setAppliedDiscount(null)
        setDiscountCode("")
        localStorage.removeItem("appliedDiscount")
        return
      }
    }

    // Lưu thông tin giỏ hàng và chuyển đến checkout
    const checkoutData = {
      items: cartItems,
      subtotal: getSubtotal(),
      discount: getDiscountAmount(),
      shipping: getShippingPrice(),
      total: getTotal(),
      discountCode: appliedDiscount?.code,
      discountData: appliedDiscount // Lưu toàn bộ thông tin discount
    }

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData))
    router.push("/checkout")
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <div className="space-x-4">
              <Link href="/products">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Xem sản phẩm
                </Button>
              </Link>
              <Link href="/processed-products">
                <Button variant="outline">
                  Sản phẩm chế biến
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hiển thị cảnh báo nếu có sản phẩm không khả dụng */}
            {Object.values(validationResults).some(r => !r.isValid) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cảnh báo</AlertTitle>
                <AlertDescription>
                  Một số sản phẩm trong giỏ hàng không còn khả dụng. Vui lòng kiểm tra và cập nhật giỏ hàng.
                </AlertDescription>
              </Alert>
            )}

            {cartItems.map((item) => {
              const validation = validationResults[item.id]
              const isInvalid = validation && !validation.isValid

              return (
                <Card key={item.id} className={`overflow-hidden ${isInvalid ? 'border-red-300 bg-red-50' : ''}`}>
                  <CardContent className="p-6">
                    {isInvalid && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-semibold">
                          {validation.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold truncate ${isInvalid ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xl font-bold text-orange-600">
                            {item.price.toLocaleString()}đ
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                {item.originalPrice.toLocaleString()}đ
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{item.discount}%
                              </Badge>
                            </>
                          )}
                        </div>
                        {validation && (
                          <div className="mt-2 text-sm">
                            {validation.issue === 'inactive' && (
                              <Badge variant="destructive" className="text-xs">
                                Đã bị vô hiệu hóa
                              </Badge>
                            )}
                            {validation.issue === 'out_of_stock' && (
                              <Badge variant="destructive" className="text-xs">
                                Hết hàng
                              </Badge>
                            )}
                            {validation.issue === 'insufficient_stock' && (
                              <Badge variant="destructive" className="text-xs">
                                Chỉ còn {validation.stock} sản phẩm
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-12 text-center font-semibold">
                        {item.qty}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        disabled={validation && validation.issue === 'insufficient_stock' && item.qty >= (validation.stock || 0)}
                        title={validation && validation.issue === 'insufficient_stock' && item.qty >= (validation.stock || 0) 
                          ? `Chỉ còn ${validation.stock} sản phẩm trong kho` 
                          : ''}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {(item.price * item.qty).toLocaleString()}đ
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={clearAllItems}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả
              </Button>
              
              <Link href="/products">
                <Button variant="outline">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="space-y-6">
            {/* Mã giảm giá */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Mã giảm giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!appliedDiscount ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleApplyDiscount} 
                        disabled={!discountCode.trim() || loading}
                      >
                        {loading ? "Đang xử lý..." : "Áp dụng"}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold mb-1">Mã khả dụng:</p>
                      <ul className="space-y-1">
                        <li>• SAVE5 - Giảm 5% (từ 500k)</li>                       
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-800">{appliedDiscount.code}</p>
                        <p className="text-sm text-green-600">
                          {appliedDiscount.description || appliedDiscount.name}
                        </p>
                        {appliedDiscount.discountAmount > 0 && (
                          <p className="text-xs text-green-700 mt-1">
                            Tiết kiệm: {appliedDiscount.discountAmount.toLocaleString()}đ
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeDiscountCode}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Phương thức giao hàng */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Phương thức giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-6 w-6 text-orange-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {appliedDiscount?.freeShipping ? "Miễn phí giao hàng" : "Giao hàng tiêu chuẩn"}
                        </h3>
                        <p className="text-sm text-gray-600">Thời gian: 1-2 ngày</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-600">
                        {getShippingPrice() === 0 ? 'Miễn phí' : `${getShippingPrice().toLocaleString()}đ`}
                      </p>
                    </div>
                  </div>
                  
                  {appliedDiscount?.freeShipping && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-2 mt-3">
                      <p className="text-sm font-semibold text-green-800">
                        ✅ Tiết kiệm 15,000đ với mã {appliedDiscount.code}
                      </p>
                    </div>
                  )}
                </div>
                
                {!appliedDiscount && (
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    💡 Dùng mã giảm giá để nhận ưu đãi
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tóm tắt thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tóm tắt thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{getSubtotal().toLocaleString()}đ</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedDiscount.code}):</span>
                      <span>-{getDiscountAmount().toLocaleString()}đ</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span>
                      {getShippingPrice() === 0 ? 'Miễn phí' : `${getShippingPrice().toLocaleString()}đ`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-orange-600">{getTotal().toLocaleString()}đ</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                  onClick={handleCheckout}
                  disabled={loading || validating || Object.values(validationResults).some(r => !r.isValid)}
                >
                  {validating ? "Đang kiểm tra..." : loading ? "Đang xử lý..." : "Tiến hành thanh toán"}
                </Button>
                
                {Object.values(validationResults).some(r => !r.isValid) && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Vui lòng xóa hoặc cập nhật các sản phẩm không khả dụng trước khi thanh toán
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
