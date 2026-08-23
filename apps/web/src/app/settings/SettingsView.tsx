"use client";

import { useState, useEffect } from "react";

interface TagItem {
  id: string;
  slug: string;
  label: string;
}

interface UserSettings {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  theme: string;
  layoutDensity: string;
  emailAlerts: boolean;
  weeklyDigest: boolean;
  interests: TagItem[];
}

export default function SettingsView() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Form states
  const [profileName, setProfileName] = useState("");
  const [displayTheme, setDisplayTheme] = useState("dark");
  const [density, setDensity] = useState("comfortable");
  const [alerts, setAlerts] = useState(true);
  const [digest, setDigest] = useState(false);

  // Search interest state
  const [tagSearch, setTagSearch] = useState("");

  // Scrollspy navigation active state
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    fetchSettings();
    fetchTags();

    // Scroll spy listener
    const handleScroll = () => {
      const sections = ["profile", "interests", "display", "communications"];
      const scrollPosition = window.scrollY + 150; // offset for headers

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        // Initialize form states
        setProfileName(data.name || "");
        setDisplayTheme(data.theme);
        setDensity(data.layoutDensity);
        setAlerts(data.emailAlerts);
        setDigest(data.weeklyDigest);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setAllTags(data);
      }
    } catch (err) {
      console.error("Failed to load tags:", err);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveSettings = async (section: string, payload: Record<string, unknown>) => {
    setSavingSection(section);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        // show brief checkmark or notification success
      }
    } catch (err) {
      console.error(`Failed to save settings for ${section}:`, err);
    } finally {
      setSavingSection(null);
    }
  };

  const handleAddTag = async (tagId: string) => {
    if (!settings) return;
    await saveSettings("interests", {
      addTagIds: [tagId],
    });
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!settings) return;
    await saveSettings("interests", {
      removeTagIds: [tagId],
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-semibold">Loading settings profile...</p>
      </div>
    );
  }

  // Filter tags available to follow (not already in interests)
  const followedTagIds = new Set(settings.interests.map((t) => t.id));
  const availableTags = allTags.filter(
    (tag) =>
      !followedTagIds.has(tag.id) &&
      tag.label.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-1 lg:sticky lg:top-24 flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">
          Preferences Menu
        </span>
        <button
          onClick={() => scrollToSection("profile")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
            activeSection === "profile"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-gray-400 hover:text-white hover:bg-[#161b22]"
          }`}
        >
          👤 Account Profile
        </button>
        <button
          onClick={() => scrollToSection("interests")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
            activeSection === "interests"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-gray-400 hover:text-white hover:bg-[#161b22]"
          }`}
        >
          🚀 Interests & Topics
        </button>
        <button
          onClick={() => scrollToSection("display")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
            activeSection === "display"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-gray-400 hover:text-white hover:bg-[#161b22]"
          }`}
        >
          🎨 Design & Appearance
        </button>
        <button
          onClick={() => scrollToSection("communications")}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
            activeSection === "communications"
              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              : "text-gray-400 hover:text-white hover:bg-[#161b22]"
          }`}
        >
          ✉️ Communications
        </button>
      </aside>

      {/* Settings Form Container */}
      <section className="lg:col-span-3 flex flex-col gap-12 pb-24">
        {/* Profile Card */}
        <div
          id="profile"
          className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 scroll-mt-24"
        >
          <div>
            <h3 className="text-xl font-bold text-white">Account Profile</h3>
            <p className="text-xs text-gray-400 mt-1">Manage your public information and metadata</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 border-b border-[#21262d] pb-6">
            <img
              src={settings.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${settings.name || "User"}`}
              alt={settings.name || "User"}
              className="w-20 h-20 rounded-full border-4 border-indigo-500/30 shadow-lg"
            />
            <div className="flex-1 w-full flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-400">Account Username</span>
              <h4 className="text-lg font-extrabold text-white">{settings.name || "Dev Sandbox"}</h4>
              <span className="text-xs text-gray-500">{settings.email}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-300">Display Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Chaitanya Kolliboyina"
              className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={() => saveSettings("profile", { name: profileName })}
            disabled={savingSection === "profile"}
            className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10"
          >
            {savingSection === "profile" ? "Saving..." : "Save Profile Details"}
          </button>
        </div>

        {/* Interests Section */}
        <div
          id="interests"
          className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 scroll-mt-24"
        >
          <div>
            <h3 className="text-xl font-bold text-white">Interests & Core Topics</h3>
            <p className="text-xs text-gray-400 mt-1">
              Follow academic fields and engineering topics to shape your personalized feed scoring
            </p>
          </div>

          {/* Active tags list */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-300">Currently Following:</span>
            {settings.interests.length === 0 ? (
              <span className="text-xs text-gray-500 italic bg-[#0d1117] p-4 rounded-xl border border-[#21262d]">
                No topics selected. Use the search below to start mapping your interests!
              </span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {settings.interests.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleRemoveTag(tag.id)}
                    className="flex items-center gap-2 bg-indigo-500/10 hover:bg-red-500/10 hover:text-red-400 text-indigo-400 font-bold px-3 py-1.5 rounded-full border border-indigo-500/20 hover:border-red-500/20 transition-all text-xs group"
                  >
                    <span>{tag.label}</span>
                    <span className="text-[10px] text-indigo-400 group-hover:text-red-400">✕</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add more interests search input */}
          <div className="flex flex-col gap-3 border-t border-[#21262d] pt-6">
            <span className="text-xs font-bold text-gray-300">Discover and Add Topics:</span>
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search semiconductor, nuclear, astrophysics, quantum, frontend..."
              className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />

            {/* Available options grid */}
            {tagSearch.trim() && (
              <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl p-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
                {availableTags.length === 0 ? (
                  <span className="text-xs text-gray-500 italic">No topics match your search query.</span>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2.5 bg-[#161b22] border border-[#21262d] rounded-xl"
                      >
                        <span className="text-xs font-bold text-gray-300">{tag.label}</span>
                        <button
                          onClick={() => handleAddTag(tag.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1 rounded-lg text-[10px] transition-all"
                        >
                          + Follow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Display / Appearance Card */}
        <div
          id="display"
          className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 scroll-mt-24"
        >
          <div>
            <h3 className="text-xl font-bold text-white">Design & Appearance</h3>
            <p className="text-xs text-gray-400 mt-1">Configure layout densities, sizing, and theme profiles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-300 font-semibold">Active Theme</label>
              <select
                value={displayTheme}
                onChange={(e) => setDisplayTheme(e.target.value)}
                className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="dark">Deep Space (Dark Mode)</option>
                <option value="light">Solar Clean (Light Mode)</option>
                <option value="system">Follow System OS Settings</option>
              </select>
            </div>

            {/* Layout Density */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-300 font-semibold">Feed Layout Density</label>
              <select
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                className="bg-[#0d1117] border border-[#21262d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="comfortable">Comfortable Grid (Spaced out cards)</option>
                <option value="compact">Compact Feed (High-density rows)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() =>
              saveSettings("display", {
                theme: displayTheme,
                layoutDensity: density,
              })
            }
            disabled={savingSection === "display"}
            className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10"
          >
            {savingSection === "display" ? "Saving..." : "Save Appearance Settings"}
          </button>
        </div>

        {/* Communications / Notifications */}
        <div
          id="communications"
          className="bg-[#161b22] border border-[#21262d] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6 scroll-mt-24"
        >
          <div>
            <h3 className="text-xl font-bold text-white">Communications & Alerts</h3>
            <p className="text-xs text-gray-400 mt-1">Configure email alerts and recurring digest schedules</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Email alerts toggle */}
            <div className="flex items-center justify-between bg-[#0d1117] border border-[#21262d] p-4 rounded-2xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-white">Realtime Email Notifications</span>
                <span className="text-xs text-gray-400">Receive alerts when new articles match your core tags</span>
              </div>
              <input
                type="checkbox"
                checked={alerts}
                onChange={(e) => setAlerts(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 cursor-pointer rounded"
              />
            </div>

            {/* Weekly digests */}
            <div className="flex items-center justify-between bg-[#0d1117] border border-[#21262d] p-4 rounded-2xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-white">Weekly Highlights Digest</span>
                <span className="text-xs text-gray-400">Get a recap of the top-ranked articles delivered to your inbox</span>
              </div>
              <input
                type="checkbox"
                checked={digest}
                onChange={(e) => setDigest(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 cursor-pointer rounded"
              />
            </div>
          </div>

          <button
            onClick={() =>
              saveSettings("communications", {
                emailAlerts: alerts,
                weeklyDigest: digest,
              })
            }
            disabled={savingSection === "communications"}
            className="self-end px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/10"
          >
            {savingSection === "communications" ? "Saving..." : "Save Communication Settings"}
          </button>
        </div>
      </section>
    </div>
  );
}
