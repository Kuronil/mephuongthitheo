import { NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth-middleware"

export async function POST(req: NextRequest) {
  try {
    console.log('Test auth: Starting authentication test...')
    
    const user = await authenticateUser(req)
    
    console.log('Test auth: Authentication result:', !!user)
    console.log('Test auth: User data:', user)
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Test auth error:", error)
    return NextResponse.json(
      { 
        error: "Authentication test failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
