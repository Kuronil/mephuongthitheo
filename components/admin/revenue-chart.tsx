"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TrendingUp, DollarSign } from "lucide-react"

interface ChartData {
  date: string
  revenue: number
  orders: number
}

interface RevenueChartProps {
  className?: string
}

export default function RevenueChart({ className = "" }: RevenueChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("7d")
  const [groupBy, setGroupBy] = useState("day")
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0
  })

  useEffect(() => {
    fetchRevenueData()
  }, [period, groupBy])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/revenue?period=${period}&groupBy=${groupBy}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data.chartData)
        setSummary(result.data.summary)
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <LoadingSpinner text="Đang tải dữ liệu..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Báo cáo doanh thu
            </CardTitle>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ngày</SelectItem>
                  <SelectItem value="30d">30 ngày</SelectItem>
                  <SelectItem value="90d">90 ngày</SelectItem>
                  <SelectItem value="1y">1 năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.totalOrders}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Giá trị trung bình</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.avgOrderValue)}
              </p>
            </div>
          </div>

          {/* Revenue Line Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Doanh thu theo thời gian</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Số lượng đơn hàng</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => `${value} đơn`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <Legend />
                <Bar 
                  dataKey="orders" 
                  fill="#10b981" 
                  name="Số đơn hàng"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

