import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma'
import { checkAuthRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // Rate limit: 5 requests per 15 minutes per IP
    const rl = checkAuthRateLimit(new Headers(req.headers), 'reset-password', 5, 900)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { 
          status: 429,
          headers: { 'Retry-After': rl.retryAfterSec.toString() }
        }
      )
    }

    const { token, password } = await req.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 1 chữ hoa" },
        { status: 400 }
      )
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 1 chữ số" },
        { status: 400 }
      )
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date() // Token not expired
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      }
    })

    console.log('✅ Password reset successful for:', user.email)

    return NextResponse.json({
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới."
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Lỗi server" },
      { status: 500 }
    )
  }
}


