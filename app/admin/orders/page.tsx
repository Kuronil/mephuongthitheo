"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/AdminLayout"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  Edit,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { LoadingSpinner, LoadingButton } from "@/components/ui/loading-spinner"

interface Order {
  id: number
  orderNumber: string
  total: number
  status: string
  paymentMethod: string
  name: string
  phone: string
  address: string
  createdAt: string
  items: any[]
}

interface OrderStats {
  total: number
  pending: number
  shipping: number
  completed: number
  cancelled: number
  revenue: number
}

function AdminOrdersContent() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Get user from localStorage for API call
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Fetch real data from API
      const response = await fetch('/api/admin/orders?limit=100', {
        headers: {
          'x-user-id': user?.id?.toString() || '1'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      const orders = data.data?.orders || []
      const stats = data.data?.stats || {}

      // Process orders data
      const processedOrders: Order[] = orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || `MP${order.id}`,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        name: order.name || order.user?.name || 'Khách hàng',
        phone: order.phone || order.user?.phone || '',
        address: order.address || '',
        createdAt: order.createdAt,
        items: order.items || []
      }))

      // Process stats
      const orderStats: OrderStats = {
        total: stats.totalOrders || 0,
        pending: stats.statusBreakdown?.PENDING || 0,
        shipping: stats.statusBreakdown?.SHIPPING || 0,
        completed: stats.statusBreakdown?.COMPLETED || 0,
        cancelled: stats.statusBreakdown?.CANCELLED || 0,
        revenue: stats.totalRevenue || 0
      }

      setOrders(processedOrders)
      setStats(orderStats)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Không thể tải danh sách đơn hàng")
      
      // Fallback to empty data
      setOrders([])
      setStats({
        total: 0,
        pending: 0,
        shipping: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId)
      
      // Get user from localStorage for API call
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      console.log('Updating order:', { orderId, newStatus, userId: user?.id })
      
      // Call real API to update order status
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || '1'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Update failed:', errorData)
        throw new Error(errorData.error || 'Failed to update order status')
      }

      const data = await response.json()
      console.log('Update successful:', data)
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))
      
      // Update stats
      setStats(prev => {
        if (!prev) return prev
        
        const oldStatus = orders.find(o => o.id === orderId)?.status
        const newStats = { ...prev }
        
        // Decrease old status count
        if (oldStatus && newStats[oldStatus.toLowerCase() as keyof OrderStats] !== undefined) {
          (newStats as any)[oldStatus.toLowerCase()] = Math.max(0, (newStats as any)[oldStatus.toLowerCase()] - 1)
        }
        
        // Increase new status count
        if (newStats[newStatus.toLowerCase() as keyof OrderStats] !== undefined) {
          (newStats as any)[newStatus.toLowerCase()] = ((newStats as any)[newStatus.toLowerCase()] || 0) + 1
        }
        
        return newStats
      })
      
      toast.success(`Đã cập nhật trạng thái đơn hàng #${orderId} thành ${getStatusText(newStatus)}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Không thể cập nhật trạng thái đơn hàng")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>
      case 'AWAITING_PAYMENT':
        return <Badge className="bg-blue-100 text-blue-800">Chờ thanh toán</Badge>
      case 'SHIPPING':
        return <Badge className="bg-purple-100 text-purple-800">Đang giao hàng</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800">Đã giao hàng</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Đang xử lý'
      case 'AWAITING_PAYMENT': return 'Chờ thanh toán'
      case 'SHIPPING': return 'Đang giao hàng'
      case 'DELIVERED': return 'Đã giao hàng'
      case 'COMPLETED': return 'Hoàn thành'
      case 'CANCELLED': return 'Đã hủy'
      default: return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'COD': return 'COD'
      case 'BANKING': return 'Chuyển khoản'
      case 'MOMO': return 'MoMo'
      case 'ZALOPAY': return 'ZaloPay'
      default: return method
    }
  }

  const handleExportOrders = async () => {
    try {
      setExporting(true)
      
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      params.append('format', 'csv')
      
      const response = await fetch(`/api/admin/orders/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to export orders')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Đã xuất đơn hàng thành công')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Không thể xuất đơn hàng')
    } finally {
      setExporting(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
              <p className="text-gray-600">Theo dõi và xử lý đơn hàng của khách hàng</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchOrders}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Làm mới
              </Button>
              <Button 
                variant="outline"
                onClick={handleExportOrders}
                disabled={exporting || loading}
              >
                {exporting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {exporting ? 'Đang xuất...' : 'Xuất CSV'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đang giao</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.shipping}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.revenue.toLocaleString()}₫
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Đang xử lý</SelectItem>
                    <SelectItem value="AWAITING_PAYMENT">Chờ thanh toán</SelectItem>
                    <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                    <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đặt</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.name}</p>
                          <p className="text-sm text-gray-600">{order.address}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell className="font-semibold">
                        {order.total.toLocaleString()}₫
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentMethodText(order.paymentMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/order-tracking?orderId=${order.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </Link>
                          
                          <Select
                            value={order.status}
                            onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                            disabled={updatingOrderId === order.id || loading}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Đang xử lý</SelectItem>
                              <SelectItem value="AWAITING_PAYMENT">Chờ thanh toán</SelectItem>
                              <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                              <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <AdminOrdersContent />
    </AdminLayout>
  )
}
