import { NextRequest, NextResponse } from 'next/server';
import { processDuePublishJobs } from '@/lib/scheduler/publisher';

export async function POST(req: NextRequest) {
  try {
    const results = await processDuePublishJobs();
    return NextResponse.json({
      success: true,
      processedCount: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scheduler tick failed.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
