import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Prisma migrations handle schema creation
    // This endpoint just verifies database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection verified. Schema is managed by Prisma migrations.' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
