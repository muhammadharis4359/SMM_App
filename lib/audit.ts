import { prisma } from './prisma';

export interface AuditParams {
  workspaceId: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Persists an immutable audit log entry for compliance and security tracking.
 * Redacts any accidental tokens or passwords from metadata before storing.
 */
export async function logAuditEvent({
  workspaceId,
  actorUserId,
  action,
  resourceType,
  resourceId,
  metadata = {},
}: AuditParams) {
  try {
    // Sanitize metadata: remove secrets or tokens
    const sanitized = { ...metadata };
    for (const key of Object.keys(sanitized)) {
      if (/token|secret|password|key|auth/i.test(key)) {
        sanitized[key] = '[REDACTED]';
      }
    }

    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorUserId,
        action,
        resourceType,
        resourceId,
        metadataJson: JSON.stringify(sanitized),
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
