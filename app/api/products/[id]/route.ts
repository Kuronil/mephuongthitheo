import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidateProductsCache, invalidateCategoriesCache } from "@/lib/cache"

// GET /api/products/[id] - Lấy chi tiết sản phẩm (có thể dùng ID hoặc slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Safely await params
    let identifier: string
    try {
      const resolvedParams = await params
      identifier = resolvedParams.id
    } catch (paramError: any) {
      console.error("Error resolving params:", paramError)
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid request parameters",
          details: process.env.NODE_ENV === 'development' ? paramError?.message : undefined
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (!identifier || identifier.trim() === '') {
      return NextResponse.json(
        { 
          success: false,
          error: "Product identifier is required"
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const isNumeric = !isNaN(parseInt(identifier))

    // Fetch product with error handling
    let product
    try {
      product = await prisma.product.findUnique({
        where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
    } catch (dbError: any) {
      console.error("Database error fetching product:", dbError)
      return NextResponse.json(
        { 
          success: false,
          error: "Database error",
          details: process.env.NODE_ENV === 'development' ? dbError?.message : undefined
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (!product) {
      return NextResponse.json(
        { 
          success: false,
          error: "Không tìm thấy sản phẩm"
        },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Calculate average rating safely
    let avgRating = 0
    try {
      if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
        const sum = product.reviews.reduce((sum: number, review: typeof product.reviews[number]) => {
          const rating = typeof review.rating === 'number' ? review.rating : 0
          return sum + rating
        }, 0)
        avgRating = sum / product.reviews.length
      }
    } catch (ratingError: any) {
      console.error("Error calculating rating:", ratingError)
      avgRating = 0 // Default to 0 if calculation fails
    }

    // Parse JSON fields safely
    const parseJsonSafely = (jsonString: string | null, defaultValue: any = null) => {
      if (!jsonString) return defaultValue
      try {
        return JSON.parse(jsonString)
      } catch (error) {
        console.error("Failed to parse JSON:", error, jsonString)
        return defaultValue
      }
    }

    // Safely prepare product data for serialization
    try {
      // Manually construct product object to avoid any circular references
      const productWithParsedData: any = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        weight: product.weight,
        unit: product.unit,
        stock: product.stock,
        minStock: product.minStock,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isFlashSale: product.isFlashSale,
        storage: product.storage,
        expiry: product.expiry,
        rating: avgRating,
        reviewCount: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.length : 0,
        images: parseJsonSafely(product.images, []),
        tags: parseJsonSafely(product.tags, []),
        nutrition: parseJsonSafely(product.nutrition, null),
        createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
        updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
        reviews: (product.reviews && Array.isArray(product.reviews)) 
          ? product.reviews.map((review: any) => ({
              id: review.id,
              productId: review.productId,
              userId: review.userId,
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              isVerified: review.isVerified,
              helpful: review.helpful,
              images: parseJsonSafely(review.images, []),
              createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
              updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt,
              // Only include safe user data (no circular references)
              user: review.user ? {
                name: review.user.name || null,
                email: review.user.email || null
              } : null
            }))
          : []
      }

      return NextResponse.json(
        {
          success: true,
          data: productWithParsedData
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (serializeError: any) {
      console.error("Error serializing product data:", serializeError)
      return NextResponse.json(
        { 
          success: false,
          error: "Error serializing product data",
          details: process.env.NODE_ENV === 'development' ? serializeError?.message : undefined
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

  } catch (error: any) {
    console.error("Get product error:", error)
    // Đảm bảo luôn trả về JSON, không bao giờ trả về HTML
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// PUT /api/products/[id] - Cập nhật sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      discount,
      image,
      images,
      category,
      subcategory,
      brand,
      weight,
      unit,
      stock,
      minStock,
      isActive,
      isFeatured,
      isFlashSale,
      tags,
      nutrition,
      storage,
      expiry
    } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Check slug uniqueness if slug is being updated
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "Slug sản phẩm đã tồn tại" },
          { status: 400 }
        )
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(originalPrice !== undefined && { originalPrice }),
        ...(discount !== undefined && { discount }),
        ...(image !== undefined && { image }),
        ...(images !== undefined && { images: images ? JSON.stringify(images) : null }),
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(brand !== undefined && { brand }),
        ...(weight !== undefined && { weight }),
        ...(unit !== undefined && { unit }),
        ...(stock !== undefined && { stock }),
        ...(minStock !== undefined && { minStock }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isFlashSale !== undefined && { isFlashSale }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(nutrition !== undefined && { nutrition: nutrition ? JSON.stringify(nutrition) : null }),
        ...(storage !== undefined && { storage }),
        ...(expiry !== undefined && { expiry })
      }
    })

    // Invalidate cache after update
    invalidateProductsCache()
    invalidateCategoriesCache()

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Sản phẩm đã được cập nhật thành công"
    })

  } catch (error: any) {
    console.error("Update product error:", error)
    // Đảm bảo luôn trả về JSON, không bao giờ trả về HTML
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Check if product has orders
    const orderItems = await prisma.orderItem.findMany({
      where: { productId }
    })

    if (orderItems.length > 0) {
      // Soft delete - just mark as inactive
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false }
      })

      // Invalidate cache after soft delete
      invalidateProductsCache()
      invalidateCategoriesCache()

      return NextResponse.json({
        success: true,
        message: "Sản phẩm đã được vô hiệu hóa (có đơn hàng liên quan)"
      })
    }

    // Hard delete if no orders
    await prisma.product.delete({
      where: { id: productId }
    })

    // Invalidate cache after hard delete
    invalidateProductsCache()
    invalidateCategoriesCache()

    return NextResponse.json({
      success: true,
      message: "Sản phẩm đã được xóa thành công"
    })

  } catch (error: any) {
    console.error("Delete product error:", error)
    // Đảm bảo luôn trả về JSON, không bao giờ trả về HTML
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
