"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function CinematicCard({
  href,
  title,
  description,
  imageUrl,
  badge
}: {
  href: string;
  title: string;
  description?: string;
  imageUrl: string;
  badge?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className="group"
    >
      <Link href={href} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-[#2a1f14]/80",
            "bg-[#0e1220]/70 shadow-soft"
          )}
        >
          {/* Image with subtle scale on hover */}
          <div className="relative h-52 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              initial={false}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={false}
              />
            </motion.div>
            {/* warm amber overlay from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/90 via-[#1a0f05]/40 to-transparent" />
            {/* hover ember glow */}
            <div className="absolute -left-8 bottom-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>

          <div className="relative p-5 border-t border-[#2a1f14]/60">
            {badge ? (
              <div className="mb-3 inline-flex items-center rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-medium text-accent font-sans">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent/80" />
                {badge}
              </div>
            ) : null}

            <h3 className="text-xl font-light leading-snug tracking-tight text-moon/90 font-serif italic">{title}</h3>
            {description ? <p className="mt-2 text-sm text-[#8a7a6a] leading-relaxed font-sans">{description}</p> : null}

            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-accent/70 font-sans tracking-wider uppercase">
              <span>Read</span>
              <span className="h-px flex-1 bg-gradient-to-r from-accent/50 via-[#3a2510]/60 to-transparent" />
              <span className="opacity-60">→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}