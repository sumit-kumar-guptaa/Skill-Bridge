// Database Verification Script
// Verifies Prisma database connection

// Load environment variables FIRST before any imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Verifying database connection...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.error('Current directory:', process.cwd());
    process.exit(1);
  }
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    console.log('\n📝 Database schema is managed by Prisma migrations.');
    console.log('   Run: npx prisma migrate dev');
    console.log('\nYour database is ready to use! 🎉');
  } catch (error) {
    console.error('\n❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
