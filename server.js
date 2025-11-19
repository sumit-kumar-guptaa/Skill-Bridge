// Custom Server for Next.js with Socket.IO
require('dotenv').config({ path: '.env.local' });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prisma client for database operations using direct connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

// Competition Room State (in-memory cache + database)
const rooms = new Map();

// Database helper functions using Prisma
async function createRoomInDB(roomId, problemId, creatorId) {
  try {
    await prisma.competitionRoom.create({
      data: {
        id: roomId,
        problemId: problemId,
        creatorId: creatorId,
      },
    });
  } catch (error) {
    console.error('Error creating room in DB:', error);
  }
}

async function saveRoomParticipant(roomId, userId, userName) {
  try {
    await prisma.roomParticipant.upsert({
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
        username: userName,
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
  } catch (error) {
    console.error('Error saving room participant:', error);
  }
}

async function setRoomWinner(roomId, userId) {
  try {
    await prisma.competitionRoom.update({
      where: { id: roomId },
      data: {
        winnerId: userId,
        endTime: new Date(),
        status: 'completed',
      },
    });

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

    // Note: Credits are now awarded in submit-solution handler (100 for winner)
    console.log(`✅ Room ${roomId} winner set to ${userId}`);
  } catch (error) {
    console.error('Error setting room winner:', error);
  }
}

async function saveRoomMessage(roomId, userId, userName, message, isSystem = false) {
  try {
    await prisma.roomMessage.create({
      data: {
        roomId,
        userId: userId || null,
        username: userName,
        message,
        isSystem,
      },
    });
  } catch (error) {
    console.error('Error saving room message:', error);
  }
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function serializeRoom(room) {
  return {
    id: room.id,
    problemId: room.problemId,
    participants: Array.from(room.participants.values()).map(p => ({
      userId: p.userId,
      userName: p.userName,
      joinedAt: p.joinedAt,
      completed: p.completed,
      completedAt: p.completedAt,
    })),
    startTime: room.startTime,
    winner: room.winner,
  };
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO with proper CORS configuration
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.103:3000',
        'http://192.168.88.1:3000',
        'http://192.168.144.1:3000',
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/, // Any local IP
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Handshake / connectivity verification
    socket.on('handshake', (data) => {
      socket.emit('handshake-ack', {
        receivedAt: new Date().toISOString(),
        serverId: socket.id,
        echo: data || null
      });
    });

    // Heartbeat ping/pong for client connectivity monitoring
    socket.on('client-ping', (payload) => {
      socket.emit('server-pong', {
        ts: Date.now(),
        serverId: socket.id,
        echo: payload?.ts || null
      });
    });

    // Create Competition Room
    socket.on('create-room', async ({ problemId, userId, userName }) => {
      const roomId = generateRoomId();
      const room = {
        id: roomId,
        problemId,
        participants: new Map(),
        startTime: Date.now(),
        winner: null,
        solutions: new Map(),
      };

      const participant = {
        userId,
        userName,
        socketId: socket.id,
        joinedAt: Date.now(),
        completed: false,
      };

      room.participants.set(userId, participant);
      rooms.set(roomId, room);
      socket.join(roomId);

      // Save to database
      await createRoomInDB(roomId, problemId, userId);
      await saveRoomParticipant(roomId, userId, userName);
      await saveRoomMessage(roomId, null, 'System', `${userName} created the room`, true);

      socket.emit('room-created', { roomId, room: serializeRoom(room) });
      console.log(`🏠 Room ${roomId} created by ${userName}`);
    });

    // Join Competition Room
    socket.on('join-room', async ({ roomId, userId, userName }) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.participants.has(userId)) {
        socket.emit('error', { message: 'Already in room' });
        return;
      }

      const participant = {
        userId,
        userName,
        socketId: socket.id,
        joinedAt: Date.now(),
        completed: false,
      };

      room.participants.set(userId, participant);
      socket.join(roomId);

      // Save to database
      await saveRoomParticipant(roomId, userId, userName);
      await saveRoomMessage(roomId, null, 'System', `${userName} joined the room`, true);

      // Notify all participants
      io.to(roomId).emit('participant-joined', {
        participant: {
          userId: participant.userId,
          userName: participant.userName,
          joinedAt: participant.joinedAt,
          completed: participant.completed,
        },
        room: serializeRoom(room),
      });

      socket.emit('room-joined', { room: serializeRoom(room) });
      console.log(`👤 ${userName} joined room ${roomId}`);
    });

    // Code Update (Real-time sync)
    socket.on('code-update', ({ roomId, code, userId }) => {
      socket.to(roomId).emit('code-synced', { code, userId });
    });

    // Submit Solution
    socket.on('submit-solution', async ({ roomId, userId, code, language, testResults }) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const participant = room.participants.get(userId);
      if (!participant) {
        socket.emit('error', { message: 'Not in room' });
        return;
      }

      try {
        // Get problemId from room's database record
        const roomData = await prisma.competitionRoom.findUnique({
          where: { id: roomId },
          select: { problemId: true }
        });

        const problemId = roomData?.problemId;
        // Derive test stats robustly
        const resultsArray = Array.isArray(testResults?.results) ? testResults.results : [];
        const totalTests = testResults.totalTests || resultsArray.length;
        const passedTests = testResults.passedTests || resultsArray.filter(r => r.passed).length;
        const allPassed = typeof testResults.allPassed === 'boolean' ? testResults.allPassed : (totalTests > 0 && passedTests === totalTests);

        // 1. Create Submission record in database
        const submission = await prisma.submission.create({
          data: {
            userId,
            problemId: problemId || 1, // Fallback to problem 1 if not set
            code,
            language,
            status: allPassed ? 'Accepted' : 'Failed',
            runtime: testResults.runtime || null,
            memory: testResults.memory || null,
            testResults: {
              allPassed,
              passedTests,
              totalTests,
              results: resultsArray
            },
            isAccepted: allPassed
          }
        });

        console.log(`✅ Submission saved: ID=${submission.id}, User=${userId}, Passed=${allPassed}`);

        // Save to in-memory room state
        const solution = {
          userId,
          code,
          language,
          submittedAt: Date.now(),
          passed: allPassed,
          passedTests,
          totalTests
        };
        room.solutions.set(userId, solution);

        // 2. Calculate credits based on outcome
        let creditsEarned = 0;
        let isWinner = false;

        // Check if this is the first correct solution (WINNER)
        if (allPassed && !room.winner) {
          room.winner = userId;
          participant.completed = true;
          participant.completedAt = Date.now();
          isWinner = true;
          creditsEarned = 100; // Winner gets 100 credits

          // Save winner to database
          await setRoomWinner(roomId, userId);

          // Update user stats for winning
          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: { increment: creditsEarned },
              totalSolved: { increment: 1 },
              totalCompetitions: { increment: 1 },
              competitionsWon: { increment: 1 }
            }
          });

          // Create/Update UserProgress for winner
          if (problemId) {
            await prisma.userProgress.upsert({
              where: {
                userId_problemId: { userId, problemId }
              },
              update: {
                language,
                executionTime: testResults.runtime || null,
                creditsEarned: 100
              },
              create: {
                userId,
                problemId,
                language,
                executionTime: testResults.runtime || null,
                creditsEarned: 100
              }
            });
          }

          // Announce winner to all participants
          io.to(roomId).emit('winner-declared', {
            winner: {
              userId,
              userName: participant.userName,
              timeToComplete: (Date.now() - room.startTime) / 1000,
              creditsEarned: 100
            },
          });

          // Emit success animation for winner
          socket.emit('submission-success', {
            isWinner: true,
            creditsEarned: 100,
            testsPassed: passedTests,
            totalTests,
            message: '🏆 YOU WON! First to solve!',
            animationType: 'winner' // Trigger confetti animation
          });

          await saveRoomMessage(roomId, null, 'System', `🏆 ${participant.userName} won the competition!`, true);
          console.log(`🏆 ${participant.userName} won room ${roomId} - Earned 100 credits`);

        } else if (allPassed) {
          // Non-winner but passed all tests
          participant.completed = true;
          participant.completedAt = Date.now();
          creditsEarned = 50; // Non-winners get 50 credits for solving

          // Update user stats for completing problem
          await prisma.user.update({
            where: { id: userId },
            data: {
              credits: { increment: creditsEarned },
              totalSolved: { increment: 1 }
            }
          });

          // Create/Update UserProgress
          if (problemId) {
            await prisma.userProgress.upsert({
              where: {
                userId_problemId: { userId, problemId }
              },
              update: {
                language,
                executionTime: testResults.runtime || null,
                creditsEarned: 50
              },
              create: {
                userId,
                problemId,
                language,
                executionTime: testResults.runtime || null,
                creditsEarned: 50
              }
            });
          }

          // Emit success animation for completion
          socket.emit('submission-success', {
            isWinner: false,
            creditsEarned: 50,
            testsPassed: passedTests,
            totalTests,
            message: '✅ All tests passed!',
            animationType: 'success' // Trigger celebration animation
          });

          console.log(`✅ ${participant.userName} completed problem in room ${roomId} - Earned 50 credits`);

          // Provide winner's solution if available
          const winnerSolution = room.solutions.get(room.winner);
          if (winnerSolution) {
            socket.emit('solution-provided', {
              solution: {
                code: winnerSolution.code,
                language: winnerSolution.language,
              },
            });
          }
        } else {
          // Failed submission - no credits
          socket.emit('submission-failed', {
            testsPassed: passedTests,
            totalTests,
            message: `${passedTests}/${totalTests} tests passed`,
            failedTests: resultsArray.filter(r => !r.passed).map((r, i) => ({ index: i, expected: r.expected, output: r.output || r.error }))
          });

          console.log(`❌ ${participant.userName} failed submission in room ${roomId} - ${passedTests}/${totalTests} tests passed`);
        }

        // Update leaderboard cache if credits were earned
        if (creditsEarned > 0) {
          const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              credits: true,
              totalSolved: true,
              competitionsWon: true,
              currentStreak: true
            }
          });

          if (updatedUser) {
            await prisma.leaderboardCache.upsert({
              where: { userId },
              update: {
                totalCredits: updatedUser.credits,
                problemsSolved: updatedUser.totalSolved,
                competitionsWon: updatedUser.competitionsWon,
                currentStreak: updatedUser.currentStreak,
                updatedAt: new Date()
              },
              create: {
                userId,
                totalCredits: updatedUser.credits,
                problemsSolved: updatedUser.totalSolved,
                competitionsWon: updatedUser.competitionsWon,
                currentStreak: updatedUser.currentStreak
              }
            });
          }
        }

        // Broadcast submission update to all room participants
        io.to(roomId).emit('submission-update', {
          userId,
          userName: participant.userName,
          passed: allPassed,
          isWinner,
          creditsEarned,
          testsPassed: passedTests,
          totalTests
        });

      } catch (error) {
        console.error(`❌ Error processing submission for user ${userId} in room ${roomId}:`, error);
        socket.emit('error', { 
          message: 'Failed to process submission. Please try again.',
          details: error.message 
        });
      }
    });

    // Chat Message
    socket.on('send-message', async ({ roomId, userId, userName, message }) => {
      // Save to database
      await saveRoomMessage(roomId, userId, userName, message, false);

      io.to(roomId).emit('new-message', {
        id: Date.now(),
        userId,
        userName,
        content: message,
        timestamp: Date.now(),
      });
    });

    // Request Solution (via Gemini)
    socket.on('request-solution', ({ roomId, userId }) => {
      const room = rooms.get(roomId);
      if (room && room.winner) {
        const winnerSolution = room.solutions.get(room.winner);
        if (winnerSolution) {
          socket.emit('solution-provided', {
            solution: {
              code: winnerSolution.code,
              language: winnerSolution.language,
            },
          });
        }
      }
    });

    // Leave Room
    socket.on('leave-room', ({ roomId, userId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.participants.delete(userId);
        socket.leave(roomId);
        
        // Notify others
        io.to(roomId).emit('participant-left', { userId });
        
        // Clean up empty rooms
        if (room.participants.size === 0) {
          rooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (empty)`);
        }
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      // Remove from all rooms
      rooms.forEach((room, roomId) => {
        room.participants.forEach((participant, userId) => {
          if (participant.socketId === socket.id) {
            room.participants.delete(userId);
            io.to(roomId).emit('participant-left', { userId });
            
            if (room.participants.size === 0) {
              rooms.delete(roomId);
            }
          }
        });
      });
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
