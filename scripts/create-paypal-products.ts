// scripts/create-paypal-products.ts
import { getPayPalAccessToken, getPayPalBaseUrl } from '@/lib/paypal/client'
import fs from 'fs'
import path from 'path'

async function createProduct() {
  // 检查是否已有 Plan ID
  const monthlyPlanId = process.env.PAYPAL_PLAN_MONTHLY
  const yearlyPlanId = process.env.PAYPAL_PLAN_YEARLY

  if (monthlyPlanId && yearlyPlanId) {
    console.log('✅ PayPal products already initialized:')
    console.log(`  PAYPAL_PLAN_MONTHLY=${monthlyPlanId}`)
    console.log(`  PAYPAL_PLAN_YEARLY=${yearlyPlanId}`)
    return
  }

  console.log('🚀 Initializing PayPal products...')

  const accessToken = await getPayPalAccessToken()
  const baseUrl = getPayPalBaseUrl()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openmaic.com'

  // 创建产品
  const productRes = await fetch(`${baseUrl}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'OpenMAIC Pro',
      description: 'AI-powered interactive classroom subscription',
      type: 'SERVICE',
      category: 'SOFTWARE',
      home_url: appUrl,
    }),
  })

  if (!productRes.ok) {
    const error = await productRes.text()
    console.error('❌ Product creation failed:', error)
    return
  }

  const product = await productRes.json()
  console.log('✅ Product created:', product.id)

  const monthlyPrice = process.env.PAYPAL_MONTHLY_PRICE || '65'
  const yearlyPrice = process.env.PAYPAL_YEARLY_PRICE || '650'

  // 创建月付计划
  const monthlyPlanRes = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      product_id: product.id,
      name: 'Monthly Subscription',
      description: 'Monthly Pro subscription',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: monthlyPrice,
              currency_code: 'TWD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'TWD',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })

  if (!monthlyPlanRes.ok) {
    const error = await monthlyPlanRes.text()
    console.error('❌ Monthly plan creation failed:', error)
    return
  }

  const monthlyPlan = await monthlyPlanRes.json()
  console.log('✅ Monthly plan created:', monthlyPlan.id)

  // 创建年付计划
  const yearlyPlanRes = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      product_id: product.id,
      name: 'Yearly Subscription',
      description: 'Yearly Pro subscription (2 months free)',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'YEAR',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: yearlyPrice,
              currency_code: 'TWD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'TWD',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })

  if (!yearlyPlanRes.ok) {
    const error = await yearlyPlanRes.text()
    console.error('❌ Yearly plan creation failed:', error)
    return
  }

  const yearlyPlan = await yearlyPlanRes.json()
  console.log('✅ Yearly plan created:', yearlyPlan.id)

  // ✅ 输出环境变量配置
  console.log('\n=== 📋 Add these to your Vercel environment variables ===')
  console.log(`PAYPAL_PLAN_MONTHLY=${monthlyPlan.id}`)
  console.log(`PAYPAL_PLAN_YEARLY=${yearlyPlan.id}`)

  // ✅ 写入 .env.local 文件（仅本地开发）
  if (process.env.NODE_ENV !== 'production') {
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8')
    }
    // 更新或添加 Plan ID
    const updateEnv = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm')
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`)
      } else {
        envContent += `\n${key}=${value}`
      }
    }
    updateEnv('PAYPAL_PLAN_MONTHLY', monthlyPlan.id)
    updateEnv('PAYPAL_PLAN_YEARLY', yearlyPlan.id)
    fs.writeFileSync(envPath, envContent.trim() + '\n')
    console.log('✅ Updated .env.local with Plan IDs')
  }

  console.log('\n🎉 PayPal initialization complete!')
}

createProduct().catch(console.error)