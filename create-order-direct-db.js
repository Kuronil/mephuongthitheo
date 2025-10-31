/**
 * Script tạo đơn hàng test trực tiếp trong database với hình ảnh sản phẩm
 * Chạy lệnh: node create-order-direct-db.js
 */

async function createOrderDirectInDB() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   TẠO ĐƠN HÀNG TRỰC TIẾP TRONG DB        ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  try {
    // Sử dụng Prisma để tạo đơn hàng trực tiếp
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

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
            productId: 999, // ID giả
            name: "Thịt heo ba chỉ tươi",
            price: 120000,
            quantity: 2,
            image: "/products/thit-heo-ba-chi.jpg"
          },
          {
            productId: 998,
            name: "Thịt bò thăn",
            price: 180000,
            quantity: 1,
            image: "/products/thit-bo-than.jpg"
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
    
    const result = await createOrderDirectInDB();
    
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
