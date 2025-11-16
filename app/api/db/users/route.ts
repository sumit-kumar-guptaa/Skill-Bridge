import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProgress: {
          include: { problem: true },
          orderBy: { solvedAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, username, displayName } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        username,
        displayName,
      },
      create: {
        id,
        email,
        username,
        displayName,
      },
    });
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, totalSolved, successRate, currentStreak, credits } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(totalSolved !== undefined && { totalSolved }),
        ...(successRate !== undefined && { successRate }),
        ...(currentStreak !== undefined && { currentStreak }),
        ...(credits !== undefined && { credits }),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
