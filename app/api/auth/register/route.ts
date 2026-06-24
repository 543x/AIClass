import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/session'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { email, password, nickname } =
      registerSchema.parse(body)

    const exists = await prisma.user.findUnique({
      where: { email }
    })

    if (exists) {
      return NextResponse.json(
        { error: '邮箱已存在' },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        nickname: nickname ?? email.split('@')[0]
      }
    })

    // await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname
      }
    })
  } catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.issues[0].message },  // 🔥 改为 issues
      { status: 400 }
    )
  }
  return NextResponse.json(
    { error: '注册失败，请稍后重试' },
    { status: 500 }
  )
}
}