// lib/db.ts

import { PrismaClient } from '@prisma/client'
import { createLogger } from './logger'

const log = createLogger('db')

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  try {
    log.info(`Creating PrismaClient in ${process.env.NODE_ENV} mode`)
    log.info(`DATABASE_URL: ${process.env.DATABASE_URL ? '✓ set' : '✗ missing'}`)
    
    if (process.env.NODE_ENV === 'production') {
      // 生产环境直接使用 PrismaClient
      return new PrismaClient({
        log: ['error', 'warn'],
      })
    }

    return new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  } catch (error) {
    log.error('Failed to create PrismaClient:', error)
    throw error
  }
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}