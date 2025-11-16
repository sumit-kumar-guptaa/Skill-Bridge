import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { code, language, problemTitle, problemDescription } = await request.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert code reviewer. Review this ${language} code for the problem "${problemTitle}".

Problem: ${problemDescription}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive review including:
1. **Correctness**: Does it solve the problem correctly?
2. **Time Complexity**: Analyze the time complexity (Big O notation)
3. **Space Complexity**: Analyze the space complexity
4. **Code Quality**: Rate readability, naming conventions, best practices
5. **Optimizations**: Suggest any performance improvements
6. **Bugs/Issues**: Point out potential bugs or edge cases missed
7. **Overall Score**: Rate the solution out of 10

Format your response clearly with sections.`;

    const result = await model.generateContent(prompt);
    const review = result.response.text();

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Code review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate code review' },
      { status: 500 }
    );
  }
}
