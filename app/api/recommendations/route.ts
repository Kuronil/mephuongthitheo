import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/recommendations - Lấy gợi ý sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '8')
    const type = searchParams.get('type') || 'mixed' // 'mixed', 'similar', 'trending', 'personalized'

    let recommendations: any[] = []

    if (type === 'similar' && productId) {
      // Gợi ý sản phẩm tương tự
      recommendations = await getSimilarProducts(parseInt(productId), limit)
    } else if (type === 'trending') {
      // Sản phẩm trending
      recommendations = await getTrendingProducts(limit)
    } else if (type === 'personalized' && userId) {
      // Gợi ý cá nhân hóa
      recommendations = await getPersonalizedRecommendations(parseInt(userId), limit)
    } else {
      // Gợi ý hỗn hợp
      recommendations = await getMixedRecommendations(limit)
    }

    return NextResponse.json({
      success: true,
      data: recommendations
    })

  } catch (error) {
    console.error("Get recommendations error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Gợi ý sản phẩm tương tự
async function getSimilarProducts(productId: number, limit: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      category: true,
      subcategory: true,
      price: true,
      tags: true
    }
  })

  if (!product) return []

  const where: any = {
    id: { not: productId },
    isActive: true,
    stock: { gt: 0 }
  }

  // Tìm sản phẩm cùng danh mục
  if (product.category) {
    where.category = product.category
  }

  const similarProducts = await prisma.product.findMany({
    where,
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      category: true,
      rating: true,
      reviewCount: true,
      isFeatured: true,
      isFlashSale: true,
      stock: true
    }
  })

  return similarProducts
}

// Sản phẩm trending
async function getTrendingProducts(limit: number) {
  // Sản phẩm có nhiều đánh giá và rating cao trong 30 ngày qua
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const trendingProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      createdAt: { gte: thirtyDaysAgo }
    },
    orderBy: [
      { reviewCount: 'desc' },
      { rating: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      category: true,
      rating: true,
      reviewCount: true,
      isFeatured: true,
      isFlashSale: true,
      stock: true
    }
  })

  return trendingProducts
}

// Gợi ý cá nhân hóa
async function getPersonalizedRecommendations(userId: number, limit: number) {
  // Lấy lịch sử mua hàng của user
  const userOrders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ['COMPLETED', 'DELIVERED'] }
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              category: true,
              subcategory: true,
              tags: true
            }
          }
        }
      }
    }
  })

  // Lấy các danh mục và tags đã mua
  const purchasedCategories = new Set<string>()
  const purchasedTags = new Set<string>()

  userOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.product.category) {
        purchasedCategories.add(item.product.category)
      }
      if (item.product.tags) {
        const tags = JSON.parse(item.product.tags)
        tags.forEach((tag: string) => purchasedTags.add(tag))
      }
    })
  })

  // Tìm sản phẩm trong các danh mục đã mua nhưng chưa mua sản phẩm cụ thể
  const purchasedProductIds = new Set<number>()
  userOrders.forEach(order => {
    order.items.forEach(item => {
      purchasedProductIds.add(item.productId)
    })
  })

  const personalizedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      id: { notIn: Array.from(purchasedProductIds) },
      OR: [
        { category: { in: Array.from(purchasedCategories) } },
        { tags: { contains: Array.from(purchasedTags).join(',') } }
      ]
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      category: true,
      rating: true,
      reviewCount: true,
      isFeatured: true,
      isFlashSale: true,
      stock: true
    }
  })

  return personalizedProducts
}

// Gợi ý hỗn hợp
async function getMixedRecommendations(limit: number) {
  const [featuredProducts, flashSaleProducts, topRatedProducts] = await Promise.all([
    // Sản phẩm nổi bật
    prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        stock: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        discount: true,
        image: true,
        category: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        isFlashSale: true,
        stock: true
      }
    }),
    // Flash sale
    prisma.product.findMany({
      where: {
        isActive: true,
        isFlashSale: true,
        stock: { gt: 0 }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        discount: true,
        image: true,
        category: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        isFlashSale: true,
        stock: true
      }
    }),
    // Top rated
    prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        rating: { gte: 4.0 }
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      take: Math.ceil(limit / 3),
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        discount: true,
        image: true,
        category: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        isFlashSale: true,
        stock: true
      }
    })
  ])

  // Trộn các loại sản phẩm
  const mixedProducts = []
  const maxLength = Math.max(featuredProducts.length, flashSaleProducts.length, topRatedProducts.length)

  for (let i = 0; i < maxLength && mixedProducts.length < limit; i++) {
    if (featuredProducts[i]) mixedProducts.push(featuredProducts[i])
    if (flashSaleProducts[i] && mixedProducts.length < limit) mixedProducts.push(flashSaleProducts[i])
    if (topRatedProducts[i] && mixedProducts.length < limit) mixedProducts.push(topRatedProducts[i])
  }

  return mixedProducts
}

// POST /api/recommendations/track - Theo dõi hành vi người dùng
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, action, metadata } = body // action: 'view', 'add_to_cart', 'purchase'

    if (!userId || !productId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Log user behavior (you might want to create a UserBehavior model)
    console.log(`User ${userId} ${action} product ${productId}`, metadata)

    // Update product view count or other metrics
    if (action === 'view') {
      // You could increment a view count field if you add it to the Product model
      console.log(`Product ${productId} viewed by user ${userId}`)
    }

    return NextResponse.json({
      success: true,
      message: "Behavior tracked successfully"
    })

  } catch (error) {
    console.error("Track behavior error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
