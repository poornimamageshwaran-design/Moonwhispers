"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function redirectByRole(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await redirectByRole(data.user.id);
      } else {
        if (!displayName.trim()) throw new Error("Please enter your name.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          // Email confirmation OFF — user logged in immediately
          await supabase.from("profiles").upsert(
            { id: data.user!.id, display_name: displayName.trim(), role: "user" },
            { onConflict: "id", ignoreDuplicates: true }
          );
          // Send welcome email via Resend
          await fetch("/api/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name: displayName }),
          });
          await redirectByRole(data.user!.id);
        } else {
          // Email confirmation ON
          setIsError(false);
          setStatus("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setIsError(true);
      setStatus((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2255cc]/8 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#7ec8ff]/5 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-[#7ec8ff]/60 mb-3">
            Moon Whispers
          </p>
          <h1 className="font-serif italic text-4xl font-light tracking-tight text-[#f0e6c8]">
            {mode === "signin" ? "Welcome back" : "Join us"}
          </h1>
          <p className="mt-3 text-sm font-sans font-light text-[#8a9aaa] leading-relaxed">
            {mode === "signin"
              ? "Sign in to your account to continue."
              : "Create an account to get started."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#1a2a3a]/80 bg-[#0a0e1a]/70 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">

          {/* Mode toggle */}
          <div className="flex gap-2 mb-7 p-1 rounded-2xl bg-[#080c14]/70 border border-[#1a2a3a]/60">
            <button
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-sans font-medium transition-all duration-300 ${
                mode === "signin"
                  ? "bg-[#2255cc] text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_22px_rgba(90,160,255,0.18)]"
                  : "text-[#6a8aaa] hover:text-[#a0c8ff]"
              }`}
              onClick={() => { setMode("signin"); setStatus(null); }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-sans font-medium transition-all duration-300 ${
                mode === "signup"
                  ? "bg-[#2255cc] text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_22px_rgba(90,160,255,0.18)]"
                  : "text-[#6a8aaa] hover:text-[#a0c8ff]"
              }`}
              onClick={() => { setMode("signup"); setStatus(null); }}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-5">

            {/* Name field — signup only */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-[#6a8aaa]">
                    Your Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-[#1a2a3a]/80 bg-[#080c14]/60 px-4 py-3 text-sm font-sans text-[#d0e8f8] placeholder-[#2a3a4a] outline-none transition-all duration-200 focus:border-[#5a9fff]/50 focus:shadow-[0_0_0_1px_rgba(90,160,255,0.12)]"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Your name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-[#6a8aaa]">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-[#1a2a3a]/80 bg-[#080c14]/60 px-4 py-3 text-sm font-sans text-[#d0e8f8] placeholder-[#2a3a4a] outline-none transition-all duration-200 focus:border-[#5a9fff]/50 focus:shadow-[0_0_0_1px_rgba(90,160,255,0.12)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-[#6a8aaa]">
                Password
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-[#1a2a3a]/80 bg-[#080c14]/60 px-4 py-3 text-sm font-sans text-[#d0e8f8] placeholder-[#2a3a4a] outline-none transition-all duration-200 focus:border-[#5a9fff]/50 focus:shadow-[0_0_0_1px_rgba(90,160,255,0.12)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <AnimatePresence>
              {status && (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-xl border px-4 py-3 text-sm font-sans ${
                    isError
                      ? "border-red-900/50 bg-red-950/30 text-red-400"
                      : "border-[#5a9fff]/25 bg-[#2255cc]/10 text-[#a0c8ff]"
                  }`}
                >
                  {status}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#2255cc] px-5 py-3.5 text-sm font-sans font-semibold text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_30px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] hover:shadow-[0_0_0_1px_rgba(126,200,255,0.45),0_0_35px_rgba(126,200,255,0.25)] transition-all duration-300 disabled:opacity-50"
            >
              {loading
                ? "Working…"
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-xs font-sans font-light text-[#2a3a4a]">
          <a href="/" className="hover:text-[#6a8aaa] transition-colors">
            ← Back to Moon Whispers
          </a>
        </p>
      </motion.div>
    </div>
  );
}
