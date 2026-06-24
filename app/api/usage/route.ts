import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/session'
import { canGenerate, incrementUsage, getUsageToday } from '@/lib/auth'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const used = await getUsageToday(user.id)
  const limit = parseInt(process.env.FREE_DAILY_LIMIT || '5')

  return NextResponse.json({
    usedToday: used,
    limit,
    remaining: Math.max(0, limit - used),
  })
}

export async function POST() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { allowed, remaining, isPro } = await canGenerate(user.id)
  if (!allowed) {
    return NextResponse.json({
      error: '今日免费次数已用完',
      remaining: 0,
      isPro: false,
    }, { status: 429 })
  }

  await incrementUsage(user.id)

  return NextResponse.json({
    success: true,
    remaining: remaining - 1,
    isPro,
  })
}