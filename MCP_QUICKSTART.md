# SkillBridge MCP Server - Quick Start Guide

## 🚀 What is MCP?

**Model Context Protocol (MCP)** gives AI assistants **superpowers** by providing them with:
- 🧠 **Full context** about your coding journey
- 📊 **Real-time data** about your progress and patterns
- 🔧 **Tool access** to execute code, search problems, and track submissions
- 🎯 **Personalized insights** based on your actual learning history

## ✨ Features

### Before MCP (Basic AI)
```
User: "Give me a hint for Two Sum"
AI: "Use a hash map to store complements"
```

### After MCP (Context-Aware AI)
```
User: "Give me a hint for Two Sum"
AI: "Since you've mastered arrays and have 85% success rate,
     let's build on your strength. You recently solved problems
     using hash maps in JavaScript. Consider using Map.set() 
     and Map.has() - your go-to pattern that works well!"
```

## 📦 Installation

Already installed! ✅

Dependencies added:
- `@modelcontextprotocol/sdk` - MCP framework
- `tsx` - TypeScript execution
- `ts-node` - Node.js TypeScript support

## 🔧 Quick Start

### 1. Start the MCP Server

```bash
npm run mcp:server
```

You should see:
```
SkillBridge MCP Server running on stdio
```

### 2. Test the MCP Tools

Open a new terminal and test:

```bash
# Test connection and list available tools
npm run mcp:test
```

Expected output:
```json
[
  { "name": "get_user_progress", "description": "..." },
  { "name": "get_problem_details", "description": "..." },
  { "name": "execute_code", "description": "..." },
  ...
]
```

### 3. Use MCP in Your App

#### Option A: Use MCP-Enhanced AI Hints

The AI hints now automatically use MCP context:

```typescript
// Already integrated in app/api/ai-hint/route.ts
// Just use the hints feature - MCP works in the background!
```

#### Option B: Use MCP-Enhanced Guidance

Try the new guidance endpoint:

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/guidance
# Ask: "What should I learn for backend development?"

# AI will respond with context:
# "Based on your 12 solved problems (8 Python, 4 JavaScript)
#  and your strength in arrays, here's your personalized path..."
```

## 🎯 MCP Tools Overview

| Tool | Purpose | Example Use Case |
|------|---------|------------------|
| `get_user_progress` | Get coding stats | "How am I doing?" |
| `get_problem_details` | Problem info | "Show me test cases" |
| `search_problems` | Find problems | "Similar to Two Sum" |
| `execute_code` | Run code | "Test my solution" |
| `analyze_code_patterns` | Code analysis | "What's my coding style?" |
| `get_learning_path` | Personalized roadmap | "What should I learn next?" |
| `track_submission` | Record progress | Auto-tracks submissions |
| `get_best_practices` | Language tips | "Python best practices" |

## 📝 Usage Examples

### Example 1: Get Your Progress

Create a test file `test-mcp.js`:

```javascript
import { getMCPClient } from './lib/mcp/client.js';

const client = getMCPClient();

async function test() {
  await client.connect();
  
  // Get your progress
  const progress = await client.getUserProgress();
  console.log(JSON.parse(progress.content[0].text));
  
  await client.disconnect();
}

test();
```

Run: `node test-mcp.js`

### Example 2: Analyze Your Code

```javascript
const patterns = await client.analyzeCodePatterns({ language: 'python' });
console.log(JSON.parse(patterns.content[0].text));

// Output:
// {
//   "commonPatterns": ["Prefers iterative solutions", "Strong with arrays"],
//   "strengths": ["Clean code", "Good naming"],
//   "weaknesses": ["Edge cases", "Recursion"],
//   "recommendedTopics": ["Dynamic Programming", "Graphs"]
// }
```

### Example 3: Get Personalized Learning Path

```javascript
const path = await client.getLearningPath({ focusArea: 'algorithms' });
console.log(JSON.parse(path.content[0].text));

// Output:
// {
//   "currentLevel": "Intermediate",
//   "nextMilestone": "Solve 20 Medium problems",
//   "recommendedProblems": [
//     { "title": "3Sum", "difficulty": "Medium", "reason": "Builds on Two Sum" }
//   ],
//   "weeklyGoal": "Complete 5 Medium problems"
// }
```

## 🔍 Testing MCP Integration

### Test AI Hints with MCP Context

1. Go to http://localhost:3000/assignments
2. Select "Two Sum" problem
3. Write some code
4. Click "Get Hint" (Level 1)
5. Notice the hint is **personalized** based on your history!

### Test Career Guidance with MCP

1. Go to http://localhost:3000/guidance
2. Enter career goal: "Backend Developer"
3. Submit
4. Notice the guidance includes:
   - ✅ Your actual coding progress (12 problems solved)
   - ✅ Your language preferences (Python, JavaScript)
   - ✅ Your strengths and weaknesses
   - ✅ Personalized learning path

## 🐛 Troubleshooting

### Issue: MCP Server Won't Start

**Symptom**: `Error: Cannot find module '@modelcontextprotocol/sdk'`

**Fix**:
```bash
npm install @modelcontextprotocol/sdk --legacy-peer-deps
```

### Issue: "Connection Refused" Errors

**Symptom**: Client can't connect to server

**Fix**:
1. Make sure MCP server is running: `npm run mcp:server`
2. Check if port 3001 is available: `netstat -an | findstr :3001`
3. Restart both server and Next.js dev server

### Issue: MCP Context Not Showing

**Symptom**: AI responses don't include user context

**Fix**:
Check the API response for `mcpEnhanced: true`:
```javascript
// In browser console (Network tab)
{
  "hint": "...",
  "mcpEnhanced": true  // ← Should be true
}
```

If `false`, check:
1. MCP server is running
2. No errors in terminal
3. Client successfully connects

### Issue: Outdated Progress Data

**Symptom**: MCP shows old data

**Fix**: Clear cache and restart:
```bash
# Clear Next.js cache
rm -rf .next

# Restart everything
npm run mcp:server  # Terminal 1
npm run dev         # Terminal 2
```

## 📊 Monitoring MCP

### Check MCP Health

Create `app/api/mcp/health/route.ts`:

```typescript
import { getMCPClient } from '@/lib/mcp/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = getMCPClient();
    await client.connect();
    
    const tools = await client.listTools();
    
    return NextResponse.json({
      status: 'healthy',
      toolCount: tools.length,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
```

Access: http://localhost:3000/api/mcp/health

### View MCP Logs

```bash
# Enable debug mode
set MCP_DEBUG=true
npm run mcp:server

# You'll see:
# [MCP] Tool call: get_user_progress {}
# [MCP] Response: { totalSolved: 12, ... }
```

## 🎓 Next Steps

1. **Explore All Tools**: Try each MCP tool in the console
2. **Customize Prompts**: Modify AI prompts to use more MCP context
3. **Add More Endpoints**: Create new API routes that use MCP
4. **Database Integration**: Replace localStorage with PostgreSQL
5. **Real-time Updates**: Add WebSocket support for live progress
6. **Analytics Dashboard**: Build charts using MCP data
7. **Collaboration Features**: Use MCP to match learning partners

## 📚 Resources

- **Full Documentation**: `MCP_DOCUMENTATION.md`
- **MCP Server Code**: `lib/mcp/skillbridge-server.ts`
- **MCP Client Code**: `lib/mcp/client.ts`
- **Example Integration**: `app/api/ai-hint/route.ts`
- **MCP Config**: `.mcp/config.json`

## 🚀 Production Deployment

When ready for production:

1. **Add Database**: Migrate from localStorage to PostgreSQL
2. **Environment Variables**: Set MCP_SERVER_PORT, DATABASE_URL
3. **Docker**: Build MCP server container
4. **Load Balancing**: Run multiple MCP server instances
5. **Monitoring**: Set up Prometheus/Grafana
6. **Caching**: Add Redis for frequently accessed data

## 🎉 Success Checklist

- [x] MCP SDK installed
- [x] MCP server created (8 tools)
- [x] MCP client implemented
- [x] AI hints enhanced with MCP
- [x] Guidance API enhanced with MCP
- [x] Configuration files added
- [x] Documentation complete
- [ ] Test MCP server startup
- [ ] Test AI hints with context
- [ ] Test guidance with progress
- [ ] Monitor MCP health endpoint

## 💡 Pro Tips

1. **Keep MCP Server Running**: Use `pm2` or `nodemon` for auto-restart
2. **Cache Aggressively**: Progress data changes infrequently
3. **Batch Requests**: Multiple MCP calls can run in parallel
4. **Fallback Gracefully**: Always handle MCP unavailability
5. **Log Everything**: Track MCP call frequency and performance

---

**Ready to test?** Run these commands:

```bash
# Terminal 1: Start MCP Server
npm run mcp:server

# Terminal 2: Start Dev Server
npm run dev

# Terminal 3: Test MCP Health
curl http://localhost:3000/api/mcp/health
```

Then open http://localhost:3000/assignments and try the AI hints! 🎯
