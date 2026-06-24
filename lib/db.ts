// lib/db.ts

import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  if (process.env.NODE_ENV === 'production') {
    // ✅ 生产环境直接使用 PrismaClient，不传 adapter
    // DATABASE_URL 使用 libsql 的 postgresql 兼容连接串
    return new PrismaClient()
  }

  return new PrismaClient()
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}