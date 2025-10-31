import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/account/orders - Get user orders with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: user.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { items: { some: { name: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Get orders with pagination
    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { image: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Map items to expose `image` in response for UI
    const orders = ordersRaw.map((o: any) => ({
      ...o,
      items: (o.items || []).map((it: any) => ({
        id: it.id,
        orderId: it.orderId,
        productId: it.productId,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image ?? it.product?.image ?? null
      }))
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/account/orders - Create new order (if needed)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, total, name, phone, address, note, paymentMethod } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        name,
        phone,
        address,
        note,
        paymentMethod,
        status: paymentMethod === "COD" ? "PENDING" : "AWAITING_PAYMENT",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty
          }))
        }
      },
      include: {
        items: true
      }
    })

    // Generate order number
    const orderNumber = `MP${Date.now()}${Math.floor(Math.random() * 1000)}`

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        orderNumber
      },
      message: "Order created successfully"
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
