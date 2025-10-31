import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email là bắt buộc" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email không tồn tại trong hệ thống" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email đã được xác thực rồi" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = getTokenExpiry();

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry: tokenExpiry,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Không thể gửi email. Vui lòng thử lại sau" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi gửi email" },
      { status: 500 }
    );
  }
}

