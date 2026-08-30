import { NextResponse } from 'next/server';
import { AIService } from '@/lib/services/ai-service';

export async function POST(request: Request) {
  const { prompt, context } = await request.json();
  
  try {
    const response = await AIService.generateInsight({ prompt, context });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
