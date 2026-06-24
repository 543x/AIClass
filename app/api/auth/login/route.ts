import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/session'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },  // 🔥 使用 issues
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}