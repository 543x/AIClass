// lib/session.ts
import { cookies } from 'next/headers'
import { prisma } from './db'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'

// 定义包含 paypalSubscriptionId 的 User 类型
type User = Prisma.UserGetPayload<{}>

const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 天

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  await prisma.session.create({
    data: { token, userId, expiresAt },
  })

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return token
}

export async function getSession(): Promise<{ user: User; token: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    cookieStore.delete('session')
    return null
  }

  const newExpiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt: newExpiresAt },
  })

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return { user: session.user as User, token }
}

export async function getUser(): Promise<User | null> {
  const result = await getSession()
  return result?.user || null
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }

  cookieStore.delete('session')
}