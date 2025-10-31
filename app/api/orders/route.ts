import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"
import { earnLoyaltyPoints } from "@/lib/loyalty-system"
import { createNewOrderNotification } from "@/lib/notification"
import { decrementStockForItems, canDecrementStock } from "@/lib/stock-management"
import { sanitizeName, sanitizePhone, sanitizeAddress, sanitizeText } from "@/lib/sanitize"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

export async function POST(req: NextRequest) {
  try {
    console.log('API: Starting order creation...')
    
    // Authenticate user
    const user = await authenticateUser(req)
    console.log('API: User authentication result:', !!user)
    
    if (!user) {
      console.log('API: User not authenticated')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    console.log('API: Received order data:', body)
    let { items, total, name, phone, address, note, paymentMethod, discountCodeId } = body as {
      items: OrderItem[]
      total: number
      name: string
      phone: string
      address: string
      note?: string
      paymentMethod: string
      discountCodeId?: number
    }

    // Sanitize user inputs
    name = sanitizeName(name)
    phone = sanitizePhone(phone)
    address = sanitizeAddress(address)
    note = note ? sanitizeText(note) : undefined

    console.log('API: Parsed data:', {
      items,
      total,
      name,
      phone,
      address,
      note,
      paymentMethod
    })

    // Validate required fields
    if (!items || items.length === 0) {
      console.log('API: Empty cart error')
      return NextResponse.json(
        { error: "Giỏ hàng trống" },
        { status: 400 }
      )
    }

    if (!name || !phone || !address || name.length === 0 || phone.length === 0 || address.length === 0) {
      console.log('API: Missing required fields:', { name, phone, address })
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      )
    }

    // Validate items data and check stock
    for (const item of items) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        console.log('API: Invalid item data:', item)
        return NextResponse.json(
          { error: "Dữ liệu sản phẩm không hợp lệ" },
          { status: 400 }
        )
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          name: true,
          isActive: true,
          stock: true
        }
      })

      console.log(`API: Checking product ${item.id} (${item.name}):`, {
        found: !!product,
        isActive: product?.isActive,
        stock: product?.stock,
        requestedQuantity: item.quantity
      })

      if (!product) {
        console.log(`API: Product ${item.id} not found`)
        return NextResponse.json(
          { 
            error: `Sản phẩm ${item.name} không tồn tại`,
            details: `Không tìm thấy sản phẩm với ID ${item.id}`
          },
          { status: 400 }
        )
      }

      // Check if product is active
      if (!product.isActive) {
        console.log(`API: Product ${item.id} (${item.name}) is not active`)
        return NextResponse.json(
          { 
            error: `Sản phẩm ${item.name} hiện không có sẵn (sản phẩm đã bị vô hiệu hóa)`,
            details: `Sản phẩm với ID ${item.id} không còn được bán`
          },
          { status: 400 }
        )
      }

      // Check if product has stock
      if (product.stock <= 0) {
        console.log(`API: Product ${item.id} (${item.name}) has no stock`)
        return NextResponse.json(
          { 
            error: `Sản phẩm ${item.name} hiện không có sẵn (hết hàng)`,
            details: `Sản phẩm với ID ${item.id} đã hết hàng trong kho`
          },
          { status: 400 }
        )
      }

      // Check stock availability with improved logic
      const canDecrement = await canDecrementStock(item.id, item.quantity)
      
      console.log(`API: Stock check for product ${item.id}:`, {
        canDecrement,
        availableStock: product.stock,
        requestedQuantity: item.quantity
      })
      
      if (!canDecrement) {
        const availableStock = product.stock
        return NextResponse.json(
          { 
            error: `Sản phẩm ${item.name} chỉ còn ${availableStock} sản phẩm trong kho. Bạn yêu cầu ${item.quantity}`,
            details: `Tồn kho hiện tại: ${availableStock}, Số lượng yêu cầu: ${item.quantity}`
          },
          { status: 400 }
        )
      }
    }

    // Create order with proper status based on payment method
    const orderStatus = paymentMethod === "COD" ? "PENDING" : "AWAITING_PAYMENT"
    
    console.log('API: Creating order with status:', orderStatus)
    console.log('API: Items to create:', items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })))
    
    console.log('API: About to create order in database...')
    console.log('API: Order data for database:', {
      userId: user.id,
      total,
      name,
      phone,
      address,
      note,
      paymentMethod,
      status: orderStatus,
      itemsCount: items.length
    })
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        name,
        phone,
        address,
        note,
        paymentMethod,
        status: orderStatus,
        discountCodeId: discountCodeId || null,
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true,
        user: true
      }
    })
    
    console.log('API: Order created successfully:', order.id)

    // Increment discount code usage if one was applied
    if (discountCodeId) {
      try {
        await prisma.discountCode.update({
          where: { id: discountCodeId },
          data: { usedCount: { increment: 1 } }
        })
        console.log(`API: Incremented usedCount for discount code ${discountCodeId}`)
      } catch (error) {
        console.error(`API: Error incrementing discount code usage:`, error)
        // Don't fail the order if discount tracking fails
      }
    }

    // Decrement stock for all items atomically
    const stockResult = await decrementStockForItems(
      items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        name: item.name
      }))
    )

    if (!stockResult.success) {
      // If stock decrement failed, we need to delete the order
      console.error('API: Stock decrement failed, deleting order:', order.id)
      await prisma.order.delete({
        where: { id: order.id }
      }).catch((error: unknown) => {
        console.error('API: Failed to delete order after stock failure:', error)
      })

      return NextResponse.json(
        { error: stockResult.error || "Không thể trừ tồn kho. Vui lòng thử lại." },
        { status: 400 }
      )
    }

    console.log('API: Stock decremented successfully for all items')

    // Generate order number
    const orderNumber = `MP${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Award loyalty points using new loyalty system
    try {
      await earnLoyaltyPoints(user.id, order.id, total)
      console.log(`API: Awarded loyalty points to user ${user.id} for order ${order.id}`)
    } catch (loyaltyError) {
      console.error("API: Error awarding loyalty points:", loyaltyError)
      // Don't fail the order if loyalty points fail
    }

    // Tạo thông báo đơn hàng mới cho người dùng
    try {
      await createNewOrderNotification(user.id, order.id, orderNumber, total)
      console.log(`API: Created order notification for user ${user.id}`)
    } catch (notificationError) {
      console.error("API: Error creating order notification:", notificationError)
      // Don't fail the order if notification fails
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        orderNumber
      },
      message: paymentMethod === "COD" 
        ? "Đơn hàng đã được tạo thành công. Bạn sẽ thanh toán khi nhận hàng."
        : "Đơn hàng đã được tạo thành công. Vui lòng thực hiện thanh toán."
    })
  } catch (error) {
    console.error("Order creation error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      type: typeof error
    })
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { 
        error: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "Thiếu thông tin người dùng" },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    )
  }
}