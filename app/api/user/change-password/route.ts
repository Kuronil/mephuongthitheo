import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authenticateUser } from '@/lib/auth-middleware'

// POST - Thay đổi mật khẩu
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 1 chữ hoa' },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải có ít nhất 1 chữ số' },
        { status: 400 }
      )
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu mới và xác nhận mật khẩu không khớp' },
        { status: 400 }
      )
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' },
        { status: 400 }
      )
    }

    // Get user with password from database
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true
      }
    })

    if (!userWithPassword) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu hiện tại không đúng' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({
      message: 'Đổi mật khẩu thành công'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Lỗi khi đổi mật khẩu' },
      { status: 500 }
    )
  }
}

