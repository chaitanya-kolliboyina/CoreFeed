import { describe, it, expect } from 'vitest';
import { authOptions } from '../src/lib/auth';

describe('NextAuth Configuration', () => {
  it('should have Prisma adapter configured', () => {
    expect(authOptions.adapter).toBeDefined();
  });

  it('should configure Google, GitHub, and Credentials providers', () => {
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.providers.length).toBe(3);

    const providerIds = authOptions.providers.map((p) => p.id);
    expect(providerIds).toContain('github');
    expect(providerIds).toContain('google');
    expect(providerIds).toContain('credentials');
  });

  it('should redirect new users to onboarding', () => {
    expect(authOptions.pages?.newUser).toBe('/onboarding');
  });
});
