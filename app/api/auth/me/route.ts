import { NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { checkSubscription, getUsageToday } from '@/lib/auth'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  const subscription = await checkSubscription(user.id)
  const usageToday = await getUsageToday(user.id)
  const limit = parseInt(process.env.FREE_DAILY_LIMIT || '5')

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isPro: !!subscription,
      usageToday,
      remainingToday: Math.max(0, limit - usageToday),
      plan: subscription?.plan || 'free',
    },
  })
}