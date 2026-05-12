"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { motion, AnimatePresence } from "framer-motion";

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  display_name?: string | null;
  likes?: number;
};

/* ── helpers ── */
function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const palette = [
  "from-[#2255cc] to-[#5a9fff]",
  "from-[#7a2299] to-[#c066ee]",
  "from-[#994422] to-[#ee8855]",
  "from-[#226677] to-[#55aacc]",
  "from-[#1a6644] to-[#4aaa88]",
  "from-[#885522] to-[#ddaa55]",
];
function avatarGrad(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return palette[h];
}

/* ── Heart icon ── */
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function CommentsClient({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [sessionRole, setSessionRole] = useState<"admin" | "user">("user");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function loadComments() {
    try {
      const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
      const json = await res.json();
      setComments(json.comments ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadComments(); }, [postId]);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      setHasSession(Boolean(sess));
      setMyUserId(sess?.user?.id ?? null);
      if (!sess) return;
      try {
        const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${sess.access_token}` } });
        const json = await res.json();
        setSessionRole(json.user?.role === "admin" ? "admin" : "user");
      } catch { /* ignore */ }
    }
    loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(loadSession);
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit() {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      if (!sess) throw new Error("No session");
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${sess.access_token}` },
        body: JSON.stringify({ postId, content }),
      });
      if (!res.ok) throw new Error("Failed");
      setContent("");
      await loadComments();
    } catch { /* silent */ }
    finally { setPosting(false); }
  }

  function toggleLike(id: string) {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setLocalLikes(l => ({ ...l, [id]: (l[id] ?? 0) - 1 })); }
      else { next.add(id); setLocalLikes(l => ({ ...l, [id]: (l[id] ?? 0) + 1 })); }
      return next;
    });
  }

  async function deleteComment(id: string) {
    const { data } = await supabase.auth.getSession();
    const sess = data.session;
    if (!sess) return;
    setDeletingId(id);
    try {
      await fetch(`/api/comments?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sess.access_token}` },
      });
      setComments(prev => prev.filter(c => c.id !== id));
    } finally { setDeletingId(null); }
  }

  const displayName = (c: CommentRow) => c.display_name ?? "Reader";
  const likeCount = (c: CommentRow) => (c.likes ?? 0) + (localLikes[c.id] ?? 0);

  return (
    <section className="max-w-2xl mt-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif italic text-2xl font-light text-[#f0e6c8]">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-sans font-light text-[#4a6a8a] not-italic">{comments.length}</span>
          )}
        </h2>
        {hasSession && (
          <span className={`text-xs font-sans px-2.5 py-1 rounded-full border ${
            sessionRole === "admin"
              ? "text-[#7ec8ff] border-[#5a9fff]/30 bg-[#2255cc]/15"
              : "text-[#6a8aaa] border-[#1a2a3a]/60 bg-[#0a0e1a]/40"
          }`}>
            {sessionRole === "admin" ? "Admin" : "Signed in"}
          </span>
        )}
      </div>

      {/* ── Comment list ── */}
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-[#4a6a8a] text-sm font-sans">
          <span className="animate-pulse text-[#5a9fff]">✦</span> Loading…
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-sans font-light text-[#3a5a7a]">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-start gap-3 py-3 border-b border-[#1a2a3a]/40 last:border-0"
              >
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${avatarGrad(displayName(c))} flex items-center justify-center text-[11px] font-sans font-semibold text-white`}>
                  {initials(displayName(c))}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-sans font-semibold text-[#d0e8f8]/90">{displayName(c)}</span>
                    <span className="text-sm font-sans font-light text-[#8a9aaa] break-words">{c.content}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[10px] font-sans text-[#2a3a4a]">{timeAgo(c.created_at)}</span>
                    {likeCount(c) > 0 && (
                      <span className="text-[10px] font-sans text-[#2a3a4a]">{likeCount(c)} like{likeCount(c) !== 1 ? "s" : ""}</span>
                    )}
                    {hasSession && (
                      <button className="text-[10px] font-sans font-semibold text-[#4a6a8a] hover:text-[#d0e8f8] transition-colors">
                        Reply
                      </button>
                    )}
                    {(sessionRole === "admin" || c.author_id === myUserId) && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        disabled={deletingId === c.id}
                        className="text-[10px] font-sans font-semibold text-transparent group-hover:text-red-500/50 hover:!text-red-400 transition-colors disabled:opacity-40"
                      >
                        {deletingId === c.id ? "…" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Like button */}
                <button
                  onClick={() => toggleLike(c.id)}
                  className={`shrink-0 mt-1 transition-all duration-200 active:scale-125 ${
                    liked.has(c.id) ? "text-red-400" : "text-[#2a3a4a] hover:text-[#6a8aaa]"
                  }`}
                >
                  <Heart filled={liked.has(c.id)} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="mt-5 border-t border-[#1a2a3a]/50 pt-4">
        {hasSession ? (
          <div className="flex items-end gap-3">
            {/* Moon Whispers logo avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#0a0e1a] border border-[#1a2a3a]/80 flex items-center justify-center">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <circle cx="18" cy="18" r="14" stroke="url(#cR)" strokeWidth="1" fill="none" opacity="0.7"/>
                {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  return <line key={i} x1={+(18+13*Math.cos(rad)).toFixed(2)} y1={+(18+13*Math.sin(rad)).toFixed(2)} x2={+(18+16.5*Math.cos(rad)).toFixed(2)} y2={+(18+16.5*Math.sin(rad)).toFixed(2)} stroke="url(#cS)" strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>;
                })}
                <path d="M18 6 C11 6 6 11.5 6 18 C6 24.5 11 30 18 30 C13 27 10 23 10 18 C10 13 13 9 18 6Z" fill="url(#cC)" opacity="0.9"/>
                <g transform="translate(14.5,14.5)">
                  <line x1="3" y1="0" x2="3" y2="6" stroke="#7ec8ff" strokeWidth="0.7" strokeLinecap="round" opacity="0.9"/>
                  <line x1="0" y1="3" x2="6" y2="3" stroke="#7ec8ff" strokeWidth="0.7" strokeLinecap="round" opacity="0.9"/>
                  <circle cx="3" cy="3" r="1.2" fill="#b8e8ff" opacity="0.95"/>
                  <circle cx="3" cy="3" r="0.5" fill="white"/>
                </g>
                <defs>
                  <linearGradient id="cR" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#a0c8ff" stopOpacity="0.9"/><stop offset="100%" stopColor="#4a7aff" stopOpacity="0.4"/></linearGradient>
                  <linearGradient id="cS" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c0e0ff" stopOpacity="0.9"/><stop offset="100%" stopColor="#5090ff" stopOpacity="0.3"/></linearGradient>
                  <linearGradient id="cC" x1="6" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#5a9fff" stopOpacity="0.95"/><stop offset="60%" stopColor="#2255cc" stopOpacity="0.85"/><stop offset="100%" stopColor="#0a1a66" stopOpacity="0.7"/></linearGradient>
                </defs>
              </svg>
            </div>
            {/* Input */}
            <div className="flex-1 flex items-end gap-2 rounded-2xl border border-[#1a2a3a]/70 bg-[#080c14]/60 px-4 py-2.5 focus-within:border-[#5a9fff]/40 transition-colors">
              <textarea
                ref={inputRef}
                value={content}
                onChange={e => { setContent(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }}}
                placeholder="Add a comment…"
                rows={1}
                className="flex-1 bg-transparent text-sm font-sans text-[#d0e8f8] placeholder-[#2a3a4a] outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
              />
              <AnimatePresence>
                {content.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={onSubmit}
                    disabled={posting}
                    className="shrink-0 text-sm font-sans font-semibold text-[#5a9fff] hover:text-[#a0c8ff] transition-colors disabled:opacity-50 pb-0.5"
                  >
                    {posting ? "…" : "Post"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-sans font-light text-[#3a5a7a]">
              <a href="/auth" className="text-[#5a9fff] hover:text-[#a0c8ff] transition-colors font-medium">Sign in</a> to leave a comment.
            </p>
            <a href="/auth"
              className="rounded-xl bg-[#2255cc] px-4 py-2 text-xs font-sans font-semibold text-white hover:bg-[#3366dd] transition-all duration-200">
              Sign in
            </a>
          </div>
        )}
        <p className="text-[10px] font-sans text-[#1a2a3a] mt-2 ml-11">Press Enter to post · Shift+Enter for new line</p>
      </div>
    </section>
  );
}