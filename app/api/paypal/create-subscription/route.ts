// app/api/paypal/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getPayPalAccessToken, getPayPalBaseUrl, getPayPalPlanId } from '@/lib/paypal/client'
import { createLogger } from '@/lib/logger'

const log = createLogger('paypal-create-subscription')

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await req.json()
    const { planType = 'monthly', returnUrl, cancelUrl } = body

    const planId = getPayPalPlanId(planType)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openmaic.com'

    const accessToken = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()

    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: user.id,
        application_context: {
          return_url: returnUrl || `${appUrl}/payment/success`,
          cancel_url: cancelUrl || `${appUrl}/payment/cancel`,
          user_action: 'SUBSCRIBE_NOW',
          brand_name: 'OpenMAIC',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      log.error('PayPal create subscription error:', error)
      return NextResponse.json(
        { error: '创建订阅失败，请稍后重试' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    await prisma.payment.create({
      data: {
        userId: user.id,
        plan: planType,
        status: 'pending',
        provider: 'paypal',
        providerId: data.id,
        amount: Number(planType === 'yearly' 
          ? process.env.PAYPAL_YEARLY_PRICE || '650' 
          : process.env.PAYPAL_MONTHLY_PRICE || '65'),
        currency: 'TWD',
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { paypalSubscriptionId: data.id },
    })

    const approvalLink = data.links?.find((link: any) => link.rel === 'approve')?.href
    if (!approvalLink) {
      log.error('No approval link found:', data)
      return NextResponse.json(
        { error: '无法获取支付链接' },
        { status: 500 }
      )
    }

    log.info(`Subscription created for user ${user.id}: ${data.id}`)
    return NextResponse.json({
      subscriptionId: data.id,
      approvalUrl: approvalLink,
    })
  } catch (error) {
    log.error('Create subscription error:', error)
    return NextResponse.json(
      { error: '创建订阅失败，请稍后重试' },
      { status: 500 }
    )
  }
}