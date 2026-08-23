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
    const sources = await prisma.source.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const userFollows = await prisma.userSource.findMany({
      where: { userId },
      select: { sourceId: true },
    });
    const followedIds = new Set(userFollows.map((f) => f.sourceId));

    const result = sources.map((source) => ({
      id: source.id,
      name: source.name,
      siteUrl: source.siteUrl,
      feedUrl: source.feedUrl,
      tags: source.tags.map((t) => ({
        id: t.tag.id,
        slug: t.tag.slug,
        label: t.tag.label,
      })),
      isFollowed: followedIds.has(source.id),
    }));

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to fetch sources", details: err.message },
      { status: 500 }
    );
  }
}
