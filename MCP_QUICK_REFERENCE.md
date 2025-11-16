# SkillBridge MCP - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start MCP Server
npm run mcp:server

# Terminal 2: Start Dev Server
npm run dev

# Terminal 3: Test MCP
node test-mcp.mjs
```

---

## 📡 Health Check

```bash
# Browser
http://localhost:3000/api/mcp/health

# cURL
curl http://localhost:3000/api/mcp/health
```

---

## 🔧 MCP Tools (8 Total)

### 1. get_user_progress
```javascript
const progress = await mcpClient.getUserProgress();
// Returns: totalSolved, successRate, streak, achievements
```

### 2. get_problem_details
```javascript
const problem = await mcpClient.getProblemDetails(problemId);
// Returns: title, difficulty, description, examples, testCases
```

### 3. search_problems
```javascript
const problems = await mcpClient.searchProblems({ 
  difficulty: 'Medium',
  topic: 'arrays',
  limit: 5 
});
// Returns: matching problems array
```

### 4. execute_code
```javascript
const result = await mcpClient.executeCode({
  language: 'python',
  code: 'def solution(nums): ...',
  testCases: [{ input: '1,2,3', expectedOutput: '6' }]
});
// Returns: test results with pass/fail
```

### 5. analyze_code_patterns
```javascript
const patterns = await mcpClient.analyzeCodePatterns({ 
  problemId: 1 
});
// Returns: commonPatterns, strengths, weaknesses, trajectory
```

### 6. get_learning_path
```javascript
const path = await mcpClient.getLearningPath({ 
  focusArea: 'algorithms' 
});
// Returns: currentLevel, nextMilestone, recommendedProblems
```

### 7. track_submission
```javascript
await mcpClient.trackSubmission({
  problemId: '1',
  code: '...',
  language: 'python',
  success: true,
  executionTime: 245
});
// Updates progress and achievements
```

### 8. get_best_practices
```javascript
const practices = await mcpClient.getBestPractices({ 
  language: 'python' 
});
// Returns: general tips, dataStructures, algorithms
```

---

## 🎯 Integration Pattern

```typescript
import { getMCPClient } from '@/lib/mcp/client';

export async function POST(request: Request) {
  const mcpClient = getMCPClient();
  
  try {
    await mcpClient.connect();
    
    // Get context
    const [progress, patterns, practices] = await Promise.all([
      mcpClient.getUserProgress(),
      mcpClient.analyzeCodePatterns({}),
      mcpClient.getBestPractices({ language: 'python' })
    ]);
    
    // Parse results
    const progressData = JSON.parse(progress.content[0].text);
    
    // Use in AI prompt
    const prompt = `User solved ${progressData.totalSolved} problems...`;
    
    return NextResponse.json({ 
      result: '...',
      mcpEnhanced: true 
    });
  } catch (error) {
    // Graceful fallback
    return fallbackResponse();
  } finally {
    await mcpClient.disconnect();
  }
}
```

---

## 🐛 Troubleshooting

### MCP Server Won't Start
```bash
# Reinstall dependencies
npm install @modelcontextprotocol/sdk --legacy-peer-deps

# Start with debug
set MCP_DEBUG=true
npm run mcp:server
```

### Connection Issues
```bash
# Check if port 3001 is free
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <process_id> /F
```

### Hints Not Personalized
```javascript
// Check browser console for:
console.log('✅ MCP-enhanced hint with personalized context');

// Check API response for:
{ "hint": "...", "mcpEnhanced": true }
```

---

## 📊 Response Times

| Tool | Average Time |
|------|-------------|
| get_user_progress | ~50ms |
| get_problem_details | ~30ms |
| search_problems | ~40ms |
| execute_code | ~2000ms |
| analyze_code_patterns | ~100ms |
| get_learning_path | ~80ms |
| track_submission | ~20ms |
| get_best_practices | ~30ms |

---

## 📚 Documentation Links

- **Quick Start**: `MCP_QUICKSTART.md` (5 min)
- **Full Docs**: `MCP_DOCUMENTATION.md` (30 min)
- **Overview**: `MCP_README.md` (10 min)
- **Implementation**: `IMPLEMENTATION_REPORT.md` (complete)

---

## ✅ Pre-Flight Checklist

Before starting development:
- [ ] MCP server running (Terminal 1)
- [ ] Dev server running (Terminal 2)
- [ ] Health check returns "healthy"
- [ ] Test script passes all tests
- [ ] No errors in either terminal

---

## 🎯 Testing URLs

- **Main App**: http://localhost:3000
- **Assignments**: http://localhost:3000/assignments
- **Progress**: http://localhost:3000/progress
- **Guidance**: http://localhost:3000/guidance
- **Health Check**: http://localhost:3000/api/mcp/health

---

## 🔥 Pro Tips

1. **Keep MCP Running**: Use `pm2` or `nodemon`
2. **Monitor Health**: Check `/api/mcp/health` every 5 min
3. **Cache Results**: Progress data doesn't change often
4. **Batch Requests**: Multiple tools can run in parallel
5. **Always Disconnect**: Close connections after use

---

## 📝 Common Code Snippets

### Connect to MCP
```typescript
const mcpClient = getMCPClient();
await mcpClient.connect();
```

### List All Tools
```typescript
const tools = await mcpClient.listTools();
console.log(`Available: ${tools.length} tools`);
```

### Disconnect
```typescript
await mcpClient.disconnect();
```

### Error Handling
```typescript
try {
  const result = await mcpClient.getUserProgress();
} catch (error) {
  console.error('MCP error:', error);
  // Fallback to basic mode
}
```

---

## 🎉 Success Indicators

✅ MCP server logs: "SkillBridge MCP Server running on stdio"  
✅ Health endpoint returns: `{ "status": "healthy" }`  
✅ Test script shows: "🎉 MCP Integration Complete!"  
✅ Browser console logs: "✅ MCP-enhanced hint"  
✅ No errors in either terminal

---

**Version**: 1.0.0  
**Status**: 🟢 Production Ready  
**Last Updated**: January 2025

---

Print this card and keep it handy! 📋
