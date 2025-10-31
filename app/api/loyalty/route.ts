import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/loyalty - Lấy thông tin loyalty của user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user loyalty info
    const userLoyalty = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        loyaltyPoints: true,
        loyaltyTier: true,
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!userLoyalty) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate tier benefits
    const tierBenefits = getTierBenefits(userLoyalty.loyaltyTier)
    const nextTier = getNextTier(userLoyalty.loyaltyTier)
    const pointsToNextTier = nextTier ? nextTier.minPoints - userLoyalty.loyaltyPoints : 0

    return NextResponse.json({
      success: true,
      data: {
        points: userLoyalty.loyaltyPoints,
        tier: userLoyalty.loyaltyTier,
        tierBenefits,
        nextTier,
        pointsToNextTier,
        recentTransactions: userLoyalty.loyaltyTransactions
      }
    })

  } catch (error) {
    console.error("Get loyalty info error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/loyalty/earn - Tích điểm từ đơn hàng
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, orderId, points, description, type = 'EARN' } = body

    if (!userId || !points || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Add loyalty transaction
    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        userId,
        orderId,
        type,
        points,
        description,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    })

    // Update user points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: points
        }
      }
    })

    // Check and update tier
    const newTier = calculateTier(updatedUser.loyaltyPoints)
    if (newTier !== updatedUser.loyaltyTier) {
      await prisma.user.update({
        where: { id: userId },
        data: { loyaltyTier: newTier }
      })

      // Add tier upgrade bonus
      if (newTier !== 'BRONZE') {
        await prisma.loyaltyTransaction.create({
          data: {
            userId,
            type: 'BONUS',
            points: getTierUpgradeBonus(newTier),
            description: `Thăng hạng lên ${newTier} - Bonus điểm`
          }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: {
              increment: getTierUpgradeBonus(newTier)
            }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Điểm đã được tích thành công"
    })

  } catch (error) {
    console.error("Earn loyalty points error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/loyalty/redeem - Đổi điểm
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { points, description } = body

    if (!points || points <= 0) {
      return NextResponse.json(
        { error: "Số điểm không hợp lệ" },
        { status: 400 }
      )
    }

    // Get user loyalty points
    const userLoyalty = await prisma.user.findUnique({
      where: { id: user.id },
      select: { loyaltyPoints: true }
    })
    
    if (!userLoyalty || userLoyalty.loyaltyPoints < points) {
      return NextResponse.json(
        { error: "Không đủ điểm để đổi" },
        { status: 400 }
      )
    }

    // Create redemption transaction
    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        userId: user.id,
        type: 'REDEEM',
        points: -points,
        description: description || `Đổi ${points} điểm`
      }
    })

    // Update user points
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loyaltyPoints: {
          decrement: points
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Đổi điểm thành công"
    })

  } catch (error) {
    console.error("Redeem loyalty points error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateTier(points: number): string {
  if (points >= 10000) return 'PLATINUM'
  if (points >= 5000) return 'GOLD'
  if (points >= 1000) return 'SILVER'
  return 'BRONZE'
}

function getTierBenefits(tier: string) {
  const benefits = {
    BRONZE: {
      name: 'Đồng',
      discount: 0,
      freeShipping: false,
      prioritySupport: false,
      birthdayBonus: 0
    },
    SILVER: {
      name: 'Bạc',
      discount: 5,
      freeShipping: true,
      prioritySupport: false,
      birthdayBonus: 100
    },
    GOLD: {
      name: 'Vàng',
      discount: 10,
      freeShipping: true,
      prioritySupport: true,
      birthdayBonus: 200
    },
    PLATINUM: {
      name: 'Bạch Kim',
      discount: 15,
      freeShipping: true,
      prioritySupport: true,
      birthdayBonus: 500
    }
  }
  return benefits[tier as keyof typeof benefits] || benefits.BRONZE
}

function getNextTier(currentTier: string) {
  const tiers = [
    { tier: 'BRONZE', minPoints: 0 },
    { tier: 'SILVER', minPoints: 1000 },
    { tier: 'GOLD', minPoints: 5000 },
    { tier: 'PLATINUM', minPoints: 10000 }
  ]
  
  const currentIndex = tiers.findIndex(t => t.tier === currentTier)
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
}

function getTierUpgradeBonus(tier: string): number {
  const bonuses = {
    SILVER: 50,
    GOLD: 100,
    PLATINUM: 200
  }
  return bonuses[tier as keyof typeof bonuses] || 0
}
