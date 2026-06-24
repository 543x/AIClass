// lib/db.ts

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'  // ✅ 导入时是大写 "SQL"
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

    const adapter = new PrismaLibSQL(libsql)  // ✅ 使用时要保持一致，也是大写 "SQL"

    return new PrismaClient({
      adapter,
    })
  }

  return new PrismaClient()
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}