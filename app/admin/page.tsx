"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  ChefHat,
  MapPin,
  Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import StoreLocationCard from "@/components/store-location-card"
import RevenueChart from "@/components/admin/revenue-chart"
import { useAdminAuth } from "@/hooks/useAdminAuth"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  lowStockProducts: number
}

interface RecentOrder {
  id: number
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface LowStockProduct {
  id: number
  name: string
  stock: number
  minStock: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { isAdmin, isLoading: authLoading, user: adminUser } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchDashboardData()
    }
  }, [authLoading, isAdmin])

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API
      const [ordersResponse, productsResponse] = await Promise.all([
        fetch('/api/admin/orders?limit=10'),
        fetch('/api/products')
      ])

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders')
      }

      const ordersData = await ordersResponse.json()
      const productsData = await productsResponse.json()

      // Process orders data
      const orders = ordersData.data?.orders || []
      const orderStats = ordersData.data?.stats || {}

      // Calculate dashboard stats
      const dashboardStats: DashboardStats = {
        totalOrders: orderStats.totalOrders || 0,
        totalRevenue: orderStats.totalRevenue || 0,
        totalCustomers: await getTotalCustomers(),
        totalProducts: productsData.data?.products?.length || 0,
        pendingOrders: orderStats.statusBreakdown?.PENDING || 0,
        lowStockProducts: await getLowStockProducts()
      }

      // Process recent orders
      const recentOrdersData: RecentOrder[] = orders.slice(0, 5).map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || `MP${order.id}`,
        customerName: order.name || order.user?.name || 'Khách hàng',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }))

      // Get low stock products
      const lowStockProductsData = await getLowStockProductsData()

      setStats(dashboardStats)
      setRecentOrders(recentOrdersData)
      setLowStockProducts(lowStockProductsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Fallback to mock data if API fails
      const mockStats: DashboardStats = {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0
      }
      setStats(mockStats)
      setRecentOrders([])
      setLowStockProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getTotalCustomers = async () => {
    try {
      const response = await fetch('/api/users/count')
      if (response.ok) {
        const data = await response.json()
        return data.count || 0
      }
    } catch (error) {
      console.error('Error fetching customer count:', error)
    }
    return 0
  }

  const getLowStockProducts = async () => {
    try {
      const response = await fetch('/api/products?lowStock=true')
      if (response.ok) {
        const data = await response.json()
        return data.data?.products?.length || 0
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    }
    return 0
  }

  const getLowStockProductsData = async (): Promise<LowStockProduct[]> => {
    try {
      const response = await fetch('/api/products?lowStock=true&limit=5')
      if (response.ok) {
        const data = await response.json()
        return data.data?.products?.map((product: any) => ({
          id: product.id,
          name: product.name,
          stock: product.stock,
          minStock: product.minStock || 10
        })) || []
      }
    } catch (error) {
      console.error('Error fetching low stock products data:', error)
    }
    return []
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>
      case 'AWAITING_PAYMENT':
        return <Badge className="bg-blue-100 text-blue-800">Chờ thanh toán</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>{authLoading ? 'Đang xác thực admin...' : 'Đang tải dashboard...'}</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect automatically
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Quản lý cửa hàng thịt heo Mẹ Phương</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/')}>
                Về trang chủ
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/store-location')}>
                <MapPin className="w-4 h-4 mr-2" />
                Quản lý cửa hàng
              </Button>
              <Button onClick={() => router.push('/admin/products')}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm tươi
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders}</p>
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
                    {stats?.totalRevenue.toLocaleString()}₫
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Đơn hàng gần đây
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">#{order.orderNumber}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.total.toLocaleString()}₫</p>
                      <Button size="sm" variant="outline" className="mt-1">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Sản phẩm sắp hết hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600">
                        Còn {product.stock} / Tối thiểu {product.minStock}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Cập nhật
                    </Button>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Tất cả sản phẩm đều đủ hàng</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Store Location Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Thông tin cửa hàng
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/admin/store-location')}>
                  <Edit className="w-3 h-3 mr-1" />
                  Chỉnh sửa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StoreLocationCard 
                showMap={false}
                className="h-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="mt-8">
          <RevenueChart />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => router.push('/admin/products')}
                >
                  <Package className="w-6 h-6 text-blue-600" />
                  <span>Quản lý sản phẩm tươi</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
                  onClick={() => router.push('/admin/processed-products')}
                >
                  <ChefHat className="w-6 h-6 text-orange-600" />
                  <span>Quản lý sản phẩm chế biến</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 border-green-300 hover:border-green-500 hover:bg-green-50"
                  onClick={() => router.push('/admin/store-location')}
                >
                  <MapPin className="w-6 h-6 text-green-600" />
                  <span>Quản lý cửa hàng</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push('/admin/orders')}
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Đơn hàng</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push('/admin/inventory')}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span>Kiểm kê kho</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="w-6 h-6" />
                  <span>Người dùng</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
