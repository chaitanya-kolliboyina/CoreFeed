import { describe, it, expect } from "vitest";
import { rankPosts } from "../src/lib/feed";
import type { Post, Tag, Source, PostTag } from "@repo/db";

describe("Feed Ranking Algorithm", () => {
  const mockSource: Source = {
    id: "source-1",
    name: "Tech Blog",
    feedUrl: "http://example.com/feed",
    siteUrl: "http://example.com",
    hasFullFeed: false,
  };

  const createMockPost = (
    id: string,
    publishedAt: Date,
    tagSlugs: string[]
  ): any => {
    return {
      id,
      sourceId: "source-1",
      title: `Post ${id}`,
      url: `http://example.com/${id}`,
      publishedAt,
      excerpt: "Excerpt",
      contentHtml: "<p>Content</p>",
      imageUrl: null,
      wordCount: 500,
      createdAt: new Date(),
      source: mockSource,
      tags: tagSlugs.map((slug) => ({
        postId: id,
        tagId: `tag-${slug}`,
        tag: { id: `tag-${slug}`, slug, label: slug.toUpperCase() },
      })),
    };
  };

  it("should rank posts with matching user interests higher", () => {
    const now = new Date();
    const post1 = createMockPost("1", now, ["react", "nextjs"]);
    const post2 = createMockPost("2", now, ["cooking"]);

    const ranked = rankPosts([post1, post2], ["tag-react"], []);

    expect(ranked[0].id).toBe("1");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("should apply recency decay (older posts ranked lower)", () => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const post1 = createMockPost("1", threeHoursAgo, ["react"]);
    const post2 = createMockPost("2", now, ["react"]);

    const ranked = rankPosts([post1, post2], ["tag-react"], []);

    // Post 2 is newer and should be ranked higher
    expect(ranked[0].id).toBe("2");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("should demote read posts", () => {
    const now = new Date();
    const post1 = createMockPost("1", now, ["react"]);
    const post2 = createMockPost("2", now, ["react"]);

    // Post 1 is read
    const ranked = rankPosts([post1, post2], ["tag-react"], ["1"]);

    expect(ranked[0].id).toBe("2");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
