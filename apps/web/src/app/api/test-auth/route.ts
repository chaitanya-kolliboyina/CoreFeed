import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function GET() {
  try {
    const email = "sandbox@example.com";
    const name = "Dev Sandbox";

    // Test the exact database operation done during Credentials Login
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database upsert test succeeded!",
      user,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
