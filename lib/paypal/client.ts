// lib/paypal/client.ts
import { createLogger } from '@/lib/logger'

const log = createLogger('paypal-client')

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const env = process.env.PAYPAL_ENV || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const baseUrl = env === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    log.error('PayPal token error:', error)
    throw new Error(`Failed to get PayPal token: ${response.status}`)
  }

  const data = await response.json()
  
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }

  log.info('PayPal access token obtained')
  return data.access_token
}

export function getPayPalBaseUrl(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function getPayPalWebhookId(): string {
  const id = process.env.PAYPAL_WEBHOOK_ID
  if (!id) {
    throw new Error('PAYPAL_WEBHOOK_ID not configured')
  }
  return id
}

export function getPayPalPlanId(planType: 'monthly' | 'yearly'): string {
  const id = planType === 'yearly'
    ? process.env.PAYPAL_PLAN_YEARLY
    : process.env.PAYPAL_PLAN_MONTHLY
  if (!id) {
    throw new Error(`PAYPAL_PLAN_${planType.toUpperCase()} not configured`)
  }
  return id
}