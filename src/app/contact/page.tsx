"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// Deterministic colour from name
const avatarColors = [
  "from-[#2255cc] to-[#5a9fff]",
  "from-[#1a6644] to-[#4aaa88]",
  "from-[#7a2299] to-[#c066ee]",
  "from-[#994422] to-[#ee8855]",
  "from-[#226677] to-[#55aacc]",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % avatarColors.length;
  return avatarColors[h];
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages");
      const json = await res.json();
      if (json.ok) setMessages(json.messages ?? []);
    } catch {
      // silently fail — board is secondary
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => { fetchMessages(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, website: "", phone: "" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setName(""); setEmail(""); setMessage("");
      // Reload the board so the new message appears instantly
      await fetchMessages();
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#1a2a3a]/80 bg-[#080c14]/60 px-4 py-3 text-sm font-sans text-[#d0e8f8] placeholder-[#2a3a4a] outline-none transition-all duration-200 focus:border-[#5a9fff]/50 focus:shadow-[0_0_0_1px_rgba(90,160,255,0.12)]";
  const labelClass =
    "text-xs font-sans font-medium tracking-[0.15em] uppercase text-[#6a8aaa]";

  return (
    <div className="relative pt-24 pb-20 min-h-screen">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2255cc]/5 blur-[130px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7ec8ff]/3 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
        className="relative max-w-2xl mx-auto px-4 sm:px-6"
      >
        {/* ── Header ── */}
        <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-3">
          Moon Whispers
        </p>
        <h1 className="font-serif italic text-4xl font-light tracking-tight text-[#f0e6c8]">
          Community Board
        </h1>
        <p className="mt-3 text-sm font-sans font-light text-[#6a8aaa] leading-relaxed max-w-lg">
          Leave a note, share a thought, or just say hello. Your message appears on this board for everyone to read.
        </p>

        {/* ── Form ── */}
        <div className="mt-8 rounded-3xl border border-[#1a2a3a]/70 bg-[#0a0e1a]/60 p-6 sm:p-8 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-4 h-4 text-[#5a9fff]" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
              <line x1="8" y1="5" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <h2 className="text-sm font-sans font-semibold text-[#d0e8f8]">Post a message</h2>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div key="success"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#5a9fff]/25 bg-[#2255cc]/10 p-8 text-center">
                <div className="text-2xl mb-3 text-[#5a9fff]">✦</div>
                <h3 className="font-serif italic text-xl font-light text-[#f0e6c8] mb-2">Message posted!</h3>
                <p className="text-sm font-sans font-light text-[#6a8aaa] mb-5">
                  Your note is now visible on the board below.
                </p>
                <button onClick={() => setStatus("idle")}
                  className="text-xs font-sans text-[#5a9fff]/70 hover:text-[#a0c8ff] transition-colors">
                  Post another →
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className={inputClass} placeholder="Your name" autoComplete="name" required />
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="normal-case text-[#2a3a4a]">(not shown publicly)</span></label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)}
                      className={inputClass} placeholder="you@example.com" type="email" autoComplete="email" required />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    className={inputClass + " min-h-[120px] resize-none"}
                    placeholder="Share a thought, ask a question, or just say hello…" required />
                </div>

                {/* Honeypot — hidden from real users, bots fill these */}
                <input type="text" name="website" style={{display:"none"}} tabIndex={-1} autoComplete="off" />
                <input type="text" name="phone" style={{display:"none"}} tabIndex={-1} autoComplete="off" />

                {status === "error" && (
                  <p className="text-xs font-sans text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
                    Something went wrong. Please try again.
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-xs font-sans font-light text-[#3a5a7a]">
                    Your email is kept private — only your name and message are shown.
                  </p>
                  <button type="submit" disabled={status === "loading"}
                    className="shrink-0 rounded-xl bg-[#2255cc] px-6 py-3 text-sm font-sans font-semibold text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_28px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] transition-all duration-300 disabled:opacity-50">
                    {status === "loading" ? "Posting…" : "Post message"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* ── Message board ── */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif italic text-2xl font-light text-[#f0e6c8]">
                What people are saying
              </h2>
              <p className="text-xs font-sans text-[#3a5a7a] mt-1">
                {loadingMessages ? "Loading…" : `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {loadingMessages ? (
            <div className="flex items-center justify-center py-16 gap-2 text-[#4a6a8a] text-sm font-sans">
              <span className="animate-pulse text-[#5a9fff]">✦</span> Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-3xl border border-[#1a2a3a]/60 bg-[#0a0e1a]/40 p-12 text-center">
              <p className="font-serif italic text-xl font-light text-[#d0e8f8]/20 mb-2">No messages yet</p>
              <p className="text-xs font-sans text-[#2a3a4a]">Be the first to leave a note above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-[#1a2a3a]/60 bg-[#0a0e1a]/50 px-5 py-4 backdrop-blur-sm hover:border-[#5a9fff]/15 transition-colors duration-200">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(m.name)} flex items-center justify-center text-xs font-sans font-semibold text-white shadow-[0_0_12px_rgba(90,160,255,0.2)]`}>
                        {initials(m.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span className="text-sm font-sans font-semibold text-[#d0e8f8]/90">{m.name}</span>
                          <span className="text-[10px] font-sans text-[#2a3a4a] shrink-0">{timeAgo(m.created_at)}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-sans font-light text-[#6a8aaa] leading-relaxed whitespace-pre-wrap break-words">
                          {m.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}