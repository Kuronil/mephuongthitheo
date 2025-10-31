import * as nodemailer from 'nodemailer';
import crypto from 'crypto';
import { getEnv } from './env';

// Cấu hình SMTP transporter
const transporter = nodemailer.createTransport({
  host: getEnv.smtp.host(),
  port: getEnv.smtp.port(),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: getEnv.smtp.user(),
    pass: getEnv.smtp.pass(),
  },
});

/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get token expiry time (24 hours from now)
 */
export function getTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    const verificationUrl = `${getEnv.appUrl()}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${getEnv.smtp.fromName()}" <${getEnv.smtp.user()}>`,
      to: email,
      subject: '✅ Xác Thực Email - Mẹ Phương Thịt Heo',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác Thực Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        🎉 Chào Mừng Bạn!
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Xin chào <strong>${name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Cảm ơn bạn đã đăng ký tài khoản tại <strong>Mẹ Phương Thịt Heo</strong>! 
                        Chỉ còn một bước nữa là hoàn tất đăng ký.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                              ✅ Xác Thực Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        Hoặc sao chép và dán link sau vào trình duyệt:
                      </p>
                      
                      <p style="margin: 0 0 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563; border-left: 4px solid #f97316;">
                        ${verificationUrl}
                      </p>
                      
                      <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Lưu ý:</strong> Link xác thực này sẽ <strong>hết hạn sau 24 giờ</strong>. 
                          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        <strong>Mẹ Phương Thịt Heo</strong>
                      </p>
                      <p style="margin: 0 0 10px; color: #9ca3af; font-size: 13px;">
                        Thịt tươi sạch - An toàn chất lượng
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Mẹ Phương Thịt Heo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
                
                <p style="margin: 20px 0 0; text-align: center; color: #9ca3af; font-size: 12px;">
                  Email này được gửi tự động. Vui lòng không trả lời email này.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Xin chào ${name},

Cảm ơn bạn đã đăng ký tài khoản tại Mẹ Phương Thịt Heo!

Vui lòng xác thực email của bạn bằng cách truy cập link sau:
${verificationUrl}

Link này sẽ hết hạn sau 24 giờ.

Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.

---
Mẹ Phương Thịt Heo
Thịt tươi sạch - An toàn chất lượng
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    const resetUrl = `${getEnv.appUrl()}/account/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${getEnv.smtp.fromName()}" <${getEnv.smtp.user()}>`,
      to: email,
      subject: '🔐 Đặt Lại Mật Khẩu - Mẹ Phương Thịt Heo',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <title>Đặt Lại Mật Khẩu</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        🔐 Đặt Lại Mật Khẩu
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Xin chào <strong>${name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>Mẹ Phương Thịt Heo</strong>.
                      </p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                              🔐 Đặt Lại Mật Khẩu
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        Hoặc sao chép và dán link sau vào trình duyệt:
                      </p>
                      
                      <p style="margin: 0 0 30px; padding: 15px; background-color: #f9fafb; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563; border-left: 4px solid: #dc2626;">
                        ${resetUrl}
                      </p>
                      
                      <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Lưu ý:</strong> Link đặt lại mật khẩu này sẽ <strong>hết hạn sau 1 giờ</strong>. 
                          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
                        </p>
                      </div>
                      
                      <div style="margin: 30px 0; padding: 20px; background-color: #fee2e2; border-radius: 6px; border-left: 4px solid #dc2626;">
                        <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                          <strong>🔒 Bảo mật:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                        <strong>Mẹ Phương Thịt Heo</strong>
                      </p>
                      <p style="margin: 0 0 10px; color: #9ca3af; font-size: 13px;">
                        Thịt tươi sạch - An toàn chất lượng
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} Mẹ Phương Thịt Heo. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
                
                <p style="margin: 20px 0 0; text-align: center; color: #9ca3af; font-size: 12px;">
                  Email này được gửi tự động. Vui lòng không trả lời email này.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Xin chào ${name},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Vui lòng truy cập link sau để đặt lại mật khẩu:
${resetUrl}

Link này sẽ hết hạn sau 1 giờ.

Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.

---
Mẹ Phương Thịt Heo
Thịt tươi sạch - An toàn chất lượng
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"${getEnv.smtp.fromName()}" <${getEnv.smtp.user()}>`,
      to: email,
      subject: '🎉 Chào Mừng Đến Với Mẹ Phương Thịt Heo!',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <title>Chào Mừng</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">
                        ✅ Email Đã Được Xác Thực!
                      </h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                        Xin chào <strong>${name}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                        Tài khoản của bạn đã được kích hoạt thành công! 🎊
                      </p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                        Bây giờ bạn có thể:
                      </p>
                      
                      <ul style="margin: 0 0 30px 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                        <li>Mua sắm các sản phẩm thịt tươi sạch</li>
                        <li>Nhận ưu đãi và điểm thưởng</li>
                        <li>Theo dõi đơn hàng của bạn</li>
                        <li>Lưu sản phẩm yêu thích</li>
                      </ul>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${getEnv.appUrl()}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                              🛒 Bắt Đầu Mua Sắm
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        © ${new Date().getFullYear()} Mẹ Phương Thịt Heo
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
}

