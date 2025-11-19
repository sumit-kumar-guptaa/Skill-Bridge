import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const DOMAIN_PROBLEM_COUNTS = {
  'SDE': 20,
  'ML': 20,
  'AI': 20,
  'DevOps': 20
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current domain
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        selectedDomain: true,
        completedDomains: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.selectedDomain) {
      return NextResponse.json({ error: 'No active domain' }, { status: 400 });
    }

    // Verify user has solved all problems in current domain
    const solvedCount = await prisma.userProgress.count({
      where: {
        userId,
        problem: {
          domain: user.selectedDomain
        }
      }
    });

    const requiredCount = DOMAIN_PROBLEM_COUNTS[user.selectedDomain as keyof typeof DOMAIN_PROBLEM_COUNTS];

    if (solvedCount < requiredCount) {
      return NextResponse.json({
        error: `You need to solve ${requiredCount - solvedCount} more problems to complete this domain`,
        solved: solvedCount,
        required: requiredCount
      }, { status: 400 });
    }

    // Mark domain as completed
    const completedDomains = [...(user.completedDomains || []), user.selectedDomain];
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        completedDomains,
        selectedDomain: null, // Clear selected domain so user can pick next one
        credits: { increment: 500 } // Bonus credits for completing a domain!
      }
    });

    return NextResponse.json({
      success: true,
      completedDomain: user.selectedDomain,
      completedDomains,
      bonusCredits: 500,
      message: `🎉 Congratulations! You've mastered ${user.selectedDomain}! +500 bonus credits!`,
      nextAction: 'Select your next domain to continue learning'
    });

  } catch (error) {
    console.error('Error completing domain:', error);
    return NextResponse.json({ error: 'Failed to complete domain' }, { status: 500 });
  }
}
