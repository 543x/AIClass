import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户登录
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 2. 解析套餐
    const { plan } = await req.json();
    
    // 直接使用产品 UUID 构建结账链接
    const productUuid = plan === 'monthly'
      ? process.env.LEMON_MONTHLY_UUID
      : process.env.LEMON_YEARLY_UUID;

    if (!productUuid) {
      return NextResponse.json({ error: '产品配置错误' }, { status: 500 });
    }

    // 3. 构建结账链接
    // 格式: https://{storeId}.lemonsqueezy.com/checkout/buy/{productUuid}
    const checkoutUrl = `https://openmaic.lemonsqueezy.com/checkout/buy/${productUuid}`;

    // 🔥 注意：如果需要在结账时传递用户 ID，可以使用 Lemon Squeezy 的 custom 参数
    // 目前你的产品链接是固定的，用户付款后需要通过 Webhook 关联用户
    
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[Lemon] Error:', error);
    return NextResponse.json(
      { error: '支付初始化失败，请稍后重试' },
      { status: 500 }
    );
  }
}