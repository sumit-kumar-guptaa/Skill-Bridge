'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowLeft, User, Bot, Sparkles, Code, Brain, Target, Rocket, Cloud, BookOpen, Download, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function GuidancePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showInitialScreen, setShowInitialScreen] = useState<boolean>(true);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const careerGoals = [
    { 
      id: 'SDE', 
      title: 'SDE', 
      subtitle: 'Software Development Engineer',
      icon: <Code className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500',
      description: 'Full-stack development, DSA, System Design'
    },
    { 
      id: 'ML Engineer', 
      title: 'ML Engineer', 
      subtitle: 'Machine Learning',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'from-blue-500 to-purple-500',
      description: 'Python, TensorFlow, Data Science'
    },
    { 
      id: 'AI Engineer', 
      title: 'AI Engineer', 
      subtitle: 'Artificial Intelligence',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      description: 'NLP, Computer Vision, LLMs'
    },
    { 
      id: 'DevOps', 
      title: 'DevOps', 
      subtitle: 'DevOps Engineer',
      icon: <Target className="w-8 h-8" />,
      gradient: 'from-green-500 to-teal-500',
      description: 'Docker, Kubernetes, CI/CD'
    },
    { 
      id: 'IoT Engineer', 
      title: 'IoT Engineer', 
      subtitle: 'Internet of Things',
      icon: <Rocket className="w-8 h-8" />,
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Arduino, Raspberry Pi, Embedded Systems'
    },
    { 
      id: 'Cloud Engineer', 
      title: 'Cloud Engineer', 
      subtitle: 'Cloud Computing',
      icon: <Cloud className="w-8 h-8" />,
      gradient: 'from-cyan-500 to-blue-500',
      description: 'AWS, Azure, Terraform, Serverless'
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

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const handleCareerSelect = async (career: string) => {
    setShowInitialScreen(false);
    setSelectedCareer(career);
    setLoading(true);
    
    // Add user message
    addMessage('user', `I want to become a ${career}`);
    
    // Add loading message
    const loadingId = addMessage('assistant', '🤖 Loading your personalized roadmap...');
    
    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career: career,
          isFollowUp: false
        }),
      });

      const data = await response.json();
      
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      
      if (response.ok) {
        addMessage('assistant', data.guidance);
      } else {
        addMessage('assistant', '❌ Failed to load guidance. Please try again.');
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      addMessage('assistant', '❌ Network error. Please check your connection and try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const input = userInput.trim();
    setUserInput('');
    setLoading(true);

    // Add user message
    addMessage('user', input);

    // Add loading message
    const loadingId = addMessage('assistant', '🤖 Thinking...');

    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career: selectedCareer,
          userQuery: input,
          isFollowUp: true
        }),
      });

      const data = await response.json();
      
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      
      if (response.ok) {
        addMessage('assistant', data.guidance);
      } else {
        addMessage('assistant', '❌ Failed to get response. Please try again.');
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      addMessage('assistant', '❌ Network error. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setShowInitialScreen(true);
    setSelectedCareer('');
    setUserInput('');
  };

  const downloadRoadmap = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    doc.setFontSize(20);
    doc.text('Career Guidance Roadmap', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(14);
    doc.text(`Career: ${selectedCareer}`, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    messages.forEach((msg) => {
      if (msg.role === 'assistant') {
        const lines = doc.splitTextToSize(msg.content, 170);
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 7;
        });
        yPosition += 5;
      }
    });
    
    doc.save(`${selectedCareer}_Roadmap.pdf`);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0d1425]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                <h1 className="text-xl font-bold text-white">Career Guidance</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!showInitialScreen && (
                <>
                  <button
                    onClick={downloadRoadmap}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={resetConversation}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    New Roadmap
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {showInitialScreen ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <Sparkles className="w-20 h-20 text-cyan-400 relative" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Career Path</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Get personalized roadmaps, learning resources, and step-by-step guidance powered by AI
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400 pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant Roadmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>Personalized Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>AI-Powered Guidance</span>
                </div>
              </div>
            </div>

            {/* Career Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerGoals.map((career) => (
                <button
                  key={career.id}
                  onClick={() => handleCareerSelect(career.id)}
                  className="group relative p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-gray-700 transition-all duration-300 text-left overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${career.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${career.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {career.icon}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{career.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{career.subtitle}</p>
                      <p className="text-xs text-gray-500">{career.description}</p>
                    </div>
                    
                    <div className="flex items-center text-cyan-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Get Started</span>
                      <Sparkles className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
              <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
                <BookOpen className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Roadmaps</h3>
                <p className="text-sm text-gray-400">6-month structured learning paths with milestones and resources</p>
              </div>
              
              <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
                <Target className="w-10 h-10 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Project Ideas</h3>
                <p className="text-sm text-gray-400">Real-world projects to build your portfolio and gain experience</p>
              </div>
              
              <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl">
                <Rocket className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Weekly Action Plans</h3>
                <p className="text-sm text-gray-400">Concrete steps to take this week to move forward</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chat Container */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              {/* Messages */}
              <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-4xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`px-6 py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <div className="prose prose-invert max-w-none">
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-800 p-4 bg-gray-900/70">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about courses, projects, interview tips..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !userInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['What are the best courses?', 'Project ideas for beginners', 'How to prepare for interviews?', 'Learning resources'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setUserInput(suggestion);
                    handleSendMessage();
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-700 transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
