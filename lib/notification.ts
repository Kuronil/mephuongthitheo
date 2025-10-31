import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Tạo thông báo cho người dùng
 */
export async function createNotification(params: {
  userId: number | null
  title: string
  message: string
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'LOYALTY'
  data?: any
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        data: params.data ? JSON.stringify(params.data) : null
      }
    })

    console.log(`Notification created for user ${params.userId}:`, notification.title)
    return notification
  } catch (error) {
    console.error("Create notification error:", error)
    throw error
  }
}

/**
 * Tạo thông báo cập nhật trạng thái đơn hàng
 */
export async function createOrderStatusNotification(
  userId: number | null,
  orderId: number,
  orderNumber: string,
  oldStatus: string,
  newStatus: string
) {
  const statusMessages: Record<string, { title: string, message: string }> = {
    'PENDING': {
      title: '✅ Đơn hàng đang xử lý',
      message: `Đơn hàng #${orderNumber} của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.`
    },
    'AWAITING_PAYMENT': {
      title: '⏳ Chờ thanh toán',
      message: `Đơn hàng #${orderNumber} đang chờ thanh toán. Vui lòng hoàn tất thanh toán để tiếp tục xử lý đơn hàng.`
    },
    'SHIPPING': {
      title: '🚚 Đang giao hàng',
      message: `Đơn hàng #${orderNumber} đang được giao đến bạn. Vui lòng chú ý điện thoại để nhận hàng.`
    },
    'DELIVERED': {
      title: '📦 Đã giao hàng',
      message: `Đơn hàng #${orderNumber} đã được giao thành công. Cảm ơn bạn đã mua hàng!`
    },
    'COMPLETED': {
      title: '✨ Hoàn thành',
      message: `Đơn hàng #${orderNumber} đã hoàn thành. Cảm ơn bạn đã tin tưởng Mẹ Phương!`
    },
    'CANCELLED': {
      title: '❌ Đơn hàng đã hủy',
      message: `Đơn hàng #${orderNumber} đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.`
    }
  }

  const statusInfo = statusMessages[newStatus] || {
    title: 'Cập nhật trạng thái đơn hàng',
    message: `Đơn hàng #${orderNumber} đã được cập nhật trạng thái.`
  }

  return createNotification({
    userId,
    title: statusInfo.title,
    message: statusInfo.message,
    type: 'ORDER',
    data: {
      orderId,
      orderNumber,
      oldStatus,
      newStatus,
      updatedAt: new Date().toISOString()
    }
  })
}

/**
 * Tạo thông báo đơn hàng mới
 */
export async function createNewOrderNotification(
  userId: number,
  orderId: number,
  orderNumber: string,
  total: number
) {
  return createNotification({
    userId,
    title: '🎉 Đặt hàng thành công',
    message: `Đơn hàng #${orderNumber} của bạn đã được đặt thành công với tổng giá trị ${total.toLocaleString()}₫. Chúng tôi sẽ sớm xử lý đơn hàng của bạn.`,
    type: 'ORDER',
    data: {
      orderId,
      orderNumber,
      total,
      createdAt: new Date().toISOString()
    }
  })
}

/**
 * Tạo thông báo khuyến mãi
 */
export async function createPromotionNotification(
  userId: number | null,
  title: string,
  message: string,
  data?: any
) {
  return createNotification({
    userId,
    title: `🎁 ${title}`,
    message,
    type: 'PROMOTION',
    data
  })
}

/**
 * Tạo thông báo điểm thưởng
 */
export async function createLoyaltyNotification(
  userId: number,
  points: number,
  action: 'EARN' | 'REDEEM',
  description: string
) {
  const title = action === 'EARN' 
    ? `⭐ Bạn nhận được ${points} điểm` 
    : `✨ Bạn đã đổi ${points} điểm`

  return createNotification({
    userId,
    title,
    message: description,
    type: 'LOYALTY',
    data: {
      points,
      action,
      timestamp: new Date().toISOString()
    }
  })
}

