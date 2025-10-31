import { NextRequest, NextResponse } from 'next/server'
import { verifyReturnUrl, getResponseMessage } from '@/lib/vnpay'
import { prisma } from "@/lib/prisma"

// IPN (Instant Payment Notification) từ VNPay
// Đây là webhook mà VNPay gọi để thông báo kết quả thanh toán
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Lấy tất cả params từ VNPay
    const vnp_Params: any = {}
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value
    })

    console.log('VNPay IPN received:', vnp_Params)

    // Xác thực chữ ký
    const isValid = verifyReturnUrl(vnp_Params)
    
    if (!isValid) {
      console.error('Invalid VNPay IPN signature')
      return NextResponse.json({
        RspCode: '97',
        Message: 'Invalid signature'
      })
    }

    const orderId = vnp_Params.vnp_TxnRef
    const responseCode = vnp_Params.vnp_ResponseCode
    const amount = parseInt(vnp_Params.vnp_Amount) / 100
    const transactionNo = vnp_Params.vnp_TransactionNo
    const bankCode = vnp_Params.vnp_BankCode
    const cardType = vnp_Params.vnp_CardType
    const payDate = vnp_Params.vnp_PayDate

    // Lấy thông tin đơn hàng
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    })

    if (!order) {
      console.error(`IPN: Order ${orderId} not found`)
      return NextResponse.json({
        RspCode: '01',
        Message: 'Order not found'
      })
    }

    // Kiểm tra số tiền
    if (amount !== order.total) {
      console.error(`IPN: Amount mismatch: ${amount} !== ${order.total}`)
      return NextResponse.json({
        RspCode: '04',
        Message: 'Amount mismatch'
      })
    }

    // Kiểm tra xem đơn hàng đã được xử lý chưa
    if (order.status === 'PAID') {
      console.log(`IPN: Order ${orderId} already processed`)
      return NextResponse.json({
        RspCode: '02',
        Message: 'Order already confirmed'
      })
    }

    // Xử lý kết quả thanh toán
    if (responseCode === '00') {
      // Thanh toán thành công
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status: 'PAID',
          paymentMethod: 'VNPAY',
          vnpayTransactionNo: transactionNo,
          vnpayBankCode: bankCode,
          vnpayCardType: cardType,
          vnpayPayDate: payDate,
          paidAt: new Date()
        }
      })

      console.log(`IPN: Order ${orderId} payment confirmed`)

      // TODO: Gửi email/SMS thông báo cho khách hàng
      // TODO: Gửi thông báo cho admin
      // TODO: Cập nhật inventory

      return NextResponse.json({
        RspCode: '00',
        Message: 'Confirm Success'
      })
    } else {
      // Thanh toán thất bại
      const message = getResponseMessage(responseCode)
      
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          vnpayResponseCode: responseCode,
          vnpayResponseMessage: message
        }
      })

      console.log(`IPN: Order ${orderId} payment failed: ${message}`)

      return NextResponse.json({
        RspCode: '00',
        Message: 'Confirm Success' // Vẫn trả về success để VNPay biết đã nhận được IPN
      })
    }

  } catch (error) {
    console.error('VNPay IPN error:', error)
    return NextResponse.json({
      RspCode: '99',
      Message: 'System error'
    })
  }
}



