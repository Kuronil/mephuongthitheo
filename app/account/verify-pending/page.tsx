"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

export default function VerifyPendingPage() {
  const [loading, setLoading] = useState(false)
  const [emailResent, setEmailResent] = useState(false)

  // Get user email from localStorage
  const getUserEmail = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      if (user) {
        return JSON.parse(user).email
      }
    }
    return null
  }

  const handleResendEmail = async () => {
    const email = getUserEmail()
    if (!email) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('📧 Email xác thực đã được gửi lại!')
        setEmailResent(true)
      } else {
        toast.error(data.error || 'Không thể gửi email')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Clock className="w-5 h-5 text-yellow-900" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            📬 Kiểm Tra Email Của Bạn
          </h1>
          <p className="text-gray-600 text-lg">
            Chúng tôi đã gửi email xác thực đến
          </p>
          <p className="text-orange-600 font-semibold text-lg mt-2">
            {getUserEmail() || 'email của bạn'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-gray-100">
          
          {/* Instructions */}
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                Các bước tiếp theo:
              </h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Mở hộp thư email của bạn</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Tìm email từ <strong>Mẹ Phương Thị Theo</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Nhấn vào nút <strong>"Xác Thực Email"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Đăng nhập và bắt đầu mua sắm! 🎉</span>
                </li>
              </ol>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  <strong>Lưu ý:</strong> Link xác thực có hiệu lực trong <strong>24 giờ</strong>. 
                  Kiểm tra cả thư mục <strong>Spam/Junk</strong> nếu không thấy email.
                </span>
              </p>
            </div>

            {/* Resend Button */}
            <div className="pt-4">
              <p className="text-center text-sm text-gray-600 mb-4">
                Không nhận được email?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={loading || emailResent}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-orange-300 rounded-lg shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Đang gửi...' : emailResent ? '✓ Đã gửi lại' : 'Gửi Lại Email'}
              </button>
            </div>

            {emailResent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-fade-in">
                <p className="text-sm text-green-800">
                  ✅ Email đã được gửi lại. Vui lòng kiểm tra hộp thư!
                </p>
              </div>
            )}

            {/* Navigation Links */}
            <div className="pt-6 space-y-3 border-t border-gray-200">
              <Link
                href="/account/login"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                Đã xác thực? Đăng nhập ngay
              </Link>

              <Link
                href="/"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Về Trang Chủ
              </Link>
            </div>

          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ:{" "}
            <a href="mailto:support@mephuongthitheo.com" className="text-orange-600 hover:text-orange-700 font-medium">
              support@mephuongthitheo.com
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

