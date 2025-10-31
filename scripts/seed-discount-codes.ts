import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const discountCodes = [
  {
    code: "SAVE5",
    name: "Giảm giá 5%", // 5% giảm giá
    description: "Giảm 5% cho đơn hàng từ 500,000đ",
    discount: 5,
    minAmount: 500000, // Đơn tối thiểu 500k
    maxDiscount: 50000, // Giảm tối đa 50k
    freeShipping: false,
    isActive: true,
    usageLimit: 1000 // Dùng được 1000 lần
  },
  {
    code: "FREESHIP",
    name: "Miễn phí giao hàng",
    description: "Miễn phí giao hàng cho mọi đơn hàng",
    discount: 0,
    minAmount: 0,
    maxDiscount: 0,
    freeShipping: true,
    isActive: true,
    usageLimit: 10
  }
]

async function seedDiscountCodes() {
  try {
    console.log('🌱 Seeding discount codes...')

    for (const discountCode of discountCodes) {
      // Check if code already exists
      const existing = await prisma.discountCode.findUnique({
        where: { code: discountCode.code }
      })

      if (!existing) {
        await prisma.discountCode.create({
          data: discountCode
        })
        console.log(`✅ Created discount code: ${discountCode.code}`)
      } else {
        console.log(`⚠️  Discount code already exists: ${discountCode.code}`)
      }
    }

    console.log('🎉 Discount codes seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding discount codes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDiscountCodes()
