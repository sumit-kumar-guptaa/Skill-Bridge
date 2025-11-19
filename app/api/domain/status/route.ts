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

// Domain problem counts (based on your assignments)
const DOMAIN_PROBLEM_COUNTS = {
  'SDE': 20, // Adjust based on actual count in sdeSheetProblems
  'ML': 20,  // mlEngineerProblems
  'AI': 20,  // aiEngineerProblems
  'DevOps': 20 // devOpsProblems
};

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user's domain status
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        selectedDomain: true,
        domainStartedAt: true,
        completedDomains: true
      }
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: '' // Will be populated later
        },
        select: {
          selectedDomain: true,
          domainStartedAt: true,
          completedDomains: true
        }
      });
      
      return NextResponse.json({
        hasSelectedDomain: false,
        selectedDomain: null,
        completedDomains: [],
        availableDomains: ['SDE', 'ML', 'AI', 'DevOps'],
        message: 'Please select a domain to start your learning journey'
      });
    }

    // Get solved problems count for current domain
    const solvedInCurrentDomain = await prisma.userProgress.count({
      where: {
        userId,
        problem: {
          domain: user.selectedDomain || undefined
        }
      }
    });

    const currentDomain = user.selectedDomain;
    const requiredProblems = currentDomain ? DOMAIN_PROBLEM_COUNTS[currentDomain as keyof typeof DOMAIN_PROBLEM_COUNTS] : 0;
    const isCurrentDomainComplete = currentDomain && solvedInCurrentDomain >= requiredProblems;

    // Determine locked domains
    const allDomains = ['SDE', 'ML', 'AI', 'DevOps'];
    const completedDomains = user.completedDomains || [];
    const lockedDomains = allDomains.filter(d => 
      d !== currentDomain && !completedDomains.includes(d)
    );

    return NextResponse.json({
      hasSelectedDomain: !!user.selectedDomain,
      selectedDomain: user.selectedDomain,
      domainStartedAt: user.domainStartedAt,
      completedDomains,
      lockedDomains,
      availableDomains: completedDomains,
      currentProgress: {
        solved: solvedInCurrentDomain,
        required: requiredProblems,
        percentage: requiredProblems > 0 ? Math.round((solvedInCurrentDomain / requiredProblems) * 100) : 0,
        isComplete: isCurrentDomainComplete
      },
      canSwitchDomain: isCurrentDomainComplete
    });

  } catch (error) {
    console.error('Error getting domain status:', error);
    return NextResponse.json({ error: 'Failed to get domain status' }, { status: 500 });
  }
}
