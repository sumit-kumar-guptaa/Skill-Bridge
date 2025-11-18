import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, END, START } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Career expertise database
const CAREER_DATA: Record<string, any> = {
  'SDE': {
    topics: ['DSA', 'System Design', 'Databases', 'Web Development', 'APIs'],
    languages: ['JavaScript', 'Python', 'Java', 'C++'],
    frameworks: ['React', 'Node.js', 'Spring Boot', 'Next.js'],
    practice: ['LeetCode', 'Codeforces', 'HackerRank'],
    learn: ['freeCodeCamp', 'The Odin Project', 'CS50'],
  },
  'ML Engineer': {
    topics: ['ML Algorithms', 'Statistics', 'Deep Learning', 'Data Processing'],
    languages: ['Python', 'R', 'SQL'],
    frameworks: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas'],
    practice: ['Kaggle', 'DrivenData', 'Analytics Vidhya'],
    learn: ['Andrew Ng Course', 'Fast.ai', 'StatQuest'],
  },
  'AI Engineer': {
    topics: ['NLP', 'Computer Vision', 'LLMs', 'Transformers', 'RAG'],
    languages: ['Python', 'C++'],
    frameworks: ['PyTorch', 'Hugging Face', 'LangChain', 'OpenCV'],
    practice: ['Hugging Face', 'Papers with Code'],
    learn: ['DeepLearning.AI', 'Fast.ai', 'OpenAI Cookbook'],
  },
  'DevOps': {
    topics: ['CI/CD', 'Containers', 'Kubernetes', 'IaC', 'Monitoring'],
    languages: ['Python', 'Bash', 'YAML'],
    frameworks: ['Docker', 'Kubernetes', 'Terraform', 'Ansible'],
    practice: ['KillerCoda', 'Kubernetes Playground'],
    learn: ['KodeKloud', 'TechWorld with Nana'],
  },
  'IoT Engineer': {
    topics: ['Embedded Systems', 'IoT Protocols', 'Sensors', 'Edge Computing'],
    languages: ['C', 'C++', 'Python'],
    frameworks: ['Arduino', 'Raspberry Pi', 'ESP32', 'MQTT'],
    practice: ['Tinkercad', 'Wokwi'],
    learn: ['Arduino Hub', 'GreatScott!', 'Andreas Spiess'],
  },
  'Cloud Engineer': {
    topics: ['Cloud Architecture', 'Networking', 'Security', 'Serverless'],
    languages: ['Python', 'Bash'],
    frameworks: ['Terraform', 'CloudFormation'],
    practice: ['AWS Free Tier', 'Azure Sandbox'],
    learn: ['AWS Skill Builder', 'A Cloud Guru'],
  },
};

// Initialize Gemini 2.0 Flash with LangChain
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    apiKey: apiKey,
    temperature: 0.9,
    maxOutputTokens: 8192,
  });
}

// LangGraph State Interface
interface GuidanceState {
  messages: (HumanMessage | AIMessage | SystemMessage)[];
  career: string;
  careerData: any;
  isInitialRoadmap: boolean;
}

// Create LangGraph workflow for stateful conversations
function createGuidanceGraph() {
  const model = getGeminiModel();

  // Define the agent node
  async function agent(state: GuidanceState) {
    const { messages, career, careerData, isInitialRoadmap } = state;
    
    console.log(`🤖 LangGraph Agent processing for: ${career}`);
    
    // Build system prompt dynamically
    let systemPrompt = '';
    
    if (isInitialRoadmap) {
      systemPrompt = `You are a world-class ${career} mentor with 15+ years at FAANG companies (Google, Meta, Amazon, Microsoft, Apple). You've trained 1000+ engineers to land jobs at top tech companies.

CAREER CONTEXT FOR ${career}:
- Core Topics: ${careerData.topics.join(', ')}
- Languages: ${careerData.languages.join(', ')}
- Frameworks: ${careerData.frameworks.join(', ')}
- Practice Platforms: ${careerData.practice.join(', ')}
- Learning Resources: ${careerData.learn.join(', ')}

YOUR MISSION:
Create a COMPREHENSIVE, PERSONALIZED, ULTRA-ACTIONABLE 90-day transformation roadmap.

STRUCTURE:

## 🎯 WEEK 1: DAY-BY-DAY BREAKDOWN
For EACH day (Day 1-7):
- Time blocks (Morning/Afternoon/Evening) with EXACT tasks
- Tools, accounts, tutorials with specific names
- Problems to solve (number + difficulty)
- Mini-projects with full tech stack
- Networking: who to connect, which communities
- Success metrics and celebration
- Progressive: each day builds on previous

## 📅 WEEKS 2-4: DETAILED WEEKLY PLANS
For each week:
- Weekly theme and focus
- Daily time allocation (hours breakdown)
- Specific topics and sub-topics
- Problems: exact count with difficulty split
- Project: name, features (5-7), tech stack, deployment
- Networking goals
- Blog posts to write
- Success metrics

## 🗺️ DAYS 31-60: INTERMEDIATE MASTERY
- Advanced specializations
- 2-3 complex projects
- 150-200 problems with distribution
- Open source strategy
- System design path
- Mock interviews (10+ sessions)
- Job prep begins

## 🚀 DAYS 61-90: JOB LANDING
- Final skill polish
- Interview intensive
- Resume perfection
- Application strategy (30-50 companies)
- Networking for referrals
- Negotiation prep

## 📚 RESOURCES (SPECIFIC)
- FREE Courses: Top 5 with exact names
- PAID Courses: Top 3 with prices
- YouTube: Channels and playlists
- Books: 3-5 must-reads
- Practice: Daily targets for ${careerData.practice.join(', ')}
- Communities: Discord/Slack/Reddit with links
- Blogs: Top 10 to follow

## 🚀 PROJECTS (4-6)
Each with:
- Name and description
- Why build it
- Complete tech stack
- 6-8 features
- APIs/databases
- Deployment
- Timeline

## 💼 INTERVIEW MASTERY
- ${career} interview topics
- Problem strategy (easy/medium/hard count)
- System design topics
- Mock interview schedule
- 15-20 common questions
- Behavioral STAR examples
- Company-specific prep

## 💰 CAREER INSIGHTS (2025)
- Salaries: India (₹) and USA ($) by level
- Top 25 companies
- Career progression timeline
- High-demand skills
- Remote/freelancing
- Negotiation strategies

## 💡 20 PRO TIPS
- Learning hacks
- Time management
- Networking that works
- Standing out
- Avoiding burnout
- Tools and workflows

## 📊 PROGRESS TRACKING
- Daily/weekly/monthly habits
- Milestones
- 90-day indicators

## 🎯 START NOW: 3 ACTIONS
Give 3 tasks for the NEXT HOUR.

BE SPECIFIC: Real names, actual numbers, concrete timelines.
BE REALISTIC: 4-6 hours daily.
BE MOTIVATING: Wins, celebrations, community.
USE EMOJIS: Visual structure.
MARKDOWN: Headers, lists, code blocks.`;
    } else {
      systemPrompt = `You are a world-class ${career} mentor with 15+ years at FAANG companies.

EXPERTISE IN ${career}:
- Topics: ${careerData.topics.join(', ')}
- Tech Stack: ${careerData.languages.join(', ')}, ${careerData.frameworks.join(', ')}
- Platforms: ${careerData.practice.join(', ')}

RESPONSE STRUCTURE:

## 🎯 DIRECT ANSWER (2-3 paragraphs)
Clear, actionable solution with context.

## 📋 DETAILED BREAKDOWN
- Step-by-step approach
- Technical details
- Common pitfalls
- Time estimates

## 💻 CODE EXAMPLES (if relevant)
Working snippets with explanations.

## 📚 RESOURCES (3-5 specific)
- Courses/tutorials
- YouTube videos
- Books/docs
- Practice problems

## 💡 PRO TIPS (3-5)
- What experts wish they knew
- Time-savers
- Career strategies

## 🎯 NEXT STEPS
Immediate actions, practice plan, progress metrics.

BE COMPREHENSIVE: 8-15 paragraphs.
BE SPECIFIC: Real examples, numbers, timelines.
USE EMOJIS: Visual clarity.
MARKDOWN: Clear structure.`;
    }

    // Add system message at the start
    const allMessages = [
      new SystemMessage(systemPrompt),
      ...messages
    ];

    // Call LLM
    const response = await model.invoke(allMessages);
    
    console.log(`✅ LangGraph generated ${response.content.toString().length} chars`);
    
    return {
      messages: [...messages, response],
    };
  }

  // Build the graph
  const workflow = new StateGraph<GuidanceState>({
    channels: {
      messages: {
        value: (left: any[], right: any[]) => left.concat(right),
        default: () => [],
      },
      career: {
        value: (left: string, right: string) => right || left,
        default: () => 'SDE',
      },
      careerData: {
        value: (left: any, right: any) => right || left,
        default: () => CAREER_DATA['SDE'],
      },
      isInitialRoadmap: {
        value: (left: boolean, right: boolean) => right ?? left,
        default: () => false,
      },
    },
  });

  // Add nodes
  workflow.addNode('agent', agent);

  // Define edges - connect start to agent, agent to end
  (workflow as any).addEdge(START, 'agent');
  (workflow as any).addEdge('agent', END);

  // Compile with memory
  const memory = new MemorySaver();
  return workflow.compile({ checkpointer: memory });
}

// Main API handler
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { career, userQuery, isFollowUp, sessionId } = body;

    if (!career && !isFollowUp) {
      return NextResponse.json({
        guidance: '❌ Please select a career path!',
        error: 'No career specified',
      }, { status: 400, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
    }

    console.log(`\n📍 ${isFollowUp ? 'Follow-up' : 'Initial'} | Career: ${career} | Session: ${sessionId || 'new'}`);

    const careerData = CAREER_DATA[career] || CAREER_DATA['SDE'];
    const graph = createGuidanceGraph();
    
    // Prepare message
    const userMessage = isFollowUp 
      ? new HumanMessage(userQuery) 
      : new HumanMessage(`Create my personalized, ultra-detailed ${career} roadmap with day-by-day Week 1 breakdown, weekly plans for Weeks 2-4, and complete 90-day transformation path. Make it comprehensive and actionable!`);

    // Run LangGraph with state
    const config = { 
      configurable: { 
        thread_id: sessionId || `session_${Date.now()}` 
      } 
    };
    
    const result = await graph.invoke({
      messages: [userMessage],
      career: career,
      careerData: careerData,
      isInitialRoadmap: !isFollowUp,
    }, config) as any;

    const lastMessage = result.messages[result.messages.length - 1];
    const guidance = lastMessage.content.toString();

    const responseTime = Date.now() - startTime;
    console.log(`✅ LangGraph completed in ${responseTime}ms\n`);

    return NextResponse.json({
      guidance,
      career: career || 'SDE',
      responseTime,
      timestamp: new Date().toISOString(),
      powered_by: 'Gemini 2.0 Flash + LangGraph',
      is_dynamic: true,
      session_id: config.configurable.thread_id,
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });

  } catch (error: any) {
    console.error('❌ LangGraph error:', error);
    
    let career = 'SDE';
    try {
      const body = await request.json();
      career = body.career || career;
    } catch (e) {
      // ignore
    }
    
    // No hardcoded guidance. Return clean 503 to trigger retry on client.
    return NextResponse.json({
      guidance: '⚠️ Unable to generate roadmap right now. Please try again in a moment.',
      error: error?.message || 'Unknown error',
      career,
      fallback: true,
      retry_suggested: true,
    }, { status: 503, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
  }
}
