import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = true, redirectTo = '/') {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, requireAuth, redirectTo, router])

  return { user, isLoading }
}



