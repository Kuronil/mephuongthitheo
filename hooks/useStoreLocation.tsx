"use client"

import React, { useEffect, useState, createContext, useContext, ReactNode } from "react"

interface StoreLocation {
  id: number
  name: string
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  workingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  services: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Custom hook để quản lý thông tin cửa hàng
export function useStoreLocation() {
  const [storeLocation, setStoreLocation] = useState<StoreLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStoreLocation = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/store-location')
      const result = await response.json()
      
      if (result.success) {
        setStoreLocation(result.data)
      } else {
        setError(result.error || 'Failed to fetch store location')
        // Fallback to default data
        setStoreLocation({
          id: 1,
          name: "Thịt Heo Mẹ Phương",
          address: "211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM",
          phone: "0902 759 466",
          email: "support@mephuong.com",
          coordinates: { lat: 10.7769, lng: 106.6309 },
          workingHours: {
            monday: "8:00 - 18:00",
            tuesday: "8:00 - 18:00",
            wednesday: "8:00 - 18:00",
            thursday: "8:00 - 18:00",
            friday: "8:00 - 18:00",
            saturday: "8:00 - 12:00",
            sunday: "Nghỉ"
          },
          services: [
            "Giao hàng tận nơi",
            "Thịt tươi ngon",
            "Đóng gói cẩn thận",
            "Hỗ trợ 24/7"
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    } catch (err) {
      console.error('Error fetching store location:', err)
      setError('Network error')
      // Fallback to default data
      setStoreLocation({
        id: 1,
        name: "Thịt Heo Mẹ Phương",
        address: "211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM",
        phone: "0902 759 466",
        email: "support@mephuong.com",
        coordinates: { lat: 10.7769, lng: 106.6309 },
        workingHours: {
          monday: "8:00 - 18:00",
          tuesday: "8:00 - 18:00",
          wednesday: "8:00 - 18:00",
          thursday: "8:00 - 18:00",
          friday: "8:00 - 18:00",
          saturday: "8:00 - 12:00",
          sunday: "Nghỉ"
        },
        services: [
          "Giao hàng tận nơi",
          "Thịt tươi ngon",
          "Đóng gói cẩn thận",
          "Hỗ trợ 24/7"
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStoreLocation()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStoreLocation()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  return {
    storeLocation,
    loading,
    error,
    refetch: fetchStoreLocation
  }
}

// Context để chia sẻ thông tin cửa hàng

interface StoreLocationContextType {
  storeLocation: StoreLocation | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const StoreLocationContext = createContext<StoreLocationContextType | undefined>(undefined)

export function StoreLocationProvider({ children }: { children: ReactNode }) {
  const storeLocationData = useStoreLocation()

  return (
    <StoreLocationContext.Provider value={storeLocationData}>
      {children}
    </StoreLocationContext.Provider>
  )
}

export function useStoreLocationContext() {
  const context = useContext(StoreLocationContext)
  if (context === undefined) {
    throw new Error('useStoreLocationContext must be used within a StoreLocationProvider')
  }
  return context
}