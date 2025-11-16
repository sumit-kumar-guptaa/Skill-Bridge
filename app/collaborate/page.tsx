'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { io, Socket } from 'socket.io-client';
import {
  Users,
  Copy,
  Loader2,
  ArrowLeft,
  MessageSquare,
  Send,
  UserPlus,
  Trophy,
  Code,
  Play,
  CheckCircle
} from 'lucide-react';

// Coding problems for competition
const competitionProblems = [
  {
    id: 1,
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', output: '[0,1]' },
      { input: '[3,2,4]\n6', output: '[1,2]' },
      { input: '[3,3]\n6', output: '[0,1]' }
    ]
  },
  {
    id: 2,
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    testCases: [
      { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    id: 3,
    title: 'FizzBuzz',
    description: 'Given an integer n, return a string array answer (1-indexed) where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, answer[i] == "Fizz" if i is divisible by 3, answer[i] == "Buzz" if i is divisible by 5, answer[i] == i (as a string) if none of the above conditions are true.',
    examples: [
      { input: 'n = 3', output: '["1","2","Fizz"]' },
      { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' }
    ],
    testCases: [
      { input: '15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
    ]
  },
  {
    id: 4,
    title: 'Palindrome Number',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    examples: [
      { input: 'x = 121', output: 'true' },
      { input: 'x = -121', output: 'false' }
    ],
    testCases: [
      { input: '121', output: 'true' },
      { input: '-121', output: 'false' },
      { input: '10', output: 'false' }
    ]
  }
];


export default function CollaborativePage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [code, setCode] = useState('// Start coding together...\n\n');
  const [language, setLanguage] = useState('javascript');
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<typeof competitionProblems[0] | null>(null);
  const [isCompeting, setIsCompeting] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server, Socket ID:', socket.id);
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setSocketConnected(false);
    });

    socket.on('error', (data) => {
      alert(data.message);
    });

    // Room events
    socket.on('room-created', ({ roomId: createdRoomId, room }) => {
      console.log('Room created:', createdRoomId);
      setRoomId(createdRoomId);
      setIsHost(true);
      setIsCompeting(true);
      setParticipants(room.participants);
    });

    socket.on('room-joined', ({ room }) => {
      console.log('Room joined:', room);
      setRoomId(room.id);
      setIsHost(false);
      setIsCompeting(true);
      setParticipants(room.participants);
      if (room.problemId) {
        const problem = competitionProblems.find(p => p.id === room.problemId);
        setSelectedProblem(problem || null);
      }
    });

    socket.on('participant-joined', ({ participant, room }) => {
      console.log('Participant joined:', participant);
      setParticipants(room.participants);
      addSystemMessage(`${participant.userName} joined the room`);
    });

    socket.on('participant-left', ({ userId: leftUserId }) => {
      setParticipants(prev => prev.filter(p => p.userId !== leftUserId));
      addSystemMessage(`Participant left the room`);
    });

    // Code sync
    socket.on('code-synced', ({ code: syncedCode, userId: syncUserId }) => {
      if (syncUserId !== userId) {
        setCode(syncedCode);
      }
    });

    // Competition events
    socket.on('winner-declared', ({ winner: winnerData }) => {
      setWinner(winnerData);
      addSystemMessage(`🏆 ${winnerData.userName} won in ${winnerData.timeToComplete.toFixed(2)}s!`);
      
      // Award credits to winner (localStorage for now)
      if (winnerData.userId === userId) {
        const progress = JSON.parse(localStorage.getItem('progress') || '{}');
        const currentCredits = progress.credits || 0;
        progress.credits = currentCredits + 20;
        localStorage.setItem('progress', JSON.stringify(progress));
        alert('🎉 You won! +20 credits');
      }
    });

    socket.on('solution-provided', ({ solution: providedSolution }) => {
      setSolution(providedSolution.code);
      setCode(providedSolution.code);
      addSystemMessage('💡 Solution provided by the winner!');
    });

    socket.on('submission-update', ({ userName, passed, isWinner }) => {
      if (isWinner) {
        addSystemMessage(`✅ ${userName} submitted the winning solution!`);
      } else if (passed) {
        addSystemMessage(`✅ ${userName} completed the challenge`);
      }
    });

    // Chat
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Remove userId and user dependencies

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      userId: 'system',
      userName: 'System',
      content,
      timestamp: Date.now(),
      isSystem: true
    }]);
  };

  const createRoom = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      alert('Not connected to server. Please refresh the page.');
      return;
    }
    
    if (!userId) {
      alert('Please sign in to create a room.');
      return;
    }
    
    const problem = competitionProblems[Math.floor(Math.random() * competitionProblems.length)];
    setSelectedProblem(problem);
    
    console.log('Creating room with problem:', problem.title);
    socketRef.current.emit('create-room', {
      problemId: problem.id,
      userId,
      userName: user?.firstName || user?.username || 'Anonymous'
    });
  };

  const joinRoom = (id: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      alert('Not connected to server. Please refresh the page.');
      return;
    }
    
    if (!userId) {
      alert('Please sign in to join a room.');
      return;
    }
    
    if (!id || id.trim() === '') {
      alert('Please enter a valid Room ID.');
      return;
    }
    
    console.log('Joining room:', id);
    socketRef.current.emit('join-room', {
      roomId: id.toUpperCase(),
      userId,
      userName: user?.firstName || user?.username || 'Anonymous'
    });
  };

  const copyRoomLink = () => {
    const link = `Room ID: ${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Room ID copied to clipboard!');
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    
    // Broadcast code changes
    if (socketRef.current && roomId) {
      socketRef.current.emit('code-update', {
        roomId,
        code: newCode,
        userId
      });
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return;
    
    socketRef.current.emit('send-message', {
      roomId,
      userId,
      userName: user?.firstName || 'Anonymous',
      message: messageInput
    });
    
    setMessageInput('');
  };

  const runCode = async () => {
    if (!selectedProblem) return;
    
    setIsSubmitting(true);
    setOutput('Running tests...');

    try {
      // Execute code with JDoodle
      const response = await fetch('/api/judge0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: selectedProblem.testCases
        })
      });

      const results = await response.json();
      
      if (results.error) {
        setOutput(`Error: ${results.error}`);
        setIsSubmitting(false);
        return;
      }

      const allPassed = results.results?.every((r: any) => r.passed) || false;
      const outputText = results.results
        ?.map((r: any, i: number) => 
          `Test ${i + 1}: ${r.passed ? '✅ Passed' : '❌ Failed'}\n` +
          `Expected: ${r.expected}\nGot: ${r.output || r.error}`
        )
        .join('\n\n') || 'No results';

      setOutput(outputText);

      // Submit to competition
      if (socketRef.current && roomId) {
        socketRef.current.emit('submit-solution', {
          roomId,
          userId,
          code,
          language,
          testResults: {
            allPassed,
            results: results.results
          }
        });
      }

    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const leaveRoom = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('leave-room', { roomId, userId });
    }
    setRoomId('');
    setIsCompeting(false);
    setSelectedProblem(null);
    setWinner(null);
    setSolution(null);
    setCode('// Start coding together...\n\n');
    setParticipants([]);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <Link href="/assignments">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Problems
              </button>
            </Link>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Competitive Coding Arena
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              Compete in real-time and win credits!
              <span className={`ml-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                socketConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  socketConnected ? 'bg-green-400' : 'bg-red-400'
                }`}></span>
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {/* Create Competition */}
            <div className="bg-[#1a1f3a] border border-gray-800 rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start Competition</h2>
              <p className="text-gray-400 text-sm mb-4">
                Create a new room and compete with others
              </p>
              <div className="bg-[#0a0e27] border border-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">Rules:</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• First to solve correctly wins +20 credits</li>
                  <li>• Others receive the winning solution</li>
                  <li>• Real-time code synchronization</li>
                  <li>• Random problem selection</li>
                </ul>
              </div>
              <button
                onClick={createRoom}
                disabled={!socketConnected}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                  socketConnected
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white cursor-pointer'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {socketConnected ? 'Create Competition' : 'Connecting...'}
              </button>
            </div>

            {/* Join Competition */}
            <div className="bg-[#1a1f3a] border border-gray-800 rounded-xl p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Join Competition</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter room ID to join an ongoing competition
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter room ID (e.g., ABC123)"
                  className="w-full bg-[#0a0e27] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      joinRoom(e.currentTarget.value.toUpperCase());
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input?.value) joinRoom(input.value.toUpperCase());
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Join Competition
                </button>
              </div>
            </div>
          </div>

          {/* Available Problems Preview */}
          <div className="mt-12 max-w-4xl">
            <h3 className="text-xl font-bold mb-6">Competition Problems</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {competitionProblems.slice(0, 4).map((problem) => (
                <div key={problem.id} className="bg-[#1a1f3a] border border-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-cyan-400">{problem.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Competitive Room UI
  return (
    <div className="h-screen bg-[#1a1f3a] text-white flex overflow-hidden">
      {/* Left Panel - Problem + Participants */}
      <div className="w-96 border-r border-gray-800 bg-[#0a0e27] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <button onClick={leaveRoom} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Room: {roomId}</span>
              <button onClick={copyRoomLink} className="p-1 hover:bg-gray-800 rounded">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        {selectedProblem && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-[#1a1f3a] border border-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg">{selectedProblem.title}</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">{selectedProblem.description}</p>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-cyan-400">Examples:</h4>
                {selectedProblem.examples.map((example, i) => (
                  <div key={i} className="bg-[#0a0e27] border border-gray-700 rounded p-3 text-xs">
                    <div className="mb-1">
                      <span className="text-gray-400">Input:</span>
                      <code className="text-green-400 ml-2">{example.input}</code>
                    </div>
                    <div>
                      <span className="text-gray-400">Output:</span>
                      <code className="text-cyan-400 ml-2">{example.output}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Winner Banner */}
            {winner && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="font-bold text-yellow-400">Winner!</h3>
                </div>
                <p className="text-sm text-gray-300 mb-1">{winner.userName}</p>
                <p className="text-xs text-gray-400">Solved in {winner.timeToComplete.toFixed(2)}s</p>
                {winner.userId === userId && (
                  <p className="text-xs text-green-400 mt-2">🎉 You earned +20 credits!</p>
                )}
              </div>
            )}

            {/* Participants */}
            <div className="bg-[#1a1f3a] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold">Participants ({participants.length})</h3>
              </div>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.userId} className="flex items-center gap-2 bg-[#0a0e27] rounded p-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">
                      {participant.userName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{participant.userName}</p>
                      {participant.completed && (
                        <p className="text-xs text-green-400">✅ Completed</p>
                      )}
                    </div>
                    {winner?.userId === participant.userId && (
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center - Code Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#0a0e27] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#1a1f3a] border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          
          <button
            onClick={runCode}
            disabled={isSubmitting || !!winner}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              winner
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : isSubmitting
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : winner ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Competition Ended
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run & Submit
              </>
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              fontLigatures: true,
              readOnly: !!winner && winner.userId !== userId,
            }}
          />
        </div>

        {/* Output */}
        {output && (
          <div className="h-48 border-t border-gray-800 bg-[#0a0e27] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Output:</h3>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{output}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Chat */}
      <div className="w-80 border-l border-gray-800 bg-[#0a0e27] flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Chat
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                msg.isSystem
                  ? 'bg-cyan-500/10 border border-cyan-500/30'
                  : 'bg-[#1a1f3a]'
              }`}
            >
              {!msg.isSystem && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">
                    {msg.userName[0]}
                  </div>
                  <span className="text-xs font-semibold">{msg.userName}</span>
                  <span className="text-[10px] text-gray-500 ml-auto">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <p className={`text-sm ${msg.isSystem ? 'text-cyan-300' : 'text-gray-300'}`}>
                {msg.content}
              </p>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-[#1a1f3a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-cyan-500 hover:bg-cyan-600 p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
