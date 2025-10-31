import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAdminAction } from "@/lib/admin-log"
import { authenticateUser } from "@/lib/auth-middleware"


/**
 * GET /api/admin/orders/export
 * Export orders to CSV or Excel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv' // csv or excel
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Get all orders matching filters
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = [
        'Mã đơn hàng',
        'Ngày đặt',
        'Khách hàng',
        'Email',
        'Số điện thoại',
        'Địa chỉ',
        'Tổng tiền',
        'Thanh toán',
        'Trạng thái',
        'Số lượng sản phẩm',
        'Ghi chú'
      ].join(',')

      const csvRows = orders.map((order: any) => {
        const orderNumber = `MP${order.id}`
        const customerName = order.name || order.user?.name || 'Khách hàng'
        const customerEmail = order.user?.email || ''
        const customerPhone = order.phone || order.user?.phone || ''
        const address = order.address || ''
        const total = order.total
        const paymentMethod = order.paymentMethod
        const status = order.status
        const itemCount = order.items?.length || 0
        const note = (order.note || '').replace(/,/g, ';').replace(/\n/g, ' ')

        return [
          orderNumber,
          new Date(order.createdAt).toLocaleDateString('vi-VN'),
          customerName,
          customerEmail,
          customerPhone,
          address.replace(/,/g, ';'),
          total,
          paymentMethod,
          status,
          itemCount,
          note
        ].join(',')
      })

      const csvContent = [csvHeader, ...csvRows].join('\n')

      // Log export action
      try {
        const adminUser = await authenticateUser(request)
        if (adminUser) {
          await logAdminAction({
            adminId: adminUser.id,
            action: 'EXPORT',
            entity: 'ORDER',
            description: `Exported ${orders.length} orders to CSV`,
            request
          })
        }
      } catch (error) {
        console.error('Failed to log export action:', error)
      }

      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // For Excel, we'll return JSON and let frontend handle with a library
      // Or return CSV with Excel MIME type
      const csvHeader = [
        'Mã đơn hàng',
        'Ngày đặt',
        'Khách hàng',
        'Email',
        'Số điện thoại',
        'Địa chỉ',
        'Tổng tiền',
        'Thanh toán',
        'Trạng thái',
        'Số lượng sản phẩm',
        'Ghi chú'
      ].join('\t')

      const csvRows = orders.map((order: any) => {
        const orderNumber = `MP${order.id}`
        const customerName = order.name || order.user?.name || 'Khách hàng'
        const customerEmail = order.user?.email || ''
        const customerPhone = order.phone || order.user?.phone || ''
        const address = order.address || ''
        const total = order.total
        const paymentMethod = order.paymentMethod
        const status = order.status
        const itemCount = order.items?.length || 0
        const note = (order.note || '').replace(/\t/g, ' ').replace(/\n/g, ' ')

        return [
          orderNumber,
          new Date(order.createdAt).toLocaleDateString('vi-VN'),
          customerName,
          customerEmail,
          customerPhone,
          address.replace(/\t/g, ' '),
          total,
          paymentMethod,
          status,
          itemCount,
          note
        ].join('\t')
      })

      const excelContent = [csvHeader, ...csvRows].join('\n')

      return new NextResponse(excelContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.xls"`
        }
      })
    }
  } catch (error) {
    console.error("Export orders error:", error)
    return NextResponse.json(
      { error: "Không thể xuất dữ liệu đơn hàng" },
      { status: 500 }
    )
  }
}

