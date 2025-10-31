import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lấy thông tin vị trí cửa hàng
export async function GET() {
  try {
    // Tạm thời trả về thông tin cửa hàng hardcode
    // Sau này có thể lưu vào database
    const storeLocation = {
      id: 1,
      name: "Thịt Heo Mẹ Phương",
      address: "211 Lê Lâm Phường Phú Thạnh Quận Tân Phú TP.HCM",
      phone: "0902 759 466",
      email: "support@mephuong.com",
      coordinates: {
        lat: 10.7769, // Tọa độ gần đúng của địa chỉ
        lng: 106.6309
      },
      workingHours: {
        monday: "8:00 - 18:00",
        tuesday: "8:00 - 18:00", 
        wednesday: "8:00 - 18:00",
        thursday: "8:00 - 18:00",
        friday: "8:00 - 18:00",
        saturday: "8:00 - 12:00",
        sunday: "Nghỉ"
      },
      services: [
        "Giao hàng tận nơi",
        "Thịt tươi ngon",
        "Đóng gói cẩn thận",
        "Hỗ trợ 24/7"
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: storeLocation
    })
  } catch (error) {
    console.error('Error fetching store location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store location' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật thông tin vị trí cửa hàng (chỉ admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, email, coordinates, workingHours, services } = body

    // TODO: Thêm authentication check cho admin
    // const user = await authenticateUser(request)
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    // }

    // Validate required fields
    if (!name || !address || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Tạm thời trả về success (sau này sẽ lưu vào database)
    const updatedLocation = {
      id: 1,
      name,
      address,
      phone,
      email,
      coordinates: coordinates || { lat: 10.7769, lng: 106.6309 },
      workingHours: workingHours || {
        monday: "8:00 - 18:00",
        tuesday: "8:00 - 18:00",
        wednesday: "8:00 - 18:00", 
        thursday: "8:00 - 18:00",
        friday: "8:00 - 18:00",
        saturday: "8:00 - 12:00",
        sunday: "Nghỉ"
      },
      services: services || [
        "Giao hàng tận nơi",
        "Thịt tươi ngon", 
        "Đóng gói cẩn thận",
        "Hỗ trợ 24/7"
      ],
      isActive: true,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedLocation,
      message: 'Store location updated successfully'
    })
  } catch (error) {
    console.error('Error updating store location:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update store location' },
      { status: 500 }
    )
  }
}
