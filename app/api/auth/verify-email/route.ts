import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';
import { checkAuthRateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    // Rate limit: 10 requests per 15 minutes per IP (allow more attempts for verification)
    const rl = checkAuthRateLimit(new Headers(req.headers), 'verify-email', 10, 900)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { 
          status: 429,
          headers: { 'Retry-After': rl.retryAfterSec.toString() }
        }
      )
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Token không hợp lệ" },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        emailVerified: false,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token không hợp lệ hoặc đã được sử dụng" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực" },
        { status: 400 }
      );
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email đã được xác thực thành công!",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xác thực email" },
      { status: 500 }
    );
  }
}

