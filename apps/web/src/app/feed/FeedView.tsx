"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface UserStats {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

interface PostItem {
  id: string;
  title: string;
  url: string;
  excerpt: string | null;
  publishedAt: string;
  wordCount: number | null;
  source: {
    name: string;
    siteUrl: string;
  };
  tags: {
    id: string;
    slug: string;
    label: string;
  }[];
  isLiked: boolean;
  isSaved: boolean;
  isRead: boolean;
}

export default function FeedView({ initialUser }: { initialUser: UserStats }) {
  const [user, setUser] = useState<UserStats>(initialUser);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch initial posts on load
  useEffect(() => {
    fetchPosts(0, false);
  }, []);

  const fetchPosts = async (currentCursor: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/feed?cursor=${currentCursor}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isLiked: !post.isLiked } : post
      )
    );

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleSave = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );

    try {
      await fetch(`/api/posts/${postId}/save`, { method: "POST" });
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const handleRead = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || post.isRead) return;

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isRead: true } : p))
    );

    try {
      const res = await fetch(`/api/posts/${postId}/read`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error("Failed to log read event:", err);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getEstimatedReadTime = (wordCount: number | null) => {
    if (!wordCount) return "1 min read";
    const mins = Math.ceil(wordCount / 200);
    return `${mins} min read`;
  };

  // XP progress calculation
  const nextLevelXp = user.level * 100;
  const xpPercentage = Math.min(100, Math.floor((user.xp / nextLevelXp) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar stats */}
      <aside className="lg:col-span-1 lg:sticky lg:top-8 h-fit flex flex-col gap-6">
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 shadow-xl flex flex-col gap-6 backdrop-blur-md">
          {/* User profile header */}
          <div className="flex items-center gap-4">
            <img
              src={user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name || "User"}`}
              alt={user.name || "User"}
              className="w-14 h-14 rounded-full border-2 border-indigo-500 shadow-md"
            />
            <div>
              <h3 className="font-bold text-lg text-white truncate max-w-[150px]">
                {user.name || "Dev Sandbox"}
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-[150px]">
                {user.email}
              </p>
            </div>
          </div>

          {/* Level stats */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-indigo-400">Level {user.level}</span>
              <span className="text-gray-400">
                {user.xp} / {nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-[#21262d] rounded-full h-3 overflow-hidden border border-[#30363d]">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#21262d] pt-4">
            <div className="flex flex-col items-center p-3 bg-[#0d1117] rounded-xl border border-[#21262d] hover:border-orange-500/50 transition-colors">
              <span className="text-2xl">🔥</span>
              <span className="text-xs text-gray-400 mt-1">Current Streak</span>
              <span className="text-lg font-extrabold text-orange-500 mt-0.5">
                {user.currentStreak} day{user.currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-[#0d1117] rounded-xl border border-[#21262d] hover:border-yellow-500/50 transition-colors">
              <span className="text-2xl">🏆</span>
              <span className="text-xs text-gray-400 mt-1">Longest Streak</span>
              <span className="text-lg font-extrabold text-yellow-500 mt-0.5">
                {user.longestStreak} day{user.longestStreak !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full mt-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all text-center"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main feed container */}
      <section className="lg:col-span-3 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#21262d] pb-4">
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            Your Core Feed
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Personalized relevance scoring
          </span>
        </div>

        {/* Feed Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium">Assembling your ranked feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-12 text-center flex flex-col items-center gap-4 shadow-md">
            <span className="text-4xl">📭</span>
            <h4 className="text-lg font-bold text-white">Your feed is empty</h4>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              We couldn&apos;t find any articles published in the last 7 days matching your tags. Try adding more interests or wait for the scraper to ingest new feeds.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => handleRead(post.id)}
                className={`bg-[#161b22] border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 relative group cursor-pointer ${
                  post.isRead ? "border-[#21262d] opacity-75" : "border-[#30363d] hover:border-indigo-500/50"
                }`}
              >
                {/* Score ribbon for dev visual debugging */}
                {post.isRead && (
                  <span className="absolute top-4 right-4 bg-[#21262d] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Read
                  </span>
                )}

                {/* Card Header metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-400 hover:underline">
                      {post.source.name}
                    </span>
                    <span className="text-[#30363d]">•</span>
                    <span>{formatRelativeTime(post.publishedAt)}</span>
                    <span className="text-[#30363d]">•</span>
                    <span>{getEstimatedReadTime(post.wordCount)}</span>
                  </div>
                  <div className="flex gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-[#21262d] text-gray-300 font-medium px-2.5 py-0.5 rounded-full border border-[#30363d] text-[10px]"
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title and Excerpt */}
                <div className="flex flex-col gap-2">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      // Prevent parent click triggering twice if click on link
                      e.stopPropagation();
                      handleRead(post.id);
                    }}
                    className="text-lg md:text-xl font-bold text-white hover:text-indigo-400 transition-colors leading-snug outline-none"
                  >
                    {post.title}
                  </a>
                  {post.excerpt && (
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                {/* Bottom Bar Controls */}
                <div className="flex items-center justify-between border-t border-[#21262d] pt-3 mt-1">
                  <div className="flex gap-4">
                    {/* Like button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        post.isLiked
                          ? "bg-pink-500/10 border-pink-500/40 text-pink-500"
                          : "border-[#21262d] text-gray-400 hover:text-white hover:border-[#30363d]"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill={post.isLiked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      Like
                    </button>

                    {/* Bookmark/Save button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(post.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        post.isSaved
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                          : "border-[#21262d] text-gray-400 hover:text-white hover:border-[#30363d]"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill={post.isSaved ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      Save
                    </button>
                  </div>

                  {/* Read state trigger button */}
                  {!post.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRead(post.id);
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-500 px-3 py-1.5 rounded-lg transition-all"
                    >
                      +10 XP Mark Read
                    </button>
                  )}
                </div>
              </article>
            ))}

            {/* Load More pagination button */}
            {cursor !== null && (
              <button
                onClick={() => fetchPosts(cursor, true)}
                disabled={loadingMore}
                className="w-full mt-4 py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-gray-300 text-sm font-semibold hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading more...
                  </>
                ) : (
                  "Load More Articles"
                )}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
