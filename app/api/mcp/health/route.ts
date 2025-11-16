import { getMCPClient } from '@/lib/mcp/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = getMCPClient();
    await client.connect();
    
    const tools = await client.listTools();
    
    await client.disconnect();
    
    return NextResponse.json({
      status: 'healthy',
      toolCount: tools.length,
      tools: tools.map(t => ({ name: t.name, description: t.description })),
      timestamp: Date.now(),
      uptime: process.uptime(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: Date.now(),
    }, { status: 503 });
  }
}
