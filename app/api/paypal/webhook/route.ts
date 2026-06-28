// app/api/paypal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPayPalAccessToken, getPayPalBaseUrl, getPayPalWebhookId, getPayPalPlanId } from '@/lib/paypal/client'
import { createLogger } from '@/lib/logger'

const log = createLogger('paypal-webhook')

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headers = req.headers
    const event = JSON.parse(body)
    
    const eventId = event.id
    const eventType = event.event_type || event.eventType
    
    if (!eventType) {
      log.error('Webhook missing event type:', event)
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
    }

    // 防止重复处理
    if (eventId) {
      const existing = await prisma.payment.findUnique({
        where: { eventId },
      })
      if (existing) {
        log.info(`Duplicate webhook event ${eventId}, skipping`)
        return NextResponse.json({ received: true, duplicate: true })
      }
    }

    // Webhook 签名验证
    const webhookId = getPayPalWebhookId()
    const accessToken = await getPayPalAccessToken()
    const baseUrl = getPayPalBaseUrl()
    const getHeader = (key: string) => headers.get(key) || ''

    const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: getHeader('paypal-auth-algo'),
        cert_url: getHeader('paypal-cert-url'),
        transmission_id: getHeader('paypal-transmission-id'),
        transmission_sig: getHeader('paypal-transmission-sig'),
        transmission_time: getHeader('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    })

    const verifyData = await verifyRes.json()
    if (verifyData.verification_status !== 'SUCCESS') {
      log.warn('Webhook verification failed:', verifyData)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    log.info(`Webhook received: ${eventType}, id: ${eventId}`)

    const resource = event.resource
    
    // 安全获取 subscriptionId
    const subscriptionId =
      resource.id ||
      resource.billing_agreement_id ||
      resource.subscription_id ||
      resource.subscription?.id

    // 安全获取 planId
    const planId =
      resource.plan_id ||
      resource.plan?.id ||
      resource.plan_overridden?.plan_id ||
      resource.billing_agreement?.plan?.id

    // 从 custom_id 获取 userId
    let userId = resource.custom_id || null
    
    if (!userId && resource.subscriber?.email_address) {
      const user = await prisma.user.findUnique({
        where: { email: resource.subscriber.email_address },
      })
      if (user) userId = user.id
    }

    if (!userId && subscriptionId) {
      const user = await prisma.user.findFirst({
        where: { paypalSubscriptionId: subscriptionId },
      })
      if (user) userId = user.id
    }

    if (!userId) {
      log.warn(`User not found for webhook: ${eventId}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (eventType) {
      case 'PAYMENT.SALE.COMPLETED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        let plan = 'monthly'
        if (planId) {
          const monthlyPlanId = getPayPalPlanId('monthly')
          const yearlyPlanId = getPayPalPlanId('yearly')
          if (planId === yearlyPlanId) {
            plan = 'yearly'
          } else if (planId === monthlyPlanId) {
            plan = 'monthly'
          }
        }

        const now = new Date()
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + (plan === 'yearly' ? 12 : 1))

        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { 
              membership: plan as 'monthly' | 'yearly',
              paypalSubscriptionId: subscriptionId,
            },
          }),
          prisma.payment.updateMany({
            where: {
              userId: userId,
              providerId: subscriptionId,
              status: 'pending',
            },
            data: {
              status: 'active',
              endDate,
              eventId,
            },
          }),
        ])

        log.info(`Membership activated for user ${userId}: ${plan}`)
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: {
              userId: userId,
              providerId: subscriptionId,
              status: 'active',
            },
            data: { 
              status: 'cancelled',
              eventId,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { paypalSubscriptionId: null },
          }),
        ])
        log.info(`Subscription cancelled for user ${userId}`)
        break
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { membership: 'free' },
          }),
          prisma.payment.updateMany({
            where: {
              userId: userId,
              providerId: subscriptionId,
              status: { in: ['active', 'cancelled'] },
            },
            data: { 
              status: 'expired',
              eventId,
            },
          }),
        ])
        log.info(`Membership expired for user ${userId}`)
        break
      }

      case 'PAYMENT.SALE.REFUNDED': {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { membership: 'free', paypalSubscriptionId: null },
          }),
          prisma.payment.updateMany({
            where: {
              userId: userId,
              providerId: subscriptionId,
              status: 'active',
            },
            data: { 
              status: 'refunded',
              eventId,
            },
          }),
        ])
        log.info(`Membership revoked due to refund for user ${userId}`)
        break
      }

      default:
        log.info(`Unhandled webhook event: ${eventType}`)
        if (eventId && subscriptionId) {
          await prisma.payment.updateMany({
            where: {
              userId: userId,
              providerId: subscriptionId,
            },
            data: { eventId },
          })
        }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    log.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}