// Prisma Client with Accelerate Extension
// Edge-optimized database access with global caching

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create Prisma client with Accelerate for edge runtime
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate())
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
