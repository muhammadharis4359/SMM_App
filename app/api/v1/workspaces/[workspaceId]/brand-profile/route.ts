import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId);
  if (!access) return forbiddenResponse();

  let profile = await prisma.brandProfile.findUnique({
    where: { workspaceId },
  });

  if (!profile) {
    profile = await prisma.brandProfile.create({
      data: {
        workspaceId,
        brandName: access.workspace.name,
        industry: 'General Business & Services',
        servicesJson: '[]',
        audienceJson: '{}',
        toneJson: '["Professional", "Innovative"]',
        goalsJson: '["Brand Awareness", "Lead Generation"]',
        offersJson: '[]',
        restrictionsJson: '[]',
      },
    });
  }

  return NextResponse.json({
    brandProfile: {
      ...profile,
      services: JSON.parse(profile.servicesJson || '[]'),
      audience: JSON.parse(profile.audienceJson || '{}'),
      tone: JSON.parse(profile.toneJson || '[]'),
      goals: JSON.parse(profile.goalsJson || '[]'),
      offers: JSON.parse(profile.offersJson || '[]'),
      restrictions: JSON.parse(profile.restrictionsJson || '[]'),
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  try {
    const body = await req.json();

    const updated = await prisma.brandProfile.upsert({
      where: { workspaceId },
      update: {
        brandName: body.brandName || access.workspace.name,
        website: body.website || null,
        industry: body.industry || 'General Business',
        servicesJson: JSON.stringify(body.services || []),
        audienceJson: JSON.stringify(body.audience || {}),
        toneJson: JSON.stringify(body.tone || []),
        language: body.language || 'en',
        goalsJson: JSON.stringify(body.goals || []),
        ctaPreferences: body.ctaPreferences || null,
        offersJson: JSON.stringify(body.offers || []),
        restrictionsJson: JSON.stringify(body.restrictions || []),
        complianceNotes: body.complianceNotes || null,
      },
      create: {
        workspaceId,
        brandName: body.brandName || access.workspace.name,
        website: body.website || null,
        industry: body.industry || 'General Business',
        servicesJson: JSON.stringify(body.services || []),
        audienceJson: JSON.stringify(body.audience || {}),
        toneJson: JSON.stringify(body.tone || []),
        language: body.language || 'en',
        goalsJson: JSON.stringify(body.goals || []),
        ctaPreferences: body.ctaPreferences || null,
        offersJson: JSON.stringify(body.offers || []),
        restrictionsJson: JSON.stringify(body.restrictions || []),
        complianceNotes: body.complianceNotes || null,
      },
    });

    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: 'BRAND_PROFILE_UPDATED',
      resourceType: 'BRAND_PROFILE',
      resourceId: updated.id,
      metadata: { brandName: updated.brandName, industry: updated.industry },
    });

    return NextResponse.json({
      success: true,
      brandProfile: {
        ...updated,
        services: JSON.parse(updated.servicesJson),
        audience: JSON.parse(updated.audienceJson),
        tone: JSON.parse(updated.toneJson),
        goals: JSON.parse(updated.goalsJson),
        offers: JSON.parse(updated.offersJson),
        restrictions: JSON.parse(updated.restrictionsJson),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update brand profile.' }, { status: 500 });
  }
}
