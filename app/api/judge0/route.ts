import { NextRequest, NextResponse } from 'next/server';

const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

// Language names for JDoodle API
const LANGUAGE_MAP: { [key: string]: string } = {
  javascript: 'nodejs',
  python: 'python3',
  java: 'java',
  cpp: 'cpp17',
  c: 'c',
  csharp: 'csharp',
  typescript: 'nodejs',
  go: 'go',
  rust: 'rust',
};

interface SubmissionRequest {
  language: string;
  code: string;
  input?: string;
  testCases?: { input: string; expectedOutput: string; wrappedCode?: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmissionRequest = await request.json();
    const { language, code, input, testCases } = body;

    // Check if we have testCases with wrappedCode
    const hasWrappedCode = testCases && testCases.length > 0 && testCases[0].wrappedCode;

    if (!hasWrappedCode && (!code || !language)) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const languageName = LANGUAGE_MAP[language?.toLowerCase() || 'python'];
    if (!languageName) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    // If test cases are provided, run multiple submissions
    if (testCases && testCases.length > 0) {
      const results = [];
      
      // Run test cases sequentially with delay to avoid rate limiting
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const codeToRun = testCase.wrappedCode || code;
        const result = await runSubmission(languageName, codeToRun, testCase.input, testCase.expectedOutput, i);
        results.push(result);
        
        // Add a small delay between requests to avoid rate limiting (except for the last one)
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      const allPassed = results.every(r => r.passed);
      const totalTests = results.length;
      const passedTests = results.filter(r => r.passed).length;

      return NextResponse.json({
        success: true,
        allPassed,
        summary: `${passedTests}/${totalTests} test cases passed`,
        results,
      });
    }

    // Single submission with custom input
    const result = await runSubmission(languageName, code, input || '');
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('JDoodle API Error:', error);
    return NextResponse.json(
      { error: 'Code execution failed', details: error.message },
      { status: 500 }
    );
  }
}

async function runSubmission(
  language: string,
  code: string,
  input: string,
  expectedOutput?: string,
  testCaseIndex?: number
): Promise<any> {
  try {
    const submissionResponse = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        language: language,
        versionIndex: '0',
        stdin: input || '',
      }),
    });

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error('JDoodle API failed:', errorText);
      
      if (submissionResponse.status === 429) {
        return {
          success: false,
          passed: false,
          error: 'Rate Limit',
          message: 'Too many requests. Please wait.',
          testCase: testCaseIndex !== undefined ? testCaseIndex + 1 : undefined,
          input,
        };
      }
      
      throw new Error(`JDoodle API failed: ${submissionResponse.status}`);
    }

    const result = await submissionResponse.json();

    // Check for compilation or runtime errors
    if (result.statusCode === 400 || result.error) {
      return {
        success: false,
        passed: false,
        error: 'Compilation Error',
        message: result.error || 'Code failed to compile',
        testCase: testCaseIndex !== undefined ? testCaseIndex + 1 : undefined,
        input,
      };
    }

    const output = (result.output || '').trim();
    const cpuTime = result.cpuTime || '0';
    const memory = result.memory || '0';

    // If expected output is provided, check if it matches
    if (expectedOutput !== undefined) {
      const passed = output === expectedOutput.trim();
      return {
        success: true,
        passed,
        testCase: testCaseIndex !== undefined ? testCaseIndex + 1 : undefined,
        input,
        expectedOutput: expectedOutput.trim(),
        actualOutput: output,
        executionTime: `${cpuTime}s`,
        memory: `${memory} KB`,
      };
    }

    // Return raw output
    return {
      success: true,
      output,
      executionTime: `${cpuTime}s`,
      memory: `${memory} KB`,
    };

  } catch (error: any) {
    return {
      success: false,
      passed: false,
      error: 'Execution Error',
      message: error.message,
      testCase: testCaseIndex !== undefined ? testCaseIndex + 1 : undefined,
      input,
    };
  }
}
