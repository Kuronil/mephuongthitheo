import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/revenue
 * Get revenue statistics for charts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        },
        status: {
          notIn: ['CANCELLED']
        }
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true,
        paymentMethod: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group data
    const grouped: Record<string, { revenue: number, count: number }> = {}
 type RevenueOrder = {
   id: number
   total: number
   createdAt: Date
   status: string
   paymentMethod: string | null
 }
    orders.forEach((order: RevenueOrder) => {
      let key: string

      if (groupBy === 'day') {
        key = new Date(order.createdAt).toLocaleDateString('vi-VN')
      } else if (groupBy === 'week') {
        const date = new Date(order.createdAt)
        const week = getWeekNumber(date)
        key = `Tuần ${week}, ${date.getFullYear()}`
      } else if (groupBy === 'month') {
        const date = new Date(order.createdAt)
        key = `${date.getMonth() + 1}/${date.getFullYear()}`
      } else {
        key = new Date(order.createdAt).toLocaleDateString('vi-VN')
      }

      if (!grouped[key]) {
        grouped[key] = { revenue: 0, count: 0 }
      }

      grouped[key].revenue += order.total
      grouped[key].count += 1
    })

    // Convert to array format for charts
    const chartData = Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate totals and averages
    const totalRevenue = chartData.reduce((sum: number, item: any) => sum + item.revenue, 0)
    const totalOrders = chartData.reduce((sum: number, item: any) => sum + item.orders, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          period,
          groupBy
        }
      }
    })

  } catch (error) {
    console.error("Get revenue stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

