import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import { prisma } from "@repo/db";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login page
  if (!session?.user) {
    redirect("/login");
  }

  // Check if the user has completed onboarding (picked tags)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { interests: true },
  });

  if (!user || user.interests.length === 0) {
    redirect("/onboarding");
  }

  // If onboarded, redirect to feed page
  redirect("/feed");
}
