import { NextRequest } from "next/server"
import { authenticateAdmin } from "@/lib/auth-middleware"

/**
 * GET /api/auth/verify-admin
 * Verify if the current user is an admin
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request)
    
    if (!admin) {
      return Response.json(
        { 
          success: false, 
          error: "Unauthorized: Admin access required",
          isAdmin: false 
        }, 
        { status: 403 }
      )
    }

    return Response.json({
      success: true,
      isAdmin: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin
      }
    })
  } catch (error) {
    console.error("Verify admin error:", error)
    return Response.json(
      { 
        success: false, 
        error: "Internal server error",
        isAdmin: false 
      }, 
      { status: 500 }
    )
  }
}



