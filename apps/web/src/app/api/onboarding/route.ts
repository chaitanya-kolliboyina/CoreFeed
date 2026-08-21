import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { tags } = await req.json();

    if (!Array.isArray(tags)) {
      return new NextResponse("Invalid tags format", { status: 400 });
    }

    // Connect user to tags
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        interests: {
          create: tags.map((tagId: string) => ({
            tag: { connect: { id: tagId } }
          }))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
