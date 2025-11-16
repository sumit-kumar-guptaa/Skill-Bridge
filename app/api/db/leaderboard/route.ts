import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const leaderboard = await prisma.user.findMany({
      where: { totalSolved: { gt: 0 } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        credits: true,
        totalSolved: true,
        competitionsWon: true,
        currentStreak: true,
        successRate: true,
      },
      orderBy: [
        { credits: 'desc' },
        { totalSolved: 'desc' },
      ],
      take: limit,
    });
    
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
