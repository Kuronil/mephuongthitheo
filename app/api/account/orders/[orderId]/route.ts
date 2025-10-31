import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/account/orders/[orderId] - Get specific order details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    console.log("[OrderDetail API] Incoming URL:", request.url)
    const params = await context.params
    console.log("[OrderDetail API] Params received:", params)
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Validate orderId (robust parsing)
    const url = new URL(request.url)
    const fromParams = (params?.orderId || "").trim()
    const fromPath = url.pathname.split("/").filter(Boolean).pop() || ""
    const rawOrderId = fromParams || fromPath

    console.log("[OrderDetail API] Raw orderId:", rawOrderId)

    const numericMatch = rawOrderId.match(/^\d+$/)
    if (!numericMatch) {
      return NextResponse.json(
        { error: `orderId không hợp lệ: ${rawOrderId}` },
        { status: 400 }
      )
    }

    const orderId = parseInt(rawOrderId, 10)

    // Fetch order for user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { image: true } }
          }
        },
        statusLogs: { orderBy: { changedAt: 'desc' } }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      )
    }

    if (order.userId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền xem đơn hàng này" },
        { status: 403 }
      )
    }

    // Generate order number for response
    const orderNumber = `MP${order.id}${Date.now().toString().slice(-4)}`

    // Enrich items with product image for UI
    const itemsWithImage = (order.items || []).map((it: any) => ({
      id: it.id,
      orderId: it.orderId,
      productId: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      image: it.image ?? it.product?.image ?? null
    }))

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: itemsWithImage,
        orderNumber
      }
    })
  } catch (error: any) {
    console.error("Get order detail error:", error)
    return NextResponse.json(
      { error: error?.message || "Không thể lấy chi tiết đơn hàng" },
      { status: 500 }
    )
  }
}