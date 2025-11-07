"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User as UserIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/AdminLayout"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { getStoredUser } from "@/lib/auth"

interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  createdAt: string
  loyaltyPoints: number
  loyaltyTier: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  status: 'active' | 'inactive'
  isAdmin?: boolean
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers?: number
  newUsersThisMonth: number
  topTierUsers: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

function AdminUsersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterTier, setFilterTier] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [userToDisable, setUserToDisable] = useState<User | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 1 })
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    loyaltyTier: 'BRONZE',
    loyaltyPoints: 0,
    status: 'active' as 'active' | 'inactive'
  })
  const [saving, setSaving] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch users when filters or pagination change
  useEffect(() => {
    fetchUsers()
  }, [debouncedSearch, filterTier, pagination.page, pagination.limit])

  // Reset to page 1 when search or filter changes (but not on initial load)
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [debouncedSearch, filterTier])

  const getUserId = () => {
    const user = getStoredUser()
    return user?.id?.toString() || ''
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterTier !== 'all' && { tier: filterTier })
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'x-user-id': userId
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data?.users || [])
        setStats(data.data?.stats || null)
        if (data.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            ...data.data.pagination
          }))
        }
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách người dùng",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải danh sách người dùng",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return <Badge className="bg-purple-100 text-purple-800">Platinum</Badge>
      case 'GOLD':
        return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
      case 'SILVER':
        return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>
      case 'BRONZE':
        return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{tier}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      loyaltyTier: user.loyaltyTier,
      loyaltyPoints: user.loyaltyPoints,
      status: user.status
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      setSaving(true)
      const userId = getUserId()
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(editFormData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin người dùng thành công",
        })
        setShowEditModal(false)
        fetchUsers()
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Không thể cập nhật thông tin người dùng",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật thông tin người dùng",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDisableUserClick = (user: User) => {
    setUserToDisable(user)
    setShowDisableDialog(true)
  }

  const handleDisableUser = async () => {
    if (!userToDisable) return

    try {
      const userId = getUserId()
      const response = await fetch(`/api/admin/users/${userToDisable.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ status: 'inactive' })
      })
      
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Đã vô hiệu hóa tài khoản của ${userToDisable.name}`,
        })
        setShowDisableDialog(false)
        setUserToDisable(null)
        fetchUsers()
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Không thể vô hiệu hóa tài khoản",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error disabling user:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi vô hiệu hóa tài khoản",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const userId = getUserId()
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userId
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Thành công",
          description: `Đã xóa ${userToDelete.name} thành công`,
        })
        setShowDeleteDialog(false)
        setUserToDelete(null)
        fetchUsers()
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Không thể xóa người dùng",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa người dùng",
        variant: "destructive"
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải danh sách người dùng...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
              <p className="text-gray-600">Quản lý thông tin khách hàng và chương trình thành viên</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Về Dashboard
              </Button>
              <Button onClick={() => router.push('/admin/users/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm người dùng
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
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
                    <p className="text-sm font-medium text-gray-600">Người dùng hoạt động</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Người dùng mới tháng này</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Thành viên VIP</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.topTierUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterTier} onValueChange={(value) => {
                  setFilterTier(value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc theo cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cấp độ</SelectItem>
                    <SelectItem value="PLATINUM">Platinum</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Danh sách người dùng ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Cấp độ thành viên</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-gray-300 border-b-transparent rounded-full animate-spin mr-2"></div>
                          Đang tải...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getTierBadge(user.loyaltyTier)}
                            <p className="text-sm text-gray-600">
                              {user.loyaltyPoints.toLocaleString()} điểm
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.totalOrders}</p>
                            {user.lastOrderDate && (
                              <p className="text-sm text-gray-500">
                                Lần cuối: {new Date(user.lastOrderDate).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{user.totalSpent.toLocaleString()}₫</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.isAdmin ? (
                              <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                Người dùng
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(user.status)}
                            <span className="text-sm capitalize">{user.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewUser(user)}
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisableUserClick(user)}
                              className="text-orange-600 hover:text-orange-700"
                              title="Vô hiệu hóa tài khoản"
                              disabled={user.status === 'inactive'}
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUserClick(user)}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        disabled={pagination.page === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Trước</span>
                      </Button>
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum: number
                      if (pagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={pageNum === pagination.page ? "outline" : "ghost"}
                            size="icon"
                            onClick={() => handlePageChange(pageNum)}
                            className={pageNum === pagination.page ? "font-semibold" : ""}
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                        disabled={pagination.page === pagination.pages}
                        className="gap-1"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                
                <div className="mt-2 text-center text-sm text-gray-500">
                  Trang {pagination.page} / {pagination.pages} - Tổng {pagination.total} người dùng
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tên</label>
                  <p className="text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <p className="text-lg">{selectedUser.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cấp độ thành viên</label>
                  <div className="mt-1">
                    {getTierBadge(selectedUser.loyaltyTier)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vai trò</label>
                  <div className="mt-1">
                    {selectedUser.isAdmin ? (
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        Người dùng
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedUser.address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-lg">{selectedUser.address}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedUser.loyaltyPoints.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Điểm tích lũy</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedUser.totalOrders}</p>
                  <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedUser.totalSpent.toLocaleString()}₫</p>
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUserDetail(false)}>
                  Đóng
                </Button>
                <Button onClick={() => {
                  setShowUserDetail(false)
                  handleEditUser(selectedUser)
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tier">Cấp độ thành viên</Label>
                <Select
                  value={editFormData.loyaltyTier}
                  onValueChange={(value) => setEditFormData({ ...editFormData, loyaltyTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="PLATINUM">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Địa chỉ</Label>
              <Textarea
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-points">Điểm tích lũy</Label>
                <Input
                  id="edit-points"
                  type="number"
                  min="0"
                  value={editFormData.loyaltyPoints}
                  onChange={(e) => setEditFormData({ ...editFormData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: 'active' | 'inactive') => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <>
                  Bạn có chắc chắn muốn xóa <strong>{userToDelete.name}</strong>?
                  <br /><br />
                  ⚠️ Lưu ý: Người dùng có đơn hàng hoặc dữ liệu liên quan sẽ không thể xóa được.
                  Hãy vô hiệu hóa tài khoản thay vì xóa nếu người dùng có lịch sử giao dịch.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận vô hiệu hóa</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDisable && (
                <>
                  Bạn có chắc chắn muốn vô hiệu hóa tài khoản của <strong>{userToDisable.name}</strong>?
                  <br /><br />
                  Tài khoản sẽ không thể đăng nhập nhưng dữ liệu lịch sử sẽ được giữ lại.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDisable(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableUser}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Vô hiệu hóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <AdminUsersContent />
    </AdminLayout>
  )
}
