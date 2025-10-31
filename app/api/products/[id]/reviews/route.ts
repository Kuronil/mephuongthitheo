import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"
import { sanitizeReview, sanitizeText } from "@/lib/sanitize"

// GET /api/products/[id]/reviews - Lấy danh sách đánh giá sản phẩm (có thể dùng ID hoặc slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const identifier = id
    const isNumeric = !isNaN(parseInt(identifier))
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const rating = searchParams.get('rating') // Filter by rating

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Build where clause
    const where: any = {
      productId: product.id
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder
    } else if (sortBy === 'helpful') {
      orderBy.helpful = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.productReview.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.productReview.count({ where })
    ])

    // Parse JSON fields
    const reviewsWithParsedData = reviews.map((review: typeof reviews[0]) => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : []
    }))

    const totalPages = Math.ceil(totalCount / limit)

    // Get rating statistics
    const ratingStats = await prisma.productReview.groupBy({
      by: ['rating'],
      where: { productId: product.id },
      _count: {
        rating: true
      }
    })

    const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
      const stat = ratingStats.find(s => s.rating === i + 1)
      return {
        rating: i + 1,
        count: stat?._count.rating || 0
      }
    })

    const averageRating = reviewsWithParsedData.length > 0 
      ? reviewsWithParsedData.reduce((sum, review) => sum + review.rating, 0) / reviewsWithParsedData.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviewsWithParsedData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: totalCount,
          ratingDistribution
        }
      }
    })

  } catch (error) {
    console.error("Get reviews error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/reviews - Tạo đánh giá mới (có thể dùng ID hoặc slug)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const identifier = id
    const isNumeric = !isNaN(parseInt(identifier))

    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    let { rating, title, comment, images } = body

    // Sanitize user inputs
    title = title ? sanitizeText(title) : null
    comment = comment ? sanitizeReview(comment) : null

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Đánh giá phải từ 1 đến 5 sao" },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId: product.id,
        userId: user.id
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "Bạn đã đánh giá sản phẩm này rồi" },
        { status: 400 }
      )
    }

    // Check if user has purchased this product (optional verification)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: user.id,
          status: {
            in: ['COMPLETED', 'DELIVERED']
          }
        }
      }
    })

    // Create review
    const review = await prisma.productReview.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating,
        title,
        comment,
        images: images ? JSON.stringify(images) : null,
        isVerified: !!hasPurchased
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update product rating
    const allReviews = await prisma.productReview.findMany({
      where: { productId: product.id },
      select: { rating: true }
    })

    const newAverageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: Math.round(newAverageRating * 10) / 10,
        reviewCount: allReviews.length
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...review,
        images: review.images ? JSON.parse(review.images) : []
      },
      message: "Đánh giá đã được thêm thành công"
    })

  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
