import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

interface CartItemToValidate {
  productId: number
  quantity: number
  name: string
}

interface ValidationResult {
  productId: number
  name: string
  isValid: boolean
  isActive: boolean
  stock: number
  requestedQuantity: number
  issue?: 'not_found' | 'inactive' | 'out_of_stock' | 'insufficient_stock'
  message?: string
}

/**
 * POST /api/cart/validate
 * Validate cart items for availability, stock, and active status
 */
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
    const { items } = body as { items: CartItemToValidate[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Danh sách sản phẩm không hợp lệ" },
        { status: 400 }
      )
    }

    const validationResults: ValidationResult[] = []

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        validationResults.push({
          productId: item.productId || 0,
          name: item.name || 'Unknown',
          isValid: false,
          isActive: false,
          stock: 0,
          requestedQuantity: item.quantity || 0,
          issue: 'not_found',
          message: 'Dữ liệu sản phẩm không hợp lệ'
        })
        continue
      }

      // Get product from database
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          isActive: true,
          stock: true
        }
      })

      if (!product) {
        validationResults.push({
          productId: item.productId,
          name: item.name,
          isValid: false,
          isActive: false,
          stock: 0,
          requestedQuantity: item.quantity,
          issue: 'not_found',
          message: `Sản phẩm ${item.name} không tồn tại`
        })
        continue
      }

      if (!product.isActive) {
        validationResults.push({
          productId: item.productId,
          name: product.name,
          isValid: false,
          isActive: false,
          stock: product.stock,
          requestedQuantity: item.quantity,
          issue: 'inactive',
          message: `Sản phẩm ${product.name} đã bị vô hiệu hóa và không còn được bán`
        })
        continue
      }

      if (product.stock <= 0) {
        validationResults.push({
          productId: item.productId,
          name: product.name,
          isValid: false,
          isActive: true,
          stock: product.stock,
          requestedQuantity: item.quantity,
          issue: 'out_of_stock',
          message: `Sản phẩm ${product.name} đã hết hàng`
        })
        continue
      }

      if (product.stock < item.quantity) {
        validationResults.push({
          productId: item.productId,
          name: product.name,
          isValid: false,
          isActive: true,
          stock: product.stock,
          requestedQuantity: item.quantity,
          issue: 'insufficient_stock',
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho. Bạn yêu cầu ${item.quantity}`
        })
        continue
      }

      // Product is valid
      validationResults.push({
        productId: item.productId,
        name: product.name,
        isValid: true,
        isActive: true,
        stock: product.stock,
        requestedQuantity: item.quantity,
        message: 'Sản phẩm có sẵn'
      })
    }

    const hasInvalidItems = validationResults.some(result => !result.isValid)

    return NextResponse.json({
      success: !hasInvalidItems,
      results: validationResults,
      summary: {
        total: validationResults.length,
        valid: validationResults.filter(r => r.isValid).length,
        invalid: validationResults.filter(r => !r.isValid).length,
        issues: {
          not_found: validationResults.filter(r => r.issue === 'not_found').length,
          inactive: validationResults.filter(r => r.issue === 'inactive').length,
          out_of_stock: validationResults.filter(r => r.issue === 'out_of_stock').length,
          insufficient_stock: validationResults.filter(r => r.issue === 'insufficient_stock').length
        }
      }
    })
  } catch (error: any) {
    console.error("Cart validation error:", error)
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

