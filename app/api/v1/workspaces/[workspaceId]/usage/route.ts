import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { getWorkspaceQuotasAndUsage } from '@/lib/quotas';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId);
  if (!access) return forbiddenResponse();

  const stats = await getWorkspaceQuotasAndUsage(workspaceId);
  return NextResponse.json(stats);
}
