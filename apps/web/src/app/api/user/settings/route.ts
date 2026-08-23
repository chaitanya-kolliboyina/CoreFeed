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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        theme: true,
        layoutDensity: true,
        emailAlerts: true,
        weeklyDigest: true,
        interests: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      theme: user.theme,
      layoutDensity: user.layoutDensity,
      emailAlerts: user.emailAlerts,
      weeklyDigest: user.weeklyDigest,
      interests: user.interests.map((ui) => ({
        id: ui.tag.id,
        slug: ui.tag.slug,
        label: ui.tag.label,
      })),
    };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to fetch settings", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const {
      name,
      theme,
      layoutDensity,
      emailAlerts,
      weeklyDigest,
      addTagIds,
      removeTagIds,
    } = body;

    // 1. Update basic profile and settings configuration in database
    const updateData: Record<string, unknown> = {};
    if (typeof name === "string") updateData.name = name.trim();
    if (typeof theme === "string") updateData.theme = theme;
    if (typeof layoutDensity === "string") updateData.layoutDensity = layoutDensity;
    if (typeof emailAlerts === "boolean") updateData.emailAlerts = emailAlerts;
    if (typeof weeklyDigest === "boolean") updateData.weeklyDigest = weeklyDigest;

    await prisma.$transaction(async (tx) => {
      // Profile updates
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      // Add followed interest tags
      if (Array.isArray(addTagIds) && addTagIds.length > 0) {
        // Filter out tags already followed to avoid duplicate key violations
        const existing = await tx.userTag.findMany({
          where: {
            userId,
            tagId: { in: addTagIds },
          },
          select: { tagId: true },
        });
        const existingSet = new Set(existing.map((e) => e.tagId));
        const newTagIds = addTagIds.filter((tid) => !existingSet.has(tid));

        if (newTagIds.length > 0) {
          await tx.userTag.createMany({
            data: newTagIds.map((tagId) => ({
              userId,
              tagId,
            })),
          });
        }
      }

      // Remove followed interest tags
      if (Array.isArray(removeTagIds) && removeTagIds.length > 0) {
        await tx.userTag.deleteMany({
          where: {
            userId,
            tagId: { in: removeTagIds },
          },
        });
      }
    });

    // Fetch updated settings profile to return to the client
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        theme: true,
        layoutDensity: true,
        emailAlerts: true,
        weeklyDigest: true,
        interests: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      theme: updatedUser.theme,
      layoutDensity: updatedUser.layoutDensity,
      emailAlerts: updatedUser.emailAlerts,
      weeklyDigest: updatedUser.weeklyDigest,
      interests: updatedUser.interests.map((ui) => ({
        id: ui.tag.id,
        slug: ui.tag.slug,
        label: ui.tag.label,
      })),
    };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to update settings", details: err.message },
      { status: 500 }
    );
  }
}
