#!/usr/bin/env node

// MCP Server must be run with: node --loader tsx lib/mcp/skillbridge-server.ts
// Or use: npm run mcp:server

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

// SkillBridge MCP Server - Comprehensive Integration
// Provides AI with full context about coding problems, user progress, and execution capabilities

interface UserProgress {
  totalSolved: number;
  successRate: number;
  currentStreak: number;
  achievements: string[];
  recentActivity: Array<{
    problemId: string;
    problemTitle: string;
    timestamp: number;
    success: boolean;
    language: string;
  }>;
  languageUsage: Record<string, number>;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface CodeExecutionRequest {
  language: string;
  code: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

class SkillBridgeServer {
  private server: Server;
  private projectRoot: string;
  
  // Simulated data store (replace with actual database in production)
  private problems: Problem[] = [];
  private userProgressCache: UserProgress | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "skillbridge-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.projectRoot = process.cwd();
    this.setupHandlers();
    this.loadProblems();
  }

  private async loadProblems() {
    // Load problems from data directory or database
    // This is a placeholder - in production, this would query your database
    this.problems = [
      {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        constraints: ["2 <= nums.length <= 10^4"],
        testCases: [
          { input: "2,7,11,15\n9", expectedOutput: "[0,1]" }
        ]
      }
    ];
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) =>
      this.handleToolCall(request.params.name, request.params.arguments)
    );
  }

  private getTools(): Tool[] {
    return [
      {
        name: "get_user_progress",
        description: "Retrieve comprehensive user progress data including solved problems, success rate, streak, achievements, and learning patterns. Use this to personalize recommendations and understand user's skill level.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID (optional - defaults to current user)",
            },
          },
        },
      },
      {
        name: "get_problem_details",
        description: "Get complete details about a specific coding problem including description, examples, constraints, and test cases. Use this to provide context-aware hints.",
        inputSchema: {
          type: "object",
          properties: {
            problemId: {
              type: ["string", "number"],
              description: "Problem ID or title",
            },
          },
          required: ["problemId"],
        },
      },
      {
        name: "search_problems",
        description: "Search for problems by difficulty, topic, or pattern. Returns matching problems with metadata. Use this to recommend similar problems.",
        inputSchema: {
          type: "object",
          properties: {
            difficulty: {
              type: "string",
              enum: ["Easy", "Medium", "Hard"],
              description: "Filter by difficulty",
            },
            topic: {
              type: "string",
              description: "Filter by topic (e.g., 'arrays', 'dynamic programming')",
            },
            excludeSolved: {
              type: "boolean",
              description: "Exclude problems user has already solved",
            },
            limit: {
              type: "number",
              description: "Maximum number of results",
            },
          },
        },
      },
      {
        name: "execute_code",
        description: "Execute user code against test cases using Judge0 API. Returns test results with input, expected output, and actual output. Use this to validate solutions.",
        inputSchema: {
          type: "object",
          properties: {
            language: {
              type: "string",
              enum: ["python", "javascript", "java", "cpp"],
              description: "Programming language",
            },
            code: {
              type: "string",
              description: "Source code to execute",
            },
            testCases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  input: { type: "string" },
                  expectedOutput: { type: "string" },
                },
              },
              description: "Test cases to run",
            },
          },
          required: ["language", "code", "testCases"],
        },
      },
      {
        name: "analyze_code_patterns",
        description: "Analyze user's code submission history to identify common patterns, strengths, weaknesses, and learning trajectory. Use this for personalized guidance.",
        inputSchema: {
          type: "object",
          properties: {
            problemId: {
              type: ["string", "number"],
              description: "Analyze patterns for specific problem (optional)",
            },
            language: {
              type: "string",
              description: "Filter by programming language",
            },
          },
        },
      },
      {
        name: "get_learning_path",
        description: "Generate personalized learning path based on user's current skill level, solved problems, and goals. Returns recommended next problems and topics.",
        inputSchema: {
          type: "object",
          properties: {
            focusArea: {
              type: "string",
              description: "Specific area to focus on (optional)",
            },
            difficulty: {
              type: "string",
              enum: ["Easy", "Medium", "Hard"],
              description: "Target difficulty level",
            },
          },
        },
      },
      {
        name: "track_submission",
        description: "Record a problem submission with code, result, and metadata. Updates user progress and achievement tracking.",
        inputSchema: {
          type: "object",
          properties: {
            problemId: {
              type: ["string", "number"],
              description: "Problem ID",
            },
            code: {
              type: "string",
              description: "Submitted code",
            },
            language: {
              type: "string",
              description: "Programming language used",
            },
            success: {
              type: "boolean",
              description: "Whether submission passed all tests",
            },
            executionTime: {
              type: "number",
              description: "Execution time in milliseconds",
            },
          },
          required: ["problemId", "code", "language", "success"],
        },
      },
      {
        name: "get_best_practices",
        description: "Retrieve language-specific best practices, common patterns, and optimization techniques. Use this to enhance code review feedback.",
        inputSchema: {
          type: "object",
          properties: {
            language: {
              type: "string",
              description: "Programming language",
            },
            topic: {
              type: "string",
              description: "Specific topic (e.g., 'recursion', 'sorting')",
            },
          },
          required: ["language"],
        },
      },
    ];
  }

  private async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case "get_user_progress":
          return await this.getUserProgress(args.userId);
        
        case "get_problem_details":
          return await this.getProblemDetails(args.problemId);
        
        case "search_problems":
          return await this.searchProblems(args);
        
        case "execute_code":
          return await this.executeCode(args);
        
        case "analyze_code_patterns":
          return await this.analyzeCodePatterns(args);
        
        case "get_learning_path":
          return await this.getLearningPath(args);
        
        case "track_submission":
          return await this.trackSubmission(args);
        
        case "get_best_practices":
          return await this.getBestPractices(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async getUserProgress(userId?: string): Promise<any> {
    // In production, fetch from database
    // For now, read from localStorage equivalent or cache
    
    if (this.userProgressCache) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(this.userProgressCache, null, 2),
          },
        ],
      };
    }

    // Simulated progress data
    const progress: UserProgress = {
      totalSolved: 12,
      successRate: 85,
      currentStreak: 5,
      achievements: ["First Blood", "Speed Demon", "Consistent Coder"],
      recentActivity: [
        {
          problemId: "1",
          problemTitle: "Two Sum",
          timestamp: Date.now() - 86400000,
          success: true,
          language: "python",
        },
        {
          problemId: "7",
          problemTitle: "Binary Search",
          timestamp: Date.now() - 172800000,
          success: true,
          language: "java",
        },
      ],
      languageUsage: {
        python: 5,
        javascript: 3,
        java: 4,
      },
      difficultyBreakdown: {
        easy: 6,
        medium: 5,
        hard: 1,
      },
    };

    this.userProgressCache = progress;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(progress, null, 2),
        },
      ],
    };
  }

  private async getProblemDetails(problemId: string | number): Promise<any> {
    const problem = this.problems.find(
      p => p.id === Number(problemId) || p.title.toLowerCase().includes(String(problemId).toLowerCase())
    );

    if (!problem) {
      return {
        content: [
          {
            type: "text",
            text: `Problem not found: ${problemId}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(problem, null, 2),
        },
      ],
    };
  }

  private async searchProblems(args: any): Promise<any> {
    let filtered = [...this.problems];

    if (args.difficulty) {
      filtered = filtered.filter(p => p.difficulty === args.difficulty);
    }

    if (args.topic) {
      filtered = filtered.filter(p => 
        p.description.toLowerCase().includes(args.topic.toLowerCase())
      );
    }

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(filtered, null, 2),
        },
      ],
    };
  }

  private async executeCode(args: CodeExecutionRequest): Promise<any> {
    // Call Judge0 API through internal endpoint
    try {
      const response = await fetch("http://localhost:3000/api/judge0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: args.language,
          code: args.code,
          testCases: args.testCases,
        }),
      });

      const results = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async analyzeCodePatterns(args: any): Promise<any> {
    // Analyze user's submission history
    // In production, query database for all submissions
    
    const analysis = {
      commonPatterns: [
        "Prefers iterative solutions over recursive",
        "Strong with array manipulation",
        "Needs improvement in dynamic programming",
      ],
      strengths: [
        "Clean code structure",
        "Good variable naming",
        "Efficient time complexity",
      ],
      weaknesses: [
        "Sometimes misses edge cases",
        "Could optimize space complexity",
      ],
      learningTrajectory: "Progressing from Easy to Medium problems, ready for Hard challenges",
      recommendedTopics: ["Dynamic Programming", "Graph Algorithms", "Advanced Data Structures"],
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  private async getLearningPath(args: any): Promise<any> {
    const progress = this.userProgressCache || await this.getUserProgress();
    
    const learningPath = {
      currentLevel: "Intermediate",
      nextMilestone: "Solve 20 Medium problems",
      recommendedProblems: [
        {
          id: 15,
          title: "3Sum",
          difficulty: "Medium",
          reason: "Builds on Two Sum knowledge",
          estimatedTime: "30 minutes",
        },
        {
          id: 20,
          title: "Valid Parentheses",
          difficulty: "Easy",
          reason: "Practice stack fundamentals",
          estimatedTime: "15 minutes",
        },
      ],
      suggestedTopics: [
        "Two Pointers",
        "Sliding Window",
        "Hash Tables",
      ],
      weeklyGoal: "Complete 5 Medium problems",
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(learningPath, null, 2),
        },
      ],
    };
  }

  private async trackSubmission(args: any): Promise<any> {
    // In production, save to database
    const submission = {
      problemId: args.problemId,
      code: args.code,
      language: args.language,
      success: args.success,
      executionTime: args.executionTime,
      timestamp: Date.now(),
    };

    // Update progress cache
    if (this.userProgressCache && args.success) {
      this.userProgressCache.totalSolved += 1;
      this.userProgressCache.languageUsage[args.language] = 
        (this.userProgressCache.languageUsage[args.language] || 0) + 1;
    }

    return {
      content: [
        {
          type: "text",
          text: `Submission tracked successfully: ${JSON.stringify(submission)}`,
        },
      ],
    };
  }

  private async getBestPractices(args: any): Promise<any> {
    const practices: Record<string, any> = {
      python: {
        general: [
          "Use list comprehensions for cleaner code",
          "Prefer built-in functions like sum(), max(), min()",
          "Use enumerate() instead of range(len())",
          "Follow PEP 8 style guide",
        ],
        dataStructures: {
          arrays: "Use collections.deque for efficient popleft()",
          hashMaps: "Use collections.Counter for frequency counting",
        },
        algorithms: {
          sorting: "Python's Timsort is O(n log n) - use sorted() or .sort()",
          searching: "Use bisect module for binary search",
        },
      },
      java: {
        general: [
          "Use StringBuilder for string concatenation in loops",
          "Prefer Arrays.sort() for primitive arrays",
          "Use HashMap for O(1) lookups",
          "Follow Java naming conventions",
        ],
        dataStructures: {
          arrays: "Use ArrayList for dynamic arrays",
          hashMaps: "HashMap vs LinkedHashMap vs TreeMap",
        },
        algorithms: {
          sorting: "Collections.sort() uses dual-pivot Quicksort",
          searching: "Arrays.binarySearch() for sorted arrays",
        },
      },
      javascript: {
        general: [
          "Use const/let instead of var",
          "Prefer array methods like map(), filter(), reduce()",
          "Use Set for unique values, Map for key-value pairs",
          "Avoid nested callbacks - use async/await",
        ],
        dataStructures: {
          arrays: "Array methods are optimized - use them",
          hashMaps: "Use Map for non-string keys, Object for simple cases",
        },
        algorithms: {
          sorting: "Array.sort() needs comparator for numbers",
          searching: "indexOf() is O(n), use Set.has() for O(1)",
        },
      },
    };

    const language = args.language.toLowerCase();
    const bestPractices = practices[language] || { general: ["No specific practices found"] };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(bestPractices, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("SkillBridge MCP Server running on stdio");
  }
}

const server = new SkillBridgeServer();
server.run().catch(console.error);
