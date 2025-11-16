import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMCPClient } from '@/lib/mcp/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI || '');

export async function POST(request: NextRequest) {
  try {
    const { problemTitle, problemDescription, userCode, hintLevel, problemId } = await request.json();

    // 🔥 MCP Integration: Get user's coding patterns and best practices
    let userContext = '';
    try {
      const mcpClient = getMCPClient();
      await mcpClient.connect();

      // Get user's coding patterns
      const patterns = await mcpClient.analyzeCodePatterns({ problemId });
      const patternData = JSON.parse(patterns.content[0].text);
      
      userContext += `\n📊 USER CONTEXT:\n`;
      userContext += `- Common Patterns: ${patternData.commonPatterns.join(', ')}\n`;
      userContext += `- Strengths: ${patternData.strengths.join(', ')}\n`;
      userContext += `- Areas to Improve: ${patternData.weaknesses.join(', ')}\n`;

      // Get problem-specific details from MCP if problemId provided
      if (problemId) {
        const problemDetails = await mcpClient.getProblemDetails(problemId);
        const problem = JSON.parse(problemDetails.content[0].text);
        
        if (problem.examples && problem.examples.length > 0) {
          userContext += `\n📝 PROBLEM EXAMPLES:\n`;
          problem.examples.slice(0, 2).forEach((ex: any, i: number) => {
            userContext += `Example ${i + 1}: Input: ${ex.input}, Output: ${ex.output}\n`;
          });
        }
      }

      // Get language-specific best practices
      const language = detectLanguage(userCode);
      if (language) {
        const practices = await mcpClient.getBestPractices({ language });
        const practiceData = JSON.parse(practices.content[0].text);
        
        userContext += `\n💡 ${language.toUpperCase()} TIPS:\n`;
        if (practiceData.general) {
          userContext += practiceData.general.slice(0, 2).map((p: string) => `- ${p}`).join('\n');
        }
      }

    } catch (mcpError) {
      console.warn('MCP context unavailable:', mcpError);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompts = {
      1: `Give a subtle hint for solving "${problemTitle}". Don't reveal the solution, just guide the thinking process.
      
Problem: ${problemDescription}

${userContext}

Based on the user's patterns and strengths, provide a hint that helps them think through the problem.`,

      2: `Give a more specific hint for "${problemTitle}". Mention the data structure or algorithm approach without code.
      
Problem: ${problemDescription}

${userContext}

User's current code:
\`\`\`
${userCode}
\`\`\`

Considering their coding patterns, suggest the right approach and data structure.`,

      3: `Give a detailed hint with pseudocode for "${problemTitle}".
      
Problem: ${problemDescription}

${userContext}

User's current code:
\`\`\`
${userCode}
\`\`\`

Provide pseudocode that addresses their specific weaknesses while leveraging their strengths.`,
    };

    const prompt = prompts[hintLevel as keyof typeof prompts] || prompts[1];

    const result = await model.generateContent(prompt);
    const hint = result.response.text();

    return NextResponse.json({ hint, mcpEnhanced: !!userContext });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to detect programming language
function detectLanguage(code: string): string | null {
  if (!code) return null;
  
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('public class') || code.includes('public static void')) return 'java';
  if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'javascript';
  if (code.includes('#include') || code.includes('std::')) return 'cpp';
  
  return null;
}

