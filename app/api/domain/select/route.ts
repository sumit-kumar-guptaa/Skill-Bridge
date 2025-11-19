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

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await req.json();

    // Validate domain
    const validDomains = ['SDE', 'ML', 'AI', 'DevOps'];
    if (!validDomains.includes(domain)) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }

    // Check if user already has a selected domain (upsert will handle non-existent users)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { selectedDomain: true, completedDomains: true }
    });

    if (existingUser?.selectedDomain) {
      return NextResponse.json({ 
        error: 'You already have an active domain. Complete all assignments before switching.',
        currentDomain: existingUser.selectedDomain
      }, { status: 400 });
    }

    // Set the selected domain (create user if doesn't exist)
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        selectedDomain: domain,
        domainStartedAt: new Date()
      },
      create: {
        id: userId,
        email: '', // Will be populated later
        selectedDomain: domain,
        domainStartedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      domain: user.selectedDomain,
      message: `Domain ${domain} selected! Complete all assignments to unlock other domains.`
    });

  } catch (error) {
    console.error('Error selecting domain:', error);
    return NextResponse.json({ error: 'Failed to select domain' }, { status: 500 });
  }
}
