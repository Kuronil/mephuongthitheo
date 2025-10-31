import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { checkAuthRateLimit } from '@/lib/rate-limit'
import { getEnv } from '@/lib/env'

export async function POST(req: Request) {
  try {
    // Rate limit by IP per route
    const rl = checkAuthRateLimit(new Headers(req.headers), 'login')
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { 'Retry-After': rl.retryAfterSec.toString() } }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập email và mật khẩu" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { 
          error: "Tài khoản không tồn tại. Sai email hoặc mật khẩu. Hãy kiểm tra lại",
          code: "INVALID_CREDENTIALS"
        },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          error: "Tài khoản không tồn tại. Sai email hoặc mật khẩu. Hãy kiểm tra lại",
          code: "INVALID_CREDENTIALS"
        },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: "Email chưa được xác thực",
          code: "EMAIL_NOT_VERIFIED",
          email: user.email,
          message: "Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập. Bạn có thể yêu cầu gửi lại email xác thực."
        },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Return user data and token
    const response = NextResponse.json({
      ...userWithoutPassword,
      token
    })

    // Set token in HTTP-only cookie for additional security
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: getEnv.isProduction(),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Lỗi server" },
      { status: 500 }
    )
  }
}