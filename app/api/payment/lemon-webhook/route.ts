import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';

    // 1. 验证 Webhook 签名
    const secret = process.env.LEMON_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Lemon Webhook] Missing secret');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[Lemon Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. 解析事件
    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;

    console.log(`[Lemon Webhook] Received: ${eventName}`);

    // 3. 处理订单创建事件
    if (eventName === 'order_created') {
      const order = event.data;
      const userId = order.attributes?.custom_data;
      const variantId = order.attributes?.first_order_item?.product_variant_id;

      if (!userId || !variantId) {
        console.error('[Lemon Webhook] Missing userId or variantId');
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      }

      // 判断套餐类型（根据你的 Price ID 判断）
      const monthlyPriceId = process.env.LEMON_MONTHLY_PRICE_ID;
      const yearlyPriceId = process.env.LEMON_YEARLY_PRICE_ID;

      let plan = 'monthly';
      // 注意：variantId 是产品变体 ID，不是 Price ID，需要根据实际情况调整
      // 这里简化处理，实际可以根据订单金额判断
      const amount = order.attributes?.total_usd || 0;
      if (amount >= 20) {
        plan = 'yearly';
      }

      // 计算会员到期日
      const now = new Date();
      const endDate = new Date(now);
      if (plan === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // 保存支付记录（激活会员）
      await prisma.payment.create({
        data: {
          userId,
          plan: plan === 'yearly' ? 'pro_yearly' : 'pro_monthly',
          status: 'paid',
          provider: 'lemonsqueezy',
          providerId: order.id,
          amount: Math.round(amount * 100),
          currency: 'usd',
          endDate,
        },
      });

      console.log(`[Lemon Webhook] Activated membership for user ${userId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Lemon Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}