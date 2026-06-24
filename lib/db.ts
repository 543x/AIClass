// lib/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'  // 🔥 注意大小写
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  // 生产环境使用 Turso
  if (process.env.NODE_ENV === 'production') {
    const libsql = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSql(libsql)  // 🔥 注意大小写
    return new PrismaClient({ adapter })
  }

  // 本地开发使用 SQLite
  return new PrismaClient()
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma