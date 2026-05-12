import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/app/globals.css";
import type { ReactNode } from "react";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Moon Whispers",
    template: "%s | Moon Whispers"
  },
  description:
    "A premium travel & storytelling blog with cinematic notes, community comments, and admin-ready CMS."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          // Keep theme logic tiny to avoid hydration mismatch flashes.
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('moonlight-theme');
                  var root = document.documentElement;
                  if (stored === 'light') root.classList.remove('dark');
                  if (stored === 'dark') root.classList.add('dark');
                  if (!stored) {
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) root.classList.add('dark'); else root.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="relative overflow-x-hidden">
        <div className="noise" />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}