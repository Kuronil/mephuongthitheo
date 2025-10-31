import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateUser } from "@/lib/auth-middleware"

// GET /api/cart - Get user's cart items
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      items: cartItems
    })
  } catch (error: any) {
    console.error("Get cart error:", error)
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

// POST /api/cart - Add item to cart
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
    const { productId, name, price, quantity, image, originalPrice, discount } = body

    // Validate required fields
    if (!productId || !name || !price || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        item: updatedItem,
        message: "Cart item updated"
      })
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          name,
          price,
          quantity,
          image: image || null,
          originalPrice: originalPrice || null,
          discount: discount || null
        }
      })

      return NextResponse.json({
        success: true,
        item: cartItem,
        message: "Item added to cart"
      })
    }
  } catch (error: any) {
    console.error("Add to cart error:", error)
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

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      // Remove item from cart
      await prisma.cartItem.delete({
        where: { 
          id: itemId,
          userId: user.id 
        }
      })

      return NextResponse.json({
        success: true,
        message: "Item removed from cart"
      })
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { 
        id: itemId,
        userId: user.id 
      },
      data: { 
        quantity,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: "Cart item updated"
    })
  } catch (error: any) {
    console.error("Update cart error:", error)
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

// DELETE /api/cart - Clear cart or remove specific item
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
    const itemId = searchParams.get('itemId')

    if (itemId) {
      // Remove specific item
      await prisma.cartItem.delete({
        where: { 
          id: parseInt(itemId),
          userId: user.id 
        }
      })

      return NextResponse.json({
        success: true,
        message: "Item removed from cart"
      })
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { userId: user.id }
      })

      return NextResponse.json({
        success: true,
        message: "Cart cleared"
      })
    }
  } catch (error: any) {
    console.error("Delete cart error:", error)
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
