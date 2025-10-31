import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// PUT /api/orders/[orderId]/status - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Robust orderId parsing
    const resolvedParams = await params
    let orderIdRaw: string | undefined = resolvedParams?.orderId
    if (!orderIdRaw) {
      const url = new URL(request.url)
      const parts = url.pathname.split('/').filter(Boolean)
      // .../api/orders/:orderId/status => ['api','orders',':orderId','status']
      const idx = parts.findIndex(p => p === 'orders')
      if (idx !== -1 && parts[idx + 1]) {
        orderIdRaw = parts[idx + 1]
      }
    }

    const orderId = Number.parseInt((orderIdRaw || '').trim(), 10)
    if (!orderIdRaw || Number.isNaN(orderId)) {
      return NextResponse.json(
        { error: `orderId không hợp lệ: ${orderIdRaw ?? 'undefined'}` },
        { status: 400 }
      )
    }
    const body = await request.json()
    const { status, reason } = body

    // Validate status
    const validStatuses = ['PENDING', 'AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'SHIPPING', 'DELIVERED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      )
    }

    // Fetch order then check permission
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      )
    }

    if (!user.isAdmin && order.userId !== user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền cập nhật đơn hàng này" },
        { status: 403 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    // Log status change (best-effort)
    try {
      await prisma.orderStatusLog.create({
        data: {
          orderId: orderId,
          status,
          reason: reason || `Cập nhật trạng thái thành ${status}`,
          changedBy: user.id,
          changedAt: new Date()
        }
      })
    } catch (logError) {
      console.error('Order status log create error:', logError)
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Cập nhật trạng thái đơn hàng thành công"
    })
  } catch (error: any) {
    console.error("Update order status error:", error)
    return NextResponse.json(
      { error: error?.message || "Không thể cập nhật trạng thái đơn hàng" },
      { status: 500 }
    )
  }
}