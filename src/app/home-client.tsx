"use client";

import { motion } from "framer-motion";
import { ParallaxHero } from "@/components/ui/ParallaxHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CinematicCard } from "@/components/ui/CinematicCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Post = { slug: string; title: string; excerpt: string; coverUrl: string };

export default function HomeClient({
  latestPosts
}: {
  latestPosts: Post[];
  featured?: unknown[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
    >
      {/* Hero — uses local image */}
      <ParallaxHero
        eyebrow="Where words drift like stars"
        title="Moon Whispers"
        subtitle="Poetry, travel and quiet thoughts — where everyday life becomes a little more mystical."
        ctaHref="/posts"
        ctaLabel="Explore Notes"
      />

      {/* Latest posts */}
      <Container className="pt-20 pb-12">
        <Reveal>
          <SectionHeading
            eyebrow="Latest on the blog"
            title="Stories whispered by the moon"
            description="A collection of moments, memories and magic — feelings turned into words, places turned into poetry."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 0.07}>
              <CinematicCard
                href={`/posts/${p.slug}`}
                title={p.title}
                description={p.excerpt}
                imageUrl={p.coverUrl}
                badge={idx === 0 ? "New" : "Latest"}
              />
            </Reveal>
          ))}
        </div>
      </Container>

      {/* The Moon Whispers Way */}
      <Container className="pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-12">
            <Reveal>
              <SectionHeading
                eyebrow="The Moon Whispers Way"
                title="Feel, wander, and write"
                description="A quiet approach to storytelling — observe deeply, wander freely, and let ordinary days become something mystical."
              />
            </Reveal>

            <div className="mt-10 space-y-3">
              {[
                { t: "Cinematic structure", d: "Hook, atmosphere, and a thoughtful ending that lingers." },
                { t: "Community-first travel", d: "Learning from locals and choosing low-impact options." },
                { t: "Turn notes into posts", d: "A workflow designed for consistency, not burnout." }
              ].map((x, i) => (
                <Reveal key={x.t} delay={i * 0.08}>
                  <div className="rounded-2xl border border-[#2a1f14]/70 bg-[#0a0e1a]/50 p-5 backdrop-blur-sm hover:border-accent/20 transition-colors duration-300">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 w-5 h-5">
                        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                          <circle cx="10" cy="10" r="8" stroke="url(#bRing)" strokeWidth="0.8" fill="none" opacity="0.6"/>
                          {[0,45,90,135,180,225,270,315].map((deg, i) => {
                            const rad = (deg * Math.PI) / 180;
                            const x1 = 10 + 7.5 * Math.cos(rad); const y1 = 10 + 7.5 * Math.sin(rad);
                            const x2 = 10 + 9.5 * Math.cos(rad); const y2 = 10 + 9.5 * Math.sin(rad);
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7ec8ff" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>;
                          })}
                          <path d="M10 3 C6.5 3 4 6 4 10 C4 14 6.5 17 10 17 C7.5 15.5 6 13 6 10 C6 7 7.5 4.5 10 3Z" fill="url(#bCrescent)" opacity="0.85"/>
                          <circle cx="8.5" cy="10" r="0.9" fill="#b8e8ff" opacity="0.9"/>
                          <line x1="8.5" y1="8" x2="8.5" y2="12" stroke="#7ec8ff" strokeWidth="0.5" opacity="0.7"/>
                          <line x1="6.5" y1="10" x2="10.5" y2="10" stroke="#7ec8ff" strokeWidth="0.5" opacity="0.7"/>
                          <defs>
                            <linearGradient id="bRing" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#a0c8ff" stopOpacity="0.8"/><stop offset="1" stopColor="#4a7aff" stopOpacity="0.3"/></linearGradient>
                            <linearGradient id="bCrescent" x1="4" y1="3" x2="10" y2="17" gradientUnits="userSpaceOnUse"><stop stopColor="#5a9fff" stopOpacity="0.9"/><stop offset="1" stopColor="#1a3a99" stopOpacity="0.7"/></linearGradient>
                          </defs>
                        </svg>
                      </span>
                      <div>
                        <div className="text-sm font-medium text-moon/80 font-sans">{x.t}</div>
                        <p className="mt-1.5 text-sm text-[#8a7a6a] leading-relaxed font-sans font-light">{x.d}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button href="/posts" className="bg-[#2255cc] text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_28px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] hover:shadow-[0_0_0_1px_rgba(126,200,255,0.45),0_0_35px_rgba(126,200,255,0.25)]">Start reading</Button>
              <Button
                href="/contact"
                className="bg-transparent text-[#a0c8ff] border border-[#2255cc]/50 hover:border-[#5a9fff]/70 hover:bg-[#0a1530]/60 shadow-none hover:text-[#c8e8ff]"
              >
                Ask a question
              </Button>
            </div>
          </div>


        </div>

        {/* CTA strip */}
        <div className="mt-16 rounded-3xl border border-[#2a1f14]/60 bg-[#0a0e1a]/50 p-7 sm:p-9 shadow-soft relative overflow-hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-accent/8 via-transparent to-accent-cold/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-accent/60 mb-2">
                Ready to explore
              </div>
              <div className="text-2xl font-light tracking-tight font-serif italic text-moon/85">
                Start with the newest cinematic notes.
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button href="/posts" className="bg-[#2255cc] text-white shadow-[0_0_0_1px_rgba(90,160,255,0.35),0_0_28px_rgba(90,160,255,0.18)] hover:bg-[#3366dd] hover:shadow-[0_0_0_1px_rgba(126,200,255,0.45),0_0_35px_rgba(126,200,255,0.25)]">Browse notes</Button>
              <Link
                href="/admin"
                className="text-sm font-sans font-light text-[#8a7a6a] hover:text-moon transition-colors"
              >
                Admin →
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}