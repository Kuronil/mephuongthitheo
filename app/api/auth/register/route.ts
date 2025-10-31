import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma'
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from '@/lib/email'
import { generateToken } from '@/lib/auth'
import { checkAuthRateLimit } from '@/lib/rate-limit'
import { getEnv } from '@/lib/env'
import { sanitizeName, sanitizeEmail, sanitizePhone, sanitizeAddress } from '@/lib/sanitize'

export async function POST(req: Request) {
  try {
    // Rate limit by IP per route
    const rl = checkAuthRateLimit(new Headers(req.headers), 'register')
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { 'Retry-After': rl.retryAfterSec.toString() } }
      )
    }

    const { email, password, name, address, phone } = await req.json()

    // Sanitize user inputs first
    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedName = sanitizeName(name)
    const sanitizedAddress = sanitizeAddress(address)
    const sanitizedPhone = phone ? sanitizePhone(phone) : null

    // Validate input (after sanitization)
    if (!sanitizedEmail || !password || !sanitizedName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate name (no numbers or special characters)
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/
    
    if (!nameRegex.test(sanitizedName) || sanitizedName.length < 2) {
      return NextResponse.json(
        { error: "Tên không hợp lệ" },
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

    // Validate phone if provided
    if (sanitizedPhone && sanitizedPhone.length > 0) {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
      if (!phoneRegex.test(sanitizedPhone.replace(/\s/g, ''))) {
        return NextResponse.json(
          { error: "Số điện thoại không hợp lệ" },
          { status: 400 }
        )
      }
    }

    // Validate address (now required)
    if (!sanitizedAddress || !sanitizedAddress.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ" },
        { status: 400 }
      )
    }

    // Check existing user (use sanitized email)
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const tokenExpiry = getTokenExpiry()

    // Create user (use sanitized values)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        password: hashedPassword,
        address: sanitizedAddress,
        phone: sanitizedPhone,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      }
    })

    // Send verification email
    try {
      await sendVerificationEmail(sanitizedEmail, sanitizedName, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email sending fails
    }

    // Generate JWT token (even though email not verified, user can still be logged in)
    const token = generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    })

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      ...userWithoutPassword,
      token,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
    }, { status: 201 })

    // Set token in HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: getEnv.isProduction(),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}