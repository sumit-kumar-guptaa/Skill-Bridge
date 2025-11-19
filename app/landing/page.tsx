'use client';

import { useState, useEffect, useRef } from 'react';
import { Code2, BrainCircuit, Sparkles, Target, Rocket, Cloud, BookOpen, Trophy, TrendingUp, Users, ArrowRight, CheckCircle, Terminal, Minus, Square, X, Clock, Star, Quote } from 'lucide-react';
import Link from 'next/link';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { isSignedIn } = useUser();
  const [typedCode, setTypedCode] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('Machine Learning');

  const codeSnippets = [
    {
      language: 'python',
      title: 'machine_learning.py',
      code: `# AI Career Guidance System
import tensorflow as tf
import numpy as np

class CareerPredictor:
    def __init__(self, model_path):
        self.model = tf.keras.models.load_model(model_path)
        
    def predict_career(self, skills, experience):
        features = np.array([skills, experience])
        prediction = self.model.predict(features)
        return prediction
        
# Initialize and predict
predictor = CareerPredictor('career_model.h5')
result = predictor.predict_career(
    skills=['Python', 'ML', 'Data Science'],
    experience=2
)
print(f"Recommended Path: {result}")`,
    },
    {
      language: 'javascript',
      title: 'react_component.jsx',
      code: `// Dynamic Learning Dashboard
import React, { useState, useEffect } from 'react';

const LearningDashboard = () => {
  const [progress, setProgress] = useState(0);
  const [skills, setSkills] = useState([]);
  
  useEffect(() => {
    fetchUserProgress();
    analyzeSkillGaps();
  }, []);
  
  const fetchUserProgress = async () => {
    const data = await fetch('/api/progress');
    const result = await data.json();
    setProgress(result.completion);
  };
  
  return (
    <div className="dashboard">
      <ProgressBar value={progress} />
      <SkillsChart data={skills} />
    </div>
  );
};`,
    },
    {
      language: 'typescript',
      title: 'ai_agent.ts',
      code: `// Multi-Agent AI System
interface Agent {
  role: string;
  execute: () => Promise<string>;
}

class CareerCounselorAgent implements Agent {
  role = 'Career Counselor';
  
  async execute(): Promise<string> {
    const guidance = await this.analyzeCareer();
    const roadmap = await this.generateRoadmap();
    return \`\${guidance}\\n\${roadmap}\`;
  }
  
  private async analyzeCareer() {
    return 'Analyzing your career path...';
  }
}

// Initialize agent system
const agent = new CareerCounselorAgent();
await agent.execute();`,
    }
  ];

  const [currentSnippet, setCurrentSnippet] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const currentCode = codeSnippets[currentSnippet].code;
    const lines = currentCode.split('\n');
    
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        const timer = setTimeout(() => {
          setTypedCode(prev => prev + currentLine[currentCharIndex]);
          setCurrentCharIndex(prev => prev + 1);
        }, 30);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setTypedCode(prev => prev + '\n');
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // Switch to next snippet after delay
      const timer = setTimeout(() => {
        setTypedCode('');
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
        setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentCharIndex, currentLineIndex, currentSnippet]);

  // Auto-scroll code editor
  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.scrollTop = codeEditorRef.current.scrollHeight;
    }
  }, [typedCode]);

  // Fetch Coursera courses
  useEffect(() => {
    fetchCourses(selectedDomain);
  }, [selectedDomain]);

  const fetchCourses = async (domain: string) => {
    setLoadingCourses(true);
    try {
      const response = await fetch(`/api/courses?query=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setCourses(data.slice(0, 9)); // Show 9 courses (3 from each platform ideally)
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const domains = [
    { id: 'sde', name: 'Software Development Engineer', icon: <Code2 className="w-6 h-6" />, color: 'blue', problems: 20, description: 'Master DSA, system design, and coding interviews' },
    { id: 'ml', name: 'Machine Learning Engineer', icon: <BrainCircuit className="w-6 h-6" />, color: 'purple', problems: 20, description: 'Build ML models, pipelines, and production systems' },
    { id: 'ai', name: 'AI Engineer', icon: <Sparkles className="w-6 h-6" />, color: 'cyan', problems: 20, description: 'Create AI agents, LLMs, and intelligent applications' },
    { id: 'devops', name: 'DevOps Engineer', icon: <Rocket className="w-6 h-6" />, color: 'orange', problems: 20, description: 'Deploy, scale, and monitor cloud infrastructure' },
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Domain-Locked Progression',
      description: 'Master one domain completely (20 problems) before unlocking others - ensures deep expertise'
    },
    {
      icon: <BrainCircuit className="w-8 h-8" />,
      title: 'AI Career Guidance',
      description: 'Get personalized roadmaps powered by LangGraph, Gemini AI, and real-time web search'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Real-Time Competitions',
      description: 'Compete live with peers using Socket.IO - first to solve wins credits and achievements'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Gamification & Rewards',
      description: 'Earn credits, climb leaderboards, unlock achievements, and track progress with analytics'
    }
  ];

  const recentProblems = [
    { id: 1, title: 'Two Sum Problem', domain: 'SDE', difficulty: 'Easy', solved: 2341 },
    { id: 2, title: 'System Design: Design URL Shortener', domain: 'SDE', difficulty: 'Hard', solved: 892 },
    { id: 3, title: 'Linear Regression from Scratch', domain: 'ML', difficulty: 'Medium', solved: 1234 },
    { id: 4, title: 'Build CNN for Image Classification', domain: 'ML', difficulty: 'Hard', solved: 756 },
    { id: 5, title: 'Create RAG System with LangChain', domain: 'AI', difficulty: 'Medium', solved: 1089 },
    { id: 6, title: 'Deploy Kubernetes Cluster on AWS', domain: 'DevOps', difficulty: 'Hard', solved: 543 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const testimonials = [
    {
      quote: "SkillBridge transformed my career! The domain-locked system forced me to master SDE concepts deeply. After completing all 20 problems, I landed a job at Google. The AI guidance was spot-on with interview prep!",
      name: "Priya Sharma",
      title: "Software Engineer at Google"
    },
    {
      quote: "The real-time competitions are addictive! Racing against peers pushed me to optimize my code. Earned 2000+ credits and unlocked all 4 domains. Best platform for serious learners who want structured growth.",
      name: "Arjun Mehta",
      title: "ML Engineer at Microsoft"
    },
    {
      quote: "I was skeptical about the locked domains at first, but it's genius! Made me complete ML fundamentals before jumping to AI. The +500 bonus credits after finishing a domain kept me motivated. Highly recommend!",
      name: "Sneha Patel",
      title: "Data Scientist at Amazon"
    },
    {
      quote: "The AI career guidance with LangGraph is incredibly detailed. It analyzed my GitHub, suggested personalized roadmaps, and even recommended courses. Combined with hands-on problems, it's a complete learning ecosystem.",
      name: "Rahul Kumar",
      title: "DevOps Engineer at Atlassian"
    },
    {
      quote: "Completed all 80 problems across 4 domains in 3 months. The gamification (credits, achievements, leaderboards) made learning fun. Interview questions felt easy after solving these curated challenges. Worth every minute!",
      name: "Ananya Singh",
      title: "AI Engineer at OpenAI"
    },
    {
      quote: "Love the Socket.IO competitions! Real-time code battles with instant feedback from Judge0. Won multiple competitions and climbed to top 10 on leaderboard. The community is supportive and the challenges are industry-relevant.",
      name: "Vikram Joshi",
      title: "Full Stack Developer at Stripe"
    },
    {
      quote: "The course recommendations from Coursera, Udemy, and YouTube in one place saved me hours. AI guidance paired with domain-specific problems and competitions - this is the future of tech education!",
      name: "Kavya Reddy",
      title: "Cloud Architect at AWS"
    },
    {
      quote: "Unlocking domains after 100% completion is tough but rewarding. Each domain certificate and achievement felt earned. The progress tracking dashboard kept me accountable. Best decision for my upskilling journey!",
      name: "Rohan Gupta",
      title: "Senior SDE at Meta"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section with Code Editor */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 z-10">
              <div className="inline-block">
                <span className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400 text-sm font-semibold animate-pulse">
                  🚀 AI-Powered Career Platform
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                  skill bridge
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Master Your Tech Career with <span className="text-orange-400 font-semibold">AI-Powered Guidance</span>,
                <span className="text-purple-400 font-semibold"> Domain-Locked Progression</span>, &
                <span className="text-cyan-400 font-semibold"> Real-Time Competitions</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {isSignedIn ? (
                  <Link href="/guidance">
                    <button className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/50 flex items-center gap-2">
                      Get Career Guidance
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/50 flex items-center gap-2">
                      Get Career Guidance
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignInButton>
                )}
                <button className="bg-transparent border-2 border-purple-500 hover:bg-purple-500/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">
                  Explore Assignments
                </button>
              </div>
              {/* Stats Mini */}
              <div className="flex gap-6 pt-4">
                <div>
                  <div className="text-3xl font-bold text-orange-500">80+</div>
                  <div className="text-sm text-gray-400">Problems</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-500">4</div>
                  <div className="text-sm text-gray-400">Domains</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-500">100%</div>
                  <div className="text-sm text-gray-400">Completion</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500">AI</div>
                  <div className="text-sm text-gray-400">Powered</div>
                </div>
              </div>
            </div>

            {/* Right Side - Mac-Style Code Editor */}
            <div className="relative z-10 hidden lg:block">
              <div className="bg-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden border border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
                {/* Mac Window Header */}
                <div className="bg-[#2a2a3a] px-4 py-3 flex items-center justify-between border-b border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer transition-colors"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer transition-colors"></div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Terminal className="w-4 h-4" />
                    <span className="font-mono">{codeSnippets[currentSnippet].title}</span>
                  </div>
                  <div className="w-16"></div>
                </div>
                
                {/* Code Editor Content */}
                <div 
                  ref={codeEditorRef}
                  className="bg-[#1e1e2e] p-6 font-mono text-sm h-[500px] overflow-auto custom-scrollbar"
                >
                  <pre className="text-gray-300 leading-relaxed">
                    <code className="whitespace-pre-wrap">
                      {typedCode.split('\n').map((line, i) => (
                        <div key={i} className="hover:bg-gray-800/30 px-2 -mx-2 rounded transition-colors">
                          <span className="text-gray-600 select-none mr-4">{String(i + 1).padStart(2, '0')}</span>
                          <span className="syntax-highlight">{highlightSyntax(line)}</span>
                        </div>
                      ))}
                      <span className="inline-block w-2 h-5 bg-orange-500 animate-pulse ml-1"></span>
                    </code>
                  </pre>
                </div>

                {/* Terminal Footer */}
                <div className="bg-[#2a2a3a] px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Active • Building your career path...</span>
                  </span>
                  <span>{codeSnippets[currentSnippet].language.toUpperCase()}</span>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-lg px-4 py-2 text-sm font-semibold text-orange-400 animate-bounce">
                Live Coding ✨
              </div>
              <div className="absolute -bottom-4 -right-4 bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 rounded-lg px-4 py-2 text-sm font-semibold text-purple-400 animate-pulse">
                AI Analyzing 🤖
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-[#1a1f3a] border border-gray-700 hover:border-orange-500 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20">
            <div className="text-4xl font-bold text-orange-500 group-hover:scale-110 transition-transform">80+</div>
            <div className="text-gray-400 mt-2">Curated Problems</div>
          </div>
          <div className="group bg-[#1a1f3a] border border-gray-700 hover:border-purple-500 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="text-4xl font-bold text-purple-500 group-hover:scale-110 transition-transform">4</div>
            <div className="text-gray-400 mt-2">Expert Domains</div>
          </div>
          <div className="group bg-[#1a1f3a] border border-gray-700 hover:border-cyan-500 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="text-4xl font-bold text-cyan-500 group-hover:scale-110 transition-transform">20</div>
            <div className="text-gray-400 mt-2">Problems per Domain</div>
          </div>
          <div className="group bg-[#1a1f3a] border border-gray-700 hover:border-green-500 rounded-xl p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
            <div className="text-4xl font-bold text-green-500 group-hover:scale-110 transition-transform">100%</div>
            <div className="text-gray-400 mt-2">Completion Required</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
          Why Choose Skill Bridge?
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Experience the future of career development with AI-driven insights and personalized learning
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-[#1a1f3a] border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-orange-500 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MVP Feature: Domain-Locked Progression */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-full text-sm font-semibold animate-pulse shadow-lg">
              🎯 MVP Feature: Domain-Locked Learning Path
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Choose Your Domain & Master It 100%
          </h2>
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto text-lg">
            Pick one domain → Solve all 20 curated problems → Earn +500 bonus credits → Unlock next domain
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Deep Expertise</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400">
              <Target className="w-4 h-4" />
              <span>Focused Learning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400">
              <Trophy className="w-4 h-4" />
              <span>Unlock Rewards</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {domains.map((domain, index) => (
            <div 
              key={domain.id} 
              className="group relative bg-gradient-to-br from-[#1a1f3a] to-[#0a0e27] border border-gray-700 rounded-2xl p-8 hover:border-orange-500 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-br from-${domain.color}-500/20 to-${domain.color}-600/20 border border-${domain.color}-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    {domain.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">{domain.problems}</div>
                    <div className="text-xs text-gray-400 mt-1">Problems</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">{domain.name}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{domain.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Complete all 20 problems to unlock</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>Earn +500 bonus credits on completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span>Unlock achievement & certificate</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <span className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 font-semibold">Easy</span>
                  <span className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30 font-semibold">Medium</span>
                  <span className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 font-semibold">Hard</span>
                </div>
                
                <Link href="/assignments">
                  <button className="mt-6 w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Start This Domain
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* How it Works */}
        <div className="mt-16 bg-gradient-to-r from-[#1a1f3a] to-[#0a0e27] border border-gray-700 rounded-2xl p-10">
          <h3 className="text-2xl font-bold text-center mb-8 text-white">How Domain-Locked Progression Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Pick Your Domain</h4>
              <p className="text-sm text-gray-400">Choose SDE, ML, AI, or DevOps based on your career goals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Solve All 20 Problems</h4>
              <p className="text-sm text-gray-400">Master every problem - other domains stay locked 🔒</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-400">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Get +500 Bonus Credits</h4>
              <p className="text-sm text-gray-400">Unlock achievement and earn massive rewards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-400">4</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Unlock Next Domain</h4>
              <p className="text-sm text-gray-400">Choose another domain and repeat the journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coursera Course Recommendations */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm font-semibold animate-pulse">
              🎓 Multi-Platform Learning
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Recommended Courses from Top Platforms
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Curated learning paths from Coursera, Udemy, and YouTube - all in one place
          </p>
          
          {/* Domain Filter with Icons */}
          <div className="flex gap-3 justify-center flex-wrap">
            {[
              { name: 'Machine Learning', icon: '🤖' },
              { name: 'Deep Learning', icon: '🧠' },
              { name: 'Data Science', icon: '📊' },
              { name: 'Web Development', icon: '💻' },
              { name: 'Cloud Computing', icon: '☁️' },
              { name: 'DevOps', icon: '⚙️' }
            ].map((domain) => (
              <button
                key={domain.name}
                onClick={() => setSelectedDomain(domain.name)}
                className={`group px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedDomain === domain.name
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                    : 'bg-[#1a1f3a] border border-gray-700 text-gray-300 hover:border-cyan-500 hover:scale-105'
                }`}
              >
                <span className="mr-2">{domain.icon}</span>
                {domain.name}
              </button>
            ))}
          </div>
        </div>

        {loadingCourses ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-semibold animate-pulse">Loading top courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <a
                  key={index}
                  href={course.url || course.link || `https://www.coursera.org/search?query=${encodeURIComponent(course.name || course.title || selectedDomain)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    // Ensure the link opens in new tab
                    if (course.url || course.link) {
                      window.open(course.url || course.link, '_blank', 'noopener,noreferrer');
                      e.preventDefault();
                    }
                  }}
                  className="group relative bg-[#1a1f3a] border border-gray-700 rounded-2xl overflow-hidden hover:border-cyan-500 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Top Rated Badge */}
                  {index < 3 && (
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Top Rated
                    </div>
                  )}

                  {/* Platform Badge */}
                  <div className={`absolute top-3 ${index < 3 ? 'left-28' : 'left-3'} z-10 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                    course.platform === 'Coursera' ? 'bg-blue-600' :
                    course.platform === 'Udemy' ? 'bg-purple-600' :
                    'bg-red-600'
                  } text-white`}>
                    {course.platform}
                  </div>

                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                    {course.image || course.imageUrl || course.thumbnail ? (
                      <img 
                        src={course.image || course.imageUrl || course.thumbnail} 
                        alt={course.name || course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-center ${course.image || course.imageUrl || course.thumbnail ? 'hidden' : ''}`}>
                      <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-cyan-300 text-sm font-semibold">{course.platform} Course</span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
                      {course.difficulty || course.level || 'All Levels'}
                    </div>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold text-sm w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
                        <Rocket className="w-4 h-4" />
                        {course.platform === 'YouTube' ? 'Watch Now' : 
                         course.platform === 'Udemy' ? 'View Course' : 
                         'Enroll Now'}
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* University/Partner & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      {course.partner || course.university ? (
                        <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 font-semibold">
                          {course.partner || course.university}
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 font-semibold">
                          Coursera
                        </span>
                      )}
                      {course.rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-yellow-400 font-bold">⭐ {course.rating}</span>
                          {course.reviews && (
                            <span className="text-gray-500">({course.reviews})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors min-h-[56px]">
                      {course.name || course.title || 'Professional Course'}
                    </h3>

                    {/* Course Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3 min-h-[60px]">
                      {course.description || course.summary || 'Master essential skills with this comprehensive course from top instructors. Gain practical experience and advance your career.'}
                    </p>

                    {/* Course Meta Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex flex-col gap-1">
                        {course.duration && (
                          <span className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {course.duration}
                          </span>
                        )}
                        {course.enrolled && (
                          <span className="flex items-center gap-2 text-xs text-gray-400">
                            <Users className="w-3 h-3 text-purple-400" />
                            {course.enrolled} students
                          </span>
                        )}
                      </div>
                      <div className="text-cyan-400 hover:text-cyan-300 font-bold text-sm transition-all flex items-center gap-1 group-hover:gap-2">
                        <span className="group-hover:underline">
                          {course.platform === 'YouTube' ? 'Watch' : 
                           course.platform === 'Udemy' ? 'View' : 
                           'Learn'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Animated Border Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10"></div>
                </a>
              ))}
            </div>

            {/* View All Courses Button */}
            <div className="text-center mt-12">
              <a
                href={`https://www.coursera.org/search?query=${encodeURIComponent(selectedDomain)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-2xl hover:shadow-cyan-500/50 flex items-center gap-3 mx-auto w-fit"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Explore All {selectedDomain} Courses
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </a>
              <p className="text-sm text-gray-500 mt-4">
                Join thousands of learners worldwide 🌍
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-[#1a1f3a] rounded-2xl border border-gray-700">
            <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-400 text-lg mb-2">No courses found</p>
            <p className="text-gray-500 text-sm">Try selecting a different domain</p>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            Choose Your Learning Path
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock your potential with our flexible pricing plans designed for every learner
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="group relative bg-[#1a1f3a] border border-gray-700 rounded-2xl p-8 hover:border-blue-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="px-4 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-sm font-semibold">
                Starter
              </span>
            </div>
            
            <div className="text-center mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-blue-400">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-8">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>100 Practice Problems</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Basic AI Guidance</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Community Support</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Progress Tracking</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 opacity-50">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>Advanced Projects</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 opacity-50">
                <X className="w-5 h-5 flex-shrink-0" />
                <span>1-on-1 Mentorship</span>
              </li>
            </ul>

            <button className="w-full bg-blue-500/20 border-2 border-blue-500 text-blue-400 py-3 rounded-xl font-semibold hover:bg-blue-500 hover:text-white transition-all">
              Get Started Free
            </button>
          </div>

          {/* Pro Plan - Featured */}
          <div className="group relative bg-gradient-to-br from-orange-500/20 to-purple-500/20 border-2 border-orange-500 rounded-2xl p-8 hover:scale-110 transition-all hover:shadow-2xl hover:shadow-orange-500/40 transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full text-white text-sm font-semibold animate-pulse shadow-lg">
                ⭐ MOST POPULAR
              </span>
            </div>
            
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-orange-500 opacity-20 blur-xl animate-gradient"></div>
            
            <div className="relative text-center mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">$29</span>
                <span className="text-gray-300">/month</span>
              </div>
              <p className="text-gray-300 mb-8">For serious learners</p>
            </div>

            <ul className="relative space-y-4 mb-8">
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span><strong>Unlimited</strong> Practice Problems</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span><strong>Advanced</strong> AI Guidance</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>Priority Support</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>Real-time Career Insights</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>Advanced Project Templates</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>Resume Review & Feedback</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>Interview Preparation</span>
              </li>
            </ul>

            <button className="relative w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-orange-500/50 overflow-hidden group">
              <span className="relative z-10">Upgrade to Pro</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="group relative bg-[#1a1f3a] border border-gray-700 rounded-2xl p-8 hover:border-purple-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="px-4 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-purple-400 text-sm font-semibold">
                Enterprise
              </span>
            </div>
            
            <div className="text-center mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Teams</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-purple-400">$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-8">For teams & organizations</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span><strong>Everything in Pro</strong></span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Up to 10 Team Members</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>1-on-1 Mentorship Sessions</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Custom Learning Paths</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Analytics Dashboard</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Dedicated Account Manager</span>
              </li>
            </ul>

            <button className="w-full bg-purple-500/20 border-2 border-purple-500 text-purple-400 py-3 rounded-xl font-semibold hover:bg-purple-500 hover:text-white transition-all">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">Secure payment powered by</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 px-6 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" className="text-blue-400"/>
                <path d="M2 10h20" stroke="currentColor" strokeWidth="2" className="text-blue-400"/>
              </svg>
              <span className="text-gray-300 font-semibold">Card</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg hover:border-purple-500 transition-colors">
              <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-gray-300 font-semibold">PayPal</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg hover:border-green-500 transition-colors">
              <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              <span className="text-gray-300 font-semibold">Wallet</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg hover:border-orange-500 transition-colors">
              <svg className="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
              <span className="text-gray-300 font-semibold">UPI</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            🔒 100% Secure checkout • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>

      {/* Recent Problems Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
          Trending Assignments
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands solving these popular challenges
        </p>
        <div className="bg-[#1a1f3a] border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e27] border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Problem</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Domain</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Solved By</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProblems.map((problem, index) => (
                  <tr 
                    key={problem.id} 
                    className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-purple-500/5 transition-all group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-600 group-hover:text-green-500 transition-colors" />
                        <span className="text-white group-hover:text-orange-400 transition-colors">{problem.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                        {problem.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{problem.solved.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button className="text-orange-500 hover:text-orange-400 font-semibold transition-all group-hover:translate-x-1">
                        Solve →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 text-sm font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400" />
              Trusted by 10,000+ Learners
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Success Stories from Our Community
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Real feedback from learners who transformed their careers with SkillBridge
          </p>
        </div>
        
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="relative bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-2xl p-12 text-center overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 animate-gradient"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Level Up Your Career?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are mastering their tech skills with AI-powered guidance and hands-on practice
            </p>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              {isSignedIn ? (
                <Link href="/guidance">
                  <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/50">
                    Start Learning Now
                  </button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-orange-500/50">
                    Start Learning Now
                  </button>
                </SignUpButton>
              )}
              <button className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105">
                View All Assignments
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>© 2025 Skill Bridge. Empowering careers through AI and practice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Syntax highlighting helper function
function highlightSyntax(line: string) {
  // Keywords
  const keywords = ['import', 'from', 'class', 'def', 'return', 'async', 'await', 'const', 'let', 'var', 'function', 'export', 'interface', 'type', 'if', 'else', 'for', 'while', 'new'];
  
  let highlighted = line;
  
  // Highlight comments
  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-gray-500 italic">{line}</span>;
  }
  
  // Highlight strings
  const stringRegex = /(['"`])(.*?)\1/g;
  const hasStrings = stringRegex.test(line);
  
  if (hasStrings) {
    return (
      <span>
        {line.split(/(['"`].*?['"`])/).map((part, i) => {
          if (part.match(/^['"`].*['"`]$/)) {
            return <span key={i} className="text-green-400">{part}</span>;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }
  
  // Highlight keywords
  const parts = line.split(/(\s+)/);
  return (
    <span>
      {parts.map((part, i) => {
        if (keywords.includes(part)) {
          return <span key={i} className="text-purple-400 font-semibold">{part}</span>;
        }
        if (part.match(/^[A-Z][a-zA-Z]*$/)) {
          return <span key={i} className="text-blue-400">{part}</span>;
        }
        if (part.match(/^\d+$/)) {
          return <span key={i} className="text-orange-400">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
