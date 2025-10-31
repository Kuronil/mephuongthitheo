import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 per page
    const search = searchParams.get('search') || searchParams.get('q') || ''
    const tier = searchParams.get('tier') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      // SQLite doesn't support case-insensitive mode, so we use contains without mode
      // For better search, we search in lowercase
      const searchLower = search.toLowerCase()
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    }
    
    if (tier && tier !== 'all') {
      where.loyaltyTier = tier
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (['name', 'email', 'createdAt', 'loyaltyPoints', 'loyaltyTier'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    // Get users with related data
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
              createdAt: true,
              status: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Calculate additional user data
    const usersWithStats = users.map((user: any) => {
      const activeOrders = user.orders.filter((o: any) => 
        ['PENDING', 'AWAITING_PAYMENT', 'PROCESSING', 'SHIPPED'].includes(o.status)
      )
      const completedOrders = user.orders.filter((o: any) => o.status === 'COMPLETED')
      const totalOrders = user.orders.length
      const totalSpent = completedOrders.reduce((sum: number, order: any) => sum + order.total, 0)
      const lastOrder = user.orders.length > 0 
        ? user.orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt.toISOString(),
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier,
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt.toISOString(),
        status: user.emailVerified ? 'active' : 'inactive', // Use emailVerified as status indicator
        isAdmin: user.isAdmin
      }
    })

    // Get stats in parallel
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      topTierUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { emailVerified: false } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.user.count({
        where: {
          loyaltyTier: {
            in: ['GOLD', 'PLATINUM']
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      topTierUsers
    }

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, phone, address, loyaltyTier } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Tên, email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Tên phải có ít nhất 2 ký tự' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone) {
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
    const validTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
    const tier = loyaltyTier && validTiers.includes(loyaltyTier.toUpperCase()) 
      ? loyaltyTier.toUpperCase() 
      : 'BRONZE'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        loyaltyPoints: 0,
        loyaltyTier: tier,
        emailVerified: true, // Admin-created users are automatically verified
        isAdmin: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        loyaltyPoints: true,
        loyaltyTier: true,
        createdAt: true,
        emailVerified: true,
        isAdmin: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin
      },
      message: 'Đã tạo người dùng mới thành công'
    })

  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Không thể tạo người dùng' },
      { status: 500 }
    )
  }
}
