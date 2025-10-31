import { prisma } from "./prisma"

/**
 * Restore stock when order is cancelled
 * Note: This function should be called when order status changes to CANCELLED
 * It checks if order is CANCELLED before restoring to prevent duplicate restores
 */
export async function restoreStockFromOrder(orderId: number) {
  try {
    // Get order with items in a transaction to ensure consistency
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    })

    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }

    // Only restore stock if order is CANCELLED
    // This prevents duplicate restores if function is called multiple times
    if (order.status !== 'CANCELLED') {
      console.log(`[Stock] Order ${orderId} status is ${order.status}, skipping stock restore`)
      return false
    }

    if (order.items.length === 0) {
      console.log(`[Stock] Order ${orderId} has no items to restore`)
      return true
    }

    // Restore stock for each item in a transaction
    await prisma.$transaction(
      order.items.map((item: any) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      )
    )

    console.log(`[Stock] Restored stock for ${order.items.length} items in order ${orderId}`)
    
    return true
  } catch (error) {
    console.error(`[Stock] Failed to restore stock for order ${orderId}:`, error)
    throw error
  }
}

/**
 * Check if stock can be decremented
 * Note: This is a read-only check. Use decrementStock for actual atomic decrement.
 */
export async function canDecrementStock(productId: number, quantity: number): Promise<boolean> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true }
    })

    if (!product) {
      return false
    }

    return product.stock >= quantity
  } catch (error) {
    console.error(`[Stock] Error checking stock for product ${productId}:`, error)
    return false
  }
}

/**
 * Decrement stock atomically using updateMany
 * Returns true if successful, false if insufficient stock
 * This is thread-safe and prevents race conditions
 */
export async function decrementStock(productId: number, quantity: number): Promise<boolean> {
  try {
    // Use updateMany with condition - Prisma handles this atomically
    // Only updates if stock >= quantity
    const result = await prisma.product.updateMany({
      where: {
        id: productId,
        stock: {
          gte: quantity
        }
      },
      data: {
        stock: {
          decrement: quantity
        }
      }
    })

    // If count is 0, it means the condition wasn't met (insufficient stock)
    if (result.count === 0) {
      // Get current stock for logging
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true, name: true }
      })
      
      if (product) {
        console.log(
          `[Stock] Insufficient stock for product ${productId} (${product.name}). ` +
          `Available: ${product.stock}, Required: ${quantity}`
        )
      } else {
        console.log(`[Stock] Product ${productId} not found`)
      }
      return false
    }

    // Get updated stock for logging
    const updated = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true }
    })

    if (updated) {
      console.log(
        `[Stock] Decremented ${quantity} units from product ${productId} (${updated.name}). ` +
        `New stock: ${updated.stock}`
      )
    }

    return true
  } catch (error: any) {
    console.error(`[Stock] Error decrementing stock for product ${productId}:`, error)
    throw error
  }
}

/**
 * Decrement stock for multiple items atomically using Prisma transaction
 * If any item fails (insufficient stock), the entire transaction rolls back
 * This ensures all-or-nothing behavior
 */
export async function decrementStockForItems(
  items: Array<{ productId: number; quantity: number; name: string }>
): Promise<{ success: boolean; failedItem?: any; error?: string }> {
  if (items.length === 0) {
    return { success: true }
  }

  try {
    // Use Prisma transaction to ensure atomicity
    // If any update fails, all changes are rolled back automatically
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })

        if (result.count === 0) {
          // Get current stock for error message
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true }
          })
          
          const availableStock = product?.stock ?? 0
          throw new Error(
            `Sản phẩm ${item.name} không đủ hàng trong kho. ` +
            `Còn lại: ${availableStock}, Cần: ${item.quantity}`
          )
        }
      }
    })

    console.log(`[Stock] Successfully decremented stock for ${items.length} items`)
    return { success: true }
  } catch (error: any) {
    // Prisma transaction automatically rolls back, no manual rollback needed
    const errorMessage = error.message || 'Lỗi khi trừ tồn kho'
    console.error(`[Stock] Failed to decrement stock for items:`, errorMessage)
    
    // Try to identify which item failed
    const failedItem = items.find(item => 
      errorMessage.includes(item.name) || errorMessage.includes(item.productId.toString())
    )
    
    return {
      success: false,
      failedItem: failedItem || items[0],
      error: errorMessage
    }
  }
}

