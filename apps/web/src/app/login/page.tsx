"use client";

import { signIn } from "next-auth/react";

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
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-medium bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.807 0-8.665-3.87-8.665-8.63 0-4.757 3.858-8.63 8.665-8.63 2.14 0 3.996.793 5.4 2.115l3.107-3.107C17.997 1.411 15.35 0 12.24 0 6.136 0 1.14 4.966 1.14 11.02c0 6.052 4.996 11.018 11.1 11.018 6.368 0 10.63-4.476 10.63-10.823 0-.73-.08-1.409-.226-1.93H12.24z" />
            </svg>
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
