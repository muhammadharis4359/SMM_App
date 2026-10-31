import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from '../lib/auth';

describe('Authentication & Session Security', () => {
  it('should hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'StrongPassword2026!';
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const match = await verifyPassword(rawPassword, hash);
    expect(match).toBe(true);

    const wrongMatch = await verifyPassword('WrongPassword', hash);
    expect(wrongMatch).toBe(false);
  });

  it('should sign and verify valid JWT session tokens', () => {
    const payload = {
      userId: 'user-1234',
      email: 'test@brandivemedsols.com',
      displayName: 'Test User',
    };

    const token = signSessionToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
  });

  it('should reject invalid or manipulated JWT tokens', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    const decoded = verifySessionToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
