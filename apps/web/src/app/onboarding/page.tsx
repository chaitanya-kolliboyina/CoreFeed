"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

type Tag = {
  id: string;
  slug: string;
  label: string;
};

export default function OnboardingPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // MOCK DATA for now until DB is seeded
  useEffect(() => {
    async function loadTags() {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data);
        }
      } catch (e) {
        console.error("Failed to load tags:", e);
      } finally {
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags: selectedTags }),
      });

      if (res.ok) {
        router.push("/feed");
        router.refresh();
      } else {
        console.error("Failed to save tags");
        setSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          What are you interested in?
        </h1>
        <p className="text-neutral-400 mb-8 text-center">
          Select the topics you want to see in your feed.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                }`}
              >
                <span className="font-medium text-sm">{tag.label}</span>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedTags.length === 0 || submitting}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            selectedTags.length > 0 && !submitting
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
          }`}
        >
          {submitting ? "Saving..." : "Continue to Feed"}
        </button>
      </div>
    </div>
  );
}
