export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CreateOrderData {
  items: OrderItem[]
  total: number
  name: string
  phone: string
  address: string
  note?: string
  paymentMethod: string
  discountCodeId?: number
}

export interface Order {
  id: number
  orderNumber: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  items: OrderItem[]
}

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    // Get user ID from localStorage
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    
    console.log('Create order: User from localStorage:', user)
    
    if (!user?.id) {
      console.log('Create order: User not authenticated')
      throw new Error('User not authenticated')
    }
    
    // Test authentication first
    try {
      const authTestResponse = await fetch('/api/test-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        }
      })
      
      console.log('Create order: Auth test response status:', authTestResponse.status)
      
      if (!authTestResponse.ok) {
        const authError = await authTestResponse.json()
        console.log('Create order: Auth test failed:', authError)
        throw new Error('Authentication test failed')
      }
      
      const authResult = await authTestResponse.json()
      console.log('Create order: Auth test successful:', authResult)
    } catch (authError) {
      console.log('Create order: Auth test error:', authError)
      throw new Error('Authentication failed')
    }

    console.log('Creating order with data:', {
      orderData,
      userId: user.id,
      user: user
    })
    
    console.log('Order data items:', orderData.items)
    console.log('Order data validation:', {
      hasItems: orderData.items && orderData.items.length > 0,
      hasTotal: orderData.total > 0,
      hasName: !!orderData.name,
      hasPhone: !!orderData.phone,
      hasAddress: !!orderData.address,
      hasPaymentMethod: !!orderData.paymentMethod
    })

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString()
      },
      body: JSON.stringify({
        ...orderData,
        userId: user.id
      }),
    })

    console.log('Create order response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      let errorData: any = null
      try {
        errorData = await response.json()
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
        const text = await response.text().catch(() => 'Unknown error')
        console.error('Response text:', text.substring(0, 200))
      }

      const serverMessage = errorData?.error || errorData?.message
      const serverDetails = errorData?.details

      console.error('Create order API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData || null,
        message: serverMessage,
        details: serverDetails
      })

      // Prefer the main error message, but include details if available
      const message = serverDetails 
        ? `${serverMessage || 'Lỗi khi tạo đơn hàng'}: ${serverDetails}`
        : serverMessage || `HTTP ${response.status}: ${response.statusText}`
      
      throw new Error(message)
    }

    const order = await response.json()
    return order.order
  } catch (error) {
    console.error('Create order error:', error)
    throw error
  }
}

export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch('/api/account/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch orders')
    }

    const data = await response.json()
    return data.data.orders
  } catch (error) {
    console.error('Get orders error:', error)
    throw error
  }
}

export const updateOrderStatus = async (orderId: number, status: string, reason?: string): Promise<void> => {
  try {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const user = userStr ? JSON.parse(userStr) : null

    if (!user?.id) {
      throw new Error('Unauthorized')
    }

    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString()
      },
      body: JSON.stringify({ status, reason }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Failed to update order status')
    }
  } catch (error) {
    console.error('Update order status error:', error)
    throw error
  }
}
