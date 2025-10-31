"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token xác thực không hợp lệ')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        
        // Update localStorage if user data exists
        if (data.user) {
          const existingUser = localStorage.getItem('user')
          if (existingUser) {
            const userData = JSON.parse(existingUser)
            userData.emailVerified = true
            localStorage.setItem('user', JSON.stringify(userData))
          }
        }

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/account/login')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Xác thực thất bại')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Có lỗi xảy ra. Vui lòng thử lại sau')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-orange-100">
                <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Đang xác thực...
              </h2>
              <p className="text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100 animate-bounce-in">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✅ Xác Thực Thành Công!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    🎉 Tài khoản của bạn đã được kích hoạt. <br/>
                    Bạn sẽ được chuyển đến trang đăng nhập...
                  </p>
                </div>

                <Link
                  href="/account/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                  Đăng Nhập Ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
                >
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-100">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ❌ Xác Thực Thất Bại
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    {message.includes('hết hạn') 
                      ? '⏰ Link xác thực đã hết hạn (24 giờ). Vui lòng yêu cầu gửi lại email xác thực.'
                      : '⚠️ Link xác thực không hợp lệ hoặc đã được sử dụng.'}
                  </p>
                </div>

                <ResendVerificationButton />

                <Link
                  href="/account/register"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Đăng Ký Lại
                </Link>

                <Link
                  href="/"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// Component để resend verification email
function ResendVerificationButton() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const handleResend = async () => {
    if (!email) {
      setResult({ type: 'error', message: 'Vui lòng nhập email' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ type: 'success', message: data.message })
        setEmail('')
        setShowInput(false)
      } else {
        setResult({ type: 'error', message: data.error })
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Có lỗi xảy ra' })
    } finally {
      setLoading(false)
    }
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all"
      >
        <Mail className="h-4 w-4" />
        Gửi Lại Email Xác Thực
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
        />
      </div>

      {result && (
        <div className={`p-3 rounded-md text-sm ${
          result.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {result.message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleResend}
          disabled={loading}
          className="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Gửi
            </>
          )}
        </button>
        <button
          onClick={() => {
            setShowInput(false)
            setResult(null)
            setEmail('')
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          Hủy
        </button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
