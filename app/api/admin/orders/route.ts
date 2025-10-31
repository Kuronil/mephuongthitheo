import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createOrderStatusNotification } from "@/lib/notification"
import { logAdminAction, logOrderChange } from "@/lib/admin-log"
import { authenticateAdmin } from "@/lib/auth-middleware"
import { restoreStockFromOrder } from "@/lib/stock-management"

// GET /api/admin/orders - Get all orders for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const paymentMethod = searchParams.get('paymentMethod')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = paymentMethod
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { name: { contains: search } },
        { phone: { contains: search } },
        { items: { some: { name: { contains: search } } } }
      ]
    }

    // Get orders with pagination and related data
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Calculate stats
    const stats = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    })

    const statusStats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const paymentStats = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: {
        id: true
      }
    })

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
        },
        stats: {
          totalOrders: stats._count.id,
          totalRevenue: stats._sum.total || 0,
          statusBreakdown: statusStats.reduce((acc: Record<string, number>, item: { status: string; _count: { id: number } }) => {
            acc[item.status] = item._count.id
            return acc
          }, {} as Record<string, number>),
          paymentBreakdown: paymentStats.reduce((acc: Record<string, number>, item: { paymentMethod: string; _count: { id: number } }) => {
            acc[item.paymentMethod] = item._count.id
            return acc
          }, {} as Record<string, number>)
        }
      }
    })
  } catch (error) {
    console.error("Get admin orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      console.error('Missing required fields:', { orderId, status })
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['PENDING', 'AWAITING_PAYMENT', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status)
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    })

    if (!existingOrder) {
      console.error('Order not found:', orderId)
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      )
    }

    console.log('Existing order found:', existingOrder.id, 'status:', existingOrder.status)

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    console.log('Order updated successfully:', updatedOrder.id, 'new status:', updatedOrder.status)

    // Log status change
    try {
      await prisma.orderStatusLog.create({
        data: {
          orderId: parseInt(orderId),
          status,
          reason: `Admin updated status from ${existingOrder.status} to ${status}`,
          changedBy: user.id
        }
      })
      console.log('Status log created')
    } catch (logError) {
      console.error('Failed to create status log (non-critical):', logError)
      // Continue even if logging fails
    }

    // Get admin user for logging (already authenticated above)
    const adminUser = user

    // Restore stock if order is cancelled
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      try {
        await restoreStockFromOrder(updatedOrder.id)
        console.log(`[Admin] Stock restored for cancelled order ${updatedOrder.id}`)
      } catch (restoreError) {
        console.error(`[Admin] Failed to restore stock for order ${updatedOrder.id}:`, restoreError)
        // Don't fail the status update if stock restoration fails
        // Log it for manual review
      }
    }

    // Log order change
    if (adminUser?.id) {
      try {
        await logOrderChange({
          orderId: updatedOrder.id,
          changedBy: adminUser.id,
          field: 'status',
          oldValue: existingOrder.status,
          newValue: status,
          reason: `Admin updated order status${status === 'CANCELLED' ? ' - Stock restored' : ''}`
        })

        await logAdminAction({
          adminId: adminUser.id,
          action: 'UPDATE',
          entity: 'ORDER',
          entityId: updatedOrder.id,
          description: `Updated order status from ${existingOrder.status} to ${status}${status === 'CANCELLED' ? ' - Stock restored' : ''}`,
          oldData: { status: existingOrder.status },
          newData: { status },
          request
        })
      } catch (logError) {
        console.error('Failed to log order change:', logError)
      }
    }

    // Tạo thông báo cho người dùng về việc cập nhật trạng thái
    if (updatedOrder.userId) {
      try {
        await createOrderStatusNotification(
          updatedOrder.userId,
          updatedOrder.id,
          `MP${updatedOrder.id}`,
          existingOrder.status,
          status
        )
        console.log('Order status notification sent to user:', updatedOrder.userId)
      } catch (notificationError) {
        console.error('Failed to create notification (non-critical):', notificationError)
        // Continue even if notification fails
      }
    } else {
      console.log('Order has no userId, skipping notification')
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order status updated successfully"
    })
  } catch (error: any) {
    console.error("Update order status error:", error)
    return NextResponse.json(
      { 
        error: error?.message || "Internal server error",
        details: error?.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    )
  }
}
