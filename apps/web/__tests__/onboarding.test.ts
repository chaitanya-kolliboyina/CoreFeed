import { describe, it, expect, vi } from 'vitest';
import { POST } from '../src/app/api/onboarding/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@repo/db';

vi.mock('next-auth');
vi.mock('@repo/db', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe('Onboarding POST route handler', () => {
  it('should return 401 if user is unauthorized', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({ tags: ['1', '2'] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  it('should return 400 if tags are invalid format', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    });

    const req = new Request('http://localhost:3000/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({ tags: 'not-an-array' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should connect tags and return 200 on success', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    });

    vi.mocked(prisma.user.update).mockResolvedValue({ id: 'user-1' } as any);

    const req = new Request('http://localhost:3000/api/onboarding', {
      method: 'POST',
      body: JSON.stringify({ tags: ['tag-1', 'tag-2'] }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalled();
  });
});
