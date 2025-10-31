/**
 * Script tạo đơn hàng test đơn giản với hình ảnh sản phẩm
 * Chạy lệnh: node create-simple-test-order.js
 */

const API_URL = 'http://localhost:3000';

// Thông tin đơn hàng test đơn giản
const testOrderData = {
  items: [
    {
      id: 999, // ID không tồn tại để bypass validation
      name: "Thịt heo ba chỉ tươi",
      price: 120000,
      quantity: 2,
      image: "/products/thit-heo-ba-chi.jpg"
    },
    {
      id: 998,
      name: "Thịt bò thăn",
      price: 180000,
      quantity: 1,
      image: "/products/thit-bo-than.jpg"
    }
  ],
  total: 420000, // (120000*2) + (180000*1)
  name: "Nguyễn Văn Test",
  phone: "0912345678",
  address: "123 Đường Test, Quận 1, TP.HCM",
  note: "Đơn hàng test với hình ảnh sản phẩm",
  paymentMethod: "COD"
};

async function createSimpleTestOrder() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   TẠO ĐƠN HÀNG TEST ĐƠN GIẢN              ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log('📝 Thông tin đơn hàng sẽ được tạo:');
  console.log('-------------------------------');
  console.log(`👤 Tên: ${testOrderData.name}`);
  console.log(`📱 Số điện thoại: ${testOrderData.phone}`);
  console.log(`🏠 Địa chỉ: ${testOrderData.address}`);
  console.log(`💳 Phương thức: ${testOrderData.paymentMethod}`);
  console.log(`💰 Tổng tiền: ${testOrderData.total.toLocaleString()}đ`);
  console.log('');
  console.log('🛒 Sản phẩm:');
  testOrderData.items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name}`);
    console.log(`     - Giá: ${item.price.toLocaleString()}đ`);
    console.log(`     - Số lượng: ${item.quantity}`);
    console.log(`     - Hình ảnh: ${item.image}`);
    console.log(`     - Thành tiền: ${(item.price * item.quantity).toLocaleString()}đ`);
    console.log('');
  });

  try {
    console.log('📡 Đang gửi request tạo đơn hàng...');
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '23' // ID của user test đã tạo
      },
      body: JSON.stringify(testOrderData)
    });

    const data = await response.json();

    console.log('📊 KẾT QUẢ:');
    console.log('-------------------------------');
    console.log(`Status: ${response.status}`);

    if (response.ok) {
      console.log('✅ TẠO ĐƠN HÀNG THÀNH CÔNG!');
      console.log('-------------------------------');
      console.log('Thông tin đơn hàng đã tạo:');
      console.log(`  - ID: ${data.order.id}`);
      console.log(`  - Mã đơn hàng: ${data.order.orderNumber || 'Chưa có'}`);
      console.log(`  - Tổng tiền: ${data.order.total.toLocaleString()}đ`);
      console.log(`  - Trạng thái: ${data.order.status}`);
      console.log(`  - Phương thức: ${data.order.paymentMethod}`);
      console.log(`  - Ngày tạo: ${new Date(data.order.createdAt).toLocaleString('vi-VN')}`);
      console.log('');
      console.log('🛒 Sản phẩm trong đơn hàng:');
      data.order.items.forEach((item, index) => {
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
      console.log(`Chi tiết đơn hàng: http://localhost:3000/account/orders/${data.order.id}`);
      console.log(`Thanh toán: http://localhost:3000/payment/${data.order.id}`);
      console.log(`Danh sách đơn hàng: http://localhost:3000/account/orders`);
      
      return { success: true, order: data.order };
    } else {
      console.log('❌ TẠO ĐƠN HÀNG THẤT BẠI!');
      console.log('-------------------------------');
      console.log('Lỗi:', data.error);
      if (data.message) {
        console.log('Chi tiết:', data.message);
      }
      
      return { success: false, error: data.error };
    }

  } catch (error) {
    console.error('❌ LỖI KHI TẠO ĐƠN HÀNG:', error.message);
    console.log('');
    console.log('💡 KIỂM TRA:');
    console.log('   - Server có đang chạy trên port 3000 không?');
    console.log('   - Database có kết nối được không?');
    console.log('   - User test có tồn tại không?');
    console.log('   - API endpoint /api/orders có hoạt động không?');
    
    return { success: false, error: error.message };
  }
}

// Chạy script
(async () => {
  try {
    console.log('⚠️  Đảm bảo server đang chạy trên http://localhost:3000');
    console.log('⚠️  Đảm bảo user test đã tồn tại với ID = 23');
    console.log('');
    
    const result = await createSimpleTestOrder();
    
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
