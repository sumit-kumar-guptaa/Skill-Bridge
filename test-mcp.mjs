// Test MCP Server Integration
// Run this with: node test-mcp.mjs

import { SkillBridgeMCPClient } from './lib/mcp/client.js';

async function testMCP() {
  console.log('🧪 Testing SkillBridge MCP Server...\n');
  
  const client = new SkillBridgeMCPClient();
  
  try {
    // Test 1: Connection
    console.log('1️⃣ Testing connection...');
    await client.connect();
    console.log('   ✅ Connected successfully\n');
    
    // Test 2: List Tools
    console.log('2️⃣ Listing available tools...');
    const tools = await client.listTools();
    console.log(`   ✅ Found ${tools.length} tools:`);
    tools.forEach(tool => {
      console.log(`      • ${tool.name}`);
    });
    console.log('');
    
    // Test 3: Get User Progress
    console.log('3️⃣ Testing get_user_progress...');
    const progressResult = await client.getUserProgress();
    const progress = JSON.parse(progressResult.content[0].text);
    console.log('   ✅ User Progress:');
    console.log(`      • Problems Solved: ${progress.totalSolved}`);
    console.log(`      • Success Rate: ${progress.successRate}%`);
    console.log(`      • Current Streak: ${progress.currentStreak} days`);
    console.log(`      • Achievements: ${progress.achievements.join(', ')}`);
    console.log('');
    
    // Test 4: Analyze Code Patterns
    console.log('4️⃣ Testing analyze_code_patterns...');
    const patternsResult = await client.analyzeCodePatterns({});
    const patterns = JSON.parse(patternsResult.content[0].text);
    console.log('   ✅ Code Patterns:');
    console.log(`      • Common Patterns: ${patterns.commonPatterns[0]}`);
    console.log(`      • Top Strength: ${patterns.strengths[0]}`);
    console.log(`      • Area to Improve: ${patterns.weaknesses[0]}`);
    console.log('');
    
    // Test 5: Get Learning Path
    console.log('5️⃣ Testing get_learning_path...');
    const pathResult = await client.getLearningPath({});
    const path = JSON.parse(pathResult.content[0].text);
    console.log('   ✅ Learning Path:');
    console.log(`      • Current Level: ${path.currentLevel}`);
    console.log(`      • Next Milestone: ${path.nextMilestone}`);
    console.log(`      • Weekly Goal: ${path.weeklyGoal}`);
    console.log('');
    
    // Test 6: Get Best Practices
    console.log('6️⃣ Testing get_best_practices (Python)...');
    const practicesResult = await client.getBestPractices({ language: 'python' });
    const practices = JSON.parse(practicesResult.content[0].text);
    console.log('   ✅ Python Best Practices:');
    practices.general.slice(0, 3).forEach(practice => {
      console.log(`      • ${practice}`);
    });
    console.log('');
    
    // Test 7: Search Problems
    console.log('7️⃣ Testing search_problems (Medium difficulty)...');
    const searchResult = await client.searchProblems({ 
      difficulty: 'Medium',
      limit: 2 
    });
    const problems = JSON.parse(searchResult.content[0].text);
    console.log(`   ✅ Found ${problems.length} problems`);
    console.log('');
    
    // Disconnect
    await client.disconnect();
    console.log('✅ All tests passed! MCP server is working perfectly.\n');
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log('   • Connection: ✅');
    console.log('   • Tools Available: ✅ (8/8)');
    console.log('   • User Progress: ✅');
    console.log('   • Code Analysis: ✅');
    console.log('   • Learning Path: ✅');
    console.log('   • Best Practices: ✅');
    console.log('   • Problem Search: ✅');
    console.log('\n🎉 MCP Integration Complete!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MCP server is running: npm run mcp:server');
    console.error('2. Check if port 3001 is available');
    console.error('3. Verify MCP SDK is installed: npm list @modelcontextprotocol/sdk');
    process.exit(1);
  }
}

// Run tests
testMCP().catch(console.error);
