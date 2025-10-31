"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StoreLocationRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new store location management page
    router.replace('/admin/store-location/overview')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}