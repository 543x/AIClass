import { NextRequest, NextResponse } from 'next/server'
import paypal from '@paypal/checkout-server-sdk'
import { getPaypalClient } from '@/lib/payment/paypal'
import { getUser } from '@/lib/session'
import { isPro, PRICE_MAP } from '@/lib/payment/membership'

const PRICES = {
  monthly: 65,
  yearly: 650,
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const alreadyPro = await isPro(user.id)
    if (alreadyPro) {
      return NextResponse.json({ error: '您已是 Pro 会员' }, { status: 400 })
    }

    const { plan } = await req.json()
    if (!plan || !PRICES[plan as keyof typeof PRICES]) {
      return NextResponse.json({ error: '无效套餐' }, { status: 400 })
    }

    const amount = PRICES[plan as keyof typeof PRICES]
    const client = getPaypalClient()

    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'TWD',
            value: amount.toString(),
          },
          custom_id: user.id,
          description: `OpenMAIC ${plan === 'yearly' ? '年度' : '月度'}会员`,
        },
      ],
      application_context: {
        brand_name: 'OpenMAIC',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      },
    })

    const order = await client.execute(request)
    const approvalUrl = order.result.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href

    if (!approvalUrl) {
      throw new Error('No approval URL found')
    }

    return NextResponse.json({
      orderId: order.result.id,
      approvalUrl,
    })
  } catch (error) {
    console.error('[payment/create] Error:', error)
    return NextResponse.json(
      { error: '创建订单失败，请稍后重试' },
      { status: 500 }
    )
  }
}