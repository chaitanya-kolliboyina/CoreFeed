import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SettingsView from "./SettingsView";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      {/* Header bar */}
      <header className="border-b border-[#21262d] bg-[#161b22] px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/feed" className="text-xl font-black text-indigo-400 hover:opacity-90">
              CoreFeed
            </a>
            <span className="text-gray-600 font-extrabold text-sm">/</span>
            <span className="text-xs text-gray-400 font-bold">Preferences</span>
          </div>
          <a
            href="/feed"
            className="text-xs font-bold text-gray-300 hover:text-white px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] transition-all"
          >
            ← Back to Feed
          </a>
        </div>
      </header>

      <SettingsView />
    </main>
  );
}
