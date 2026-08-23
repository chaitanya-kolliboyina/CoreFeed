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
  bookmarkLabel: string | null;
  isReposted: boolean;
  isRead: boolean;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
}

interface CompanySource {
  id: string;
  name: string;
  siteUrl: string;
  tags: {
    id: string;
    slug: string;
    label: string;
  }[];
  isFollowed: boolean;
}

interface SuggestedSource {
  id: string;
  name: string;
  siteUrl: string;
  tags: {
    id: string;
    slug: string;
    label: string;
  }[];
  score: number;
}

interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

export default function FeedView({ initialUser }: { initialUser: UserStats }) {
  const [user, setUser] = useState<UserStats>(initialUser);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search & Navigation
  const [feedSearch, setFeedSearch] = useState("");

  // Company management states
  const [allSources, setAllSources] = useState<CompanySource[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedSource[]>([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState("");

  // Bookmark management states
  const [bookmarkPickerPostId, setBookmarkPickerPostId] = useState<string | null>(null);
  const [bookmarkLabelText, setBookmarkLabelText] = useState("");

  // Comments states
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  // Fetch initial posts and company details on load
  useEffect(() => {
    fetchPosts(0, false, feedSearch);
    fetchCompanyData();
  }, []);

  // Trigger search on debounce or press enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(0, false, feedSearch);
  };

  const fetchCompanyData = async () => {
    try {
      const [sourcesRes, suggestionsRes] = await Promise.all([
        fetch("/api/sources"),
        fetch("/api/sources/suggestions"),
      ]);

      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        setAllSources(data);
      }
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error("Failed to load company sources data:", err);
    }
  };

  const fetchPosts = async (currentCursor: number, append: boolean, searchQuery: string = "") => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(
        `/api/feed?cursor=${currentCursor}&limit=10&search=${encodeURIComponent(searchQuery)}`
      );
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
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: post.likesCount + (isLiked ? 1 : -1),
          };
        }
        return post;
      })
    );

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleRepost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isReposted = !post.isReposted;
          return {
            ...post,
            isReposted,
            repostsCount: post.repostsCount + (isReposted ? 1 : -1),
          };
        }
        return post;
      })
    );

    try {
      await fetch(`/api/posts/${postId}/repost`, { method: "POST" });
    } catch (err) {
      console.error("Failed to toggle repost:", err);
    }
  };

  const handleSaveToggle = async (postId: string, label: string = "Default") => {
    try {
      const res = await fetch(`/api/posts/${postId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isSaved: data.saved,
                  bookmarkLabel: data.saved ? data.label || label : null,
                }
              : post
          )
        );
        setBookmarkPickerPostId(null);
        setBookmarkLabelText("");
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const handleRead = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || post.isRead) return;

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

  const handleFollowSource = async (sourceId: string) => {
    setAllSources((prev) =>
      prev.map((src) =>
        src.id === sourceId ? { ...src, isFollowed: !src.isFollowed } : src
      )
    );
    setSuggestions((prev) => prev.filter((s) => s.id !== sourceId));

    try {
      const res = await fetch(`/api/sources/${sourceId}/follow`, {
        method: "POST",
      });
      if (res.ok) {
        fetchPosts(0, false, feedSearch);
        const suggestionsRes = await fetch("/api/sources/suggestions");
        if (suggestionsRes.ok) {
          const data = await suggestionsRes.json();
          setSuggestions(data);
        }
      }
    } catch (err) {
      console.error("Failed to follow source:", err);
    }
  };

  // Comments Actions
  const toggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      setComments([]);
      return;
    }

    setActiveCommentsPostId(postId);
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setNewCommentText("");
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, commentsCount: post.commentsCount + 1 }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
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

  const nextLevelXp = user.level * 100;
  const xpPercentage = Math.min(100, Math.floor((user.xp / nextLevelXp) * 100));

  const filteredSources = allSources.filter((source) =>
    source.name.toLowerCase().includes(directorySearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Stats & Suggestions */}
      <aside className="lg:col-span-1 lg:sticky lg:top-8 h-fit flex flex-col gap-6">
        {/* User Card */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6 shadow-xl flex flex-col gap-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <img
              src={user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name || "User"}`}
              alt={user.name || "User"}
              className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-md"
            />
            <div>
              <h3 className="font-bold text-white truncate max-w-[150px]">
                {user.name || "Dev Sandbox"}
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-[150px]">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-indigo-400">Level {user.level}</span>
              <span className="text-gray-400">
                {user.xp} / {nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-[#21262d] rounded-full h-2.5 overflow-hidden border border-[#30363d]">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#21262d] pt-4">
            <div className="flex flex-col items-center p-2.5 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <span className="text-xl">🔥</span>
              <span className="text-[10px] text-gray-400 mt-1">Current Streak</span>
              <span className="text-base font-extrabold text-orange-500 mt-0.5">
                {user.currentStreak} day{user.currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col items-center p-2.5 bg-[#0d1117] rounded-xl border border-[#21262d]">
              <span className="text-xl">🏆</span>
              <span className="text-[10px] text-gray-400 mt-1">Longest Streak</span>
              <span className="text-base font-extrabold text-yellow-500 mt-0.5">
                {user.longestStreak} day{user.longestStreak !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Directory Trigger */}
          <button
            onClick={() => setShowDirectory(true)}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            🔍 Explore Companies
          </button>

          <a
            href="/settings"
            className="w-full py-2.5 rounded-xl border border-[#30363d] hover:bg-[#21262d] text-gray-200 text-xs font-bold transition-all text-center block"
          >
            ⚙️ Preferences & Settings
          </a>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/5 transition-all text-center"
          >
            Sign Out
          </button>
        </div>

        {/* Suggested Companies Widget */}
        {suggestions.length > 0 && (
          <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>💡</span> Suggested Channels
            </h4>
            <div className="flex flex-col gap-3">
              {suggestions.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between gap-3 bg-[#0d1117] p-3 rounded-xl border border-[#21262d]"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-gray-200 truncate">
                      {source.name}
                    </span>
                    <span className="text-[10px] text-indigo-400 truncate">
                      {source.tags[0]?.label || "Engineering"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleFollowSource(source.id)}
                    className="text-[10px] font-extrabold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-500 px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0"
                  >
                    + Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main feed container */}
      <section className="lg:col-span-3 flex flex-col gap-6">
        {/* Search and Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#21262d] pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-wide">
              Your Core Feed
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              Personalized relevance scoring
            </span>
          </div>

          {/* Unified Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md w-full relative">
            <input
              type="text"
              value={feedSearch}
              onChange={(e) => setFeedSearch(e.target.value)}
              placeholder="Search posts, topics, tags..."
              className="w-full bg-[#161b22] border border-[#21262d] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          </form>
        </div>

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
              We couldn&apos;t find any articles matching your tags or filters. Try exploring companies to follow or clearing your search!
            </p>
            {feedSearch && (
              <button
                onClick={() => {
                  setFeedSearch("");
                  fetchPosts(0, false, "");
                }}
                className="mt-2 text-xs font-bold text-indigo-400 hover:underline"
              >
                Clear Search Filter
              </button>
            )}
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
                {post.isRead && (
                  <span className="absolute top-4 right-4 bg-[#21262d] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Read
                  </span>
                )}

                {/* Bookmark Folder Label Indicator */}
                {post.isSaved && post.bookmarkLabel && (
                  <span className="absolute top-4 right-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    📂 {post.bookmarkLabel}
                  </span>
                )}

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

                <div className="flex flex-col gap-2">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
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

                {/* Custom Bookmark Tag Dialog Box */}
                {bookmarkPickerPostId === post.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0d1117] border border-[#21262d] p-4 rounded-xl flex flex-col gap-3 mt-2"
                  >
                    <span className="text-xs font-bold text-gray-300">Save to Custom Bookmark Folder:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bookmarkLabelText}
                        onChange={(e) => setBookmarkLabelText(e.target.value)}
                        placeholder="e.g. Astrophysics, Deep Tech, Read Later..."
                        className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveToggle(post.id, bookmarkLabelText || "Default")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Social tray and action buttons */}
                <div className="flex flex-wrap items-center justify-between border-t border-[#21262d] pt-3 mt-1 gap-3">
                  <div className="flex gap-2">
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
                      <span>{post.likesCount}</span>
                    </button>

                    {/* Repost button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRepost(post.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        post.isReposted
                          ? "bg-green-500/10 border-green-500/40 text-green-500"
                          : "border-[#21262d] text-gray-400 hover:text-white hover:border-[#30363d]"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17"
                        />
                      </svg>
                      <span>{post.repostsCount}</span>
                    </button>

                    {/* Comment button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments(post.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        activeCommentsPostId === post.id
                          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400"
                          : "border-[#21262d] text-gray-400 hover:text-white hover:border-[#30363d]"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.commentsCount}</span>
                    </button>

                    {/* Save/Custom Bookmark button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.isSaved) {
                          handleSaveToggle(post.id);
                        } else {
                          setBookmarkPickerPostId(bookmarkPickerPostId === post.id ? null : post.id);
                          setBookmarkLabelText("");
                        }
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

                {/* Inline Comment Drawer Section */}
                {activeCommentsPostId === post.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="border-t border-[#21262d] pt-4 mt-2 flex flex-col gap-4"
                  >
                    <span className="text-xs font-bold text-gray-200">Discussion</span>

                    {/* Write comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                      >
                        Post
                      </button>
                    </div>

                    {/* Comments List */}
                    {commentsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : comments.length === 0 ? (
                      <span className="text-xs text-gray-500 italic">No comments yet. Be the first to comment!</span>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-[#0d1117] border border-[#21262d] p-3 rounded-xl flex gap-3"
                          >
                            <img
                              src={comment.user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user.name || "User"}`}
                              alt={comment.user.name || "User"}
                              className="w-7 h-7 rounded-full border border-indigo-500/40"
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-300">{comment.user.name || "Dev"}</span>
                                <span className="text-[10px] text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{comment.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}

            {cursor !== null && (
              <button
                onClick={() => fetchPosts(cursor, true, feedSearch)}
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

      {/* Company Directory Modal */}
      {showDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0f14]/80 backdrop-blur-md transition-all duration-300 animate-fadeIn">
          <div className="bg-[#161b22] border border-[#30363d] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#21262d] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Explore Company Channels</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Follow specialized research groups, space agencies, and core engineering hubs
                </p>
              </div>
              <button
                onClick={() => setShowDirectory(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-[#21262d] hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 bg-[#0d1117] border-b border-[#21262d]">
              <input
                type="text"
                value={directorySearchQuery}
                onChange={(e) => setDirectorySearchQuery(e.target.value)}
                placeholder="Search engineering blogs, space programs, chip designers..."
                className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Modal Content - Grid */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-[#30363d] transition-all"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{source.name}</h4>
                    <a
                      href={source.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:underline mt-1 block"
                    >
                      Visit Site →
                    </a>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {source.tags.map((t) => (
                        <span
                          key={t.id}
                          className="bg-[#161b22] text-gray-400 text-[9px] px-2 py-0.5 rounded-full border border-[#21262d]"
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowSource(source.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold border transition-all ${
                      source.isFollowed
                        ? "bg-[#21262d] border-[#30363d] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 hover:content-['Unfollow']"
                        : "bg-indigo-600 hover:bg-indigo-700 border-transparent text-white"
                    }`}
                  >
                    {source.isFollowed ? "Following" : "+ Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
