"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, MapPin, Phone, Edit, Save, X, ArrowLeft, Award, ShoppingBag, Heart, Lock, Eye, EyeOff, Shield } from "lucide-react"

interface UserProfile {
  id: number
  name: string
  email: string
  address: string
  phone?: string
}

interface UserStats {
  createdAt: string
  totalOrders: number
  totalSpent: number
  wishlistCount: number
  cartCount: number
  reviewCount: number
  loyaltyPoints: number
  loyaltyTier: string
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth(true, '/account/login')
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile>({
    id: 0,
    name: "",
    email: "",
    address: "",
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({})
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address || "",
        phone: user.phone || ""
      })
      
      // Load stats
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      
      if (!user?.id) {
        return
      }

      const response = await fetch('/api/user/stats', {
        headers: {
          'x-user-id': user.id.toString()
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Tên không được để trống"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự"
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    // Validate phone if provided
    if (formData.phone && formData.phone.trim().length > 0) {
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
        newErrors.phone = "Số điện thoại phải có 10-11 chữ số"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    // Validate form first
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    setLoading(true)
    try {
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập lại")
        router.push('/account/login')
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Update localStorage with new user data
        const updatedUser = { ...user, ...data.user }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        
        toast.success("Cập nhật thông tin thành công!")
        setIsEditing(false)
        
        // Reload to update context
        window.location.reload()
      } else {
        toast.error(data.error || "Cập nhật thất bại")
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("Có lỗi xảy ra khi cập nhật")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      id: user?.id || 0,
      name: user?.name || "",
      email: user?.email || "",
      address: user?.address || "",
      phone: user?.phone || ""
    })
    setErrors({})
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Password change handlers
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validatePasswordForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới"
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"
    } else if (!/[A-Z]/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ hoa"
    } else if (!/[0-9]/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ số"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu hiện tại"
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthInfo = (strength: number) => {
    if (strength <= 1) return { label: 'Yếu', color: 'bg-red-500', textColor: 'text-red-600' }
    if (strength === 2) return { label: 'Trung bình', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    if (strength === 3) return { label: 'Khá', color: 'bg-blue-500', textColor: 'text-blue-600' }
    if (strength === 4) return { label: 'Mạnh', color: 'bg-green-500', textColor: 'text-green-600' }
    return { label: 'Rất mạnh', color: 'bg-green-600', textColor: 'text-green-700' }
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    setChangingPassword(true)
    try {
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập lại")
        router.push('/account/login')
        return
      }

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify(passwordData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Đổi mật khẩu thành công!")
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        setPasswordErrors({})
      } else {
        toast.error(data.error || "Đổi mật khẩu thất bại")
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error("Có lỗi xảy ra khi đổi mật khẩu")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setPasswordErrors({})
    setIsChangingPassword(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="mt-2 text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{user.phone || "Chưa cập nhật"}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Nhập địa chỉ của bạn"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address || "Chưa cập nhật"}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white shadow rounded-lg mt-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-medium text-gray-900">Bảo mật</h2>
                  </div>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Lock className="w-4 h-4" />
                      Đổi mật khẩu
                    </button>
                  )}
                </div>
              </div>

              {isChangingPassword ? (
                <div className="px-6 py-4 space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPasswordStrengthInfo(calculatePasswordStrength(passwordData.newPassword)).color} transition-all`}
                              style={{ width: `${(calculatePasswordStrength(passwordData.newPassword) / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${getPasswordStrengthInfo(calculatePasswordStrength(passwordData.newPassword)).textColor}`}>
                            {getPasswordStrengthInfo(calculatePasswordStrength(passwordData.newPassword)).label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Mật khẩu mạnh nên có: chữ hoa, chữ thường, số và ký tự đặc biệt
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {changingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
                    </button>
                    <button
                      onClick={handleCancelPasswordChange}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Lock className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Mật khẩu</p>
                      <p className="text-sm text-gray-500">••••••••</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Truy cập nhanh</h3>
              <div className="space-y-3">
                <Link
                  href="/account/orders"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  📦 Lịch sử đơn hàng
                </Link>
                <Link
                  href="/account/wishlist"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  ❤️ Danh sách yêu thích
                </Link>
                <Link
                  href="/cart"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  🛒 Giỏ hàng
                </Link>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê tài khoản</h3>
              {loadingStats ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-4 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thành viên từ:</span>
                    <span className="font-medium text-sm">
                      {formatDate(stats.createdAt)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        Tổng đơn hàng:
                      </span>
                      <span className="font-bold text-orange-600">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Đã tiêu:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(stats.totalSpent)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        Yêu thích:
                      </span>
                      <span className="font-medium">{stats.wishlistCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Điểm tích lũy:
                      </span>
                      <span className="font-bold text-purple-600">{stats.loyaltyPoints}</span>
                    </div>
                  </div>
                  {stats.loyaltyTier && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hạng thành viên:</span>
                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                          stats.loyaltyTier === 'PLATINUM' ? 'bg-gray-200 text-gray-800' :
                          stats.loyaltyTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                          stats.loyaltyTier === 'SILVER' ? 'bg-gray-100 text-gray-600' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {stats.loyaltyTier}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
