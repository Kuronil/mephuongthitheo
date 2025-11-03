"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoredUser, isUserAdmin } from "@/lib/auth"

interface AdminAuthState {
  isAdmin: boolean
  isLoading: boolean
  user: {
    id: number
    name: string
    email: string
    isAdmin: boolean
  } | null
}

/**
 * Hook kiểm tra xác thực admin
 * Tự động chuyển hướng về trang chủ nếu không phải admin
 */
export function useAdminAuth(redirectIfNotAdmin = true) {
  const router = useRouter()
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    user: null
  })

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Kiểm tra localStorage trước
        const storedUser = getStoredUser()
        
        if (!storedUser) {
          console.log("No user in localStorage")
          if (redirectIfNotAdmin) {
            router.push('/account/login?redirect=/admin')
          }
          setState({ isAdmin: false, isLoading: false, user: null })
          return
        }

        // Kiểm tra nhanh từ localStorage
        if (!storedUser.isAdmin) {
          console.log("User is not admin (from localStorage)")
          if (redirectIfNotAdmin) {
            router.push('/')
          }
          setState({ isAdmin: false, isLoading: false, user: null })
          return
        }

        // Xác minh với máy chủ
        const response = await fetch('/api/auth/verify-admin', {
          headers: {
            'x-user-id': storedUser.id.toString()
          }
        })

        const data = await response.json()

        if (data.success && data.isAdmin) {
          console.log("Admin verified:", data.user.email)
          setState({
            isAdmin: true,
            isLoading: false,
            user: data.user
          })
        } else {
          console.log("Admin verification failed")
          if (redirectIfNotAdmin) {
            router.push('/')
          }
          setState({ isAdmin: false, isLoading: false, user: null })
        }
      } catch (error) {
        console.error("Admin verification error:", error)
        if (redirectIfNotAdmin) {
          router.push('/')
        }
        setState({ isAdmin: false, isLoading: false, user: null })
      }
    }

    verifyAdmin()
  }, [router, redirectIfNotAdmin])

  return state
}

/**
 * Hook đơn giản để kiểm tra user có phải admin hay không (không xác minh)
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(isUserAdmin())
  }, [])

  return isAdmin
}



