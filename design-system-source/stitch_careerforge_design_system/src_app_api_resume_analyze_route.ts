import { NextResponse } from 'next/server';
import { ATSAnalyzer } from '@/lib/services/ats-analyzer';

export async function POST(request: Request) {
  const { resumeText, jobDescription } = await request.json();
  
  try {
    const analysis = await ATSAnalyzer.analyze(resumeText, jobDescription);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
