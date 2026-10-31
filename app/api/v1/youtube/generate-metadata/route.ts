import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { generateYouTubeMetadata } from '@/lib/ai/campaignEngine';

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { workspaceId, videoTopic, targetAudience, notes } = body;

    if (!workspaceId || !videoTopic) {
      return NextResponse.json({ error: 'workspaceId and videoTopic are required.' }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(session.userId, workspaceId);
    if (!access) return forbiddenResponse();

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { workspaceId },
    });

    const brandContext = {
      brandName: brandProfile?.brandName || access.workspace.name,
      website: brandProfile?.website || '',
      industry: brandProfile?.industry || 'Digital Services',
      services: brandProfile?.servicesJson ? JSON.parse(brandProfile.servicesJson) : [],
      audience: brandProfile?.audienceJson ? JSON.parse(brandProfile.audienceJson) : {},
      tone: brandProfile?.toneJson ? JSON.parse(brandProfile.toneJson) : ['Professional'],
      goals: brandProfile?.goalsJson ? JSON.parse(brandProfile.goalsJson) : [],
      ctaPreferences: brandProfile?.ctaPreferences || undefined,
      offers: brandProfile?.offersJson ? JSON.parse(brandProfile.offersJson) : [],
      restrictions: brandProfile?.restrictionsJson ? JSON.parse(brandProfile.restrictionsJson) : [],
      complianceNotes: brandProfile?.complianceNotes || undefined,
    };

    const metadata = await generateYouTubeMetadata({
      brand: brandContext,
      videoTopic,
      targetAudience: targetAudience || 'Modern Businesses and Founders',
      notes,
    });

    return NextResponse.json({ success: true, metadata });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'YouTube metadata generation failed.' }, { status: 500 });
  }
}
