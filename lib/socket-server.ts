// WebSocket Server for Real-time Competition
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export interface CompetitionRoom {
  id: string;
  problemId: number;
  participants: Map<string, Participant>;
  startTime: number;
  winner: string | null;
  solutions: Map<string, Solution>;
}

export interface Participant {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: number;
  completed: boolean;
  completedAt?: number;
}

export interface Solution {
  userId: string;
  code: string;
  language: string;
  submittedAt: number;
  passed: boolean;
}

const rooms = new Map<string, CompetitionRoom>();

export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create Competition Room
    socket.on('create-room', ({ problemId, userId, userName }) => {
      const roomId = generateRoomId();
      const room: CompetitionRoom = {
        id: roomId,
        problemId,
        participants: new Map(),
        startTime: Date.now(),
        winner: null,
        solutions: new Map(),
      };

      const participant: Participant = {
        userId,
        userName,
        socketId: socket.id,
        joinedAt: Date.now(),
        completed: false,
      };

      room.participants.set(userId, participant);
      rooms.set(roomId, room);
      socket.join(roomId);

      socket.emit('room-created', { roomId, room: serializeRoom(room) });
      console.log(`Room ${roomId} created by ${userName}`);
    });

    // Join Competition Room
    socket.on('join-room', ({ roomId, userId, userName }) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.participants.has(userId)) {
        socket.emit('error', { message: 'Already in room' });
        return;
      }

      const participant: Participant = {
        userId,
        userName,
        socketId: socket.id,
        joinedAt: Date.now(),
        completed: false,
      };

      room.participants.set(userId, participant);
      socket.join(roomId);

      // Notify all participants
      io.to(roomId).emit('participant-joined', {
        participant: serializeParticipant(participant),
        room: serializeRoom(room),
      });

      socket.emit('room-joined', { room: serializeRoom(room) });
      console.log(`${userName} joined room ${roomId}`);
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

      const solution: Solution = {
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

        // Winner gets credits
        io.to(roomId).emit('winner-declared', {
          winner: {
            userId,
            userName: participant.userName,
            timeToComplete: (Date.now() - room.startTime) / 1000,
          },
        });
      } else if (testResults.allPassed) {
        participant.completed = true;
        participant.completedAt = Date.now();
        
        // Others get solution
        socket.emit('solution-provided', {
          solution: room.solutions.get(room.winner!),
        });
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
    socket.on('send-message', ({ roomId, userId, userName, message }) => {
      io.to(roomId).emit('new-message', {
        id: Date.now(),
        userId,
        userName,
        content: message,
        timestamp: Date.now(),
      });
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
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
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

  return io;
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function serializeRoom(room: CompetitionRoom) {
  return {
    id: room.id,
    problemId: room.problemId,
    participants: Array.from(room.participants.values()).map(serializeParticipant),
    startTime: room.startTime,
    winner: room.winner,
  };
}

function serializeParticipant(participant: Participant) {
  return {
    userId: participant.userId,
    userName: participant.userName,
    joinedAt: participant.joinedAt,
    completed: participant.completed,
    completedAt: participant.completedAt,
  };
}
