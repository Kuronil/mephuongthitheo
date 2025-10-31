import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/auth-middleware'

// GET - Lấy thống kê tài khoản
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateUser(request)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Lấy thông tin user
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        createdAt: true,
        loyaltyPoints: true,
        loyaltyTier: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Đếm tổng số đơn hàng
    const totalOrders = await prisma.order.count({
      where: { userId: authUser.id }
    })

    // Tính tổng tiền đã chi tiêu (chỉ đơn hàng đã hoàn thành hoặc đã thanh toán)
    const orders = await prisma.order.findMany({
      where: {
        userId: authUser.id,
        status: {
          in: ['completed', 'delivered', 'shipping', 'confirmed']
        }
      },
      select: {
        total: true
      }
    })

    const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0)

    // Đếm sản phẩm trong wishlist
    const wishlistCount = await prisma.wishlistItem.count({
      where: { userId: authUser.id }
    })

    // Đếm sản phẩm trong giỏ hàng
    const cartCount = await prisma.cartItem.count({
      where: { userId: authUser.id }
    })

    // Đếm số review đã viết
    const reviewCount = await prisma.productReview.count({
      where: { userId: authUser.id }
    })

    return NextResponse.json({
      createdAt: user.createdAt,
      totalOrders,
      totalSpent,
      wishlistCount,
      cartCount,
      reviewCount,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

