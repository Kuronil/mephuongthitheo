"use client"

import { useAdminAuth } from "@/hooks/useAdminAuth"

interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * Giao diện xác thực admin
 * Tự động chuyển hướng người dùng không phải admin về trang chủ
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-orange-200 border-b-orange-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang xác thực admin...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect automatically
  }

  return <>{children}</>
}



