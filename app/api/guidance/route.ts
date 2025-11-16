import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { tavily } from '@tavily/core';

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

    // Create model instance
    const model = new ChatGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxOutputTokens: 1024, // Reduced for shorter responses
    });

    // Handle different conversation contexts
    let prompt = '';
    let searchQuery = '';

    if (isFollowUp) {
      // For follow-up questions, keep it concise
      searchQuery = `${careerPath} ${userQuery} 2025`;
      const searchData = await searchWithTavily(searchQuery, 2);
      
      prompt = `You are a helpful AI career counselor. The user is interested in ${careerPath} career.
${userSkills && userSkills.length > 0 ? `User's current skills: ${userSkills.join(', ')}` : ''}

User asks: "${userQuery}"

${searchData ? `Latest info:\n${searchData}\n` : ''}

Provide a CONCISE, focused answer (3-5 key points max). Be direct and helpful. Use bullet points and emojis.`;
    } else {
      // For initial comprehensive guidance
      searchQuery = `${careerPath} career path roadmap skills 2025`;
      const searchData = await searchWithTavily(searchQuery, 3);
      
      const levelContext = isFresher 
        ? "User is a COMPLETE BEGINNER with no prior experience."
        : `User has existing skills: ${userSkills?.join(', ')}. Build on what they already know.`;
      
      prompt = `You are an AI career counselor. Create a personalized learning plan for ${careerPath}.

${levelContext}

${searchData ? `Current market data:\n${searchData}\n` : ''}

Provide a FOCUSED response with these sections (keep each section SHORT - 3-4 points max):

🎯 **CAREER OVERVIEW** (2-3 sentences about the role)

📚 **KEY SKILLS NEEDED** (List 5-6 most important skills only)

🗺️ **LEARNING ROADMAP** 
${isFresher ? '- Start: Basics (1-2 months)\n- Next: Intermediate (2-3 months)\n- Advanced: Specialization (3-4 months)' : '- What to learn next based on current skills\n- Focus areas for growth'}

💡 **TOP 3 RESOURCES** (Just 3 best resources - courses/books)

🚀 **2-3 PROJECT IDEAS** (Specific to ${isFresher ? 'beginners' : 'their level'})

🔥 **QUICK START** (3-4 action steps to begin THIS WEEK)

Keep it concise and actionable. Use emojis and bullet points. NO long paragraphs.`;
    }

    const response = await model.invoke([new HumanMessage(prompt)]);
    const guidance = response.content as string;

    return NextResponse.json({ 
      guidance,
      career: careerPath,
      timestamp: new Date().toISOString(),
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
