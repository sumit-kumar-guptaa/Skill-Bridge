'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowLeft, User, Bot, Sparkles, Code, Brain, Target, Rocket, Cloud, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  stage: 'initial' | 'career-selection' | 'skill-assessment' | 'guidance';
  selectedCareer: string;
  userSkills: string[];
  experienceLevel: 'fresher' | 'intermediate' | 'advanced' | '';
}

export default function GuidancePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showInitialScreen, setShowInitialScreen] = useState<boolean>(true);
  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'initial',
    selectedCareer: '',
    userSkills: [],
    experienceLevel: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const careerGoals = [
    { 
      id: 'sde', 
      title: 'SDE', 
      subtitle: 'Software Engineer',
      icon: <Code className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      id: 'ml', 
      title: 'ML Engineer', 
      subtitle: 'Machine Learning',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'from-blue-500 to-purple-500'
    },
    { 
      id: 'ai', 
      title: 'AI Engineer', 
      subtitle: 'Artificial Intelligence',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'devops', 
      title: 'DevOps', 
      subtitle: 'DevOps Engineer',
      icon: <Target className="w-8 h-8" />,
      gradient: 'from-green-500 to-teal-500'
    },
    { 
      id: 'iot', 
      title: 'IoT Engineer', 
      subtitle: 'Internet of Things',
      icon: <Rocket className="w-8 h-8" />,
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      id: 'cloud', 
      title: 'Cloud Engineer', 
      subtitle: 'Cloud Computing',
      icon: <Cloud className="w-8 h-8" />,
      gradient: 'from-cyan-500 to-blue-500'
    },
  ];

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/landing');
    }
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCareerSelect = (career: string) => {
    setShowInitialScreen(false);
    setUserInput('');
    setConversationState({ ...conversationState, stage: 'career-selection', selectedCareer: career });
    
    const greeting: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Awesome! **${career}** is a great choice! 🚀\n\n**Quick question** - What's your current skill level?\n\n📚 **Option 1**: List your skills\n(e.g., "Python, React, Git")\n\n📚 **Option 2**: Type "**fresher**" if you're starting from scratch\n\nThis helps me personalize your roadmap!`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  };

  const handleSearchSubmit = () => {
    if (userInput.trim()) {
      handleCareerSelect(userInput.trim());
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    const input = userInput.trim();
    if (!input || loading) return;

    // Add user message
    addMessage('user', input);
    setUserInput('');
    setLoading(true);

    try {
      // Handle conversation flow
      if (conversationState.stage === 'initial') {
        // Career selection stage
        setConversationState({ ...conversationState, stage: 'career-selection', selectedCareer: input });
        
        setTimeout(() => {
          addMessage(
            'assistant',
            `Awesome! ${input} is a great choice! 🚀\n\n**Quick question** - What's your current skill level?\n\n📚 **Option 1**: List your skills\n(e.g., "Python, React, Git")\n\n📚 **Option 2**: Type "**fresher**" if you're starting from scratch\n\nThis helps me personalize your roadmap!`
          );
          setConversationState({ ...conversationState, stage: 'skill-assessment', selectedCareer: input });
          setLoading(false);
        }, 800);
      } else if (conversationState.stage === 'skill-assessment') {
        // Skill assessment stage
        const isFresher = input.toLowerCase().includes('fresher') || 
                         input.toLowerCase().includes('none') || 
                         input.toLowerCase().includes('beginner') ||
                         input.toLowerCase() === 'no';
        
        const skills = isFresher ? [] : input.split(',').map(s => s.trim());
        const experienceLevel = isFresher ? 'fresher' : (skills.length > 5 ? 'intermediate' : 'beginner') as any;
        
        setConversationState({
          ...conversationState,
          stage: 'guidance',
          userSkills: skills,
          experienceLevel,
        });

        // Show analyzing message
        addMessage(
          'assistant',
          `${isFresher 
            ? "Got it! Starting from scratch 💪" 
            : `Nice! You know: ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''} ✨`}\n\nCreating your roadmap... ⏳`
        );

        // Get AI guidance
        setTimeout(async () => {
          try {
            const response = await fetch('/api/guidance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                career: conversationState.selectedCareer,
                userQuery: `Career Goal: ${conversationState.selectedCareer}\nCurrent Skills: ${isFresher ? 'Complete Beginner/Fresher' : skills.join(', ')}\nExperience Level: ${experienceLevel}\n\nCreate a personalized learning path.`,
                userSkills: skills,
                experienceLevel,
                isFresher,
              }),
            });

            const data = await response.json();
            
            if (response.ok) {
              // Add progress assessment if not fresher
              let progressMessage = '';
              if (!isFresher && skills.length > 0) {
                const progress = skills.length > 5 ? '30-40%' : skills.length > 2 ? '15-25%' : '10-15%';
                progressMessage = `✅ **Your Progress**: Based on your skills (${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''}), you've covered ~**${progress}** of the path! 🎯\n\n`;
              } else if (isFresher) {
                progressMessage = `🎯 **Starting Fresh**: Perfect! I'll guide you step-by-step from the basics.\n\n`;
              }
              
              addMessage('assistant', progressMessage + data.guidance + `\n\n💬 **Questions?** Ask me anything like:\n• "Recommend beginner projects"\n• "Best course for [topic]?"\n• "Interview tips?"\n• Or start fresh with a new career!`);
            } else {
              addMessage('assistant', `❌ Sorry, I encountered an error: ${data.error || 'Unknown error'}. Please try again.`);
            }
          } catch (error) {
            addMessage('assistant', '❌ Failed to connect. Please check your internet connection and try again.');
          } finally {
            setLoading(false);
          }
        }, 2000);
      } else if (conversationState.stage === 'guidance') {
        // Follow-up questions stage - keep it natural
        setTimeout(async () => {
          try {
            const response = await fetch('/api/guidance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                career: conversationState.selectedCareer,
                userQuery: input,
                userSkills: conversationState.userSkills,
                experienceLevel: conversationState.experienceLevel,
                isFollowUp: true,
              }),
            });

            const data = await response.json();
            
            if (response.ok) {
              addMessage('assistant', data.guidance + '\n\n💬 Anything else?');
            } else {
              addMessage('assistant', `❌ Sorry, I encountered an error. Please try again.`);
            }
          } catch (error) {
            addMessage('assistant', '❌ Failed to connect. Please try again.');
          } finally {
            setLoading(false);
          }
        }, 1500);
      }
    } catch (error) {
      addMessage('assistant', '❌ An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setShowInitialScreen(true);
    setUserInput('');
    setConversationState({
      stage: 'initial',
      selectedCareer: '',
      userSkills: [],
      experienceLevel: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] text-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 border-b border-gray-800/30 bg-[#0a0e27]/80 backdrop-blur-lg sticky top-0 z-10">
        <Link href="/landing">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </Link>
        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
          skill bridge <span className="text-sm px-2 py-1 bg-orange-500 text-white rounded-full ml-2">pro</span>
        </h1>
        {!showInitialScreen && (
          <button
            onClick={handleNewConversation}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            New Chat
          </button>
        )}
        {showInitialScreen && <div className="w-20"></div>}
      </nav>

      {/* Initial Screen with Search and Career Cards */}
      {showInitialScreen ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-3xl w-full text-center space-y-8">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  skill bridge
                </span>
                <span className="text-sm px-3 py-1 bg-orange-500 text-white rounded-full ml-3 align-middle">pro</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Choose Your Career Goal & Get Personalized Guidance
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center gap-3 bg-[#1a1f3a] border border-gray-700 rounded-2xl p-4 hover:border-orange-500 transition-all shadow-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  <input
                    type="text"
                    placeholder="What's your career goal? (e.g., SDE, ML Engineer, DevOps, Cloud...)"
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-lg"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userInput.trim()) {
                        handleSearchSubmit();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSearchSubmit}
                  disabled={!userInput.trim()}
                  className="bg-orange-500 hover:bg-orange-600 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Career Goal Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
              {careerGoals.map((career) => (
                <button
                  key={career.id}
                  onClick={() => handleCareerSelect(career.title)}
                  className="group relative bg-[#1a1f3a] border border-gray-700 rounded-2xl p-6 hover:border-orange-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${career.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    {career.icon}
                  </div>
                  <h3 className="font-bold text-white mb-1">{career.title}</h3>
                  <p className="text-sm text-gray-400">{career.subtitle}</p>
                </button>
              ))}
            </div>

            {/* Bottom Info */}
            <div className="text-center text-gray-500 text-sm mt-8">
              <p>AI-Powered Career Guidance • Goal-Based Learning Paths • Expert Mentorship</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-6 flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#1a1f3a] border border-gray-700'
              }`}
            >
              <div className="prose prose-invert prose-orange max-w-none">
                {message.content.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  
                  if (trimmedLine.match(/^[🎯📚🗺️💡🚀💼🎓💪⚠️🔥✅📊👋💬]/)) {
                    return (
                      <p key={index} className="text-lg font-bold text-orange-400 mt-4 mb-2">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                    return (
                      <p key={index} className="font-bold text-orange-300 mt-3 mb-2">
                        {trimmedLine.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  
                  if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
                    return (
                      <li key={index} className="text-gray-300 ml-4 mb-1">
                        {trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '')}
                      </li>
                    );
                  }
                  
                  if (trimmedLine === '---') {
                    return <hr key={index} className="my-4 border-gray-700" />;
                  }
                  
                  if (trimmedLine) {
                    return (
                      <p key={index} className="text-gray-300 mb-2">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  return <br key={index} />;
                })}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="mb-6 flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-[#1a1f3a] border border-gray-700 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                <span className="text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 bg-[#0a0e27]/50 backdrop-blur-lg p-4">
            <div className="max-w-4xl w-full mx-auto">
              <div className="flex items-center gap-3 bg-[#1a1f3a] border border-gray-700 rounded-xl p-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !userInput.trim()}
                  className="bg-orange-500 hover:bg-orange-600 p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-center text-gray-500 text-xs mt-2">
                Powered by AI • Enhanced with real-time search
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}