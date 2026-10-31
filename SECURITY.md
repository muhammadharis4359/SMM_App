# BranDive SocialFlow AI - Security Policy & Architecture

## 1. Multi-Tenant Isolation
- Every core entity (`BrandProfile`, `BrandAsset`, `SocialAccount`, `Campaign`, `ContentItem`, `PublishJob`, `UsageRecord`, `AuditLog`) includes a non-nullable `workspace_id`.
- The API layer (`lib/auth.ts`) enforces server-side tenant authorization on every request via `verifyWorkspaceAccess(userId, workspaceId, allowedRoles)`.
- Direct object reference attacks (BOLA / IDOR) are systematically prevented: a user in Workspace A cannot query, update, or delete any resource belonging to Workspace B.

## 2. Token Vault & Cryptography
- All sensitive third-party tokens (OAuth access tokens, refresh tokens, client secrets) are encrypted before writing to the database using **AES-256-GCM** authenticated encryption (`lib/crypto.ts`).
- Storage format: `Base64(12-byte IV + 16-byte Auth Tag + Ciphertext)`.
- Tampering detection: if ciphertext or tag is modified, decryption throws an exception.
- Secrets and tokens are never returned in client JSON responses, never passed to frontend bundles, and masked as `[REDACTED]` in audit logs.

## 3. Global Emergency Pause
- Workspaces feature a one-click **"PAUSE ALL PUBLISHING"** emergency control.
- When activated, all automated and scheduled background jobs are immediately frozen, preventing accidental or compromised publishing until manually resumed.

## 4. Policy Guardrails & Input Sanitization
- Uploaded briefs and notes are treated as untrusted data and strictly evaluated against brand prohibited words and claims.
- The AI campaign engine (`lib/ai/campaignEngine.ts`) never invents unverified pricing, false statistics, or unauthorized claims.

## 5. Audit Logging
- High-impact operational events (logins, account linking/disconnection, campaign generation, post approvals, emergency freezes) are permanently recorded in an immutable audit log (`lib/audit.ts`).
