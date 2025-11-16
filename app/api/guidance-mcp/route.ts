import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { tavily } from '@tavily/core';
import { getMCPClient } from '@/lib/mcp/client';

const GEMINI_API_KEY = 'AIzaSyAs275peqnqCjNEX5PS3CNpmk67y0eZA3U';
const TAVILY_API_KEY = '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';

// Initialize Tavily client
const tavilyClient = tavily({ apiKey: TAVILY_API_KEY });

// Function to search for real-time information
async function searchWithTavily(query: string, maxResults: number = 3): Promise<string> {
  try {
    const response = await tavilyClient.search(query, {
      maxResults,
      searchDepth: 'advanced',
      includeAnswer: true,
      includeRawContent: false,
    });
    
    let context = '';
    if (response.answer) {
      context += `${response.answer}\n`;
    }
    
    if (response.results && response.results.length > 0) {
      response.results.slice(0, 2).forEach((result: any) => {
        context += `\n${result.content.substring(0, 200)}...`;
      });
    }
    
    return context;
  } catch (error) {
    console.error('Tavily search error:', error);
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const { career, userQuery, userSkills, experienceLevel, isFresher, isFollowUp } = await request.json();

    if (!userQuery) {
      return NextResponse.json(
        { error: 'User query is required' },
        { status: 400 }
      );
    }

    const careerPath = career || userQuery;

    // 🔥 MCP Integration: Get user's coding progress and patterns
    let userProgressContext = '';
    let learningPathSuggestions = '';
    let codePatternAnalysis = '';
    
    try {
      const mcpClient = getMCPClient();
      await mcpClient.connect();

      // Get comprehensive user progress
      const progressResult = await mcpClient.getUserProgress();
      const progress = JSON.parse(progressResult.content[0].text);
      
      userProgressContext = `
📊 **USER'S CODING PROGRESS**:
- Total Problems Solved: ${progress.totalSolved}
- Success Rate: ${progress.successRate}%
- Current Streak: ${progress.currentStreak} days
- Achievements: ${progress.achievements.join(', ')}
- Primary Languages: ${Object.keys(progress.languageUsage).join(', ')}
- Difficulty Breakdown: Easy (${progress.difficultyBreakdown.easy}), Medium (${progress.difficultyBreakdown.medium}), Hard (${progress.difficultyBreakdown.hard})
`;

      // Get personalized learning path
      const learningPath = await mcpClient.getLearningPath({
        focusArea: careerPath,
      });
      const pathData = JSON.parse(learningPath.content[0].text);
      
      learningPathSuggestions = `
🎯 **PERSONALIZED LEARNING PATH**:
- Current Level: ${pathData.currentLevel}
- Next Milestone: ${pathData.nextMilestone}
- Suggested Topics: ${pathData.suggestedTopics.join(', ')}
- Weekly Goal: ${pathData.weeklyGoal}
`;

      // Analyze coding patterns
      const patterns = await mcpClient.analyzeCodePatterns({});
      const patternData = JSON.parse(patterns.content[0].text);
      
      codePatternAnalysis = `
💡 **YOUR CODING PATTERNS**:
- Strengths: ${patternData.strengths.join(', ')}
- Areas to Improve: ${patternData.weaknesses.join(', ')}
- Learning Trajectory: ${patternData.learningTrajectory}
`;

      // Get best practices for user's primary language
      const primaryLanguage = Object.keys(progress.languageUsage)[0];
      if (primaryLanguage) {
        const bestPractices = await mcpClient.getBestPractices({
          language: primaryLanguage,
        });
        const practices = JSON.parse(bestPractices.content[0].text);
        
        codePatternAnalysis += `
📚 **${primaryLanguage.toUpperCase()} BEST PRACTICES**:
${practices.general.slice(0, 3).map((p: string) => `- ${p}`).join('\n')}
`;
      }

    } catch (mcpError) {
      console.warn('MCP context unavailable, proceeding with basic guidance:', mcpError);
      // Gracefully degrade to non-MCP mode if server is unavailable
    }

    // Create model instance
    const model = new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    // Handle different conversation contexts
    let prompt = '';
    let searchQuery = '';

    if (isFollowUp) {
      // For follow-up questions with MCP context
      searchQuery = `${careerPath} ${userQuery} 2025`;
      const searchData = await searchWithTavily(searchQuery, 2);
      
      prompt = `You are an AI career counselor with FULL CONTEXT about the user's progress.

User is interested in: ${careerPath}

${userProgressContext}
${codePatternAnalysis}

User asks: "${userQuery}"

${searchData ? `Latest info:\n${searchData}\n` : ''}

Provide a PERSONALIZED answer based on their actual progress and patterns. Be specific and reference their strengths/weaknesses. Keep it concise (3-5 key points).`;
    } else {
      // For initial comprehensive guidance with MCP context
      searchQuery = `${careerPath} career path roadmap skills 2025`;
      const searchData = await searchWithTavily(searchQuery, 3);
      
      const levelContext = isFresher 
        ? "User is a COMPLETE BEGINNER with no prior experience."
        : `User has existing skills: ${userSkills?.join(', ')}. Build on what they already know.`;
      
      prompt = `You are an AI career counselor with COMPLETE USER CONTEXT from their coding journey.

Career Goal: ${careerPath}

${levelContext}

${userProgressContext}
${learningPathSuggestions}
${codePatternAnalysis}

${searchData ? `Current market data:\n${searchData}\n` : ''}

Create a HYPER-PERSONALIZED learning plan that:
1. Builds on their existing ${userProgressContext ? 'coding progress' : 'background'}
2. Addresses their specific weaknesses
3. Leverages their strengths
4. Aligns with their current skill level

Provide these sections:

🎯 **CAREER OVERVIEW FOR YOU** (How ${careerPath} fits YOUR current skills)

📚 **SKILLS TO LEARN NEXT** (Based on what you already know - be specific)

🗺️ **YOUR PERSONALIZED ROADMAP** 
- Immediate Next Steps (this week)
- Short-term Goals (1-2 months)
- Long-term Mastery (3-6 months)

💡 **RESOURCES MATCHED TO YOUR LEVEL**

🚀 **PROJECT IDEAS** (Aligned with your ${userProgressContext ? 'solved problems and favorite languages' : 'current level'})

🔥 **ACTION PLAN** (Specific to YOU - reference your actual progress)

Be ULTRA PERSONALIZED. Reference their actual achievements, patterns, and progress. Use emojis and bullet points.`;
    }

    const response = await model.invoke([new HumanMessage(prompt)]);
    const guidance = response.content as string;

    return NextResponse.json({ 
      guidance,
      career: careerPath,
      timestamp: new Date().toISOString(),
      mcpEnhanced: !!userProgressContext, // Indicates if MCP context was used
    });
  } catch (error: any) {
    console.error('Error generating guidance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate guidance. Please try again.',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
