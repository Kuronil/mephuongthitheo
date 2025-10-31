import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/auth-middleware'
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeAddress } from '@/lib/sanitize'

// GET - Lấy thông tin profile
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        isAdmin: true,
        createdAt: true,
        loyaltyPoints: true,
        loyaltyTier: true,
      }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật thông tin profile
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Sanitize inputs first
    const sanitizedName = sanitizeName(body.name)
    const sanitizedEmail = sanitizeEmail(body.email)
    const sanitizedPhone = body.phone ? sanitizePhone(body.phone) : null
    const sanitizedAddress = body.address ? sanitizeAddress(body.address) : null

    // Validation (after sanitization)
    if (!sanitizedName || sanitizedName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tên không được để trống' },
        { status: 400 }
      )
    }

    if (sanitizedName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Tên phải có ít nhất 2 ký tự' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!sanitizedEmail || sanitizedEmail.length === 0) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (sanitizedPhone && sanitizedPhone.length > 0) {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(sanitizedPhone.replace(/[\s-]/g, ''))) {
        return NextResponse.json(
          { error: 'Số điện thoại phải có 10-11 chữ số' },
          { status: 400 }
        )
      }
    }

    // Check if email is already used by another user
    if (sanitizedEmail) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: sanitizedEmail,
          NOT: {
            id: user.id
          }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email đã được sử dụng bởi tài khoản khác' },
          { status: 400 }
        )
      }
    }

    // Update user (use sanitized values)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        address: sanitizedAddress,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        isAdmin: true,
        createdAt: true,
        loyaltyPoints: true,
        loyaltyTier: true,
      }
    })

    return NextResponse.json({
      message: 'Cập nhật thông tin thành công',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật thông tin' },
      { status: 500 }
    )
  }
}

