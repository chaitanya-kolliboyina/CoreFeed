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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
        stack: error.stack,
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
