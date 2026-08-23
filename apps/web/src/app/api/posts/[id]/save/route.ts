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
    let label = "Default";
    try {
      const body = await request.json();
      if (body?.label) {
        label = body.label.trim();
      }
    } catch {
      // Body might be empty, fallback to "Default"
    }

    const existingSave = await prisma.save.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingSave) {
      // If same label, toggle delete. If different label, update it!
      if (existingSave.label === label) {
        await prisma.save.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });
        return NextResponse.json({ saved: false });
      } else {
        const updated = await prisma.save.update({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
          data: {
            label,
          },
        });
        return NextResponse.json({ saved: true, label: updated.label });
      }
    } else {
      const created = await prisma.save.create({
        data: {
          userId,
          postId,
          label,
        },
      });
      return NextResponse.json({ saved: true, label: created.label });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
