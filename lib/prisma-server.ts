// Prisma Client for Node.js Server
// Regular Prisma client without edge extensions for server.js

import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  })
}

declare global {
  var prismaServer: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaServer ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaServer = prisma

export default prisma
