// lib/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  if (process.env.NODE_ENV === 'production') {
    const libsql = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)

    // ✅ 使用 as any 绕过类型检查
    return new PrismaClient({
      adapter: adapter as any,
    } as any) as PrismaClient
  }

  return new PrismaClient()
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}