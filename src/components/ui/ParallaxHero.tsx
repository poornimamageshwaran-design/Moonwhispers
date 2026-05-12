"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function ParallaxHero({
  eyebrow = "Moon Whispers",
  title,
  subtitle,
  ctaHref,
  ctaLabel
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run parallax after client hydration — fixes black screen on network/ngrok
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll();

  // Disable parallax on mobile — prevents the cropped image issue
  const bgY       = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "0%"] : ["0%", "20%"]);
  const bgScale   = useTransform(scrollYProgress, [0, 1], isMobile ? [1, 1]       : [1, 1.08]);
  const textY     = useTransform(scrollYProgress, [0, 0.5], isMobile ? ["0%", "0%"] : ["0%", "12%"]);
  const opacity   = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[100svh] sm:min-h-[92vh] flex items-center">

      {/* Background image */}
      <motion.div
        style={mounted ? { y: bgY, scale: bgScale } : {}}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src="/hero-bg.png"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
          // On mobile show mountain peaks; on desktop centre
          style={{ objectPosition: isMobile ? "center 30%" : "center center", minHeight: "100%" }}
        />
      </motion.div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/60 via-[#080c14]/20 to-[#080c14]/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080c14]/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#1a0a00]/50 via-[#2a1205]/20 to-transparent" />

      {/* Content — only animate after mount so server HTML matches */}
      <motion.div
        style={mounted ? { y: textY, opacity } : {}}
        className="relative w-full"
      >
        <Container className="py-28 sm:py-36">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-5 flex items-center gap-3"
            >
              <span className="relative inline-flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-moon/15 blur-md" />
                <span className="relative h-2 w-2 rounded-full bg-moon shadow-moon" />
              </span>
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-moon/60 font-sans">
                {eyebrow}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.9, 0.2, 1] }}
              className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight text-moon/95 font-serif italic leading-[1.05]"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38 }}
              className="mt-6 text-base sm:text-lg leading-relaxed text-[#c8b89a]/80 max-w-xl font-sans font-light"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.52 }}
              className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Button href={ctaHref}>{ctaLabel}</Button>
              <div className="flex items-center gap-3 text-sm text-[#8a7a6a] font-sans">
                <div className="h-px w-8 bg-gradient-to-r from-accent/40 to-transparent" />
                <span>Poetry, memories and magic</span>
              </div>
            </motion.div>
          </div>
        </Container>
      </motion.div>

      {/* Glow orb */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-moon/4 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080c14] to-transparent" />
    </section>
  );
}