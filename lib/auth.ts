import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'brandive-socialflow-jwt-super-secret-key-min-32-chars-2026';
export const AUTH_COOKIE_NAME = 'brandive_session';

export interface TokenPayload {
  userId: string;
  email: string;
  displayName: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session from NextRequest cookies or Authorization header.
 */
export async function getSession(req: NextRequest): Promise<TokenPayload | null> {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  let token = cookie?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Strictly verifies tenant isolation: Checks that the authenticated user is a
 * verified member of the given workspace with the necessary role.
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceId: string,
  allowedRoles: ('OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER')[] = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']
) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!membership) {
    return null; // Deny access: User does not belong to this tenant workspace
  }

  if (!allowedRoles.includes(membership.role as any)) {
    return null; // Deny access: Insufficient privileges
  }

  return membership;
}

/**
 * Standard unauthorized JSON response.
 */
export function unauthorizedResponse(message = 'Unauthorized access.') {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

/**
 * Standard forbidden JSON response.
 */
export function forbiddenResponse(message = 'Forbidden: Tenant access denied or insufficient role.') {
  return NextResponse.json({ error: message, code: 'FORBIDDEN' }, { status: 403 });
}
