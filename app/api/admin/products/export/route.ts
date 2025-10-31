import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/products/export
 * Export products to CSV or Excel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const category = searchParams.get('category')

    // Build where clause
    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    // Get all products matching filters
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = [
        'ID',
        'Tên sản phẩm',
        'Slug',
        'Giá',
        'Giá gốc',
        'Giảm giá (%)',
        'Danh mục',
        'Thương hiệu',
        'Tồn kho',
        'Tồn kho tối thiểu',
        'Đơn vị',
        'Trạng thái',
        'Nổi bật',
        'Flash Sale',
        'Đánh giá',
        'Số đánh giá',
        'Ngày tạo'
      ].join(',')

      const csvRows = products.map((product: any) => {
        return [
          product.id,
          product.name.replace(/,/g, ';'),
          product.slug,
          product.price,
          product.originalPrice || '',
          product.discount || 0,
          product.category || '',
          product.brand || '',
          product.stock,
          product.minStock,
          product.unit || '',
          product.isActive ? 'Hoạt động' : 'Tạm ngưng',
          product.isFeatured ? 'Có' : 'Không',
          product.isFlashSale ? 'Có' : 'Không',
          product.rating,
          product.reviewCount,
          new Date(product.createdAt).toLocaleDateString('vi-VN')
        ].join(',')
      })

      const csvContent = [csvHeader, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Excel format (tab-separated)
      const excelHeader = [
        'ID',
        'Tên sản phẩm',
        'Slug',
        'Giá',
        'Giá gốc',
        'Giảm giá (%)',
        'Danh mục',
        'Thương hiệu',
        'Tồn kho',
        'Tồn kho tối thiểu',
        'Đơn vị',
        'Trạng thái',
        'Nổi bật',
        'Flash Sale',
        'Đánh giá',
        'Số đánh giá',
        'Ngày tạo'
      ].join('\t')

      const excelRows = products.map((product: any) => {
        return [
          product.id,
          product.name.replace(/\t/g, ' '),
          product.slug,
          product.price,
          product.originalPrice || '',
          product.discount || 0,
          product.category || '',
          product.brand || '',
          product.stock,
          product.minStock,
          product.unit || '',
          product.isActive ? 'Hoạt động' : 'Tạm ngưng',
          product.isFeatured ? 'Có' : 'Không',
          product.isFlashSale ? 'Có' : 'Không',
          product.rating,
          product.reviewCount,
          new Date(product.createdAt).toLocaleDateString('vi-VN')
        ].join('\t')
      })

      const excelContent = [excelHeader, ...excelRows].join('\n')

      return new NextResponse(excelContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.xls"`
        }
      })
    }
  } catch (error) {
    console.error("Export products error:", error)
    return NextResponse.json(
      { error: "Không thể xuất dữ liệu sản phẩm" },
      { status: 500 }
    )
  }
}

