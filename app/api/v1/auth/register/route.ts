import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, brandName } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Email, password, and display name are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Create User, Default Workspace, and Membership
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        displayName,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    const workspaceName = brandName?.trim() || `${displayName}'s Workspace`;
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        ownerUserId: user.id,
        timezone: 'America/New_York',
        locale: 'en-US',
        approvalMode: 'MANUAL',
      },
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'OWNER',
      },
    });

    // Default to Diamond trial subscription
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await prisma.subscription.create({
      data: {
        workspaceId: workspace.id,
        planId: 'diamond',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Initialize Default Brand Profile
    await prisma.brandProfile.create({
      data: {
        workspaceId: workspace.id,
        brandName: workspaceName,
        industry: 'General Business & Services',
        servicesJson: JSON.stringify([]),
        audienceJson: JSON.stringify({}),
        toneJson: JSON.stringify(['Professional', 'Engaging']),
        language: 'en',
        goalsJson: JSON.stringify(['Brand Awareness', 'Lead Generation']),
        offersJson: JSON.stringify([]),
        restrictionsJson: JSON.stringify([]),
      },
    });

    await logAuditEvent({
      workspaceId: workspace.id,
      actorUserId: user.id,
      action: 'USER_REGISTERED',
      resourceType: 'USER',
      resourceId: user.id,
    });

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      workspaces: [
        {
          id: workspace.id,
          name: workspace.name,
          role: 'OWNER',
          timezone: workspace.timezone,
          emergencyPaused: workspace.emergencyPaused,
        },
      ],
      activeWorkspaceId: workspace.id,
      token,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 500 });
  }
}
