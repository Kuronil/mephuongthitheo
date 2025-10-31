// lib/loyalty-system.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cấu hình cấp độ thành viên
export const LOYALTY_TIERS = {
  BRONZE: {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: 'orange',
    benefits: ['Tích điểm cơ bản', 'Thông báo khuyến mãi']
  },
  SILVER: {
    name: 'Silver', 
    minPoints: 500,
    maxPoints: 1499,
    color: 'gray',
    benefits: ['Tích điểm nhanh hơn', 'Ưu đãi đặc biệt', 'Hỗ trợ ưu tiên']
  },
  GOLD: {
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 2999,
    color: 'yellow',
    benefits: ['Tích điểm cao', 'Miễn phí giao hàng', 'Quà tặng sinh nhật']
  },
  PLATINUM: {
    name: 'Platinum',
    minPoints: 3000,
    maxPoints: Infinity,
    color: 'purple',
    benefits: ['Tích điểm tối đa', 'Ưu đãi VIP', 'Tư vấn cá nhân', 'Sản phẩm độc quyền']
  }
} as const

// Tỷ lệ tích điểm theo cấp độ
export const POINTS_RATE = {
  BRONZE: 0.01,    // 1% giá trị đơn hàng
  SILVER: 0.015,   // 1.5% giá trị đơn hàng  
  GOLD: 0.02,      // 2% giá trị đơn hàng
  PLATINUM: 0.025  // 2.5% giá trị đơn hàng
} as const

// Tính điểm tích lũy từ đơn hàng
export function calculateLoyaltyPoints(orderTotal: number, currentTier: string): number {
  const rate = POINTS_RATE[currentTier as keyof typeof POINTS_RATE] || POINTS_RATE.BRONZE
  return Math.floor(orderTotal * rate)
}

// Xác định cấp độ thành viên dựa trên điểm tích lũy
export function determineLoyaltyTier(totalPoints: number): string {
  if (totalPoints >= LOYALTY_TIERS.PLATINUM.minPoints) return 'PLATINUM'
  if (totalPoints >= LOYALTY_TIERS.GOLD.minPoints) return 'GOLD'
  if (totalPoints >= LOYALTY_TIERS.SILVER.minPoints) return 'SILVER'
  return 'BRONZE'
}

// Kiểm tra và cập nhật cấp độ thành viên
export async function updateUserLoyaltyTier(userId: number): Promise<{
  oldTier: string
  newTier: string
  pointsEarned: number
  tierUpgraded: boolean
}> {
  // Lấy thông tin user hiện tại
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      loyaltyTransactions: {
        where: {
          type: 'EARN',
          expiresAt: {
            gte: new Date() // Chỉ tính điểm chưa hết hạn
          }
        }
      }
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Tính tổng điểm tích lũy hiện tại
  const totalPoints = user.loyaltyTransactions.reduce((sum, transaction) => sum + transaction.points, 0)
  
  // Xác định cấp độ mới
  const newTier = determineLoyaltyTier(totalPoints)
  const oldTier = user.loyaltyTier
  const tierUpgraded = newTier !== oldTier

  // Cập nhật cấp độ thành viên nếu có thay đổi
  if (tierUpgraded) {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        loyaltyTier: newTier,
        loyaltyPoints: totalPoints
      }
    })

    // Tạo thông báo nâng cấp
    await prisma.notification.create({
      data: {
        userId: userId,
        title: `Chúc mừng! Bạn đã được nâng cấp lên ${LOYALTY_TIERS[newTier as keyof typeof LOYALTY_TIERS].name}`,
        message: `Bạn hiện có ${totalPoints} điểm tích lũy và được hưởng các ưu đãi đặc biệt của cấp độ ${LOYALTY_TIERS[newTier as keyof typeof LOYALTY_TIERS].name}`,
        type: 'LOYALTY'
      }
    })
  } else {
    // Cập nhật điểm tích lũy ngay cả khi không nâng cấp
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: totalPoints }
    })
  }

  return {
    oldTier,
    newTier,
    pointsEarned: totalPoints,
    tierUpgraded
  }
}

// Tích điểm từ đơn hàng
export async function earnLoyaltyPoints(userId: number, orderId: number, orderTotal: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Tính điểm tích lũy
  const pointsEarned = calculateLoyaltyPoints(orderTotal, user.loyaltyTier)
  
  if (pointsEarned > 0) {
    // Tạo giao dịch tích điểm
    await prisma.loyaltyTransaction.create({
      data: {
        userId: userId,
        orderId: orderId,
        type: 'EARN',
        points: pointsEarned,
        description: `Tích điểm từ đơn hàng #${orderId}`,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Hết hạn sau 1 năm
      }
    })

    // Cập nhật cấp độ thành viên
    await updateUserLoyaltyTier(userId)
  }
}

// Đổi điểm lấy ưu đãi
export async function redeemLoyaltyPoints(userId: number, pointsToRedeem: number, description: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.loyaltyPoints < pointsToRedeem) {
    return false // Không đủ điểm
  }

  // Tạo giao dịch đổi điểm
  await prisma.loyaltyTransaction.create({
    data: {
      userId: userId,
      type: 'REDEEM',
      points: -pointsToRedeem, // Số âm vì là đổi điểm
      description: description
    }
  })

  // Cập nhật lại cấp độ thành viên
  await updateUserLoyaltyTier(userId)

  return true
}

// Lấy thông tin cấp độ thành viên
export function getLoyaltyTierInfo(tier: string) {
  return LOYALTY_TIERS[tier as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.BRONZE
}

// Tính điểm cần thiết để nâng cấp
export function getPointsToNextTier(currentTier: string, currentPoints: number): number {
  const tierInfo = LOYALTY_TIERS[currentTier as keyof typeof LOYALTY_TIERS]
  if (!tierInfo) return 0

  const nextTier = Object.values(LOYALTY_TIERS).find(tier => tier.minPoints > currentPoints)
  if (!nextTier) return 0 // Đã ở cấp cao nhất

  return nextTier.minPoints - currentPoints
}
