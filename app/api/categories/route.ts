import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCached, setCached, getCategoriesCacheKey } from "@/lib/cache"

// GET /api/categories - Lấy danh sách categories từ products
export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cacheKey = getCategoriesCacheKey()
    const cachedResult = getCached(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // Get unique categories from products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        category: true,
        subcategory: true
      }
    })

    // Extract unique categories
    const categorySet = new Set<string>()
    const subcategorySet = new Set<string>()

    products.forEach((product: any) => {
      if (product.category) {
        categorySet.add(product.category)
      }
      if (product.subcategory) {
        subcategorySet.add(product.subcategory)
      }
    })

    // Convert to array of objects with name and slug
    const categories = Array.from(categorySet).map((cat: string) => ({
      name: cat,
      slug: cat.toLowerCase().replace(/\s+/g, '-')
    }))

    const subcategories = Array.from(subcategorySet).map((subcat: string) => ({
      name: subcat,
      slug: subcat.toLowerCase().replace(/\s+/g, '-')
    }))

    const responseData = {
      success: true,
      data: {
        categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
        subcategories: subcategories.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    // Cache the result
    setCached(cacheKey, responseData)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/categories - Not implemented (categories are managed through products)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Categories are managed through products" },
    { status: 501 }
  )
}
