import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export interface AuthenticatedUser {
  id: number
  name: string
  email: string
  address?: string | null
  phone?: string | null
  isAdmin: boolean
}

/**
 * Extract JWT token from request headers or cookies
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // First try Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fallback to cookie
  const token = request.cookies.get('token')?.value
  if (token) {
    return token
  }

  return null
}

/**
 * Authenticate user from JWT token
 */
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get token from request
    const token = getTokenFromRequest(request)

    if (!token) {
      return null
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Get user from database to ensure user still exists and get full details
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        isAdmin: true
      }
    })

    if (!user) {
      return null
    }

    // Verify admin status matches token (in case it was changed)
    if (user.isAdmin !== payload.isAdmin) {
      // Token has outdated admin status, but user still authenticated
      // Return user with current admin status
      return user
    }

    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

/**
 * Verify if the authenticated user is an admin
 * Returns null if user is not authenticated or not an admin
 */
export async function authenticateAdmin(request: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await authenticateUser(request)
  
  if (!user) {
    return null
  }
  
  if (!user.isAdmin) {
    return null
  }
  
  return user
}

export function createAuthResponse(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}
