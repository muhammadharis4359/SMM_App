import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken } from '../lib/crypto';

describe('Token Encryption & Vault (AES-256-GCM)', () => {
  it('should securely encrypt and decrypt OAuth tokens', () => {
    const originalToken = 'EAABwzLixnjYBAK...meta_long_lived_token_secret_9988';
    const encrypted = encryptToken(originalToken);

    expect(encrypted).not.toEqual(originalToken);
    expect(typeof encrypted).toBe('string');

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(originalToken);
  });

  it('should reject tampered or corrupted ciphertext', () => {
    const original = 'secret_linkedin_token_value';
    const encrypted = encryptToken(original);
    
    // Corrupt the ciphertext
    const buffer = Buffer.from(encrypted, 'base64');
    buffer[buffer.length - 1] ^= 0xff; // Flip bits
    const corruptedBase64 = buffer.toString('base64');

    expect(() => decryptToken(corruptedBase64)).toThrow();
  });

  it('should handle empty tokens safely', () => {
    expect(encryptToken('')).toBe('');
    expect(decryptToken('')).toBe('');
  });
});
