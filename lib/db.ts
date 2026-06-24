// lib/db.ts

import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const libsql = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  const adapter = new PrismaLibSQL(libsql)

  // 尝试使用 driverAdapters
  prisma = new PrismaClient({
    driverAdapters: {
      adapter,
    },
  })
} else {
  prisma = new PrismaClient()
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }