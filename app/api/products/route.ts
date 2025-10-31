import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Vietnamese utils inline to avoid import issues
const vietnameseUtils = {
  accentMap: {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
  },
  removeAccents: (text: string): string => {
    if (!text) return ''
    return text.split('').map(char => (vietnameseUtils.accentMap as any)[char] || char).join('')
  },
  createSearchTerms: (text: string): string[] => {
    if (!text) return []
    const terms = text.trim().split(/\s+/).filter(term => term.length > 0)
    const searchTerms = new Set<string>()
    terms.forEach(term => {
      searchTerms.add(term.toLowerCase())
      searchTerms.add(vietnameseUtils.removeAccents(term).toLowerCase())
    })
    return Array.from(searchTerms)
  }
}

// GET /api/products - Lấy danh sách sản phẩm với filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const excludeCategory = searchParams.get('excludeCategory') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const maxRating = parseFloat(searchParams.get('maxRating') || '5')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const isActive = searchParams.get('isActive') !== 'false'
    const isFeatured = searchParams.get('isFeatured')
    const isFlashSale = searchParams.get('isFlashSale')
    const inStock = searchParams.get('inStock') === 'true'
    const lowStock = searchParams.get('lowStock') === 'true'

    // Build where clause
    const where: any = {
      isActive: isActive,
    }

    if (search) {
      // Enhanced search with Vietnamese accent support
      const searchTerms = vietnameseUtils.createSearchTerms(search)
      
      // Create OR conditions for all search terms using LIKE for case-insensitive search
      // Only add OR if we have search terms
      if (searchTerms.length > 0) {
        where.OR = [
          ...searchTerms.flatMap(term => [
            { name: { contains: term } },
            { description: { contains: term } },
            { tags: { contains: term } },
            { category: { contains: term } },
            { subcategory: { contains: term } },
            { brand: { contains: term } }
          ])
        ]
      }
    }

    if (category) {
      where.category = category
    } else if (excludeCategory) {
      where.category = {
        not: excludeCategory
      }
    }

    if (minPrice > 0 || maxPrice < 999999999) {
      where.price = {
        gte: minPrice,
        lte: maxPrice
      }
    }

    if (minRating > 0 || maxRating < 5) {
      where.rating = {
        gte: minRating,
        lte: maxRating
      }
    }

    if (isFeatured === 'true') {
      where.isFeatured = true
    } else if (isFeatured === 'false') {
      where.isFeatured = false
    }

    if (isFlashSale === 'true') {
      where.isFlashSale = true
    } else if (isFlashSale === 'false') {
      where.isFlashSale = false
    }

    if (inStock) {
      where.stock = {
        gt: 0
      }
    }

    if (lowStock) {
      where.stock = {
        lte: 10 // Products with stock <= 10
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate average ratings
    const productsWithRatings = products.map((product: any) => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        rating: avgRating,
        reviewCount: product.reviews.length,
        reviews: undefined // Remove reviews from response
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithRatings,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error: any) {
    console.error("Get products error:", error)
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

// POST /api/products - Tạo sản phẩm mới
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: "Tên và giá sản phẩm là bắt buộc" },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productSlug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Slug sản phẩm đã tồn tại" },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug: productSlug,
        description,
        price,
        originalPrice,
        discount,
        image,
        images: images ? JSON.stringify(images) : null,
        category,
        subcategory,
        brand,
        weight,
        unit,
        stock: stock || 0,
        minStock: minStock || 5,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        isFlashSale: isFlashSale || false,
        tags: tags ? JSON.stringify(tags) : null,
        nutrition: nutrition ? JSON.stringify(nutrition) : null,
        storage,
        expiry
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: "Sản phẩm đã được tạo thành công"
    })

  } catch (error: any) {
    console.error("Create product error:", error)
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
