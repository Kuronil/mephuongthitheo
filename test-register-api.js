// Test script để kiểm tra API register với các validation mới
// Chạy với: node test-register-api.js
// Hoặc: Paste vào Console của browser tại trang đăng ký

console.log("🧪 Bắt đầu test API Register...\n");

const API_URL = 'http://localhost:3000';

// Test utilities
const testCase = (name, passed) => {
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}`);
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Test data
const testCases = [
  {
    name: "1. Đăng ký thành công với đầy đủ thông tin",
    data: {
      name: "Nguyễn Văn A",
      email: `test${Date.now()}@example.com`,
      phone: "0912345678",
      password: "Test123",
      address: "123 Đường ABC, Quận 1, TP.HCM"
    },
    expectedStatus: 201,
    expectedError: null
  },
  {
    name: "2. Đăng ký thành công không có số điện thoại (optional)",
    data: {
      name: "Trần Thị B",
      email: `test${Date.now() + 1}@example.com`,
      password: "Test456",
      address: "456 Đường XYZ"
    },
    expectedStatus: 201,
    expectedError: null
  },
  {
    name: "3. Lỗi: Thiếu tên",
    data: {
      email: "test@example.com",
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Missing required fields"
  },
  {
    name: "4. Lỗi: Thiếu email",
    data: {
      name: "Test User",
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Missing required fields"
  },
  {
    name: "5. Lỗi: Thiếu mật khẩu",
    data: {
      name: "Test User",
      email: "test@example.com",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Missing required fields"
  },
  {
    name: "6. Lỗi: Thiếu địa chỉ",
    data: {
      name: "Test User",
      email: `test${Date.now() + 2}@example.com`,
      password: "Test123"
    },
    expectedStatus: 400,
    expectedError: "Vui lòng nhập địa chỉ"
  },
  {
    name: "7. Lỗi: Email không hợp lệ",
    data: {
      name: "Test User",
      email: "invalid-email",
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Email không hợp lệ"
  },
  {
    name: "8. Lỗi: Tên chứa số",
    data: {
      name: "User123",
      email: `test${Date.now() + 3}@example.com`,
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Tên không hợp lệ"
  },
  {
    name: "9. Lỗi: Tên quá ngắn (< 2 ký tự)",
    data: {
      name: "A",
      email: `test${Date.now() + 4}@example.com`,
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Tên không hợp lệ"
  },
  {
    name: "10. Lỗi: Mật khẩu quá ngắn (< 6 ký tự)",
    data: {
      name: "Test User",
      email: `test${Date.now() + 5}@example.com`,
      password: "abc",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Mật khẩu phải có ít nhất 6 ký tự"
  },
  {
    name: "11. Lỗi: Mật khẩu không có chữ hoa",
    data: {
      name: "Test User",
      email: `test${Date.now() + 6}@example.com`,
      password: "test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Mật khẩu phải có ít nhất 1 chữ hoa"
  },
  {
    name: "12. Lỗi: Mật khẩu không có số",
    data: {
      name: "Test User",
      email: `test${Date.now() + 7}@example.com`,
      password: "TestAbc",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Mật khẩu phải có ít nhất 1 chữ số"
  },
  {
    name: "13. Lỗi: Số điện thoại không hợp lệ",
    data: {
      name: "Test User",
      email: `test${Date.now() + 8}@example.com`,
      phone: "123456",
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Số điện thoại không hợp lệ"
  },
  {
    name: "14. Lỗi: Đầu số điện thoại không hợp lệ",
    data: {
      name: "Test User",
      email: `test${Date.now() + 9}@example.com`,
      phone: "0212345678",
      password: "Test123",
      address: "123 Street"
    },
    expectedStatus: 400,
    expectedError: "Số điện thoại không hợp lệ"
  }
];

// Run tests
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      console.log(`\n📝 Test: ${test.name}`);
      console.log("Data:", JSON.stringify(test.data, null, 2));

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data)
      });

      const data = await response.json();
      
      console.log(`Response Status: ${response.status}`);
      console.log("Response Data:", JSON.stringify(data, null, 2));

      // Check status
      if (response.status !== test.expectedStatus) {
        testCase(`Status: Expected ${test.expectedStatus}, got ${response.status}`, false);
        failed++;
        continue;
      }

      // Check error message if expecting error
      if (test.expectedError) {
        if (data.error === test.expectedError) {
          testCase(`Error message correct: "${data.error}"`, true);
          passed++;
        } else {
          testCase(`Error message: Expected "${test.expectedError}", got "${data.error}"`, false);
          failed++;
        }
      } else {
        // Success case - check user object
        if (data.id && data.email && data.name && !data.password) {
          testCase("User object returned without password", true);
          passed++;
        } else {
          testCase("User object invalid", false);
          failed++;
        }
      }

      // Small delay between requests
      await delay(500);

    } catch (error) {
      console.error("❌ Test failed with error:", error.message);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST RESULTS:");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${testCases.length}`);
  console.log(`🎯 Success Rate: ${((passed / testCases.length) * 100).toFixed(2)}%`);
  console.log("=".repeat(50));
}

// Test email check API
async function testEmailCheck() {
  console.log("\n\n🔍 Testing Email Check API...\n");

  const tests = [
    { email: "test@example.com", description: "Valid email format" },
    { email: "nonexistent@example.com", description: "Non-existent email" }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📧 Checking: ${test.email} (${test.description})`);
      
      const response = await fetch(`${API_URL}/api/auth/check-email?email=${encodeURIComponent(test.email)}`);
      const data = await response.json();
      
      console.log(`Response:`, data);
      testCase(`Email check returned ${data.exists ? 'exists' : 'available'}`, response.ok);
      
      await delay(500);
    } catch (error) {
      console.error("❌ Email check failed:", error.message);
    }
  }
}

// Additional: Test with Vietnamese names
async function testVietnameseNames() {
  console.log("\n\n🇻🇳 Testing Vietnamese Names...\n");

  const vietnameseNames = [
    { name: "Nguyễn Văn An", valid: true },
    { name: "Trần Thị Bích", valid: true },
    { name: "Lê Hoàng Đức", valid: true },
    { name: "Phạm Minh Châu", valid: true },
    { name: "Võ Thị Ánh", valid: true }
  ];

  for (const test of vietnameseNames) {
    try {
      console.log(`\n👤 Testing: ${test.name}`);
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: test.name,
          email: `test${Date.now()}@example.com`,
          password: "Test123",
          address: "123 Đường ABC"
        })
      });

      const data = await response.json();
      
      if (response.status === 201) {
        testCase(`Vietnamese name accepted: ${test.name}`, true);
      } else {
        testCase(`Vietnamese name rejected: ${test.name}`, false);
        console.log("Error:", data.error);
      }
      
      await delay(500);
    } catch (error) {
      console.error("❌ Test failed:", error.message);
    }
  }
}

// Run all tests
(async () => {
  try {
    console.log("🚀 Starting comprehensive API tests...\n");
    console.log("⚠️  Make sure server is running at http://localhost:3000\n");
    
    await runTests();
    await testEmailCheck();
    await testVietnameseNames();
    
    console.log("\n\n✨ All tests completed!");
    
  } catch (error) {
    console.error("💥 Fatal error:", error);
  }
})();

