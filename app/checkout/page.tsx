"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { getCartItems } from "@/lib/cart"
import { CheckCircle, ChevronLeft, ChevronRight, User, Truck, CreditCard, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"

// Import các component bước
import Step1InfoAddress from "@/components/checkout/Step1InfoAddress"
import Step2Shipping from "@/components/checkout/Step2Shipping"
import Step3Payment from "@/components/checkout/Step3Payment"
import Step4Confirmation from "@/components/checkout/Step4Confirmation"

interface CheckoutData {
  // Bước 1: Thông tin & địa chỉ
  customerInfo: {
    name: string
    phone: string
    email: string
    address: string
    note?: string
  }
  
  // Bước 2: Phương thức giao hàng
  shipping: {
    method: string
    price: number
    estimatedDays: string
    timeSlot: string
  }
  
  // Bước 3: Thanh toán
  payment: {
    method: string
    discountCode?: string
    discountAmount: number
  }
  
  // Bước 4: Xác nhận
  order: {
    items: Array<{
      id: number
      name: string
      price: number
      qty: number
      image?: string
    }>
    subtotal: number
    discount: number
    shipping: number
    total: number
  }
}

const steps = [
  {
    id: 1,
    title: "Thông tin & địa chỉ",
    description: "Nhập thông tin giao hàng",
    icon: User
  },
  {
    id: 2,
    title: "Phương thức giao hàng",
    description: "Chọn cách giao hàng",
    icon: Truck
  },
  {
    id: 3,
    title: "Thanh toán",
    description: "Chọn phương thức thanh toán",
    icon: CreditCard
  },
  {
    id: 4,
    title: "Xác nhận đơn hàng",
    description: "Kiểm tra và xác nhận",
    icon: Check
  }
]

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customerInfo: {
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      address: user?.address || "",
      note: ""
    },
    shipping: {
      method: "",
      price: 0,
      estimatedDays: "",
      timeSlot: ""
    },
    payment: {
      method: "",
      discountCode: "",
      discountAmount: 0
    },
    order: {
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán")
      router.push("/account/login")
      return
    }

    // Load cart items
    const items = getCartItems()
    if (items.length === 0) {
      toast.error("Giỏ hàng trống")
      router.push("/cart")
      return
    }

    setCartItems(items)
    
    // Load discount từ localStorage nếu có
    const savedDiscount = localStorage.getItem("appliedDiscount")
    let discountAmount = 0
    let discountCode = ""
    
    if (savedDiscount) {
      try {
        const discount = JSON.parse(savedDiscount)
        discountAmount = discount.discountAmount || 0
        discountCode = discount.code || ""
      } catch (error) {
        console.error("Error loading saved discount:", error)
      }
    }
    
    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    const shipping = 0 // Will be updated in Step 2
    const total = subtotal + shipping - discountAmount
    
    setCheckoutData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        discountCode: discountCode,
        discountAmount: discountAmount
      },
      order: { 
        ...prev.order, 
        subtotal,
        discount: discountAmount,
        shipping,
        total,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image
        }))
      }
    }))
  }, [user, router])

  const updateCheckoutData = (step: keyof CheckoutData, data: any) => {
    setCheckoutData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return !!(checkoutData.customerInfo.name && 
                 checkoutData.customerInfo.phone && 
                 checkoutData.customerInfo.address)
      case 2:
        return !!(checkoutData.shipping.method && 
                 checkoutData.shipping.timeSlot)
      case 3:
        return !!(checkoutData.payment.method)
      case 4:
        return !!(checkoutData.order.items && checkoutData.order.items.length > 0)
      default:
        return false
    }
  }

  const canProceedToStep = (step: number) => {
    for (let i = 1; i < step; i++) {
      if (!isStepCompleted(i)) return false
    }
    return true
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1InfoAddress
            data={checkoutData.customerInfo}
            onUpdate={(data) => updateCheckoutData('customerInfo', data)}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <Step2Shipping
            data={checkoutData.shipping}
            onUpdate={(data) => updateCheckoutData('shipping', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <Step3Payment
            data={checkoutData.payment}
            onUpdate={(data) => updateCheckoutData('payment', data)}
            onNext={nextStep}
            onPrev={prevStep}
            subtotal={checkoutData.order.total}
            shippingPrice={checkoutData.shipping.price}
          />
        )
      case 4:
        return (
          <Step4Confirmation
            checkoutData={checkoutData}
            cartItems={cartItems}
            onComplete={() => {
              toast.success("Đặt hàng thành công!")
              router.push("/account/orders")
            }}
            onPrev={prevStep}
          />
        )
      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-8">Bạn cần đăng nhập để tiếp tục thanh toán</p>
          <Button onClick={() => router.push("/account/login")}>
            Đăng nhập
          </Button>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Không có sản phẩm nào để thanh toán</p>
          <Button onClick={() => router.push("/cart")}>
            Quay lại giỏ hàng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Steps */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Tiến trình thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = isStepCompleted(step.id)
                    const isCurrent = currentStep === step.id
                    const canAccess = canProceedToStep(step.id)
                    
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isCurrent 
                            ? 'bg-orange-50 border-orange-200 border' 
                            : isCompleted 
                            ? 'bg-green-50 border-green-200 border' 
                            : canAccess 
                            ? 'hover:bg-gray-50' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canAccess && goToStep(step.id)}
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-orange-900' : isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            Hoàn thành
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  )
}