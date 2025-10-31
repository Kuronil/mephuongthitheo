import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// PUT /api/notifications/mark-all-read - Đánh dấu tất cả thông báo đã đọc
export async function PUT(request: NextRequest) {
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

