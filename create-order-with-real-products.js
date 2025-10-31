/**
 * Script tạo đơn hàng test với sản phẩm thực tế
 * Chạy lệnh: node create-order-with-real-products.js
 */

async function createOrderWithRealProducts() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   TẠO ĐƠN HÀNG VỚI SẢN PHẨM THỰC TẾ      ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  try {
    // Sử dụng Prisma để tạo đơn hàng trực tiếp
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Tạo sản phẩm test trước
    console.log('📦 Đang tạo sản phẩm test...');
    
    const product1 = await prisma.product.create({
      data: {
        name: "Thịt heo ba chỉ tươi",
        slug: "thit-heo-ba-chi-tuoi",
        price: 120000,
        originalPrice: 150000,
        discount: 20,
        image: "cured-pork-meat.jpg",
        category: "Thịt tươi",
        subcategory: "Thịt heo",
        stock: 100,
        rating: 4.5,
        reviewCount: 25,
        isActive: true,
        isFeatured: false,
        isFlashSale: false,
        description: "Thịt heo ba chỉ tươi ngon, chất lượng cao",
        weight: 500,
        unit: "gram",
        minStock: 10,
        tags: "tươi,ngon,chất lượng"
      }
    });

    const product2 = await prisma.product.create({
      data: {
        name: "Thịt bò thăn",
        slug: "thit-bo-than",
        price: 180000,
        originalPrice: 220000,
        discount: 18,
        image: "/products/thit-bo-than.jpg",
        category: "Thịt tươi",
        subcategory: "Thịt bò",
        stock: 50,
        rating: 4.8,
        reviewCount: 15,
        isActive: true,
        isFeatured: true,
        isFlashSale: false,
        description: "Thịt bò thăn cao cấp, mềm ngon",
        weight: 300,
        unit: "gram",
        minStock: 5,
        tags: "cao cấp,mềm,ngon"
      }
    });

    console.log(`✅ Đã tạo sản phẩm 1: ${product1.name} (ID: ${product1.id})`);
    console.log(`✅ Đã tạo sản phẩm 2: ${product2.name} (ID: ${product2.id})`);
    console.log('');

    // Thông tin đơn hàng test
    const orderData = {
      userId: 23, // ID của user test đã tạo
      total: 420000,
      name: "Nguyễn Văn Test",
      phone: "0912345678",
      address: "123 Đường Test, Quận 1, TP.HCM",
      note: "Đơn hàng test với hình ảnh sản phẩm",
      paymentMethod: "COD",
      status: "PENDING",
      items: {
        create: [
          {
            productId: product1.id,
            name: product1.name,
            price: product1.price,
            quantity: 2,
            image: product1.image
          },
          {
            productId: product2.id,
            name: product2.name,
            price: product2.price,
            quantity: 1,
            image: product2.image
          }
        ]
      }
    };

    console.log('📝 Thông tin đơn hàng sẽ được tạo:');
    console.log('-------------------------------');
    console.log(`👤 User ID: ${orderData.userId}`);
    console.log(`👤 Tên: ${orderData.name}`);
    console.log(`📱 Số điện thoại: ${orderData.phone}`);
    console.log(`🏠 Địa chỉ: ${orderData.address}`);
    console.log(`💳 Phương thức: ${orderData.paymentMethod}`);
    console.log(`💰 Tổng tiền: ${orderData.total.toLocaleString()}đ`);
    console.log('');
    console.log('🛒 Sản phẩm:');
    orderData.items.create.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     - Giá: ${item.price.toLocaleString()}đ`);
      console.log(`     - Số lượng: ${item.quantity}`);
      console.log(`     - Hình ảnh: ${item.image}`);
      console.log(`     - Thành tiền: ${(item.price * item.quantity).toLocaleString()}đ`);
      console.log('');
    });

    console.log('📡 Đang tạo đơn hàng trong database...');
    
    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: true,
        user: true
      }
    });

    console.log('✅ TẠO ĐƠN HÀNG THÀNH CÔNG!');
    console.log('-------------------------------');
    console.log('Thông tin đơn hàng đã tạo:');
    console.log(`  - ID: ${order.id}`);
    console.log(`  - Tổng tiền: ${order.total.toLocaleString()}đ`);
    console.log(`  - Trạng thái: ${order.status}`);
    console.log(`  - Phương thức: ${order.paymentMethod}`);
    console.log(`  - Ngày tạo: ${new Date(order.createdAt).toLocaleString('vi-VN')}`);
    console.log('');
    console.log('🛒 Sản phẩm trong đơn hàng:');
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     - Giá: ${item.price.toLocaleString()}đ`);
      console.log(`     - Số lượng: ${item.quantity}`);
      console.log(`     - Hình ảnh: ${item.image || 'Không có'}`);
      console.log(`     - Thành tiền: ${(item.price * item.quantity).toLocaleString()}đ`);
      console.log('');
    });
    console.log('');
    console.log('🔗 LIÊN KẾT:');
    console.log('-------------------------------');
    console.log(`Chi tiết đơn hàng: http://localhost:3000/account/orders/${order.id}`);
    console.log(`Thanh toán: http://localhost:3000/payment/${order.id}`);
    console.log(`Danh sách đơn hàng: http://localhost:3000/account/orders`);
    
    await prisma.$disconnect();
    return { success: true, order };

  } catch (error) {
    console.error('❌ LỖI KHI TẠO ĐƠN HÀNG:', error.message);
    console.log('');
    console.log('💡 KIỂM TRA:');
    console.log('   - Database có kết nối được không?');
    console.log('   - User test có tồn tại với ID = 23 không?');
    console.log('   - Prisma client có hoạt động không?');
    
    return { success: false, error: error.message };
  }
}

// Chạy script
(async () => {
  try {
    console.log('⚠️  Đảm bảo user test đã tồn tại với ID = 23');
    console.log('');
    
    const result = await createOrderWithRealProducts();
    
    console.log('');
    console.log('✨ HOÀN THÀNH!');
    
    if (result.success) {
      console.log('');
      console.log('🎉 Đơn hàng test đã được tạo thành công!');
      console.log('Bạn có thể kiểm tra hình ảnh sản phẩm trong:');
      console.log('- Trang chi tiết đơn hàng');
      console.log('- Trang thanh toán');
      console.log('- Trang danh sách đơn hàng');
    }
    
  } catch (error) {
    console.error('💥 Lỗi không mong muốn:', error);
  }
})();
