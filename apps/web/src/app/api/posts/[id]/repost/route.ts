import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = params.id;
  const userId = session.user.id;

  try {
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingRepost) {
      await prisma.repost.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return NextResponse.json({ reposted: false });
    } else {
      await prisma.repost.create({
        data: {
          userId,
          postId,
        },
      });
      return NextResponse.json({ reposted: true });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
