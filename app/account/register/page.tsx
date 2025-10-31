"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { useUser } from "@/contexts/UserContext"
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowLeft, Phone } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [emailError, setEmailError] = useState("")
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [checkingEmail, setCheckingEmail] = useState(false)
  const { setUser } = useUser()
  const router = useRouter()
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on name input when component mounts
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  // Debounced email check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email && !emailError) {
        checkEmailExists(formData.email)
      }
    }, 1000) // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId)
  }, [formData.email, emailError])

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("")
      return true
    }
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ")
      return false
    }
    setEmailError("")
    return true
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  // Validate password strength
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự"
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa"
    }
    if (!/\d/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ số"
    }
    return ""
  }

  // Validate name (no numbers or special characters)
  const validateName = (name: string) => {
    if (!name) {
      setNameError("")
      return true
    }
    
    // Vietnamese characters allowed + spaces
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/
    
    if (!nameRegex.test(name)) {
      setNameError("Tên không được chứa số hoặc ký tự đặc biệt")
      return false
    }
    
    if (name.length < 2) {
      setNameError("Tên phải có ít nhất 2 ký tự")
      return false
    }
    
    setNameError("")
    return true
  }

  // Validate phone number (Vietnamese format)
  const validatePhone = (phone: string) => {
    if (!phone) {
      setPhoneError("")
      return true // Optional field
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    const isValid = phoneRegex.test(phone.replace(/\s/g, ''))
    
    if (!isValid) {
      setPhoneError("Số điện thoại không hợp lệ")
      return false
    }
    
    setPhoneError("")
    return true
  }

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phone = value.replace(/\D/g, '')
    
    // Format as: 0912 345 678
    if (phone.length <= 4) {
      return phone
    } else if (phone.length <= 7) {
      return `${phone.slice(0, 4)} ${phone.slice(4)}`
    } else {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 10)}`
    }
  }

  // Check if email already exists (debounced)
  const checkEmailExists = async (email: string) => {
    if (!email || !validateEmail(email)) return
    
    setCheckingEmail(true)
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.exists) {
        setEmailError("Email đã được sử dụng")
      }
    } catch (error) {
      console.error("Error checking email:", error)
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate name
    if (!validateName(formData.name)) {
      toast.error(nameError || "Tên không hợp lệ")
      return
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      toast.error("Email không hợp lệ")
      return
    }

    // Check if email error exists (like already used)
    if (emailError) {
      toast.error(emailError)
      return
    }

    // Validate phone
    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error(phoneError || "Số điện thoại không hợp lệ")
      return
    }

    // Validate password
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    // Validate address (now required)
    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Đăng ký thất bại")
      }

      // DON'T save user to localStorage yet - wait for verification
      // localStorage.setItem("user", JSON.stringify(data))
      // setUser(data)
      
      // Show success message with email verification notice
      toast.success(data.message || "Đăng ký thành công!")
      
      // Show additional notification about email verification
      setTimeout(() => {
        toast.success("📧 Vui lòng kiểm tra email để xác thực tài khoản!", {
          duration: 6000,
        })
      }, 1500)
      
      // Redirect to verification pending page
      router.push("/account/verify-pending")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Handle phone number formatting
    if (name === "phone") {
      const formatted = formatPhoneNumber(value)
      setFormData(prev => ({
        ...prev,
        phone: formatted
      }))
      validatePhone(formatted)
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Real-time validation
    if (name === "name") {
      validateName(value)
    }
    
    if (name === "email") {
      validateEmail(value)
    }
    
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="bg-linear-to-br from-orange-600 to-orange-500 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl sm:text-3xl">P</span>
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Tạo tài khoản mới
        </h2>
        <p className="text-center text-sm text-gray-600 px-4">
          Hoặc{" "}
          <Link
            href="/account/login"
            className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
          >
            đăng nhập nếu đã có tài khoản
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all ${
                    nameError ? "border-red-500 animate-shake" : "border-gray-300"
                  }`}
                  placeholder="Nhập họ và tên"
                />
              </div>
              {nameError && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{nameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all ${
                    emailError ? "border-red-500 animate-shake" : "border-gray-300"
                  }`}
                  placeholder="Nhập email của bạn"
                />
                {checkingEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={12}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all ${
                    phoneError ? "border-red-500 animate-shake" : "border-gray-300"
                  }`}
                  placeholder="0912 345 678"
                />
              </div>
              {phoneError ? (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{phoneError}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Tùy chọn - Để liên hệ khi có vấn đề với đơn hàng</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Địa chỉ giao hàng mặc định</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    {passwordStrength <= 2 && "Mật khẩu yếu"}
                    {passwordStrength === 3 && "Mật khẩu trung bình"}
                    {passwordStrength >= 4 && "Mật khẩu mạnh"}
                  </p>
                </div>
              )}
              
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-1">
                  <span className={formData.password.length >= 6 ? "text-green-600" : "text-gray-400"}>
                    {formData.password.length >= 6 ? "✓" : "○"}
                  </span>
                  Ít nhất 6 ký tự
                </li>
                <li className="flex items-center gap-1">
                  <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                    {/[A-Z]/.test(formData.password) ? "✓" : "○"}
                  </span>
                  Ít nhất 1 chữ hoa
                </li>
                <li className="flex items-center gap-1">
                  <span className={/\d/.test(formData.password) ? "text-green-600" : "text-gray-400"}>
                    {/\d/.test(formData.password) ? "✓" : "○"}
                  </span>
                  Ít nhất 1 chữ số
                </li>
              </ul>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                Tôi đồng ý với{" "}
                <a href="#" className="text-orange-600 hover:text-orange-500">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-orange-600 hover:text-orange-500">
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || checkingEmail}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  "Tạo tài khoản"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link
                href="/"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
