import paypal from '@paypal/checkout-server-sdk'

function getEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  if (process.env.PAYPAL_MODE === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

export function getPaypalClient() {
  return new paypal.core.PayPalHttpClient(getEnvironment())
}