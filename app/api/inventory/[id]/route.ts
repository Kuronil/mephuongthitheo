import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT /api/inventory/[id] - Cập nhật tồn kho sản phẩm cụ thể
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
    const { stock, minStock, operation, quantity, reason } = body

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

    let newStock = existingProduct.stock

    // Handle different operations
    if (operation === 'adjust') {
      // Direct stock adjustment
      newStock = stock
    } else if (operation === 'add') {
      // Add stock
      newStock = existingProduct.stock + (quantity || 0)
    } else if (operation === 'subtract') {
      // Subtract stock (for sales, damage, etc.)
      newStock = Math.max(0, existingProduct.stock - (quantity || 0))
    } else if (operation === 'set_min') {
      // Set minimum stock level
      await prisma.product.update({
        where: { id: productId },
        data: { minStock: minStock || existingProduct.minStock }
      })
      
      return NextResponse.json({
        success: true,
        message: "Đã cập nhật mức tồn kho tối thiểu"
      })
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        stock: newStock,
        ...(minStock !== undefined && { minStock })
      }
    })

    // Log inventory change (you might want to create an InventoryLog model)
    console.log(`Inventory update: Product ${productId}, Operation: ${operation}, New stock: ${newStock}, Reason: ${reason}`)

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Đã cập nhật tồn kho thành công"
    })

  } catch (error) {
    console.error("Update inventory error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/inventory/[id] - Lấy thông tin tồn kho sản phẩm cụ thể
export async function GET(
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
    })

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      )
    }

    // Calculate stock status
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

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        stockStatus,
        alertLevel,
        alertMessage
      }
    })

  } catch (error) {
    console.error("Get inventory item error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
