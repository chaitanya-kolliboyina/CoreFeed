import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import LandingView from "./LandingView";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <main className="min-h-screen bg-[#0d1117] text-white overflow-x-hidden">
      <LandingView isLoggedIn={isLoggedIn} />
    </main>
  );
}
