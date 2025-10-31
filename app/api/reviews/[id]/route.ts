import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// PUT /api/reviews/[id] - Cập nhật đánh giá
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewId = parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "ID đánh giá không hợp lệ" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { rating, title, comment, images } = body

    // Check if review exists and belongs to user
    const existingReview = await prisma.productReview.findFirst({
      where: {
        id: reviewId,
        userId: user.id
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: "Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa" },
        { status: 404 }
      )
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Đánh giá phải từ 1 đến 5 sao" },
        { status: 400 }
      )
    }

    // Update review
    const updatedReview = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
        ...(images !== undefined && { images: images ? JSON.stringify(images) : null })
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

    // Update product rating if rating changed
    if (rating !== undefined && rating !== existingReview.rating) {
      const allReviews = await prisma.productReview.findMany({
        where: { productId: existingReview.productId },
        select: { rating: true }
      })

      const newAverageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await prisma.product.update({
        where: { id: existingReview.productId },
        data: {
          rating: Math.round(newAverageRating * 10) / 10
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedReview,
        images: updatedReview.images ? JSON.parse(updatedReview.images) : []
      },
      message: "Đánh giá đã được cập nhật thành công"
    })

  } catch (error) {
    console.error("Update review error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Xóa đánh giá
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewId = parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "ID đánh giá không hợp lệ" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if review exists and belongs to user
    const existingReview = await prisma.productReview.findFirst({
      where: {
        id: reviewId,
        userId: user.id
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: "Không tìm thấy đánh giá hoặc bạn không có quyền xóa" },
        { status: 404 }
      )
    }

    // Delete review
    await prisma.productReview.delete({
      where: { id: reviewId }
    })

    // Update product rating
    const remainingReviews = await prisma.productReview.findMany({
      where: { productId: existingReview.productId },
      select: { rating: true }
    })

    const newAverageRating = remainingReviews.length > 0 
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0

    await prisma.product.update({
      where: { id: existingReview.productId },
      data: {
        rating: Math.round(newAverageRating * 10) / 10,
        reviewCount: remainingReviews.length
      }
    })

    return NextResponse.json({
      success: true,
      message: "Đánh giá đã được xóa thành công"
    })

  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/reviews/[id]/helpful - Đánh dấu đánh giá hữu ích
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviewId = parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "ID đánh giá không hợp lệ" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if review exists
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json(
        { error: "Không tìm thấy đánh giá" },
        { status: 404 }
      )
    }

    // Check if user is not the review author
    if (review.userId === user.id) {
      return NextResponse.json(
        { error: "Bạn không thể đánh dấu đánh giá của chính mình" },
        { status: 400 }
      )
    }

    // Increment helpful count
    const updatedReview = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        helpful: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: { helpful: updatedReview.helpful },
      message: "Cảm ơn bạn đã đánh giá hữu ích!"
    })

  } catch (error) {
    console.error("Mark helpful error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
