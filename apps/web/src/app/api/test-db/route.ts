import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany();
    return NextResponse.json({
      success: true,
      tags,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
        stack: err.stack,
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasSecret: !!process.env.NEXTAUTH_SECRET,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}
