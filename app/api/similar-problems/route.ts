import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI || '');

export async function POST(request: NextRequest) {
  try {
    const { problemTitle, category, difficulty } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Suggest 5 similar coding problems to "${problemTitle}" (Category: ${category}, Difficulty: ${difficulty}).

For each problem, provide:
1. Problem Title
2. Difficulty Level
3. Key Concepts/Tags
4. Brief Description (2-3 lines)
5. Why it's similar

Format as a JSON array of objects with fields: title, difficulty, tags, description, similarity.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\[[\s\S]*\]/);
    const problems = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : [];

    return NextResponse.json({ problems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, problems: [] }, { status: 500 });
  }
}
