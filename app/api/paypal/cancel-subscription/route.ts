// app/api/paypal/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getPayPalAccessToken, getPayPalBaseUrl } from '@/lib/paypal/client'
import { createLogger } from '@/lib/logger'

const log = createLogger('paypal-cancel-subscription')

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    // ✅ 现在 user.paypalSubscriptionId 存在了
    if (!user.paypalSubscriptionId) {
      return NextResponse.json({ error: '没有找到订阅' }, { status: 404 })
    }

    const accessToken = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()

    const response = await fetch(
      `${baseUrl}/v1/billing/subscriptions/${user.paypalSubscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'User requested cancellation',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      log.error('PayPal cancel error:', error)
      return NextResponse.json(
        { error: '取消订阅失败，请稍后重试' },
        { status: response.status }
      )
    }

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: {
          userId: user.id,
          providerId: user.paypalSubscriptionId,
          status: 'active',
        },
        data: { status: 'cancelled' },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { paypalSubscriptionId: null },
      }),
    ])

    log.info(`Subscription cancelled for user ${user.id}`)
    return NextResponse.json({ 
      success: true,
      message: '已取消续费，当前权益不受影响',
    })
  } catch (error) {
    log.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: '取消订阅失败，请稍后重试' },
      { status: 500 }
    )
  }
}