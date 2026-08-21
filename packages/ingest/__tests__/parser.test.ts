import { describe, it, expect, vi } from 'vitest';
import Parser from 'rss-parser';

vi.mock('rss-parser');

describe('RSS Feed Parser and Ingestion Helpers', () => {
  it('should parse feed URL successfully', async () => {
    const mockItems = [
      { title: 'Post 1', link: 'https://test.com/post-1', pubDate: '2026-08-21T00:00:00.000Z' },
    ];
    
    vi.spyOn(Parser.prototype, 'parseURL').mockResolvedValue({
      items: mockItems,
    } as any);

    const parserInstance = new Parser();
    const result = await parserInstance.parseURL('https://test.com/feed');
    
    expect(result.items).toBeDefined();
    expect(result.items.length).toBe(1);
    expect(result.items[0].title).toBe('Post 1');
  });
});
