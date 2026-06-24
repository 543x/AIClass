import { getUser } from './session'
import { prisma } from './db'

export async function checkSubscription(userId: string) {
  return await prisma.payment.findFirst({
    where: {
      userId,
      status: 'paid',
      endDate: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getUsageToday(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 🔥 直接用 count，不需要 sum
  const count = await prisma.usage.count({
    where: {
      userId,
      createdAt: { gte: today, lt: tomorrow },
    },
  })

  return count
}

export async function incrementUsage(userId: string): Promise<void> {
  await prisma.usage.create({
    data: { userId },
  })
}

export async function canGenerate(userId: string): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
  const sub = await checkSubscription(userId)
  if (sub) {
    return { allowed: true, remaining: Infinity, isPro: true }
  }

  const used = await getUsageToday(userId)
  const limit = parseInt(process.env.FREE_DAILY_LIMIT || '5')
  const remaining = Math.max(0, limit - used)

  return {
    allowed: remaining > 0,
    remaining,
    isPro: false,
  }
}