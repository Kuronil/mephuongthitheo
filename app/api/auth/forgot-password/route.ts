import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { generateVerificationToken, getTokenExpiry, sendPasswordResetEmail } from '@/lib/email'
import { checkAuthRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // Rate limit: 3 requests per 60 minutes per IP (stricter because it sends emails)
    const rl = checkAuthRateLimit(new Headers(req.headers), 'forgot-password', 3, 3600)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { 
          status: 429,
          headers: { 'Retry-After': rl.retryAfterSec.toString() }
        }
      )
    }

    const { email } = await req.json()

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập email" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration attacks
    // Don't reveal if email exists or not
    if (!user) {
      return NextResponse.json({
        message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu."
      })
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = generateVerificationToken()
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 1) // 1 hour expiry

    // Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: tokenExpiry,
      }
    })

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken)
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      return NextResponse.json(
        { error: "Không thể gửi email. Vui lòng thử lại sau." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu."
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Lỗi server" },
      { status: 500 }
    )
  }
}


