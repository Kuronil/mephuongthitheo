import { NextRequest, NextResponse } from 'next/server'
import { createPaymentUrl } from '@/lib/vnpay'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/auth-middleware'

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(req)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { orderId, bankCode } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin đơn hàng' },
        { status: 400 }
      )
    }

    // Lấy thông tin đơn hàng từ database
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: true,
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      )
    }

    // Kiểm tra quyền sở hữu đơn hàng
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền truy cập đơn hàng này' },
        { status: 403 }
      )
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== 'AWAITING_PAYMENT' && order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Đơn hàng này không thể thanh toán' },
        { status: 400 }
      )
    }

    // Lấy IP address của client
    const ipAddr = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   '127.0.0.1'

    // Tạo order info
    const orderInfo = `Thanh toan don hang ${order.id} - Me Phuong Thit Heo`

    // Tạo payment URL
    const paymentUrl = createPaymentUrl({
      orderId: order.id.toString(),
      amount: order.total,
      orderInfo: orderInfo,
      ipAddr: ipAddr,
      bankCode: bankCode || undefined,
      locale: 'vn'
    })

    // Cập nhật trạng thái đơn hàng
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'AWAITING_PAYMENT',
        paymentMethod: 'VNPAY'
      }
    })

    console.log(`Created VNPay payment URL for order ${order.id}`)

    return NextResponse.json({
      success: true,
      paymentUrl: paymentUrl,
      orderId: order.id
    })

  } catch (error) {
    console.error('VNPay create payment error:', error)
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tạo link thanh toán',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}



