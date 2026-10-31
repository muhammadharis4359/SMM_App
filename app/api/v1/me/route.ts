import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      memberships: {
        include: {
          workspace: {
            include: {
              subscriptions: {
                include: { plan: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return unauthorizedResponse('User not found.');
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    workspaces: user.memberships.map((m) => {
      const sub = m.workspace.subscriptions[0];
      return {
        id: m.workspace.id,
        name: m.workspace.name,
        role: m.role,
        timezone: m.workspace.timezone,
        locale: m.workspace.locale,
        approvalMode: m.workspace.approvalMode,
        emergencyPaused: m.workspace.emergencyPaused,
        plan: {
          id: sub?.plan?.id || 'basic',
          name: sub?.plan?.name || 'Basic',
          status: sub?.status || 'ACTIVE',
        },
      };
    }),
  });
}
