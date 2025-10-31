import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'ID người dùng không hợp lệ' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        emailVerified: true,
        isAdmin: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            paymentMethod: true,
            name: true,
            phone: true,
            address: true,
            note: true,
            createdAt: true,
            updatedAt: true,
            paidAt: true,
            items: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                image: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            type: true,
            points: true,
            description: true,
            createdAt: true,
            expiresAt: true,
            orderId: true
          }
        },
        reviews: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            productId: true,
            product: true
          }
        },
        cart: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            name: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                stock: true
              }
            }
          }
        },
        wishlist: {
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            image: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                stock: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Calculate additional stats
    const completedOrders = user.orders.filter((o: any) => o.status === 'COMPLETED')
    const totalOrders = user.orders.length
    const totalSpent = completedOrders.reduce((sum: number, order: any) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const totalPoints = user.loyaltyPoints
    const totalReviews = user.reviews.length
    const averageRating = totalReviews > 0
      ? user.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
      : 0

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        status: user.emailVerified ? 'active' : 'inactive',
        orders: user.orders.map((order: any) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          paidAt: order.paidAt?.toISOString()
        })),
        loyaltyTransactions: user.loyaltyTransactions.map((transaction: any) => ({
          ...transaction,
          createdAt: transaction.createdAt.toISOString(),
          expiresAt: transaction.expiresAt?.toISOString()
        })),
        reviews: user.reviews.map((review: any) => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString()
        })),
        stats: {
          totalOrders,
          completedOrders: completedOrders.length,
          totalSpent,
          averageOrderValue,
          totalPoints,
          totalReviews,
          averageRating,
          cartItems: user.cart.length,
          wishlistItems: user.wishlist.length
        }
      }
    })

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể lấy thông tin người dùng' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)
    const body = await request.json()
    const { name, email, phone, address, loyaltyPoints, loyaltyTier, status, password } = body

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'ID người dùng không hợp lệ' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isAdmin: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Prevent editing own admin status or deleting yourself
    if (userId === admin.id && (body.isAdmin === false || body.status === 'inactive')) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể thay đổi trạng thái admin của chính mình' },
        { status: 403 }
      )
    }

    // Prevent making other admins inactive or non-admin
    if (existingUser.isAdmin && (status === 'inactive' || body.isAdmin === false)) {
      return NextResponse.json(
        { success: false, error: 'Không thể vô hiệu hóa hoặc xóa quyền admin của người dùng admin khác' },
        { status: 403 }
      )
    }

    // Validate email if being changed
    if (email && email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Email không hợp lệ' },
          { status: 400 }
        )
      }

      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email đã được sử dụng' },
          { status: 400 }
        )
      }
    }

    // Validate phone if provided
    if (phone !== undefined && phone !== null && phone !== '') {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
      const cleanedPhone = phone.replace(/\s/g, '')
      if (!phoneRegex.test(cleanedPhone)) {
        return NextResponse.json(
          { success: false, error: 'Số điện thoại không hợp lệ' },
          { status: 400 }
        )
      }
    }

    // Validate loyalty tier
    let tierToUpdate = loyaltyTier
    if (loyaltyTier) {
      const validTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
      if (!validTiers.includes(loyaltyTier.toUpperCase())) {
        return NextResponse.json(
          { success: false, error: 'Cấp độ thành viên không hợp lệ' },
          { status: 400 }
        )
      }
      tierToUpdate = loyaltyTier.toUpperCase()
    }

    // Validate loyalty points
    if (loyaltyPoints !== undefined && (isNaN(loyaltyPoints) || loyaltyPoints < 0)) {
      return NextResponse.json(
        { success: false, error: 'Điểm tích lũy phải là số không âm' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.toLowerCase().trim()
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (address !== undefined) updateData.address = address?.trim() || null
    if (loyaltyPoints !== undefined) updateData.loyaltyPoints = parseInt(loyaltyPoints)
    if (tierToUpdate) updateData.loyaltyTier = tierToUpdate
    
    // Handle status (using emailVerified as status indicator)
    if (status === 'inactive') {
      updateData.emailVerified = false
    } else if (status === 'active') {
      updateData.emailVerified = true
    }

    // Handle password update if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
          { status: 400 }
        )
      }
      const bcrypt = await import('bcryptjs')
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        loyaltyPoints: updatedUser.loyaltyPoints,
        loyaltyTier: updatedUser.loyaltyTier,
        status: updatedUser.emailVerified ? 'active' : 'inactive',
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt.toISOString()
      },
      message: 'Đã cập nhật thông tin người dùng thành công'
    })

  } catch (error: any) {
    console.error('Error updating user:', error)
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Không thể cập nhật người dùng' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'ID người dùng không hợp lệ' },
        { status: 400 }
      )
    }

    // Prevent deleting yourself
    if (userId === admin.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể xóa tài khoản của chính mình' },
        { status: 403 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Check if user is admin - prevent deleting admin users
    if (existingUser.isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không thể xóa tài khoản admin. Hãy vô hiệu hóa tài khoản thay vì xóa.' 
        },
        { status: 403 }
      )
    }

    // Check if user has orders
    const orderCount = await prisma.order.count({ 
      where: { userId } 
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Không thể xóa người dùng vì có ${orderCount} đơn hàng liên quan. Vui lòng vô hiệu hóa tài khoản thay vì xóa.` 
        },
        { status: 400 }
      )
    }

    console.log(`Deleting user ${userId} (${existingUser.email}) and all related data...`)

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx: any) => {
      // 1. Delete product reviews
      await tx.productReview.deleteMany({ where: { userId } })
      console.log('  ✓ Deleted product reviews')

      // 2. Delete cart items
      await tx.cartItem.deleteMany({ where: { userId } })
      console.log('  ✓ Deleted cart items')

      // 3. Delete wishlist items
      await tx.wishlistItem.deleteMany({ where: { userId } })
      console.log('  ✓ Deleted wishlist items')

      // 4. Delete loyalty transactions
      await tx.loyaltyTransaction.deleteMany({ where: { userId } })
      console.log('  ✓ Deleted loyalty transactions')

      // 5. Delete notifications
      await tx.notification.deleteMany({ where: { userId } })
      console.log('  ✓ Deleted notifications')

      // 6. Delete order status logs where user was the changer
      await tx.orderStatusLog.deleteMany({ where: { changedBy: userId } })
      console.log('  ✓ Deleted order status logs')

      // 7. Delete admin logs created by this user (if any - shouldn't happen for non-admin)
      await tx.adminLog.deleteMany({ where: { adminId: userId } })
      
      // 8. Delete product history entries
      await tx.productHistory.deleteMany({ where: { changedBy: userId } })
      
      // 9. Delete order history entries
      await tx.orderHistory.deleteMany({ where: { changedBy: userId } })

      // 10. Finally delete user
      await tx.user.delete({ where: { id: userId } })
      console.log('  ✓ Deleted user')
    })

    return NextResponse.json({
      success: true,
      message: `Đã xóa người dùng ${existingUser.name} (${existingUser.email}) và tất cả dữ liệu liên quan thành công`
    })

  } catch (error: any) {
    console.error('Error deleting user:', error)
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003' || error.message?.includes('foreign key') || error.message?.includes('constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Không thể xóa người dùng vì còn dữ liệu liên quan. Vui lòng vô hiệu hóa tài khoản thay vì xóa.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    )
  }
}
