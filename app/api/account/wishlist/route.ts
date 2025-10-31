import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/account/wishlist - Get user wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: user.id
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // Get wishlist items with pagination
    const [items, total] = await Promise.all([
      prisma.wishlistItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.wishlistItem.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/account/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, name, price, image, originalPrice, discount, rating, reviews } = body

    // Validate required fields
    if (!productId || !name || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 400 }
      )
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
        name,
        price,
        image: image || null,
        originalPrice: originalPrice || null,
        discount: discount || null,
        rating: rating || null,
        reviews: reviews || null
      }
    })

    return NextResponse.json({
      success: true,
      item: wishlistItem,
      message: "Item added to wishlist"
    })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/account/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Remove item from wishlist
    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: parseInt(productId)
      }
    })

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist"
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
