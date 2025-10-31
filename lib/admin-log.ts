import { NextRequest } from "next/server"
import { prisma } from "./prisma"

/**
 * Safe JSON stringify that handles circular references and errors
 */
function safeStringify(value: any): string | null {
  if (value === null || value === undefined) {
    return null
  }

  // If already a string, return as is
  if (typeof value === 'string') {
    return value
  }

  // Try to stringify, handle circular references
  try {
    const seen = new WeakSet()
    return JSON.stringify(value, (key, val) => {
      if (val != null && typeof val === "object") {
        if (seen.has(val)) {
          return "[Circular]"
        }
        seen.add(val)
      }
      return val
    })
  } catch (error) {
    // Fallback to String() if JSON.stringify fails
    try {
      return String(value)
    } catch {
      return "[Unable to serialize]"
    }
  }
}

/**
 * Parse IP address from headers (handles proxy chains)
 */
function getIpAddress(request?: NextRequest): string {
  if (!request) return 'unknown'

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is usually the original client IP
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0] || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

/**
 * Log admin action
 */
export async function logAdminAction(params: {
  adminId: number
  action: string // CREATE, UPDATE, DELETE, EXPORT, LOGIN, etc.
  entity: string // PRODUCT, ORDER, USER, etc.
  entityId?: number
  description: string
  oldData?: any
  newData?: any
  request?: NextRequest
}) {
  try {
    const ipAddress = getIpAddress(params.request)
    const userAgent = params.request?.headers.get('user-agent') || 'unknown'

    await prisma.adminLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        oldData: safeStringify(params.oldData),
        newData: safeStringify(params.newData),
        ipAddress,
        userAgent
      }
    })

    console.log(`[AdminLog] ${params.action} ${params.entity} ${params.entityId || ''} by admin ${params.adminId}`)
  } catch (error) {
    console.error("Failed to log admin action:", error)
    // Don't throw - logging shouldn't break the main operation
  }
}

/**
 * Log product history change
 */
export async function logProductChange(params: {
  productId: number
  changedBy: number
  field: string
  oldValue?: any
  newValue?: any
  reason?: string
}) {
  try {
    await prisma.productHistory.create({
      data: {
        productId: params.productId,
        changedBy: params.changedBy,
        field: params.field,
        oldValue: safeStringify(params.oldValue),
        newValue: safeStringify(params.newValue),
        reason: params.reason || null
      }
    })

    console.log(`[ProductHistory] Field ${params.field} changed for product ${params.productId}`)
  } catch (error) {
    console.error("Failed to log product change:", error)
    // Don't throw - logging shouldn't break the main operation
  }
}

/**
 * Log order history change
 */
export async function logOrderChange(params: {
  orderId: number
  changedBy: number
  field: string
  oldValue?: any
  newValue?: any
  reason?: string
}) {
  try {
    await prisma.orderHistory.create({
      data: {
        orderId: params.orderId,
        changedBy: params.changedBy,
        field: params.field,
        oldValue: safeStringify(params.oldValue),
        newValue: safeStringify(params.newValue),
        reason: params.reason || null
      }
    })

    console.log(`[OrderHistory] Field ${params.field} changed for order ${params.orderId}`)
  } catch (error) {
    console.error("Failed to log order change:", error)
    // Don't throw - logging shouldn't break the main operation
  }
}

