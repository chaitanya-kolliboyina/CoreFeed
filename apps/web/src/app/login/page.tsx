"use client";

import { signIn } from "next-auth/react";
import { Github, Chrome } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative max-w-md w-full backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
          <span className="text-2xl font-bold text-white">CF</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome to CoreFeed</h1>
        <p className="text-neutral-400 text-sm text-center mb-8">
          The gamified engineering blog feed. Stay updated, earn XP, and build your reading streak.
        </p>

        <div className="w-full space-y-3">
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-medium bg-white text-black hover:bg-neutral-200 transition-all shadow-lg"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-medium bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <span className="text-xs text-neutral-500 mt-8">
          By signing in, you agree to our Terms and Privacy Policy.
        </span>
      </div>
    </div>
  );
}
