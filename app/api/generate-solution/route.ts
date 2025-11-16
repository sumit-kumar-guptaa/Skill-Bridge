import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { problemTitle, problemDescription, language } = await req.json();

    if (!problemTitle || !problemDescription) {
      return NextResponse.json(
        { error: 'Problem title and description are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert programmer. Generate a complete, production-ready solution for the following coding problem.

Problem Title: ${problemTitle}

Problem Description:
${problemDescription}

Language: ${language || 'JavaScript'}

Requirements:
1. Write clean, well-commented code
2. Include proper error handling
3. Make it efficient and optimized
4. Follow best practices for ${language || 'JavaScript'}
5. The solution should be complete and executable

Provide ONLY the code solution without any explanations or markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const solution = response.text();

    if (!solution) {
      return NextResponse.json(
        { error: 'Failed to generate solution' },
        { status: 500 }
      );
    }

    // Clean up markdown code blocks if present
    let cleanedSolution = solution.trim();
    if (cleanedSolution.startsWith('```')) {
      cleanedSolution = cleanedSolution
        .replace(/^```[\w]*\n/, '')
        .replace(/```$/, '')
        .trim();
    }

    return NextResponse.json({
      solution: cleanedSolution,
      language: language || 'javascript',
    });

  } catch (error) {
    console.error('Solution generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate solution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
