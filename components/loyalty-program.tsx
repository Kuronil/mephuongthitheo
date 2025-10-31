"use client"

import { useState, useEffect } from "react"
import { Star, Gift, Crown, Award, TrendingUp, Clock, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

interface LoyaltyInfo {
  points: number
  tier: string
  tierBenefits: {
    name: string
    discount: number
    freeShipping: boolean
    prioritySupport: boolean
    birthdayBonus: number
  }
  nextTier?: {
    tier: string
    minPoints: number
  }
  pointsToNextTier: number
  recentTransactions: Array<{
    id: number
    type: string
    points: number
    description: string
    createdAt: string
  }>
}

export default function LoyaltyProgram() {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeemPoints, setRedeemPoints] = useState(0)
  const [redeemDescription, setRedeemDescription] = useState("")

  // Fetch loyalty info
  const fetchLoyaltyInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/loyalty')
      const data = await response.json()

      if (data.success) {
        setLoyaltyInfo(data.data)
      } else {
        toast.error("Lỗi khi tải thông tin loyalty")
      }
    } catch (error) {
      console.error("Fetch loyalty info error:", error)
      toast.error("Lỗi khi tải thông tin loyalty")
    } finally {
      setLoading(false)
    }
  }

  // Redeem points
  const handleRedeemPoints = async () => {
    if (!redeemPoints || redeemPoints <= 0) {
      toast.error("Vui lòng nhập số điểm hợp lệ")
      return
    }

    if (!loyaltyInfo || loyaltyInfo.points < redeemPoints) {
      toast.error("Không đủ điểm để đổi")
      return
    }

    try {
      const response = await fetch('/api/loyalty', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points: redeemPoints,
          description: redeemDescription || `Đổi ${redeemPoints} điểm`
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Đổi điểm thành công!")
        setRedeemPoints(0)
        setRedeemDescription("")
        fetchLoyaltyInfo()
      } else {
        toast.error(data.error || "Lỗi khi đổi điểm")
      }
    } catch (error) {
      console.error("Redeem points error:", error)
      toast.error("Lỗi khi đổi điểm")
    }
  }

  // Get tier icon
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return <Award className="w-6 h-6 text-orange-600" />
      case 'SILVER':
        return <Star className="w-6 h-6 text-gray-400" />
      case 'GOLD':
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 'PLATINUM':
        return <Crown className="w-6 h-6 text-purple-600" />
      default:
        return <Award className="w-6 h-6 text-orange-600" />
    }
  }

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-orange-100 text-orange-800'
      case 'SILVER':
        return 'bg-gray-100 text-gray-800'
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Initial load
  useEffect(() => {
    fetchLoyaltyInfo()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!loyaltyInfo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Không thể tải thông tin loyalty</h2>
          <p className="text-gray-500">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chương trình khách hàng thân thiết</h1>
        <p className="text-gray-600">Tích điểm và tận hưởng nhiều ưu đãi đặc biệt</p>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTierIcon(loyaltyInfo.tier)}
            <div>
              <h2 className="text-xl font-semibold">Hạng {loyaltyInfo.tierBenefits.name}</h2>
              <p className="text-orange-100">Thành viên thân thiết</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{loyaltyInfo.points.toLocaleString()}</div>
            <div className="text-orange-100">điểm tích lũy</div>
          </div>
        </div>

        {/* Progress to next tier */}
        {loyaltyInfo.nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Tiến tới hạng {loyaltyInfo.nextTier.tier}</span>
              <span>{loyaltyInfo.pointsToNextTier} điểm nữa</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (loyaltyInfo.points / loyaltyInfo.nextTier.minPoints) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tier Benefits */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quyền lợi hạng {loyaltyInfo.tierBenefits.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Giảm giá {loyaltyInfo.tierBenefits.discount}%</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className={`w-5 h-5 ${loyaltyInfo.tierBenefits.freeShipping ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={loyaltyInfo.tierBenefits.freeShipping ? '' : 'text-gray-500'}>
              Miễn phí vận chuyển
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className={`w-5 h-5 ${loyaltyInfo.tierBenefits.prioritySupport ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={loyaltyInfo.tierBenefits.prioritySupport ? '' : 'text-gray-500'}>
              Hỗ trợ ưu tiên
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-purple-600" />
            <span>Quà sinh nhật {loyaltyInfo.tierBenefits.birthdayBonus} điểm</span>
          </div>
        </div>
      </div>

      {/* Redeem Points */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Đổi điểm</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điểm muốn đổi
            </label>
            <input
              type="number"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nhập số điểm"
              min="1"
              max={loyaltyInfo.points}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <input
              type="text"
              value={redeemDescription}
              onChange={(e) => setRedeemDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ví dụ: Đổi voucher giảm giá"
            />
          </div>
          <button
            onClick={handleRedeemPoints}
            disabled={redeemPoints <= 0 || redeemPoints > loyaltyInfo.points}
            className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đổi điểm
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h3>
        {loyaltyInfo.recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loyaltyInfo.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'EARN' ? 'bg-green-100' : 
                    transaction.type === 'REDEEM' ? 'bg-red-100' : 
                    'bg-blue-100'
                  }`}>
                    {transaction.type === 'EARN' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : transaction.type === 'REDEEM' ? (
                      <Gift className="w-4 h-4 text-red-600" />
                    ) : (
                      <Star className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to Earn Points */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Cách tích điểm</h3>
        <div className="space-y-3 text-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span>Mua hàng: 1% giá trị đơn hàng</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span>Đánh giá sản phẩm: 10 điểm/đánh giá</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span>Thăng hạng: Bonus điểm đặc biệt</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <span>Sinh nhật: Quà tặng điểm</span>
          </div>
        </div>
      </div>
    </div>
  )
}
