import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { executePublish } from '@/lib/scheduler/publisher';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { contentId } = await params;
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  const access = await verifyWorkspaceAccess(session.userId, content.workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  try {
    const outcome = await executePublish(contentId, session.userId);

    const refreshed = await prisma.contentItem.findUnique({
      where: { id: contentId },
    });

    return NextResponse.json({
      success: outcome.status === 'SUCCEEDED',
      outcome,
      item: refreshed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Publishing failed.' }, { status: 500 });
  }
}
