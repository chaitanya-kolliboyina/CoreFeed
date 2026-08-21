import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { prisma } from '@repo/db';

const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
});

function cleanHtml(html: string, url: string): { contentHtml: string; wordCount: number; excerpt: string } {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    return { contentHtml: html, wordCount: html.split(/\s+/).length, excerpt: '' };
  }

  const wordCount = article.textContent.trim().split(/\s+/).length;
  // Create excerpt from text content
  const excerpt = article.textContent.trim().substring(0, 200) + (article.textContent.length > 200 ? '...' : '');

  return {
    contentHtml: article.content,
    wordCount,
    excerpt,
  };
}

async function ingest() {
  console.log('Starting feed ingestion...');
  
  const sources = await prisma.source.findMany({
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  for (const source of sources) {
    console.log(`Fetching feed for: ${source.name} (${source.feedUrl})`);
    try {
      const feed = await parser.parseURL(source.feedUrl);
      console.log(`Found ${feed.items.length} items in feed.`);

      for (const item of feed.items) {
        if (!item.link) continue;

        // Check if post already exists
        const existing = await prisma.post.findUnique({
          where: { url: item.link },
        });

        if (existing) continue;

        const rawContent = item.contentEncoded || item.content || item.summary || '';
        const isLongFeed = rawContent.length > 1200;
        
        let contentHtml: string | null = null;
        let wordCount: number | null = null;
        let excerpt = item.contentSnippet || '';

        // If source supports full feed, or the feed content itself is long, parse it
        if (source.hasFullFeed || isLongFeed) {
          if (rawContent) {
            const cleaned = cleanHtml(rawContent, item.link);
            contentHtml = cleaned.contentHtml;
            wordCount = cleaned.wordCount;
            if (!excerpt) {
              excerpt = cleaned.excerpt;
            }
          }
        }

        // Get word count fallback if not computed
        if (!wordCount && rawContent) {
          wordCount = rawContent.split(/\s+/).length;
        }

        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        // Create the post
        const post = await prisma.post.create({
          data: {
            sourceId: source.id,
            title: item.title || 'Untitled',
            url: item.link,
            author: item.creator || item.author || source.name,
            publishedAt,
            excerpt: excerpt.substring(0, 300),
            contentHtml,
            wordCount,
          },
        });

        // Link tags from source to post
        for (const sourceTag of source.tags) {
          await prisma.postTag.upsert({
            where: {
              postId_tagId: {
                postId: post.id,
                tagId: sourceTag.tagId,
              },
            },
            update: {},
            create: {
              postId: post.id,
              tagId: sourceTag.tagId,
            },
          });
        }
        
        console.log(`Ingested: ${post.title}`);
      }
    } catch (error) {
      console.error(`Failed to ingest feed for ${source.name}:`, error);
    }
  }

  console.log('Ingestion finished.');
}

ingest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
