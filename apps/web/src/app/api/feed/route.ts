import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";
import { rankPosts } from "@/lib/feed";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const cursor = parseInt(searchParams.get("cursor") || "0", 10);

  try {
    const userId = session.user.id;

    // 1. Fetch user interest tag IDs
    const userInterests = await prisma.userTag.findMany({
      where: { userId },
      select: { tagId: true },
    });
    const interestTagIds = userInterests.map((ui) => ui.tagId);

    // 2. Fetch read post IDs for the user
    const readEvents = await prisma.readEvent.findMany({
      where: { userId },
      select: { postId: true },
    });
    const readPostIds = readEvents.map((re) => re.postId);

    // 3. Fetch liked and saved post IDs to attach interaction states
    const likes = await prisma.like.findMany({
      where: { userId },
      select: { postId: true },
    });
    const likedPostIds = new Set(likes.map((l) => l.postId));

    const saves = await prisma.save.findMany({
      where: { userId },
      select: { postId: true },
    });
    const savedPostIds = new Set(saves.map((s) => s.postId));

    // 4. Fetch posts published in the last 7 days to rank
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await prisma.post.findMany({
      where: {
        publishedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        source: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // 5. Rank posts
    const ranked = rankPosts(posts, interestTagIds, readPostIds);

    // 6. Slice page
    const sliced = ranked.slice(cursor, cursor + limit);
    const hasMore = cursor + limit < ranked.length;
    const nextCursor = hasMore ? cursor + limit : null;

    // Attach liked, saved, and read state to the payload for the client UI
    const postsWithInteractionState = sliced.map((post) => ({
      id: post.id,
      title: post.title,
      url: post.url,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      wordCount: post.wordCount,
      source: {
        name: post.source.name,
        siteUrl: post.source.siteUrl,
      },
      tags: post.tags.map((t) => ({
        id: t.tag.id,
        slug: t.tag.slug,
        label: t.tag.label,
      })),
      isLiked: likedPostIds.has(post.id),
      isSaved: savedPostIds.has(post.id),
      isRead: readPostIds.includes(post.id),
      score: post.score,
    }));

    return NextResponse.json({
      posts: postsWithInteractionState,
      nextCursor,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
