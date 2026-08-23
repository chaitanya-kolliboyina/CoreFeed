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
  const search = searchParams.get("search") || "";

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

    // 3. Fetch liked, saved, and reposted post IDs to attach interaction states
    const likes = await prisma.like.findMany({
      where: { userId },
      select: { postId: true },
    });
    const likedPostIds = new Set(likes.map((l) => l.postId));

    const saves = await prisma.save.findMany({
      where: { userId },
      select: { postId: true, label: true },
    });
    const savedPostLabels = new Map(saves.map((s) => [s.postId, s.label || "Default"]));

    const reposts = await prisma.repost.findMany({
      where: { userId },
      select: { postId: true },
    });
    const repostedPostIds = new Set(reposts.map((r) => r.postId));

    // 4. Fetch followed source IDs to boost ranking
    const followedSources = await prisma.userSource.findMany({
      where: { userId },
      select: { sourceId: true },
    });
    const followedSourceIds = followedSources.map((fs) => fs.sourceId);

    // 5. Build search filter block
    const searchFilter = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { excerpt: { contains: search, mode: "insensitive" as const } },
            { source: { name: { contains: search, mode: "insensitive" as const } } },
            {
              tags: {
                some: {
                  tag: {
                    label: { contains: search, mode: "insensitive" as const },
                  },
                },
              },
            },
          ],
        }
      : {};

    // 6. Fetch posts to rank
    const posts = await prisma.post.findMany({
      where: searchFilter,
      include: {
        source: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
    });

    // 7. Rank posts
    const ranked = rankPosts(posts, interestTagIds, readPostIds, followedSourceIds);

    // 8. Slice page
    const sliced = ranked.slice(cursor, cursor + limit);
    const hasMore = cursor + limit < ranked.length;
    const nextCursor = hasMore ? cursor + limit : null;

    // Attach liked, saved, read, and reposted states along with counts to payload
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
      isSaved: savedPostLabels.has(post.id),
      bookmarkLabel: savedPostLabels.get(post.id) || null,
      isReposted: repostedPostIds.has(post.id),
      isRead: readPostIds.includes(post.id),
      likesCount: post._count?.likes || 0,
      commentsCount: post._count?.comments || 0,
      repostsCount: post._count?.reposts || 0,
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
