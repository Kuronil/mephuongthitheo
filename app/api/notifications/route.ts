import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/notifications - Lấy danh sách thông báo
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // Filter by type
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: user.id
    }

    if (type) {
      where.type = type
    }

    if (unreadOnly) {
      where.isRead = false
    }

    // Get notifications
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map((notification: any) => ({
          ...notification,
          data: notification.data ? JSON.parse(notification.data) : null
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unreadCount
      }
    })

  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Tạo thông báo mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type, data } = body

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data ? JSON.stringify(data) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Thông báo đã được tạo thành công"
    })

  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications/mark-all-read - Đánh dấu tất cả đã đọc
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Mark all notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json({
      success: true,
      message: "Tất cả thông báo đã được đánh dấu đã đọc"
    })

  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
