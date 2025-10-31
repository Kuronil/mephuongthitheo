import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Vietnamese utils inline
const vietnameseUtils: { accentMap: Record<string, string>, removeAccents: (text: string) => string, createSearchTerms: (text: string) => string[] } = {
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
    return text.split('').map(char => vietnameseUtils.accentMap[char] || char).join('')
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

// GET /api/search/suggestions - Lấy gợi ý tìm kiếm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          categories: [],
          products: []
        }
      })
    }

    // Search products with Vietnamese accent support
    const searchTerms = vietnameseUtils.createSearchTerms(query)
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          // Search in each field with all search terms
          ...searchTerms.flatMap(term => [
            { name: { contains: term } },
            { description: { contains: term } },
            { tags: { contains: term } },
            { category: { contains: term } },
            { subcategory: { contains: term } },
            { brand: { contains: term } }
          ])
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        category: true,
        subcategory: true,
        brand: true,
        rating: true,
        reviewCount: true,
        isFeatured: true
      },
      take: limit,
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ]
    })
    
    // Get unique categories from search results
    const categories = Array.from(new Set(
      products
        .map((p: any) => p.category)
        .filter(Boolean)
        .concat(
          products
            .map((p: any) => p.subcategory)
            .filter(Boolean)
        )
    )).slice(0, 5)

    // Get unique brands from search results
    const brands = Array.from(new Set(
      products
        .map((p: any) => p.brand)
        .filter(Boolean)
    )).slice(0, 5)

    // Generate search suggestions
    const suggestions = [
      ...products.slice(0, 3).map((p: any) => ({
        type: 'product',
        text: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        slug: p.slug,
        id: p.id
      })),
      ...categories.slice(0, 2).map((cat: string) => ({
        type: 'category',
        text: `Danh mục: ${cat}`,
        category: cat
      })),
      ...brands.slice(0, 2).map((brand: string) => ({
        type: 'brand',
        text: `Thương hiệu: ${brand}`,
        brand: brand
      }))
    ]

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        categories,
        brands,
        products: products.slice(0, 5)
      }
    })

  } catch (error) {
    console.error("Search suggestions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
