// Database Operations using Prisma ORM with Accelerate
// Provides type-safe database access with edge optimization

import { prisma } from './prisma';

export const db = {
  // User operations
  async getUser(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userProgress: {
          include: { problem: true },
          orderBy: { solvedAt: 'desc' },
          take: 10
        },
        userAchievements: {
          include: { achievement: true }
        }
      }
    }).withAccelerateInfo(); // Enable caching with Accelerate
  },

  async createUser(userData: {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
  }) {
    return await prisma.user.upsert({
      where: { id: userData.id },
      update: {
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
      },
      create: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
      },
    });
  },

  async updateUserProgress(userId: string, updates: {
    totalSolved?: number;
    successRate?: number;
    currentStreak?: number;
    credits?: number;
  }) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  // Competition room operations
  async createRoom(roomData: {
    id: string;
    problemId: number;
    creatorId: string;
  }) {
    return await prisma.competitionRoom.create({
      data: {
        id: roomData.id,
        problemId: roomData.problemId,
        creatorId: roomData.creatorId,
      },
    });
  },

  async joinRoom(roomId: string, userId: string, username: string) {
    const participant = await prisma.roomParticipant.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      update: {},
      create: {
        roomId,
        userId,
        username,
      },
    });

    // Update participant count
    await prisma.competitionRoom.update({
      where: { id: roomId },
      data: {
        participantCount: {
          increment: 1,
        },
      },
    });

    return participant;
  },

  async setRoomWinner(roomId: string, userId: string) {
    // Update room with winner
    await prisma.competitionRoom.update({
      where: { id: roomId },
      data: {
        winnerId: userId,
        endTime: new Date(),
        status: 'completed',
      },
    });

    // Update participant as winner
    await prisma.roomParticipant.update({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      data: {
        isWinner: true,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Award credits to winner
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: 20 },
        competitionsWon: { increment: 1 },
      },
    });
  },

  async saveRoomMessage(messageData: {
    roomId: string;
    userId?: string;
    username: string;
    message: string;
    isSystem?: boolean;
  }) {
    return await prisma.roomMessage.create({
      data: {
        roomId: messageData.roomId,
        userId: messageData.userId || null,
        username: messageData.username,
        message: messageData.message,
        isSystem: messageData.isSystem || false,
      },
    });
  },

  // Submission operations
  async saveSubmission(submissionData: {
    userId: string;
    problemId: number;
    code: string;
    language: string;
    status: string;
    testResults: any;
    isAccepted: boolean;
  }) {
    return await prisma.submission.create({
      data: {
        userId: submissionData.userId,
        problemId: submissionData.problemId,
        code: submissionData.code,
        language: submissionData.language,
        status: submissionData.status,
        testResults: submissionData.testResults,
        isAccepted: submissionData.isAccepted,
      },
    });
  },

  async getUserSubmissions(userId: string, limit = 10) {
    return await prisma.submission.findMany({
      where: { userId },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }).withAccelerateInfo();
  },

  // Leaderboard operations
  async getLeaderboard(limit = 100) {
    return await prisma.user.findMany({
      where: {
        totalSolved: { gt: 0 },
      },
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
    }).withAccelerateInfo();
  },

  // Problem operations
  async getAllProblems() {
    return await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        description: true,
        topics: true,
      },
      orderBy: { id: 'asc' },
    }).withAccelerateInfo();
  },

  async getProblemById(problemId: number) {
    return await prisma.problem.findUnique({
      where: { id: problemId },
    }).withAccelerateInfo();
  },

  // Room operations
  async getActiveRooms() {
    return await prisma.competitionRoom.findMany({
      where: { status: 'active' },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true,
          },
        },
        creator: {
          select: {
            username: true,
            displayName: true,
          },
        },
        participants: {
          select: {
            username: true,
            joinedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).withAccelerateInfo();
  },

  async getRoomMessages(roomId: string) {
    return await prisma.roomMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    }).withAccelerateInfo();
  },

  // User progress operations
  async saveUserProgress(progressData: {
    userId: string;
    problemId: number;
    language: string;
    creditsEarned: number;
  }) {
    return await prisma.userProgress.upsert({
      where: {
        userId_problemId: {
          userId: progressData.userId,
          problemId: progressData.problemId,
        },
      },
      update: {
        language: progressData.language,
        creditsEarned: progressData.creditsEarned,
      },
      create: {
        userId: progressData.userId,
        problemId: progressData.problemId,
        language: progressData.language,
        creditsEarned: progressData.creditsEarned,
      },
    });
  },
};

export default db;
