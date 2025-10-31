import { NextRequest, NextResponse } from 'next/server'
import { verifyReturnUrl, getResponseMessage } from '@/lib/vnpay'
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Lấy tất cả params từ VNPay
    const vnp_Params: any = {}
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value
    })

    console.log('VNPay Return URL params:', vnp_Params)

    // Xác thực chữ ký
    const isValid = verifyReturnUrl(vnp_Params)
    
    if (!isValid) {
      console.error('Invalid VNPay signature')
      return NextResponse.redirect(
        new URL(`/payment-result?success=false&message=Invalid signature`, req.url)
      )
    }

    const orderId = vnp_Params.vnp_TxnRef
    const responseCode = vnp_Params.vnp_ResponseCode
    const amount = parseInt(vnp_Params.vnp_Amount) / 100 // Chia 100 vì VNPay gửi amount * 100
    const transactionNo = vnp_Params.vnp_TransactionNo
    const bankCode = vnp_Params.vnp_BankCode
    const cardType = vnp_Params.vnp_CardType
    const payDate = vnp_Params.vnp_PayDate

    console.log('VNPay Payment Result:', {
      orderId,
      responseCode,
      amount,
      transactionNo,
      bankCode,
      success: responseCode === '00'
    })

    // Lấy thông tin đơn hàng
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return NextResponse.redirect(
        new URL(`/payment-result?success=false&message=Order not found`, req.url)
      )
    }

    // Kiểm tra số tiền
    if (amount !== order.total) {
      console.error(`Amount mismatch: ${amount} !== ${order.total}`)
      return NextResponse.redirect(
        new URL(`/payment-result?success=false&message=Amount mismatch`, req.url)
      )
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

      console.log(`Order ${orderId} payment successful`)

      return NextResponse.redirect(
        new URL(`/payment-result?success=true&orderId=${orderId}&message=Payment successful`, req.url)
      )
    } else {
      // Thanh toán thất bại
      const message = getResponseMessage(responseCode)
      
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status: 'AWAITING_PAYMENT', // Giữ nguyên trạng thái để có thể thanh toán lại
          vnpayResponseCode: responseCode,
          vnpayResponseMessage: message
        }
      })

      console.log(`Order ${orderId} payment failed: ${message}`)

      return NextResponse.redirect(
        new URL(`/payment-result?success=false&orderId=${orderId}&message=${encodeURIComponent(message)}`, req.url)
      )
    }

  } catch (error) {
    console.error('VNPay return URL error:', error)
    return NextResponse.redirect(
      new URL(`/payment-result?success=false&message=System error`, req.url)
    )
  }
}



