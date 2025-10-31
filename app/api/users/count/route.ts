import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const totalUsers = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      count: totalUsers
    })

  } catch (error) {
    console.error('Error counting users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to count users' },
      { status: 500 }
    )
  }
}