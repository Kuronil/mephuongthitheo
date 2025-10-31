import crypto from 'crypto'
import querystring from 'querystring'
import { getEnv } from './env'

// VNPay Configuration
export const vnpayConfig = {
  vnp_TmnCode: getEnv.vnpay.tmnCode(),
  vnp_HashSecret: getEnv.vnpay.hashSecret(),
  vnp_Url: getEnv.vnpay.url(),
  vnp_ReturnUrl: getEnv.vnpay.returnUrl(),
  vnp_IpnUrl: getEnv.vnpay.ipnUrl(),
}

// Sắp xếp object theo key
export function sortObject(obj: any) {
  const sorted: any = {}
  const keys = Object.keys(obj).sort()
  keys.forEach((key) => {
    sorted[key] = obj[key]
  })
  return sorted
}

// Tạo chữ ký bảo mật
export function createSignature(params: any, secretKey: string): string {
  const sortedParams = sortObject(params)
  const signData = querystring.stringify(sortedParams, { encode: false } as any)
  const hmac = crypto.createHmac('sha512', secretKey)
  return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
}

// Tạo URL thanh toán VNPay
export function createPaymentUrl(params: {
  orderId: string
  amount: number
  orderInfo: string
  ipAddr: string
  locale?: string
  bankCode?: string
}): string {
  const date = new Date()
  const createDate = formatDate(date)
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000)) // Expire sau 15 phút

  let vnp_Params: any = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: params.locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: params.amount * 100, // VNPay yêu cầu amount * 100
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  }

  // Thêm bankCode nếu có
  if (params.bankCode) {
    vnp_Params.vnp_BankCode = params.bankCode
  }

  // Sắp xếp params và tạo secure hash
  vnp_Params = sortObject(vnp_Params)
  const signData = querystring.stringify(vnp_Params, { encode: false } as any)
  const secureHash = createSignature(vnp_Params, vnpayConfig.vnp_HashSecret)
  
  vnp_Params['vnp_SecureHash'] = secureHash

  // Tạo URL
  const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false } as any)
  
  return paymentUrl
}

// Xác thực chữ ký từ VNPay
export function verifyReturnUrl(vnp_Params: any): boolean {
  const secureHash = vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHash']
  delete vnp_Params['vnp_SecureHashType']
  
  const sortedParams = sortObject(vnp_Params)
  const signed = createSignature(sortedParams, vnpayConfig.vnp_HashSecret)
  
  return secureHash === signed
}

// Format date cho VNPay (yyyyMMddHHmmss)
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

// Parse response code từ VNPay
export function getResponseMessage(responseCode: string): string {
  const messages: { [key: string]: string } = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
    '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
  }
  
  return messages[responseCode] || 'Lỗi không xác định'
}

// Danh sách ngân hàng hỗ trợ
export const vnpayBanks = [
  { code: 'VNPAYQR', name: 'Cổng thanh toán VNPAYQR' },
  { code: 'VNBANK', name: 'Ngân hàng nội địa' },
  { code: 'INTCARD', name: 'Thẻ quốc tế' },
  { code: 'VIETCOMBANK', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
  { code: 'VIETINBANK', name: 'Ngân hàng TMCP Công thương Việt Nam' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { code: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
  { code: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { code: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
  { code: 'VPBANK', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { code: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong' },
  { code: 'MBBANK', name: 'Ngân hàng TMCP Quân đội' },
  { code: 'HDBANK', name: 'Ngân hàng TMCP Phát triển TP.HCM' },
  { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông' },
  { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội' },
  { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn' },
]

