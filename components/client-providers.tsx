"use client"

import { Toaster } from 'react-hot-toast'
import { UserProvider } from '@/contexts/UserContext'
import AnalyticsComponent from '@/components/analytics'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AnalyticsComponent />
    </UserProvider>
  )
}

