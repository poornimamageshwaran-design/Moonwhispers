"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { motion, AnimatePresence } from "framer-motion";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at?: string | null;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at?: string | null;
  author_id?: string | null;
};

// ── API helper — all requests go through server-side routes ───────────────
// This means RLS never touches these calls; the service role bypasses it.
async function apiFetch(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (!json.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

// ── Small UI atoms ─────────────────────────────────────────────────────────
function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="8" stroke="url(#mR)" strokeWidth="0.8" fill="none" opacity="0.6" />
      <path d="M10 3 C6.5 3 4 6 4 10 C4 14 6.5 17 10 17 C7.5 15.5 6 13 6 10 C6 7 7.5 4.5 10 3Z" fill="url(#mC)" opacity="0.85" />
      <defs>
        <linearGradient id="mR" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a0c8ff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#4a7aff" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="mC" x1="4" y1="3" x2="10" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5a9fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#1a3a99" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Alert({ type, children, onClose }: {
  type: "error" | "success" | "warn";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const styles = {
    error: "border-red-900/50 bg-red-950/30 text-red-400",
    success: "border-[#5a9fff]/25 bg-[#2255cc]/10 text-[#a0c8ff]",
    warn: "border-yellow-900/50 bg-yellow-950/20 text-yellow-400",
  };
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`mb-4 rounded-xl border px-4 py-3 text-sm font-sans flex items-start justify-between gap-3 ${styles[type]}`}>
      <span>{children}</span>
      {onClose && <button onClick={onClose} className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100">×</button>}
    </motion.div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ post, onConfirm, onCancel, loading }: {
  post: Post; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#020408]/75 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
        className="relative w-full max-w-sm rounded-3xl border border-[#1a2a3a]/80 bg-[#0a0e1a]/97 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-center w-12 h-12 rounded-2xl border border-red-900/40 bg-red-950/30 mx-auto">
          <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.5 4h3a1.5 1.5 0 0 0-3 0ZM7 4a3 3 0 1 1 6 0h4a.75.75 0 0 1 0 1.5h-.96l-1.04 10.4A2.5 2.5 0 0 1 12.51 18H7.49a2.5 2.5 0 0 1-2.49-2.1L3.96 5.5H3A.75.75 0 0 1 3 4h4Z" />
          </svg>
        </div>
        <h3 className="font-serif italic text-xl font-light text-[#f0e6c8] text-center mb-2">Delete this post?</h3>
        <p className="text-sm font-sans font-light text-[#6a8aaa] text-center mb-1">You are about to permanently delete:</p>
        <p className="text-sm font-sans font-semibold text-[#a0c8ff] text-center mb-2 px-2 truncate">"{post.title}"</p>
        <p className="text-xs font-sans text-[#3a4a5a] text-center mb-7">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 rounded-xl border border-[#1a2a3a]/80 px-4 py-3 text-sm font-sans font-medium text-[#6a8aaa] hover:border-[#5a9fff]/30 hover:text-[#a0c8ff] transition-all duration-200 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl bg-red-700/80 border border-red-600/40 px-4 py-3 text-sm font-sans font-semibold text-red-100 hover:bg-red-600/80 transition-all duration-200 disabled:opacity-50">
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Not-admin help screen ──────────────────────────────────────────────────
function NotAdminScreen({ session, onRetry }: { session: any; onRetry: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#cc4422]/5 blur-[110px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-lg">
        <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-3 text-center">Moon Whispers</p>
        <h1 className="font-serif italic text-4xl font-light tracking-tight text-[#f0e6c8] mb-6 text-center">Access Restricted</h1>

        <div className="rounded-2xl border border-[#1a2a3a]/70 bg-[#0a0e1a]/60 p-6 backdrop-blur-sm space-y-5">
          <p className="text-sm font-sans font-light text-[#6a8aaa]">
            Signed in as <span className="text-[#a0c8ff] font-medium">{session.user?.email}</span>, but this account does not have the <code className="text-[#7ec8ff] bg-[#1a2a3a]/60 px-1.5 py-0.5 rounded text-xs">admin</code> role.
          </p>

          <div>
            <p className="text-xs font-sans font-medium tracking-[0.12em] uppercase text-[#6a8aaa] mb-2">
              Run this in your Supabase SQL Editor:
            </p>
            <pre className="rounded-xl bg-[#080c14]/90 border border-[#1a2a3a]/70 px-4 py-3.5 text-xs font-mono text-[#7ec8ff] overflow-x-auto select-all leading-relaxed">
{`-- Option A: promote by user ID (copy from below)
UPDATE public.profiles
SET role = 'admin'
WHERE id = '${session.user?.id}';

-- Option B: promote by email
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND u.email = '${session.user?.email}';`}
            </pre>
          </div>

          <div className="rounded-xl bg-[#1a2a3a]/30 border border-[#1a2a3a]/50 px-4 py-3 text-xs font-sans text-[#4a7a9a] space-y-1 leading-relaxed">
            <p><span className="text-[#6a8aaa]">Your user ID:</span> <span className="font-mono text-[#7ec8ff] select-all">{session.user?.id}</span></p>
            <p><span className="text-[#6a8aaa]">Your email:</span> <span className="font-mono text-[#7ec8ff]">{session.user?.email}</span></p>
          </div>

          <p className="text-xs font-sans text-[#3a5a7a]">
            After running the SQL, sign out and sign back in, then click Retry below.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
              className="flex-1 rounded-xl border border-[#1a2a3a]/80 px-4 py-2.5 text-sm font-sans text-[#6a8aaa] hover:text-[#a0c8ff] hover:border-[#5a9fff]/30 transition-all duration-200">
              Sign out
            </button>
            <button onClick={onRetry}
              className="flex-1 rounded-xl bg-[#2255cc] px-4 py-2.5 text-sm font-sans font-semibold text-white hover:bg-[#3366dd] transition-all duration-200">
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main admin page ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [session, setSession]         = useState<any>(null);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);
  const [notAdmin, setNotAdmin]       = useState(false);

  // form
  const [title, setTitle]       = useState("");
  const [slug, setSlug]         = useState("");
  const [excerpt, setExcerpt]   = useState("");
  const [content, setContent]   = useState("");
  const [postStatus, setPostStatus] = useState<"draft" | "published">("published");
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState<"create" | "posts" | "messages">("create");
  const [messages, setMessages]   = useState<ContactMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [deletingMsg, setDeletingMsg] = useState<string | null>(null);

  function syncSlug(t: string) {
    setSlug(t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function loadMessages(token: string) {
    setLoadingMsgs(true);
    try {
      const json = await apiFetch("/api/admin/messages", token);
      setMessages(json.messages ?? []);
    } catch (err: any) {
      setError(`Could not load messages: ${err.message}`);
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function deleteMessage(id: string, token: string) {
    setDeletingMsg(id);
    try {
      await apiFetch(`/api/admin/messages?id=${id}`, token, { method: "DELETE" });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setDeletingMsg(null);
    }
  }

  // ── loadPosts calls the SERVER API (service role, bypasses RLS) ──────────
  async function loadPosts(token: string) {
    setLoadingPosts(true);
    setNotAdmin(false);
    setError(null);
    try {
      const json = await apiFetch("/api/admin/posts", token);
      setPosts(json.posts ?? []);
    } catch (err: any) {
      if (err.message === "Forbidden") {
        setNotAdmin(true);
      } else {
        setError(`Could not load posts: ${err.message}`);
      }
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const sess = data.session;
      setSession(sess);
      if (sess?.access_token) { await loadPosts(sess.access_token); await loadMessages(sess.access_token); }
      setLoadingPage(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, sess) => {
      setSession(sess);
      if (sess?.access_token) { await loadPosts(sess.access_token); await loadMessages(sess.access_token); } else {
        setPosts([]);
        setNotAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function confirmDelete() {
    if (!selectedPost || !session?.access_token) return;
    setDeleting(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/posts?id=${selectedPost.id}`, session.access_token, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
      setSuccess(`"${selectedPost.title}" was deleted.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
      setSelectedPost(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // Duplicate check
    const dupTitle = posts.find(p => p.title.trim().toLowerCase() === title.trim().toLowerCase());
    if (dupTitle) {
      setError(`A post named "${dupTitle.title}" already exists. Use a different title.`);
      return;
    }
    const dupSlug = posts.find(p => p.slug === slug.trim());
    if (dupSlug) {
      setError(`Slug "${slug}" is already used by "${dupSlug.title}". Change it to something unique.`);
      return;
    }

    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug and content are all required.");
      return;
    }
    if (!session?.access_token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch("/api/admin/posts", session.access_token, {
        method: "POST",
        body: JSON.stringify({ title, slug, excerpt: excerpt || undefined, content, status: postStatus }),
      });
      setTitle(""); setSlug(""); setExcerpt(""); setContent(""); setPostStatus("published");
      setSuccess("Post created! Switching to Your Posts…");
      setTimeout(() => setSuccess(null), 4000);
      await loadPosts(session.access_token);
      setTab("posts");
    } catch (err: any) {
      const msg = (err.message ?? "").toLowerCase();
      if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("slug")) {
        setError(`A post with slug "${slug}" already exists. Change the slug and try again.`);
      } else {
        setError(`Create failed: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-[#1a2a3a]/80 bg-[#080c14]/60 px-4 py-3 text-sm font-sans text-[#d0e8f8] placeholder-[#2a3a4a] outline-none transition-all duration-200 focus:border-[#5a9fff]/50 focus:shadow-[0_0_0_1px_rgba(90,160,255,0.12)]";
  const labelClass = "text-xs font-sans font-medium tracking-[0.15em] uppercase text-[#6a8aaa]";

  // ── States ────────────────────────────────────────────────────────────────

  if (loadingPage) {
    return (
      <div className="pt-28 flex items-center justify-center gap-3 text-[#6a8aaa] font-sans font-light text-sm">
        <span className="animate-pulse text-[#5a9fff]">✦</span> Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#2255cc]/6 blur-[110px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative w-full max-w-md text-center">
          <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-3">Moon Whispers</p>
          <h1 className="font-serif italic text-4xl font-light tracking-tight text-[#f0e6c8] mb-2">Admin Dashboard</h1>
          <p className="text-sm font-sans font-light text-[#6a8aaa] mb-8">Sign in with an admin account to continue.</p>
          <div className="rounded-2xl border border-[#1a2a3a]/70 bg-[#0a0e1a]/60 p-6 backdrop-blur-sm">
            <p className="text-sm font-sans font-light text-[#6a8aaa] mb-5">You need to be signed in to access this area.</p>
            <a href="/auth" className="inline-block w-full rounded-xl bg-[#2255cc] px-5 py-3.5 text-sm font-sans font-semibold text-white text-center shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_30px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] transition-all duration-300">
              Sign in
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  if (notAdmin) {
    return <NotAdminScreen session={session} onRetry={() => loadPosts(session.access_token)} />;
  }

  // ── Authenticated admin UI ─────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {selectedPost && (
          <DeleteModal post={selectedPost} onConfirm={confirmDelete}
            onCancel={() => setSelectedPost(null)} loading={deleting} />
        )}
      </AnimatePresence>

      <div className="relative pt-24 pb-20">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#2255cc]/5 blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#7ec8ff]/4 blur-[100px]" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-2">Moon Whispers</p>
            <h1 className="font-serif italic text-4xl font-light tracking-tight text-[#f0e6c8]">Admin Dashboard</h1>
            <p className="mt-2 text-sm font-sans font-light text-[#6a8aaa]">
              Signed in as <span className="text-[#a0c8ff]">{session.user?.email}</span>
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && <Alert key="error" type="error" onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert key="success" type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
          </AnimatePresence>

          {/* Tabbed card */}
          <div className="rounded-3xl border border-[#1a2a3a]/70 bg-[#0a0e1a]/60 overflow-hidden backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

            {/* Tabs */}
            <div className="flex border-b border-[#1a2a3a]/70">
              {(["create", "posts", "messages"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-sans font-medium transition-all duration-200 border-b-2 ${
                    tab === t
                      ? "text-[#a0c8ff] border-[#5a9fff] bg-[#2255cc]/8"
                      : "text-[#4a6a8a] hover:text-[#7ec8ff] border-transparent"
                  }`}>
                  {t === "create" ? (
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                      <line x1="8" y1="5" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  ) : t === "posts" ? <MoonIcon /> : (
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v7A1.5 1.5 0 0 1 12.5 12H9l-3 2.5V12H3.5A1.5 1.5 0 0 1 2 10.5v-7Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7"/>
                    </svg>
                  )}
                  {t === "create" ? "Create a post" : t === "posts" ? "Your posts" : "Messages"}
                  {t === "posts" && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-light ${
                      tab === "posts" ? "bg-[#2255cc]/30 text-[#7ec8ff]" : "bg-[#1a2a3a]/60 text-[#4a6a8a]"
                    }`}>
                      {loadingPosts ? "…" : posts.length}
                    </span>
                  )}
                  {t === "messages" && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-light ${
                      tab === "messages" ? "bg-[#2255cc]/30 text-[#7ec8ff]" : "bg-[#1a2a3a]/60 text-[#4a6a8a]"
                    }`}>
                      {loadingMsgs ? "…" : messages.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">

                {/* ── CREATE ── */}
                {tab === "create" && (
                  <motion.form key="create" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
                    onSubmit={handleCreate} className="space-y-5">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input className={inputClass} value={title}
                        onChange={(e) => { setTitle(e.target.value); syncSlug(e.target.value); }}
                        placeholder="My post title" />
                    </div>
                    <div>
                      <label className={labelClass}>Slug</label>
                      <input className={inputClass} value={slug}
                        onChange={(e) => setSlug(e.target.value)} placeholder="my-post-title" />
                    </div>
                    <div>
                      <label className={labelClass}>Excerpt</label>
                      <textarea className={inputClass + " resize-none"} rows={2} value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description…" />
                    </div>
                    <div>
                      <label className={labelClass}>Content</label>
                      <textarea className={inputClass + " resize-none"} rows={7} value={content}
                        onChange={(e) => setContent(e.target.value)} placeholder="Write your post content here…" />
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select className={inputClass} value={postStatus}
                        onChange={(e) => setPostStatus(e.target.value as "draft" | "published")}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <button type="submit" disabled={saving}
                      className="w-full rounded-xl bg-[#2255cc] px-5 py-3.5 text-sm font-sans font-semibold text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_28px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] transition-all duration-300 disabled:opacity-50">
                      {saving ? "Creating…" : "Create post"}
                    </button>
                  </motion.form>
                )}

                {/* ── POSTS ── */}
                {tab === "posts" && (
                  <motion.div key="posts" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>

                    {/* Refresh button */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-sans font-light text-[#3a5a7a]">
                        {posts.length > 0
                          ? <>Hover a post then click <span className="text-red-400/70">Delete</span> to remove it.</>
                          : "No posts found."}
                      </p>
                      <button onClick={() => loadPosts(session.access_token)} disabled={loadingPosts}
                        className="text-xs font-sans text-[#4a6a8a] hover:text-[#7ec8ff] transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50">
                        <svg className={`w-3.5 h-3.5 ${loadingPosts ? "animate-spin" : ""}`} viewBox="0 0 16 16" fill="none">
                          <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Refresh
                      </button>
                    </div>

                    {loadingPosts ? (
                      <div className="py-16 flex items-center justify-center gap-2 text-[#4a6a8a] text-sm font-sans">
                        <span className="animate-pulse text-[#5a9fff]">✦</span> Loading posts…
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="flex justify-center mb-4 opacity-20"><MoonIcon className="w-10 h-10" /></div>
                        <p className="font-serif italic text-2xl font-light text-[#d0e8f8]/30 mb-2">No posts yet</p>
                        <p className="text-xs font-sans font-light text-[#2a3a4a] mb-6">
                          If you've created posts before, run the SQL migration in <code className="text-[#4a6a8a]">supabase/migrations/0002_admin_fix.sql</code>.
                        </p>
                        <button onClick={() => setTab("create")}
                          className="rounded-xl border border-[#1a2a3a]/80 px-5 py-2.5 text-sm font-sans font-medium text-[#6a8aaa] hover:border-[#5a9fff]/30 hover:text-[#a0c8ff] transition-all duration-200">
                          Create a post →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[520px] overflow-y-auto -mx-1 px-1">
                        {posts.map((p, i) => (
                          <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.035 }}
                            className="group flex items-start justify-between rounded-xl border border-[#1a2a3a]/60 bg-[#080c14]/40 px-4 py-4 hover:border-[#5a9fff]/25 hover:bg-[#0d1525]/60 transition-all duration-200">
                            <div className="min-w-0 flex-1 flex gap-3">
                              {/* numbered badge */}
                              <span className="shrink-0 w-6 h-6 rounded-full bg-[#1a2a3a]/60 border border-[#2a3a5a]/50 flex items-center justify-center text-[10px] font-mono text-[#4a6a8a] mt-0.5">
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-sans font-semibold text-[#d0e8f8]/90 text-sm truncate">{p.title}</p>
                                {(p as any).excerpt && (
                                  <p className="text-xs text-[#4a6a8a] font-sans font-light mt-0.5 line-clamp-1">{(p as any).excerpt}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <code className="text-[10px] text-[#2a4a6a] font-mono bg-[#0d1525]/60 px-1.5 py-0.5 rounded">/{p.slug}</code>
                                  <span className={`text-xs font-sans font-medium px-1.5 py-0.5 rounded-full border ${
                                    p.status === "published"
                                      ? "text-[#7ec8ff] bg-[#2255cc]/15 border-[#5a9fff]/20"
                                      : "text-[#4a6a8a] bg-[#1a2a3a]/40 border-[#2a3a5a]/30"
                                  }`}>
                                    {p.status}
                                  </span>
                                  {p.created_at && (
                                    <span className="text-[10px] text-[#2a3a4a] font-sans">
                                      {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setSelectedPost(p)}
                              className="ml-3 mt-0.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-sans font-medium border border-transparent text-transparent opacity-0 group-hover:opacity-100 group-hover:border-red-900/40 group-hover:text-red-400/80 hover:!bg-red-950/20 hover:!text-red-400 transition-all duration-200">
                              Delete
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}


                {/* ── MESSAGES ── */}
                {tab === "messages" && (
                  <motion.div key="messages" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-sans font-light text-[#3a5a7a]">
                        Reader messages from your contact page — including their email so you can reply.
                      </p>
                      <button onClick={() => loadMessages(session.access_token)} disabled={loadingMsgs}
                        className="text-xs font-sans text-[#4a6a8a] hover:text-[#7ec8ff] transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50">
                        <svg className={`w-3.5 h-3.5 ${loadingMsgs ? "animate-spin" : ""}`} viewBox="0 0 16 16" fill="none">
                          <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Refresh
                      </button>
                    </div>

                    {loadingMsgs ? (
                      <div className="py-16 flex items-center justify-center gap-2 text-[#4a6a8a] text-sm font-sans">
                        <span className="animate-pulse text-[#5a9fff]">✦</span> Loading messages…
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="font-serif italic text-2xl font-light text-[#d0e8f8]/20 mb-2">No messages yet</p>
                        <p className="text-xs font-sans font-light text-[#2a3a4a]">
                          When readers send messages from <code className="text-[#4a6a8a]">/contact</code>, they'll appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[520px] overflow-y-auto -mx-1 px-1">
                        {messages.map((m, i) => (
                          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="group rounded-xl border border-[#1a2a3a]/60 bg-[#080c14]/40 px-4 py-4 hover:border-[#5a9fff]/20 transition-colors duration-200">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm font-sans font-semibold text-[#d0e8f8]/90">{m.name}</span>
                                  <span className="text-[#1a2a3a]">·</span>
                                  <a href={`mailto:${m.email}`}
                                    className="text-xs font-sans text-[#5a9fff]/70 hover:text-[#a0c8ff] transition-colors underline underline-offset-2">
                                    {m.email}
                                  </a>
                                  {m.created_at && (
                                    <>
                                      <span className="text-[#1a2a3a]">·</span>
                                      <span className="text-[10px] font-sans text-[#2a3a4a]">
                                        {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <p className="text-sm font-sans font-light text-[#6a8aaa] leading-relaxed whitespace-pre-wrap break-words">
                                  {m.message}
                                </p>
                                <a href={`mailto:${m.email}?subject=Re: Your message on Moon Whispers`}
                                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-sans text-[#2255cc] hover:text-[#5a9fff] transition-colors">
                                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                                    <path d="M1 3l5 3.5L11 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                    <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                                  </svg>
                                  Reply by email
                                </a>
                              </div>
                              <button
                                onClick={() => deleteMessage(m.id, session.access_token)}
                                disabled={deletingMsg === m.id}
                                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-sans border border-transparent text-transparent opacity-0 group-hover:opacity-100 group-hover:border-red-900/40 group-hover:text-red-400/70 hover:!bg-red-950/20 hover:!text-red-400 transition-all duration-200 disabled:opacity-40">
                                {deletingMsg === m.id ? "…" : "Delete"}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Browse strip */}
          <div className="mt-8 rounded-3xl border border-[#1a2a3a]/60 bg-[#0a0e1a]/50 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2255cc]/6 via-transparent to-[#7ec8ff]/3 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-[#7ec8ff]/50 mb-1">View your work</div>
                <div className="font-serif italic text-lg font-light text-[#f0e6c8]/80">See how your stories look to readers.</div>
              </div>
              <a href="/posts" className="shrink-0 rounded-xl bg-[#2255cc] px-5 py-2.5 text-sm font-sans font-semibold text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_28px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] transition-all duration-300">
                Browse posts
              </a>
            </div>
          </div>

        </motion.div>
      </div>
    </>
  );
}