import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// MCP Client for SkillBridge
// Use this to connect to the MCP server from Next.js API routes

interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

class SkillBridgeMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connected: boolean = false;

  async connect() {
    if (this.connected) return;

    try {
      // Create transport with updated Node.js 20 syntax
      this.transport = new StdioClientTransport({
        command: "node",
        args: ["--import", "tsx", "--no-warnings", "./lib/mcp/skillbridge-server.ts"],
      });

      // Create and connect client
      this.client = new Client(
        {
          name: "skillbridge-nextjs-client",
          version: "1.0.0",
        },
        {
          capabilities: {},
        }
      );

      await this.client.connect(this.transport);
      this.connected = true;
      console.log("✅ Connected to SkillBridge MCP Server");
    } catch (error) {
      console.error("❌ Failed to connect to MCP server:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.connected) {
      await this.client.close();
      this.connected = false;
      console.log("🔌 Disconnected from MCP server");
    }
  }

  async callTool(name: string, args: Record<string, any>): Promise<any> {
    if (!this.connected || !this.client) {
      await this.connect();
    }

    try {
      const result = await this.client!.callTool({
        name,
        arguments: args,
      });

      return result;
    } catch (error) {
      console.error(`Error calling tool ${name}:`, error);
      throw error;
    }
  }

  // Convenience methods for common operations

  async getUserProgress(userId?: string) {
    return this.callTool("get_user_progress", { userId });
  }

  async getProblemDetails(problemId: string | number) {
    return this.callTool("get_problem_details", { problemId });
  }

  async searchProblems(filters: {
    difficulty?: string;
    topic?: string;
    excludeSolved?: boolean;
    limit?: number;
  }) {
    return this.callTool("search_problems", filters);
  }

  async executeCode(request: {
    language: string;
    code: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  }) {
    return this.callTool("execute_code", request);
  }

  async analyzeCodePatterns(filters: {
    problemId?: string | number;
    language?: string;
  }) {
    return this.callTool("analyze_code_patterns", filters);
  }

  async getLearningPath(options: {
    focusArea?: string;
    difficulty?: string;
  }) {
    return this.callTool("get_learning_path", options);
  }

  async trackSubmission(submission: {
    problemId: string | number;
    code: string;
    language: string;
    success: boolean;
    executionTime?: number;
  }) {
    return this.callTool("track_submission", submission);
  }

  async getBestPractices(options: {
    language: string;
    topic?: string;
  }) {
    return this.callTool("get_best_practices", options);
  }

  async listTools() {
    if (!this.connected || !this.client) {
      await this.connect();
    }

    const result = await this.client!.listTools();
    return result.tools;
  }
}

// Singleton instance
let mcpClient: SkillBridgeMCPClient | null = null;

export function getMCPClient(): SkillBridgeMCPClient {
  if (!mcpClient) {
    mcpClient = new SkillBridgeMCPClient();
  }
  return mcpClient;
}

export { SkillBridgeMCPClient };
