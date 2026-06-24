import { NextRequest } from 'next/server'

/**
 * 🔥 获取 PayPal Access Token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(
    process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com/v1/oauth2/token'
      : 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    }
  )

  const data = await response.json()
  return data.access_token
}

/**
 * 🔥 验证 PayPal Webhook 签名（官方 API）
 */
export async function verifyPayPalWebhook(
  req: NextRequest,
  body: string
): Promise<boolean> {
  try {
    const headers = Object.fromEntries(req.headers)

    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      console.error('[webhook] Missing PAYPAL_WEBHOOK_ID')
      return false
    }

    const accessToken = await getPayPalAccessToken()
    const event = JSON.parse(body)

    const response = await fetch(
      process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com/v1/notifications/verify-webhook-signature'
        : 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: event,
        }),
      }
    )

    const data = await response.json()
    return data.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('[webhook] Verification error:', error)
    return false
  }
}