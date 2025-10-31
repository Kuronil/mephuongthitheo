"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Vui lòng nhập email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra")
      }

      setSuccess(true)
      toast.success("📧 Vui lòng kiểm tra email của bạn!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-linear-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-xl">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Quên Mật Khẩu?
          </h1>
          <p className="text-gray-600">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          
          {success ? (
            // Success State
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Email Đã Gửi! ✅
              </h3>

              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
              </p>

              <p className="text-orange-600 font-semibold text-lg mb-8">
                {email}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  📧 Vui lòng kiểm tra hộp thư (kể cả thư mục Spam) và làm theo hướng dẫn trong email.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/account/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 transition-all"
                >
                  Quay Lại Đăng Nhập
                </Link>

                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Gửi Lại
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Link đặt lại mật khẩu sẽ có hiệu lực trong <strong>1 giờ</strong>.
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Gửi Email Đặt Lại
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <Link
                  href="/account/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}

        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ?{" "}
            <a href="mailto:support@mephuongthitheo.com" className="text-red-600 hover:text-red-700 font-medium">
              Liên hệ chúng tôi
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}


