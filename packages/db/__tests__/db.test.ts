import { describe, it, expect } from 'vitest';
import { prisma } from '../index';

describe('Prisma Client Connection', () => {
  it('should import prisma client successfully', () => {
    expect(prisma).toBeDefined();
  });

  it('should query tags if database is connected', async () => {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy')) {
      console.log('Skipping active database queries (no real DATABASE_URL provided)');
      return;
    }

    try {
      const count = await prisma.tag.count();
      expect(count).toBeGreaterThanOrEqual(0);
    } catch (e) {
      console.error('Database connection failed', e);
      throw e;
    }
  });
});
