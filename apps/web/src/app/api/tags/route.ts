import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        label: "asc",
      },
    });
    return NextResponse.json(tags);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to fetch tags", details: err.message },
      { status: 500 }
    );
  }
}
