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
    console.error(error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '注册失败'
      },
      { status: 500 }
    )
  }
}