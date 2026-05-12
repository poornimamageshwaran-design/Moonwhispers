import { Container } from "@/components/ui/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Welcome to Moon Whispers — a quiet yet chaotic corner of Poornima's world."
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background atmosphere matching the moon image palette */}
      <div className="absolute inset-0 bg-[#080c14]" />
      <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-[#1a0f05]/40 via-[#0e0a18]/20 to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-moon/3 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

      <Container className="relative">
        <div className="max-w-2xl mx-auto">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-accent/70 to-transparent" />
            <span className="text-xs font-sans font-medium tracking-[0.22em] uppercase text-accent/70">
              About
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif italic font-light text-5xl sm:text-6xl text-moon/90 leading-[1.08] tracking-tight mb-12">
            Moon Whispers
          </h1>

          {/* Decorative crescent divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-[#2a1f14]/80 via-accent/20 to-transparent" />
            <span className="text-moon/30 text-lg">☽</span>
            <div className="h-px w-8 bg-[#2a1f14]/40" />
          </div>

          {/* Body text */}
          <div className="space-y-7">
            <p className="font-serif text-xl sm:text-2xl font-light italic leading-relaxed text-moon/80">
              Welcome to Moon Whispers — a quiet yet chaotic corner of Poornima&apos;s world where words drift like the stars in the night sky and stories unfold in soft echoes.
            </p>

            <p className="font-sans font-light text-base leading-[1.85] text-[#a09080]">
              This blog is a collection of moments, memories and magic. Here, poetry meets travel, thoughts blend with emotions, and everyday life transforms into something a little more mystical. Moon Whispers is not just about places visited, but about feelings experienced — the curiosity of unfamiliar streets, the warmth of friendships, the poetic depth hidden in ordinary days.
            </p>

            <p className="font-sans font-light text-base leading-[1.85] text-[#a09080]">
              So pause for a moment, wander through these pages, and let the whispers of the moon stay with you.
            </p>

            {/* Closing line */}
            <div className="pt-4 flex items-center gap-4">
              <div className="h-px w-6 bg-gradient-to-r from-accent/50 to-transparent" />
              <p className="font-serif italic text-lg text-moon/70">
                Hope you enjoy reading!
              </p>
            </div>
          </div>

          {/* Bottom glow line */}
          <div className="mt-16 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>
      </Container>
    </div>
  );
}