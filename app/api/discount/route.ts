import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"
import { ErrorResponses, ErrorCode, createErrorResponse } from "@/lib/errors"

// GET /api/discount - Get all active discount codes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
      // Get specific discount code
      const discountCode = await prisma.discountCode.findUnique({
        where: { code: code.toUpperCase() }
      })

      if (!discountCode) {
        return NextResponse.json(
          { error: "Discount code not found" },
          { status: 404 }
        )
      }

      // Check if code is active and valid
      const now = new Date()
      if (!discountCode.isActive) {
        return NextResponse.json(
          { error: "Discount code is not active" },
          { status: 400 }
        )
      }

      if (discountCode.validFrom && now < discountCode.validFrom) {
        return NextResponse.json(
          { error: "Discount code is not yet valid" },
          { status: 400 }
        )
      }

      if (discountCode.validTo && now > discountCode.validTo) {
        return NextResponse.json(
          { error: "Discount code has expired" },
          { status: 400 }
        )
      }

      if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
        return NextResponse.json(
          { error: "Discount code usage limit reached" },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        discountCode
      })
    } else {
      // Get all active discount codes
      const discountCodes = await prisma.discountCode.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        success: true,
        discountCodes
      })
    }
  } catch (error: any) {
    console.error("Get discount error:", error)
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

// POST /api/discount - Validate and apply discount code
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return ErrorResponses.unauthorized()
    }

    const body = await request.json()
    const { code, subtotal } = body

    if (!code || subtotal === undefined) {
      return ErrorResponses.missingFields(
        !code ? ['code'] : ['subtotal']
      )
    }

    // Get discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!discountCode) {
      return ErrorResponses.notFound('Discount code')
    }

    // Check if code is active and valid
    const now = new Date()
    if (!discountCode.isActive) {
      return NextResponse.json(
        { error: "Discount code is not active" },
        { status: 400 }
      )
    }

    if (discountCode.validFrom && now < discountCode.validFrom) {
      return NextResponse.json(
        { error: "Discount code is not yet valid" },
        { status: 400 }
      )
    }

    if (discountCode.validTo && now > discountCode.validTo) {
      return NextResponse.json(
        { error: "Discount code has expired" },
        { status: 400 }
      )
    }

    if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
      return NextResponse.json(
        { error: "Discount code usage limit reached" },
        { status: 400 }
      )
    }

    // Check minimum amount requirement
    if (discountCode.minAmount && subtotal < discountCode.minAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is ${discountCode.minAmount.toLocaleString()}đ` },
        { status: 400 }
      )
    }

    // Calculate discount amount
    let discountAmount = (subtotal * discountCode.discount) / 100
    
    // Apply maximum discount limit
    if (discountCode.maxDiscount && discountAmount > discountCode.maxDiscount) {
      discountAmount = discountCode.maxDiscount
    }

    return NextResponse.json({
      success: true,
      discountCode: {
        id: discountCode.id,
        code: discountCode.code,
        name: discountCode.name,
        description: discountCode.description,
        discount: discountCode.discount,
        freeShipping: discountCode.freeShipping,
        discountAmount,
        minAmount: discountCode.minAmount
      }
    })
  } catch (error: any) {
    console.error("Apply discount error:", error)
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
