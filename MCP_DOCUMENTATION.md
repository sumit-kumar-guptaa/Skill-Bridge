# SkillBridge MCP Server Integration

## Overview

The **SkillBridge MCP (Model Context Protocol) Server** provides comprehensive context about user progress, coding patterns, and problem details to AI assistants. This enables **hyper-personalized** learning experiences by giving AI full access to:

- User's coding journey (problems solved, languages, success rate)
- Learning patterns and strengths/weaknesses
- Real-time code execution capabilities
- Best practices and optimization techniques
- Personalized learning paths

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SkillBridge Platform                    │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   Next.js    │───→│  MCP Client  │───→│   MCP    │  │
│  │  API Routes  │    │   (lib/mcp)  │    │  Server  │  │
│  └──────────────┘    └──────────────┘    └──────────┘  │
│         │                    │                   │       │
│         ↓                    ↓                   ↓       │
│  ┌──────────────────────────────────────────────────┐  │
│  │          User Progress Database                   │  │
│  │  (localStorage → PostgreSQL/MongoDB in prod)     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## MCP Server Tools

The SkillBridge MCP server provides 8 powerful tools:

### 1. `get_user_progress`
**Purpose**: Retrieve comprehensive user progress data

**Returns**:
- Total problems solved
- Success rate and current streak
- Achievements unlocked
- Recent activity with timestamps
- Language usage statistics
- Difficulty breakdown (Easy/Medium/Hard)

**Example Response**:
```json
{
  "totalSolved": 12,
  "successRate": 85,
  "currentStreak": 5,
  "achievements": ["First Blood", "Speed Demon"],
  "languageUsage": { "python": 5, "java": 4, "javascript": 3 },
  "difficultyBreakdown": { "easy": 6, "medium": 5, "hard": 1 }
}
```

### 2. `get_problem_details`
**Purpose**: Get complete problem information

**Input**: `problemId` (string or number)

**Returns**:
- Problem title, difficulty, description
- Examples with explanations
- Constraints and hints
- Test cases

### 3. `search_problems`
**Purpose**: Search problems by criteria

**Filters**:
- `difficulty`: Easy, Medium, Hard
- `topic`: Arrays, DP, Graphs, etc.
- `excludeSolved`: Skip already solved
- `limit`: Max results

**Use Case**: Find similar problems, recommend next challenges

### 4. `execute_code`
**Purpose**: Run code against test cases via Judge0

**Input**:
```json
{
  "language": "python",
  "code": "def solution(nums): ...",
  "testCases": [
    { "input": "1,2,3", "expectedOutput": "6" }
  ]
}
```

**Returns**: Test results with pass/fail status, actual output, execution time

### 5. `analyze_code_patterns`
**Purpose**: Analyze user's coding style and patterns

**Returns**:
- Common patterns (iterative vs recursive, etc.)
- Strengths (clean code, efficiency)
- Weaknesses (edge cases, optimization)
- Learning trajectory and progress
- Recommended topics for improvement

### 6. `get_learning_path`
**Purpose**: Generate personalized learning roadmap

**Input**:
- `focusArea` (optional): Specific topic to focus on
- `difficulty` (optional): Target difficulty level

**Returns**:
- Current skill level assessment
- Next milestone and weekly goals
- Recommended problems (with reasoning)
- Suggested topics to study
- Estimated time per problem

### 7. `track_submission`
**Purpose**: Record problem submissions

**Input**:
```json
{
  "problemId": "1",
  "code": "...",
  "language": "python",
  "success": true,
  "executionTime": 245
}
```

**Effect**: Updates progress, achievements, streaks

### 8. `get_best_practices`
**Purpose**: Retrieve language-specific best practices

**Input**: `language` (python, java, javascript, cpp)

**Returns**:
- General best practices
- Data structure recommendations
- Algorithm optimization tips
- Common pitfalls to avoid

## Integration Examples

### Example 1: AI Hints with User Context

```typescript
// app/api/ai-hint/route.ts
import { getMCPClient } from '@/lib/mcp/client';

const mcpClient = getMCPClient();
await mcpClient.connect();

// Get user's coding patterns
const patterns = await mcpClient.analyzeCodePatterns({ problemId });
const patternData = JSON.parse(patterns.content[0].text);

// Get best practices for user's language
const practices = await mcpClient.getBestPractices({ language: 'python' });
const tips = JSON.parse(practices.content[0].text);

// Generate personalized hint
const hint = `Based on your strength in ${patternData.strengths[0]}, 
consider using ${tips.dataStructures.arrays} for this problem...`;
```

### Example 2: Career Guidance with Progress Context

```typescript
// app/api/guidance-mcp/route.ts
const progress = await mcpClient.getUserProgress();
const learningPath = await mcpClient.getLearningPath({ focusArea: 'backend' });

// AI now knows:
// - User has solved 12 problems (8 Easy, 4 Medium)
// - Prefers Python and JavaScript
// - Strong in arrays, needs work on recursion
// - 5-day streak → highly motivated

// Generates ultra-personalized guidance
```

### Example 3: Collaborative Learning

```typescript
// app/api/collaborate/route.ts
const patterns = await mcpClient.analyzeCodePatterns({});

// Suggests collaboration partners with:
// - Complementary strengths
// - Similar skill levels
// - Different coding styles for learning
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @modelcontextprotocol/sdk tsx ts-node --legacy-peer-deps
```

### 2. Configure MCP Server

The server is auto-configured in `.mcp/config.json`:

```json
{
  "mcpServers": {
    "skillbridge": {
      "command": "node",
      "args": ["--experimental-modules", "./lib/mcp/skillbridge-server.ts"],
      "env": { "NODE_ENV": "development" }
    }
  }
}
```

### 3. Start MCP Server

```bash
npm run mcp:server
```

### 4. Test MCP Tools

```bash
npm run mcp:test
```

## Usage in API Routes

### Basic Pattern

```typescript
import { getMCPClient } from '@/lib/mcp/client';

export async function POST(request: Request) {
  const mcpClient = getMCPClient();
  
  try {
    await mcpClient.connect();
    
    // Call MCP tools
    const progress = await mcpClient.getUserProgress();
    const patterns = await mcpClient.analyzeCodePatterns({});
    
    // Use context in AI prompt
    const personalizedResponse = generateResponse(progress, patterns);
    
    return NextResponse.json({ 
      response: personalizedResponse,
      mcpEnhanced: true 
    });
  } catch (error) {
    // Graceful degradation
    console.warn('MCP unavailable, using basic mode');
    return basicResponse();
  }
}
```

### Advanced Pattern: Multi-Tool Orchestration

```typescript
async function generatePersonalizedHint(problemId: string, code: string) {
  const mcpClient = getMCPClient();
  await mcpClient.connect();
  
  // Parallel MCP calls
  const [progress, patterns, problemDetails, bestPractices] = await Promise.all([
    mcpClient.getUserProgress(),
    mcpClient.analyzeCodePatterns({ problemId }),
    mcpClient.getProblemDetails(problemId),
    mcpClient.getBestPractices({ language: detectLanguage(code) })
  ]);
  
  // Build comprehensive context
  const context = {
    userLevel: calculateLevel(progress),
    strengths: patterns.strengths,
    weaknesses: patterns.weaknesses,
    problemDifficulty: problemDetails.difficulty,
    relevantTips: bestPractices.general.slice(0, 3)
  };
  
  // Generate ultra-personalized hint
  return generateHint(context);
}
```

## Production Deployment

### Environment Variables

```env
# .env.local
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=localhost
DATABASE_URL=postgresql://...  # For persistent storage
```

### Database Migration

Replace localStorage with PostgreSQL:

```typescript
// lib/mcp/storage/postgres.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getUserProgress(userId: string) {
  const result = await pool.query(
    'SELECT * FROM user_progress WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}
```

### Docker Deployment

```dockerfile
# Dockerfile.mcp
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "mcp:server"]
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-config
data:
  config.json: |
    {
      "mcpServers": {
        "skillbridge": {
          "command": "node",
          "args": ["./dist/mcp/skillbridge-server.js"]
        }
      }
    }
```

## Performance Optimization

### 1. Connection Pooling

```typescript
// lib/mcp/pool.ts
class MCPConnectionPool {
  private pool: SkillBridgeMCPClient[] = [];
  private maxSize = 10;
  
  async acquire(): Promise<SkillBridgeMCPClient> {
    if (this.pool.length > 0) return this.pool.pop()!;
    
    const client = new SkillBridgeMCPClient();
    await client.connect();
    return client;
  }
  
  release(client: SkillBridgeMCPClient) {
    if (this.pool.length < this.maxSize) {
      this.pool.push(client);
    }
  }
}
```

### 2. Response Caching

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

async function getCachedUserProgress(userId: string) {
  const cacheKey = `progress:${userId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const progress = await mcpClient.getUserProgress(userId);
  cache.set(cacheKey, progress);
  return progress;
}
```

### 3. Batch Operations

```typescript
async function batchAnalyzeProblems(problemIds: string[]) {
  const mcpClient = getMCPClient();
  
  // Batch multiple problems in single connection
  const results = await Promise.all(
    problemIds.map(id => mcpClient.getProblemDetails(id))
  );
  
  return results;
}
```

## Monitoring & Debugging

### Enable Debug Logs

```typescript
// lib/mcp/client.ts
const DEBUG = process.env.MCP_DEBUG === 'true';

if (DEBUG) {
  console.log('[MCP] Tool call:', name, args);
  console.log('[MCP] Response:', result);
}
```

### Health Check Endpoint

```typescript
// app/api/mcp/health/route.ts
export async function GET() {
  try {
    const mcpClient = getMCPClient();
    await mcpClient.connect();
    
    const tools = await mcpClient.listTools();
    
    return NextResponse.json({
      status: 'healthy',
      toolsAvailable: tools.length,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
```

### Metrics Dashboard

```typescript
// lib/mcp/metrics.ts
export class MCPMetrics {
  private callCounts: Map<string, number> = new Map();
  private responseTimes: Map<string, number[]> = new Map();
  
  recordCall(toolName: string, duration: number) {
    this.callCounts.set(toolName, (this.callCounts.get(toolName) || 0) + 1);
    
    if (!this.responseTimes.has(toolName)) {
      this.responseTimes.set(toolName, []);
    }
    this.responseTimes.get(toolName)!.push(duration);
  }
  
  getStats() {
    const stats: any = {};
    
    for (const [tool, times] of this.responseTimes) {
      stats[tool] = {
        calls: this.callCounts.get(tool),
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        maxTime: Math.max(...times),
        minTime: Math.min(...times)
      };
    }
    
    return stats;
  }
}
```

## Troubleshooting

### Issue: MCP Server Not Starting

**Solution**:
```bash
# Check TypeScript compilation
npx tsx lib/mcp/skillbridge-server.ts

# Check port availability
netstat -an | findstr :3001

# Enable debug mode
set MCP_DEBUG=true
npm run mcp:server
```

### Issue: Connection Timeout

**Solution**:
```typescript
// Increase timeout in client
const mcpClient = getMCPClient();
mcpClient.timeout = 30000; // 30 seconds
```

### Issue: Memory Leak

**Solution**:
```typescript
// Always disconnect after use
try {
  await mcpClient.connect();
  const result = await mcpClient.getUserProgress();
  return result;
} finally {
  await mcpClient.disconnect();
}
```

## Best Practices

1. **Graceful Degradation**: Always handle MCP unavailability
2. **Connection Reuse**: Use singleton pattern for clients
3. **Error Handling**: Wrap all MCP calls in try-catch
4. **Caching**: Cache frequently accessed data (progress, patterns)
5. **Monitoring**: Track MCP call frequency and response times
6. **Security**: Validate all inputs before passing to MCP tools
7. **Testing**: Mock MCP client in unit tests

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] GraphQL API for flexible queries
- [ ] Multi-user collaboration context
- [ ] AI-powered code review automation
- [ ] Predictive learning path adjustments
- [ ] Integration with external APIs (LeetCode, HackerRank)
- [ ] Voice-based coding assistance
- [ ] AR/VR debugging visualization

## License

MIT License - SkillBridge Platform
