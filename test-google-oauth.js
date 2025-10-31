/**
 * Kiểm tra nhanh Google OAuth init route
 * Cách chạy: node test-google-oauth.js [BASE_URL]
 * Mặc định BASE_URL = http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000'

async function testGoogleInit() {
  console.log('🔎 Kiểm tra GET /api/auth/google/init')
  const resp = await fetch(`${BASE_URL}/api/auth/google/init`, {
    method: 'GET',
    redirect: 'manual', // đừng tự theo redirect
  })

  const location = resp.headers.get('location') || resp.headers.get('Location')
  console.log('Status:', resp.status)
  console.log('Location:', location)

  if (resp.status !== 307 && resp.status !== 302) {
    console.log('❌ Kỳ vọng nhận 302/307 redirect, nhưng nhận:', resp.status)
    return false
  }
  if (!location || !location.includes('accounts.google.com')) {
    console.log('❌ Location không trỏ tới Google OAuth')
    return false
  }

  const url = new URL(location)
  const clientId = url.searchParams.get('client_id')
  const redirectUri = url.searchParams.get('redirect_uri')
  const scope = url.searchParams.get('scope')

  console.log('client_id:', clientId)
  console.log('redirect_uri:', redirectUri)
  console.log('scope:', scope)

  if (!clientId) {
    console.log('❌ Thiếu client_id trong URL redirect - kiểm tra GOOGLE_CLIENT_ID')
    return false
  }
  if (!redirectUri) {
    console.log('❌ Thiếu redirect_uri trong URL redirect')
    return false
  }
  if (!scope || !scope.includes('email')) {
    console.log('❌ scope không đúng, cần bao gồm email')
    return false
  }

  console.log('✅ Init route hoạt động đúng (redirect tới Google)')
  return true
}

;(async () => {
  try {
    const ok = await testGoogleInit()
    process.exit(ok ? 0 : 1)
  } catch (e) {
    console.error('❌ Lỗi khi test:', e.message)
    process.exit(1)
  }
})()


