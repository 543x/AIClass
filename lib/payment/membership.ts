import { prisma } from '@/lib/db'

const PLAN_DURATION = {
  monthly: 30,
  yearly: 365,
}

const PRICE_MAP = {
  65: 'monthly',
  650: 'yearly',
} as const

export type Plan = keyof typeof PLAN_DURATION
export type PriceKey = keyof typeof PRICE_MAP

/**
 * 🔥 激活会员（唯一入口）
 * 防重复、防篡改、统一处理
 */
export async function activateMembership({
  userId,
  plan,
  transactionId,
  eventId,
  amount,
}: {
  userId: string
  plan: Plan
  transactionId: string
  eventId: string
  amount: number
}) {
  // 1. 防重复事件（Webhook 重试防护）
  if (eventId) {
    const eventExists = await prisma.payment.findUnique({
      where: { eventId },
    })
    if (eventExists) {
      console.log(`[membership] Duplicate event: ${eventId}`)
      return { success: false, reason: 'duplicate_event' }
    }
  }

  // 2. 防重复交易
  const exists = await prisma.payment.findUnique({
    where: { providerId: transactionId },
  })
  if (exists) {
    console.log(`[membership] Duplicate transaction: ${transactionId}`)
    return { success: false, reason: 'duplicate_transaction' }
  }

  // 3. 计算天数
  const days = PLAN_DURATION[plan]
  const now = new Date()

  // 4. 检查现有会员（取最晚到期日）
  const existingActive = await prisma.payment.findFirst({
    where: {
      userId,
      status: 'paid',
      endDate: { gt: now },
    },
    orderBy: { endDate: 'desc' },
  })

  // 🔥 修复：基于最晚到期日延长，防止重复叠加
  const baseDate = existingActive?.endDate && existingActive.endDate > now
    ? existingActive.endDate
    : now

  const finalEndDate = new Date(baseDate)
  finalEndDate.setDate(finalEndDate.getDate() + days)

  // 5. 创建支付记录
  await prisma.payment.create({
    data: {
      userId,
      plan,
      status: 'paid',
      provider: 'paypal',
      providerId: transactionId,
      eventId: eventId || undefined,
      amount,
      currency: 'twd',
      endDate: finalEndDate,
    },
  })

  console.log(`[membership] Activated: user=${userId}, plan=${plan}, end=${finalEndDate.toISOString()}`)
  return { success: true, endDate: finalEndDate }
}

/**
 * 检查用户是否为 Pro 会员
 */
export async function isPro(userId: string): Promise<boolean> {
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      status: 'paid',
      endDate: { gt: new Date() },
    },
    orderBy: { endDate: 'desc' },
  })
  return !!payment
}

/**
 * 获取用户当前会员信息
 */
export async function getMembership(userId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      status: 'paid',
      endDate: { gt: new Date() },
    },
    orderBy: { endDate: 'desc' },
  })

  // ✅ 添加空值检查
  if (!payment || !payment.endDate) {
    return { isPro: false, plan: 'free', endDate: null, remainingDays: 0 }
  }

  const remainingDays = Math.ceil(
    (payment.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return {
    isPro: true,
    plan: payment.plan,
    endDate: payment.endDate,
    remainingDays: remainingDays > 0 ? remainingDays : 0,
  }
}

export { PLAN_DURATION, PRICE_MAP }