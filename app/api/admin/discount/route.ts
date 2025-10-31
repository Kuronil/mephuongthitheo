import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateAdmin } from "@/lib/auth-middleware"

// GET /api/admin/discount - Get all discount codes (admin)
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const discountCodes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      discountCodes
    })
  } catch (error) {
    console.error("Get discount codes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/admin/discount - Create new discount code
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      code,
      name,
      description,
      discount,
      minAmount,
      maxDiscount,
      freeShipping,
      validFrom,
      validTo,
      usageLimit
    } = body

    // Validate required fields
    if (!code || !name || !discount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCode) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      )
    }

    // Create discount code
    const discountCode = await prisma.discountCode.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        discount,
        minAmount: minAmount || null,
        maxDiscount: maxDiscount || null,
        freeShipping: freeShipping || false,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        usageLimit: usageLimit || null
      }
    })

    return NextResponse.json({
      success: true,
      discountCode,
      message: "Discount code created successfully"
    })
  } catch (error) {
    console.error("Create discount code error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/discount - Update discount code
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      id,
      name,
      description,
      discount,
      minAmount,
      maxDiscount,
      freeShipping,
      isActive,
      validFrom,
      validTo,
      usageLimit
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing discount code ID" },
        { status: 400 }
      )
    }

    // Update discount code
    const updatedCode = await prisma.discountCode.update({
      where: { id },
      data: {
        name,
        description,
        discount,
        minAmount: minAmount || null,
        maxDiscount: maxDiscount || null,
        freeShipping: freeShipping || false,
        isActive: isActive !== undefined ? isActive : true,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        usageLimit: usageLimit || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      discountCode: updatedCode,
      message: "Discount code updated successfully"
    })
  } catch (error) {
    console.error("Update discount code error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/discount - Delete discount code
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateAdmin(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Missing discount code ID" },
        { status: 400 }
      )
    }

    // Delete discount code
    await prisma.discountCode.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: "Discount code deleted successfully"
    })
  } catch (error) {
    console.error("Delete discount code error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
