"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Package, TrendingDown } from "lucide-react"

interface StockAlertProps {
  productId: number
  className?: string
}

interface StockInfo {
  stock: number
  minStock: number
  stockStatus: 'good' | 'low' | 'out'
  alertMessage: string
}

export default function StockAlert({ productId, className = "" }: StockAlertProps) {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStockInfo = async () => {
      try {
        const response = await fetch(`/api/inventory/${productId}`)
        const data = await response.json()

        if (data.success) {
          setStockInfo({
            stock: data.data.stock,
            minStock: data.data.minStock,
            stockStatus: data.data.stockStatus,
            alertMessage: data.data.alertMessage
          })
        }
      } catch (error) {
        console.error("Error fetching stock info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStockInfo()
  }, [productId])

  if (loading || !stockInfo) {
    return null
  }

  const getAlertConfig = () => {
    switch (stockInfo.stockStatus) {
      case 'out':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          message: 'Hết hàng'
        }
      case 'low':
        return {
          icon: TrendingDown,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200',
          message: `Sắp hết hàng (${stockInfo.stock}/${stockInfo.minStock})`
        }
      case 'good':
        return {
          icon: Package,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          message: `Còn hàng (${stockInfo.stock})`
        }
      default:
        return null
    }
  }

  const alertConfig = getAlertConfig()

  if (!alertConfig || stockInfo.stockStatus === 'good') {
    return null
  }

  const Icon = alertConfig.icon

  return (
    <div className={`${alertConfig.bgColor} ${alertConfig.borderColor} border rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${alertConfig.textColor}`} />
        <span className={`text-sm font-medium ${alertConfig.textColor}`}>
          {alertConfig.message}
        </span>
      </div>
      {stockInfo.stockStatus === 'low' && (
        <p className={`text-xs ${alertConfig.textColor} mt-1`}>
          Vui lòng đặt hàng sớm để đảm bảo có sản phẩm
        </p>
      )}
      {stockInfo.stockStatus === 'out' && (
        <p className={`text-xs ${alertConfig.textColor} mt-1`}>
          Sản phẩm tạm thời hết hàng. Vui lòng liên hệ để được thông báo khi có hàng
        </p>
      )}
    </div>
  )
}
