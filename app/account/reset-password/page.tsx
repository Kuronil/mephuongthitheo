"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import toast from "react-hot-toast"

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'input' | 'success' | 'error'>('input')
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage("Link không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.")
    }
  }, [token])

  const validatePassword = () => {
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return false
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Mật khẩu phải có ít nhất 1 chữ hoa")
      return false
    }

    if (!/\d/.test(password)) {
      toast.error("Mật khẩu phải có ít nhất 1 chữ số")
      return false
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra")
      }

      setStatus('success')
      toast.success("Đặt lại mật khẩu thành công!")
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/account/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra")
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100 animate-bounce-in">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ✅ Thành Công!
              </h2>

              <p className="text-gray-600 mb-6">
                Mật khẩu của bạn đã được đặt lại thành công.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  🎉 Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ!
                </p>
              </div>

              <Link
                href="/account/login"
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all"
              >
                Đăng Nhập Ngay
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-100">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ❌ Có Lỗi Xảy Ra
              </h2>

              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>

              <div className="space-y-3">
                <Link
                  href="/account/forgot-password"
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all"
                >
                  Yêu Cầu Đặt Lại Mới
                </Link>

                <Link
                  href="/account/login"
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Quay Lại Đăng Nhập
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Input Form State */}
        {status === 'input' && (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-linear-to-br from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-xl">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Đặt Lại Mật Khẩu
              </h1>
              <p className="text-gray-600">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
            </div>

            {/* Card */}
            <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Mật khẩu phải có:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className={password.length >= 6 ? "text-green-600" : ""}>
                        {password.length >= 6 ? "✓" : "○"}
                      </span>
                      Ít nhất 6 ký tự
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                        {/[A-Z]/.test(password) ? "✓" : "○"}
                      </span>
                      Ít nhất 1 chữ hoa
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/\d/.test(password) ? "text-green-600" : ""}>
                        {/\d/.test(password) ? "✓" : "○"}
                      </span>
                      Ít nhất 1 chữ số
                    </li>
                  </ul>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      Mật khẩu không khớp
                    </p>
                  )}
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
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Đặt Lại Mật Khẩu
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center pt-4">
                  <Link
                    href="/account/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

