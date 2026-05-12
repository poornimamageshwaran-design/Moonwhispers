import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-[#2a1f14]/50 bg-[#050810]/80">
      {/* Subtle amber glow along top border */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex h-7 w-7 shrink-0">
                <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="18" cy="18" r="14" stroke="url(#fRing)" strokeWidth="0.8" fill="none" opacity="0.65"/>
                  {[0,45,90,135,180,225,270,315].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 18 + 13 * Math.cos(rad); const y1 = 18 + 13 * Math.sin(rad);
                    const x2 = 18 + 16 * Math.cos(rad); const y2 = 18 + 16 * Math.sin(rad);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7ec8ff" strokeWidth="0.9" strokeLinecap="round" opacity="0.6"/>;
                  })}
                  <path d="M18 6 C11 6 6 11.5 6 18 C6 24.5 11 30 18 30 C13 27 10 23 10 18 C10 13 13 9 18 6Z" fill="url(#fCrescent)" opacity="0.88"/>
                  <g transform="translate(14.5,14.5)">
                    <line x1="3" y1="0" x2="3" y2="6" stroke="#7ec8ff" strokeWidth="0.6" strokeLinecap="round" opacity="0.85"/>
                    <line x1="0" y1="3" x2="6" y2="3" stroke="#7ec8ff" strokeWidth="0.6" strokeLinecap="round" opacity="0.85"/>
                    <line x1="0.9" y1="0.9" x2="5.1" y2="5.1" stroke="#7ec8ff" strokeWidth="0.45" strokeLinecap="round" opacity="0.55"/>
                    <line x1="5.1" y1="0.9" x2="0.9" y2="5.1" stroke="#7ec8ff" strokeWidth="0.45" strokeLinecap="round" opacity="0.55"/>
                    <circle cx="3" cy="3" r="1.1" fill="#b8e8ff" opacity="0.9"/>
                    <circle cx="3" cy="3" r="0.45" fill="white"/>
                  </g>
                  <path d="M14 8 Q11 13 11 18 Q11 23 14 28" stroke="#7ec8ff" strokeWidth="0.5" strokeDasharray="1 2" fill="none" opacity="0.45"/>
                  <defs>
                    <linearGradient id="fRing" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a0c8ff" stopOpacity="0.85"/><stop offset="1" stopColor="#4a7aff" stopOpacity="0.3"/>
                    </linearGradient>
                    <linearGradient id="fCrescent" x1="6" y1="6" x2="18" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#5a9fff" stopOpacity="0.9"/><stop offset="1" stopColor="#0a1a66" stopOpacity="0.7"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="font-serif text-sm font-light italic text-moon/80">Moon Whispers</span>
            </div>
            <p className="text-sm text-[#7a6a5a] leading-relaxed font-sans font-light">
              Premium travel notes with cinematic storytelling and a community voice.
            </p>
          </div>

          <div>
            <div className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-accent/60 mb-4">Explore</div>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link className="text-[#8a7a6a] hover:text-moon transition-colors duration-300 font-sans font-light" href="/posts">
                Notes
              </Link>
              <Link className="text-[#8a7a6a] hover:text-moon transition-colors duration-300 font-sans font-light" href="/about">
                About
              </Link>
              <Link className="text-[#8a7a6a] hover:text-moon transition-colors duration-300 font-sans font-light" href="/contact">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-sans font-medium tracking-[0.18em] uppercase text-accent/60 mb-4">Crafted with care</div>
            <p className="text-sm text-[#7a6a5a] leading-relaxed font-sans font-light">
              SEO-first pages, smooth Framer Motion interactions, and a Supabase backend built to last.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#2a1f14]/40 pt-7">
          <p className="text-xs text-[#5a4a3a] font-sans font-light">
            © {new Date().getFullYear()} Moon Whispers. All rights reserved.
          </p>
          <div className="text-xs text-[#5a4a3a] font-sans">
            <Link className="hover:text-[#b8a898] transition-colors" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}