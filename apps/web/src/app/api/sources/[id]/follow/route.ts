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

  const sourceId = params.id;
  const userId = session.user.id;

  try {
    const existingFollow = await prisma.userSource.findUnique({
      where: {
        userId_sourceId: {
          userId,
          sourceId,
        },
      },
    });

    if (existingFollow) {
      await prisma.userSource.delete({
        where: {
          userId_sourceId: {
            userId,
            sourceId,
          },
        },
      });
      return NextResponse.json({ followed: false });
    } else {
      await prisma.userSource.create({
        data: {
          userId,
          sourceId,
        },
      });
      return NextResponse.json({ followed: true });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
