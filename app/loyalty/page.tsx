"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Award, 
  Star, 
  Gift, 
  Truck, 
  Crown,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Users,
  Calendar,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LOYALTY_TIERS, getLoyaltyTierInfo, getPointsToNextTier } from "@/lib/loyalty-system"

interface UserLoyaltyInfo {
  currentTier: string
  currentPoints: number
  totalOrders: number
  totalSpent: number
  joinDate: string
  nextTierPoints: number
  progressPercentage: number
}

export default function LoyaltyProgramPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserLoyaltyInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserLoyaltyInfo()
  }, [])

  const fetchUserLoyaltyInfo = async () => {
    try {
      // Mock data for demonstration
      const mockUserInfo: UserLoyaltyInfo = {
        currentTier: 'SILVER',
        currentPoints: 750,
        totalOrders: 12,
        totalSpent: 2500000,
        joinDate: '2024-01-15',
        nextTierPoints: 750, // Points needed to reach GOLD (1500 - 750)
        progressPercentage: 50 // 750/1500 * 100
      }
      
      setUserInfo(mockUserInfo)
    } catch (error) {
      console.error("Error fetching user loyalty info:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return <Crown className="w-6 h-6 text-purple-600" />
      case 'GOLD':
        return <Star className="w-6 h-6 text-yellow-600" />
      case 'SILVER':
        return <Award className="w-6 h-6 text-gray-600" />
      case 'BRONZE':
        return <Gift className="w-6 h-6 text-orange-600" />
      default:
        return <Award className="w-6 h-6 text-gray-600" />
    }
  }

  const getTierBadge = (tier: string) => {
    const tierInfo = getLoyaltyTierInfo(tier)
    return (
      <Badge className={`bg-${tierInfo.color}-100 text-${tierInfo.color}-800`}>
        {tierInfo.name}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 border-4 border-gray-300 border-b-transparent rounded-full animate-spin"></div>
          <p>Đang tải thông tin chương trình thành viên...</p>
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không thể tải thông tin chương trình thành viên</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Về trang chủ
          </Button>
        </div>
      </div>
    )
  }

  const currentTierInfo = getLoyaltyTierInfo(userInfo.currentTier)
  const nextTier = Object.values(LOYALTY_TIERS).find(tier => tier.minPoints > userInfo.currentPoints)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chương trình thành viên</h1>
              <p className="text-gray-600">Tích điểm và hưởng ưu đãi đặc biệt</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/')}>
                Về trang chủ
              </Button>
              <Button onClick={() => router.push('/products')}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mua sắm ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Tier Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTierIcon(userInfo.currentTier)}
                Cấp độ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{currentTierInfo.name}</h3>
                    <p className="text-gray-600">Thành viên {currentTierInfo.name}</p>
                  </div>
                  {getTierBadge(userInfo.currentTier)}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Điểm tích lũy</span>
                    <span className="text-lg font-bold">{userInfo.currentPoints.toLocaleString()} điểm</span>
                  </div>

                  {nextTier && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Tiến độ đến {nextTier.name}</span>
                          <span className="text-sm text-gray-600">
                            {userInfo.nextTierPoints.toLocaleString()} điểm nữa
                          </span>
                        </div>
                        <Progress value={userInfo.progressPercentage} className="h-2" />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{userInfo.totalOrders}</p>
                    <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {userInfo.totalSpent.toLocaleString()}₫
                    </p>
                    <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Ưu đãi hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentTierInfo.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Tiers Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tất cả cấp độ thành viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(LOYALTY_TIERS).map(([key, tier]) => (
                <div
                  key={key}
                  className={`p-6 rounded-lg border-2 ${
                    userInfo.currentTier === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {getTierIcon(key)}
                    <div>
                      <h3 className="font-bold">{tier.name}</h3>
                      <p className="text-sm text-gray-600">
                        {tier.minPoints === 0 ? 'Từ 0 điểm' : `Từ ${tier.minPoints.toLocaleString()} điểm`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />
                        <span className="text-xs">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {userInfo.currentTier === key && (
                    <div className="mt-4 p-2 bg-blue-100 rounded text-center">
                      <span className="text-sm font-medium text-blue-800">Cấp độ hiện tại</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Cách tích điểm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <ShoppingBag className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Mua sắm</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tích điểm từ mỗi đơn hàng thành công
                </p>
                <div className="text-lg font-bold text-green-600">
                  {currentTierInfo.name === 'Bronze' ? '1%' : 
                   currentTierInfo.name === 'Silver' ? '1.5%' :
                   currentTierInfo.name === 'Gold' ? '2%' : '2.5%'} giá trị đơn hàng
                </div>
              </div>

              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Giới thiệu bạn bè</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nhận điểm thưởng khi bạn bè đăng ký và mua hàng
                </p>
                <div className="text-lg font-bold text-blue-600">
                  +100 điểm
                </div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Hoạt động đặc biệt</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tham gia các sự kiện và chương trình khuyến mãi
                </p>
                <div className="text-lg font-bold text-purple-600">
                  Điểm thưởng đặc biệt
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}