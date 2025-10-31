import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// PUT /api/notifications/[id] - Đánh dấu đã đọc
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notificationId = parseInt(id)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "ID thông báo không hợp lệ" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Không tìm thấy thông báo" },
        { status: 404 }
      )
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: "Thông báo đã được đánh dấu đã đọc"
    })

  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Xóa thông báo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const notificationId = parseInt(id)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "ID thông báo không hợp lệ" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Không tìm thấy thông báo" },
        { status: 404 }
      )
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({
      success: true,
      message: "Thông báo đã được xóa"
    })

  } catch (error) {
    console.error("Delete notification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
