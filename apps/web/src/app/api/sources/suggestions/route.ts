import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Fetch user interest tag IDs
    const userInterests = await prisma.userTag.findMany({
      where: { userId },
      select: { tagId: true },
    });
    const interestTagIds = new Set(userInterests.map((ui) => ui.tagId));

    // 2. Fetch followed source IDs
    const followedSources = await prisma.userSource.findMany({
      where: { userId },
      select: { sourceId: true },
    });
    const followedSourceIds = new Set(followedSources.map((fs) => fs.sourceId));

    // 3. Fetch all sources the user does NOT follow
    const allSources = await prisma.source.findMany({
      where: {
        id: {
          notIn: Array.from(followedSourceIds),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // 4. Score sources based on overlap with user interests
    const scoredSuggestions = allSources
      .map((source) => {
        const sourceTagIds = source.tags.map((t) => t.tagId);
        const matchCount = sourceTagIds.filter((tid) =>
          interestTagIds.has(tid)
        ).length;

        return {
          id: source.id,
          name: source.name,
          siteUrl: source.siteUrl,
          tags: source.tags.map((t) => ({
            id: t.tag.id,
            slug: t.tag.slug,
            label: t.tag.label,
          })),
          score: matchCount,
        };
      })
      // Filter out sources with zero tag overlap
      .filter((s) => s.score > 0)
      // Sort by score descending
      .sort((a, b) => b.score - a.score)
      // Limit to 5 suggestions
      .slice(0, 5);

    return NextResponse.json(scoredSuggestions);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to fetch suggestions", details: err.message },
      { status: 500 }
    );
  }
}
