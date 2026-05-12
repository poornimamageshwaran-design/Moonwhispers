"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { CinematicCard } from "@/components/ui/CinematicCard";
import type { PublishedPost } from "@/lib/blog/posts";
import { useState } from "react";

export default function PostsClient({ posts }: { posts: PublishedPost[] }) {
  const [query, setQuery] = useState("");

  const filtered = posts.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.excerpt ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="pt-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-10">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              Notes
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-neutral-300 leading-relaxed max-w-2xl">
              Poetry, memories and magic — one whisper at a time.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-6 relative max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/50 pl-10 pr-4 py-3 text-sm outline-none focus:border-accent-soft text-neutral-100 placeholder:text-neutral-500"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-neutral-400">
            <p className="text-lg">No notes found for &quot;{query}&quot;</p>
            <button
              onClick={() => setQuery("")}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.05}>
                <CinematicCard
                  href={`/posts/${p.slug}`}
                  title={p.title}
                  description={p.excerpt ?? undefined}
                  imageUrl={
                    p.cover_image_url ??
                    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
                  }
                  badge={p.published_at ? "Published" : "Latest"}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}