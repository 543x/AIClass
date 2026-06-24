import { NextRequest, NextResponse } from 'next/server'
import { verifyPayPalWebhook } from '@/lib/payment/webhook-verify'
import { activateMembership, PRICE_MAP } from '@/lib/payment/membership'

// 🔥 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()

  // 🔥 1. 验证签名（官方 API）
  const isValid = await verifyPayPalWebhook(req, body)
  if (!isValid) {
    console.error('[webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(body)

    // 只处理支付成功事件
    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true })
    }

    const resource = event.resource
    const userId = resource.custom_id
    const transactionId = resource.id
    const eventId = event.id
    const amount = parseFloat(resource.amount?.value || '0')

    if (!userId) {
      console.error('[webhook] Missing user ID')
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    // 🔥 2. 精确价格映射（防汇率误差）
    const roundedAmount = Math.round(amount)
    const plan = PRICE_MAP[roundedAmount as keyof typeof PRICE_MAP]

    if (!plan) {
      console.error(`[webhook] Unknown amount: ${roundedAmount}`)
      return NextResponse.json({ error: 'Unknown amount' }, { status: 400 })
    }

    // 🔥 3. 激活会员（防重复逻辑在内部）
    const result = await activateMembership({
      userId,
      plan,
      transactionId,
      eventId,
      amount: Math.round(amount * 100),
    })

    if (!result.success) {
      console.log(`[webhook] Skipped: ${result.reason}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}