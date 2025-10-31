/**
 * Script test hệ thống notification
 * 
 * Test các chức năng:
 * 1. Tạo notification cho user
 * 2. Lấy danh sách notifications
 * 3. Đánh dấu đã đọc
 * 4. Xóa notification
 * 5. Đánh dấu tất cả đã đọc
 */

const BASE_URL = 'http://localhost:3000'

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123'
}

let authHeaders = {}

// Helper function để log kết quả
function logResult(testName, passed, details = '') {
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${testName}`)
  if (details) console.log(`   ${details}`)
  console.log('')
}

// Helper function để login
async function login() {
  console.log('🔐 Đang login...\n')
  
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
      authHeaders = {
        'Content-Type': 'application/json',
        'x-user-id': data.user.id.toString()
      }
      logResult('Login thành công', true, `User: ${data.user.name} (ID: ${data.user.id})`)
      return data.user
    } else {
      logResult('Login thất bại', false, data.error || 'Unknown error')
      process.exit(1)
    }
  } catch (error) {
    logResult('Login lỗi', false, error.message)
    process.exit(1)
  }
}

// Test 1: Tạo notification
async function testCreateNotification(userId) {
  console.log('📝 Test 1: Tạo notification\n')

  try {
    const notificationData = {
      userId: userId,
      title: 'Test Notification',
      message: 'Đây là notification test được tạo bởi script',
      type: 'SYSTEM',
      data: {
        testId: Date.now(),
        source: 'test-script'
      }
    }

    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(notificationData)
    })

    const data = await response.json()

    if (data.success && data.data) {
      logResult(
        'Tạo notification thành công',
        true,
        `ID: ${data.data.id}, Title: ${data.data.title}`
      )
      return data.data.id
    } else {
      logResult('Tạo notification thất bại', false, data.error)
      return null
    }
  } catch (error) {
    logResult('Tạo notification lỗi', false, error.message)
    return null
  }
}

// Test 2: Lấy danh sách notifications
async function testGetNotifications() {
  console.log('📋 Test 2: Lấy danh sách notifications\n')

  try {
    const response = await fetch(`${BASE_URL}/api/notifications?limit=10`, {
      headers: authHeaders
    })

    const data = await response.json()

    if (data.success && data.data) {
      const { notifications, unreadCount } = data.data
      logResult(
        'Lấy danh sách notifications thành công',
        true,
        `Tổng: ${notifications.length} notifications, Chưa đọc: ${unreadCount}`
      )
      
      // Hiển thị 3 notifications đầu tiên
      if (notifications.length > 0) {
        console.log('   📌 Notifications gần nhất:')
        notifications.slice(0, 3).forEach((notif, index) => {
          const status = notif.isRead ? '✓' : '○'
          console.log(`   ${index + 1}. [${status}] ${notif.title}`)
          console.log(`      ${notif.message.substring(0, 60)}...`)
        })
        console.log('')
      }
      
      return notifications
    } else {
      logResult('Lấy danh sách thất bại', false, data.error)
      return []
    }
  } catch (error) {
    logResult('Lấy danh sách lỗi', false, error.message)
    return []
  }
}

// Test 3: Đánh dấu notification đã đọc
async function testMarkAsRead(notificationId) {
  console.log('✓ Test 3: Đánh dấu notification đã đọc\n')

  if (!notificationId) {
    logResult('Không có notification để test', false)
    return false
  }

  try {
    const response = await fetch(`${BASE_URL}/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: authHeaders
    })

    const data = await response.json()

    if (data.success) {
      logResult(
        'Đánh dấu đã đọc thành công',
        true,
        `Notification ID: ${notificationId}`
      )
      return true
    } else {
      logResult('Đánh dấu đã đọc thất bại', false, data.error)
      return false
    }
  } catch (error) {
    logResult('Đánh dấu đã đọc lỗi', false, error.message)
    return false
  }
}

// Test 4: Đánh dấu tất cả đã đọc
async function testMarkAllAsRead() {
  console.log('✓✓ Test 4: Đánh dấu tất cả đã đọc\n')

  try {
    const response = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
      method: 'PUT',
      headers: authHeaders
    })

    const data = await response.json()

    if (data.success) {
      logResult('Đánh dấu tất cả đã đọc thành công', true)
      return true
    } else {
      logResult('Đánh dấu tất cả đã đọc thất bại', false, data.error)
      return false
    }
  } catch (error) {
    logResult('Đánh dấu tất cả đã đọc lỗi', false, error.message)
    return false
  }
}

// Test 5: Xóa notification
async function testDeleteNotification(notificationId) {
  console.log('🗑️  Test 5: Xóa notification\n')

  if (!notificationId) {
    logResult('Không có notification để xóa', false)
    return false
  }

  try {
    const response = await fetch(`${BASE_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: authHeaders
    })

    const data = await response.json()

    if (data.success) {
      logResult(
        'Xóa notification thành công',
        true,
        `Notification ID: ${notificationId}`
      )
      return true
    } else {
      logResult('Xóa notification thất bại', false, data.error)
      return false
    }
  } catch (error) {
    logResult('Xóa notification lỗi', false, error.message)
    return false
  }
}

// Test 6: Tạo notification cập nhật đơn hàng
async function testOrderNotification(userId) {
  console.log('📦 Test 6: Tạo notification cập nhật đơn hàng\n')

  try {
    // Giả lập việc tạo notification cho order
    const orderNotification = {
      userId: userId,
      title: '🚚 Đang giao hàng',
      message: 'Đơn hàng #MP123456789 đang được giao đến bạn. Vui lòng chú ý điện thoại để nhận hàng.',
      type: 'ORDER',
      data: {
        orderId: 123,
        orderNumber: 'MP123456789',
        oldStatus: 'PENDING',
        newStatus: 'SHIPPING',
        updatedAt: new Date().toISOString()
      }
    }

    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(orderNotification)
    })

    const data = await response.json()

    if (data.success) {
      logResult(
        'Tạo notification đơn hàng thành công',
        true,
        `Order #${orderNotification.data.orderNumber}`
      )
      return data.data.id
    } else {
      logResult('Tạo notification đơn hàng thất bại', false, data.error)
      return null
    }
  } catch (error) {
    logResult('Tạo notification đơn hàng lỗi', false, error.message)
    return null
  }
}

// Test 7: Kiểm tra filter by type
async function testFilterByType() {
  console.log('🔍 Test 7: Filter notifications theo type\n')

  try {
    const types = ['ORDER', 'PROMOTION', 'SYSTEM', 'LOYALTY']
    const results = []

    for (const type of types) {
      const response = await fetch(`${BASE_URL}/api/notifications?type=${type}&limit=5`, {
        headers: authHeaders
      })

      const data = await response.json()

      if (data.success) {
        results.push({ type, count: data.data.notifications.length })
      }
    }

    logResult('Filter theo type thành công', true)
    results.forEach(({ type, count }) => {
      console.log(`   ${type}: ${count} notifications`)
    })
    console.log('')

    return true
  } catch (error) {
    logResult('Filter theo type lỗi', false, error.message)
    return false
  }
}

// Test 8: Kiểm tra unread only filter
async function testUnreadOnly() {
  console.log('📭 Test 8: Lấy chỉ notifications chưa đọc\n')

  try {
    const response = await fetch(`${BASE_URL}/api/notifications?unreadOnly=true`, {
      headers: authHeaders
    })

    const data = await response.json()

    if (data.success) {
      const { notifications, unreadCount } = data.data
      logResult(
        'Lấy notifications chưa đọc thành công',
        true,
        `Có ${unreadCount} notifications chưa đọc`
      )
      return true
    } else {
      logResult('Lấy notifications chưa đọc thất bại', false, data.error)
      return false
    }
  } catch (error) {
    logResult('Lấy notifications chưa đọc lỗi', false, error.message)
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('\n========================================')
  console.log('🧪 TEST HỆ THỐNG NOTIFICATION')
  console.log('========================================\n')

  try {
    // Login trước
    const user = await login()

    // Test 1: Tạo notification
    const notificationId = await testCreateNotification(user.id)

    // Test 2: Lấy danh sách
    const notifications = await testGetNotifications()

    // Test 3: Đánh dấu đã đọc
    if (notificationId) {
      await testMarkAsRead(notificationId)
    }

    // Test 4: Tạo notification đơn hàng
    const orderNotificationId = await testOrderNotification(user.id)

    // Test 5: Filter by type
    await testFilterByType()

    // Test 6: Unread only
    await testUnreadOnly()

    // Test 7: Đánh dấu tất cả đã đọc
    await testMarkAllAsRead()

    // Test 8: Xóa notification
    if (orderNotificationId) {
      await testDeleteNotification(orderNotificationId)
    }

    // Lấy danh sách sau khi test
    console.log('📊 Kiểm tra lại sau khi test:\n')
    await testGetNotifications()

    console.log('========================================')
    console.log('✅ HOÀN THÀNH TẤT CẢ TESTS')
    console.log('========================================\n')

  } catch (error) {
    console.error('\n❌ Lỗi khi chạy tests:', error.message)
    process.exit(1)
  }
}

// Chạy tests
runTests()

