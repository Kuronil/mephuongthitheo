import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/inventory - Lấy danh sách tồn kho với cảnh báo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const stockStatus = searchParams.get('stockStatus') || '' // 'low', 'out', 'good'
    const sortBy = searchParams.get('sortBy') || 'stock'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    // Filter by stock status
    if (stockStatus === 'out') {
      where.stock = 0
    } else if (stockStatus === 'low') {
      where.stock = {
        gt: 0,
        lte: prisma.product.fields.minStock
      }
    } else if (stockStatus === 'good') {
      where.stock = {
        gt: prisma.product.fields.minStock
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'stock') {
      orderBy.stock = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'category') {
      orderBy.category = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get products with inventory info
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          subcategory: true,
          price: true,
          stock: true,
          minStock: true,
          image: true,
          isActive: true,
          updatedAt: true
        }
      }),
      prisma.product.count({ where })
    ])

    // Add stock status and alerts
    const productsWithStatus = products.map((product: any) => {
      let stockStatus = 'good'
      let alertLevel = 'none'
      let alertMessage = ''

      if (product.stock === 0) {
        stockStatus = 'out'
        alertLevel = 'critical'
        alertMessage = 'Hết hàng'
      } else if (product.stock <= product.minStock) {
        stockStatus = 'low'
        alertLevel = 'warning'
        alertMessage = `Sắp hết hàng (${product.stock}/${product.minStock})`
      }

      return {
        ...product,
        stockStatus,
        alertLevel,
        alertMessage
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    // Get inventory summary
    const inventorySummary = await prisma.product.aggregate({
      where: { isActive: true },
      _count: {
        id: true
      },
      _sum: {
        stock: true
      }
    })

    const outOfStockCount = await prisma.product.count({
      where: {
        isActive: true,
        stock: 0
      }
    })

    const lowStockCount = await prisma.product.count({
      where: {
        isActive: true,
        stock: {
          gt: 0,
          lte: prisma.product.fields.minStock
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithStatus,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary: {
          totalProducts: inventorySummary._count.id,
          totalStock: inventorySummary._sum.stock || 0,
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          goodStock: inventorySummary._count.id - outOfStockCount - lowStockCount
        }
      }
    })

  } catch (error) {
    console.error("Get inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

