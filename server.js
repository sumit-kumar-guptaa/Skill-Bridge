// Custom Server for Next.js with Socket.IO
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
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

    // Award credits to winner
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: 20 },
        competitionsWon: { increment: 1 },
      },
    });
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

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

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

      const solution = {
        userId,
        code,
        language,
        submittedAt: Date.now(),
        passed: testResults.allPassed,
      };

      room.solutions.set(userId, solution);

      // Check if this is the first correct solution
      if (testResults.allPassed && !room.winner) {
        room.winner = userId;
        participant.completed = true;
        participant.completedAt = Date.now();

        // Save winner to database
        await setRoomWinner(roomId, userId);

        // Winner gets credits
        io.to(roomId).emit('winner-declared', {
          winner: {
            userId,
            userName: participant.userName,
            timeToComplete: (Date.now() - room.startTime) / 1000,
          },
        });
        
        await saveRoomMessage(roomId, null, 'System', `🏆 ${participant.userName} won the competition!`, true);
        console.log(`🏆 ${participant.userName} won room ${roomId}`);
      } else if (testResults.allPassed) {
        participant.completed = true;
        participant.completedAt = Date.now();
        
        // Others get solution from winner
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

      // Broadcast submission update
      io.to(roomId).emit('submission-update', {
        userId,
        userName: participant.userName,
        passed: testResults.allPassed,
        isWinner: room.winner === userId,
      });
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
