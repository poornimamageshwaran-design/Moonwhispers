"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { supabase } from "@/lib/supabase/browserClient";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Notes" },
  { href: "/about", label: "About" }
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > 80 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#080c14]/75 backdrop-blur-xl border-b border-[#2a1f14]/50"
          : "bg-transparent"
      )}
    >
      <Container className="py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative inline-flex h-9 w-9 shrink-0 transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(126,200,255,0.5)]">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Outer spiky sun-ring */}
                <circle cx="18" cy="18" r="14" stroke="url(#outerRing)" strokeWidth="1" fill="none" opacity="0.7"/>
                {/* Spike rays */}
                {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = +(18 + 13 * Math.cos(rad)).toFixed(4);
                  const y1 = +(18 + 13 * Math.sin(rad)).toFixed(4);
                  const x2 = +(18 + 16.5 * Math.cos(rad)).toFixed(4);
                  const y2 = +(18 + 16.5 * Math.sin(rad)).toFixed(4);
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1}
                      x2={x2} y2={y2}
                      stroke="url(#spikeGrad)"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  );
                })}
                {/* Inner crescent moon */}
                <path
                  d="M18 6 C11 6 6 11.5 6 18 C6 24.5 11 30 18 30 C13 27 10 23 10 18 C10 13 13 9 18 6Z"
                  fill="url(#crescentFill)"
                  opacity="0.9"
                />
                {/* Star compass center */}
                <g transform="translate(14.5, 14.5)">
                  <line x1="3" y1="0" x2="3" y2="6" stroke="#7ec8ff" strokeWidth="0.7" strokeLinecap="round" opacity="0.9"/>
                  <line x1="0" y1="3" x2="6" y2="3" stroke="#7ec8ff" strokeWidth="0.7" strokeLinecap="round" opacity="0.9"/>
                  <line x1="0.9" y1="0.9" x2="5.1" y2="5.1" stroke="#7ec8ff" strokeWidth="0.5" strokeLinecap="round" opacity="0.6"/>
                  <line x1="5.1" y1="0.9" x2="0.9" y2="5.1" stroke="#7ec8ff" strokeWidth="0.5" strokeLinecap="round" opacity="0.6"/>
                  <circle cx="3" cy="3" r="1.2" fill="#b8e8ff" opacity="0.95"/>
                  <circle cx="3" cy="3" r="0.5" fill="white"/>
                </g>
                {/* Dotted arc on crescent */}
                <path d="M14 8 Q11 13 11 18 Q11 23 14 28" stroke="#7ec8ff" strokeWidth="0.6" strokeDasharray="1.2 2" fill="none" opacity="0.5"/>
                <defs>
                  <linearGradient id="outerRing" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a0c8ff" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#4a7aff" stopOpacity="0.4"/>
                  </linearGradient>
                  <linearGradient id="spikeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c0e0ff" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#5090ff" stopOpacity="0.3"/>
                  </linearGradient>
                  <linearGradient id="crescentFill" x1="6" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#5a9fff" stopOpacity="0.95"/>
                    <stop offset="60%" stopColor="#2255cc" stopOpacity="0.85"/>
                    <stop offset="100%" stopColor="#0a1a66" stopOpacity="0.7"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="font-serif text-base font-light italic tracking-wide text-moon/85 group-hover:text-moon transition-colors duration-300">
              Moon Whispers
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-sans font-light text-[#b8a898]/80 hover:text-moon transition-colors duration-300 tracking-wide"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-sm font-sans font-light text-[#b8a898]/80 hover:text-moon transition-colors duration-300 tracking-wide"
            >
              Admin
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-xs text-[#7a6a5a] truncate max-w-[120px] font-sans">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl border border-[#2a1f14] px-4 py-2 text-sm font-sans font-light text-[#b8a898] hover:border-accent/40 hover:text-moon transition-all duration-300"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex">
                <Button href="/auth" className="rounded-xl">
                  Sign in
                </Button>
              </div>
            )}

            <button
              aria-label="Open menu"
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-[#2a1f14]/70 bg-[#0e1220]/60 w-10 h-10 hover:border-accent/30 transition-all duration-300"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="text-moon/70 text-base">{mobileOpen ? "×" : "≡"}</span>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-[#2a1f14]/60 bg-[#080c14]/85 backdrop-blur-xl p-5">
              <div className="flex flex-col gap-4">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-sans font-light text-[#b8a898] hover:text-moon transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-sans font-light text-[#b8a898] hover:text-moon transition-colors"
                >
                  Admin
                </Link>
                <div className="pt-2 border-t border-[#2a1f14]/50">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full rounded-xl border border-[#2a1f14] px-4 py-2 text-sm font-sans font-light text-[#b8a898] hover:border-accent/40 transition-all"
                    >
                      Sign out
                    </button>
                  ) : (
                    <Button href="/auth" className="w-full justify-center">
                      Sign in
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </Container>
    </motion.header>
  );
}