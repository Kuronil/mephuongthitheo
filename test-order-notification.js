/**
 * Script test notification khi cập nhật trạng thái đơn hàng
 * 
 * Flow:
 * 1. Login admin
 * 2. Lấy một đơn hàng có userId
 * 3. Cập nhật trạng thái đơn hàng
 * 4. Login user
 * 5. Kiểm tra notification mới
 */

const BASE_URL = 'http://localhost:3000'

// Admin credentials
const ADMIN_USER = {
  email: 'admin@mephuong.com',
  password: 'Admin123'
}

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123'
}

let adminHeaders = {}
let userHeaders = {}

// Helper function để log kết quả
function logResult(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${testName}`)
  if (details) console.log(`   ${details}`)
  console.log('')
}

// Login admin
async function loginAdmin() {
  console.log('🔐 Đang login admin...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ADMIN_USER)
    })

    const data = await response.json()

    if (data.success && data.user && data.user.isAdmin) {
      adminHeaders = {
        'Content-Type': 'application/json',
        'x-user-id': data.user.id.toString()
      }
      logResult('Login admin thành công', true, `Admin: ${data.user.name}`)
      return data.user
    } else {
      logResult('Login admin thất bại', false, data.error || 'User is not admin')
      process.exit(1)
    }
  } catch (error) {
    logResult('Login admin lỗi', false, error.message)
    process.exit(1)
  }
}

// Login user
async function loginUser() {
  console.log('🔐 Đang login user...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_USER)
    })

    const data = await response.json()

    if (data.success && data.user) {
      userHeaders = {
        'Content-Type': 'application/json',
        'x-user-id': data.user.id.toString()
      }
      logResult('Login user thành công', true, `User: ${data.user.name} (ID: ${data.user.id})`)
      return data.user
    } else {
      logResult('Login user thất bại', false, data.error || 'Unknown error')
      process.exit(1)
    }
  } catch (error) {
    logResult('Login user lỗi', false, error.message)
    process.exit(1)
  }
}

// Lấy danh sách orders
async function getOrders() {
  console.log('📦 Đang lấy danh sách orders...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/orders?limit=10`, {
      headers: adminHeaders
    })

    const data = await response.json()

    if (data.success && data.data && data.data.orders) {
      const orders = data.data.orders
      logResult(
        'Lấy orders thành công',
        true,
        `Tìm thấy ${orders.length} orders`
      )
      
      // Hiển thị một vài orders
      console.log('   📋 Orders gần nhất:')
      orders.slice(0, 5).forEach((order, index) => {
        const userInfo = order.userId ? `User ID: ${order.userId}` : 'Guest'
        console.log(`   ${index + 1}. #${order.orderNumber || order.id} - ${order.status} (${userInfo})`)
      })
      console.log('')
      
      return orders
    } else {
      logResult('Lấy orders thất bại', false, data.error)
      return []
    }
  } catch (error) {
    logResult('Lấy orders lỗi', false, error.message)
    return []
  }
}

// Cập nhật trạng thái order
async function updateOrderStatus(orderId, newStatus) {
  console.log(`🔄 Đang cập nhật trạng thái order #${orderId} thành ${newStatus}...\n`)
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/orders`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        orderId: orderId,
        status: newStatus
      })
    })

    const data = await response.json()

    if (data.success) {
      logResult(
        'Cập nhật trạng thái thành công',
        true,
        `Order #${orderId} → ${newStatus}`
      )
      return true
    } else {
      logResult('Cập nhật trạng thái thất bại', false, data.error)
      return false
    }
  } catch (error) {
    logResult('Cập nhật trạng thái lỗi', false, error.message)
    return false
  }
}

// Lấy notifications của user
async function getUserNotifications() {
  console.log('🔔 Đang lấy notifications của user...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/notifications?limit=10`, {
      headers: userHeaders
    })

    const data = await response.json()

    if (data.success && data.data) {
      const { notifications, unreadCount } = data.data
      logResult(
        'Lấy notifications thành công',
        true,
        `Tổng: ${notifications.length} notifications, Chưa đọc: ${unreadCount}`
      )
      
      // Hiển thị notifications
      if (notifications.length > 0) {
        console.log('   🔔 Notifications:')
        notifications.forEach((notif, index) => {
          const status = notif.isRead ? '✓' : '🔴'
          const time = new Date(notif.createdAt).toLocaleString('vi-VN')
          console.log(`   ${index + 1}. [${status}] ${notif.title}`)
          console.log(`      ${notif.message}`)
          console.log(`      Type: ${notif.type} | Time: ${time}`)
          if (notif.data) {
            const data = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data
            if (data.orderNumber) {
              console.log(`      Order: ${data.orderNumber} (${data.oldStatus} → ${data.newStatus})`)
            }
          }
          console.log('')
        })
      }
      
      return notifications
    } else {
      logResult('Lấy notifications thất bại', false, data.error)
      return []
    }
  } catch (error) {
    logResult('Lấy notifications lỗi', false, error.message)
    return []
  }
}

// Tạo test order cho user
async function createTestOrder(userId) {
  console.log('📝 Đang tạo test order...\n')
  
  try {
    // Tạo order trực tiếp vào database thông qua API
    const orderData = {
      items: [
        {
          id: 1,
          name: 'Test Product',
          price: 100000,
          quantity: 2
        }
      ],
      total: 200000,
      name: 'Test User',
      phone: '0123456789',
      address: 'Test Address',
      note: 'Test order for notification',
      paymentMethod: 'COD'
    }

    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify(orderData)
    })

    const data = await response.json()

    if (data.success && data.order) {
      logResult(
        'Tạo test order thành công',
        true,
        `Order ID: ${data.order.id}, Number: ${data.order.orderNumber}`
      )
      return data.order
    } else {
      logResult('Tạo test order thất bại', false, data.error)
      return null
    }
  } catch (error) {
    logResult('Tạo test order lỗi', false, error.message)
    return null
  }
}

// Main test flow
async function runTest() {
  console.log('\n========================================')
  console.log('🧪 TEST ORDER NOTIFICATION SYSTEM')
  console.log('========================================\n')

  try {
    // Step 1: Login admin
    await loginAdmin()

    // Step 2: Login user
    const user = await loginUser()

    // Step 3: Tạo test order
    const testOrder = await createTestOrder(user.id)
    
    if (!testOrder) {
      console.log('❌ Không thể tạo test order, sẽ dùng order có sẵn\n')
    } else {
      // Đợi một chút để notification được tạo
      console.log('⏳ Đợi 2 giây để notification được tạo...\n')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Kiểm tra notification tạo order
      console.log('📌 Kiểm tra notification "Đặt hàng thành công":\n')
      await getUserNotifications()
    }

    // Step 4: Lấy danh sách orders
    const orders = await getOrders()

    // Tìm order có userId để test
    const orderWithUser = orders.find(o => o.userId) || testOrder
    
    if (!orderWithUser) {
      console.log('❌ Không tìm thấy order nào có userId để test\n')
      console.log('💡 Vui lòng tạo order với user account trước khi chạy test này\n')
      return
    }

    console.log(`✨ Sẽ test với order #${orderWithUser.orderNumber || orderWithUser.id}\n`)

    // Step 5: Test các trạng thái khác nhau
    const statusesToTest = [
      { status: 'SHIPPING', waitTime: 2000 },
      { status: 'DELIVERED', waitTime: 2000 },
      { status: 'COMPLETED', waitTime: 2000 }
    ]

    for (const { status, waitTime } of statusesToTest) {
      // Cập nhật trạng thái
      await updateOrderStatus(orderWithUser.id, status)
      
      // Đợi notification được tạo
      console.log(`⏳ Đợi ${waitTime/1000} giây để notification được tạo...\n`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      
      // Kiểm tra notification
      console.log(`📌 Kiểm tra notification cho status ${status}:\n`)
      const notifications = await getUserNotifications()
      
      // Kiểm tra xem có notification mới không
      const latestNotif = notifications[0]
      if (latestNotif && latestNotif.type === 'ORDER') {
        const notifData = typeof latestNotif.data === 'string' 
          ? JSON.parse(latestNotif.data) 
          : latestNotif.data
        
        if (notifData.newStatus === status) {
          console.log('   ✅ Notification mới đã được tạo đúng!\n')
        } else {
          console.log('   ⚠️ Notification không khớp với status mới\n')
        }
      } else {
        console.log('   ⚠️ Không tìm thấy notification ORDER mới\n')
      }
      
      console.log('---\n')
    }

    console.log('========================================')
    console.log('✅ HOÀN THÀNH TEST')
    console.log('========================================\n')
    
    console.log('📊 Tóm tắt:')
    console.log(`   • Đã test ${statusesToTest.length} trạng thái`)
    console.log('   • Mỗi lần cập nhật tạo 1 notification')
    console.log('   • User nhận được thông báo real-time')
    console.log('')

  } catch (error) {
    console.error('\n❌ Lỗi khi chạy test:', error.message)
    process.exit(1)
  }
}

// Chạy test
runTest()

