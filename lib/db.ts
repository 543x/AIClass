// lib/db.ts
import { PrismaClient } from '@prisma/client'

// 只在生产环境使用 Turso
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // 动态导入，避免本地开发报错
  const { PrismaLibSQL } = await import('@prisma/adapter-libsql')
  const { createClient } = await import('@libsql/client')
  
  const libsql = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  const adapter = new PrismaLibSQL(libsql)
  prisma = new PrismaClient({ adapter })
} else {
  prisma = new PrismaClient()
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }