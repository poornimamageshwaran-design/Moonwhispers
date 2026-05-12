import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", ".dark"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#c8956c",
          soft: "#e8b99a",
          cold: "#7ec8c8"
        },
        moon: "#f0e6c8",
        ember: "#8b4513"
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.55)",
        glow: "0 0 0 1px rgba(200,149,108,0.3), 0 0 30px rgba(200,149,108,0.15)",
        moon: "0 0 60px rgba(240,230,200,0.1)"
      },
      backgroundImage: {
        "hero-grad": "radial-gradient(ellipse 120% 80% at 60% 100%, rgba(139,69,19,0.55) 0%, rgba(200,149,108,0.2) 35%, rgba(8,12,20,0) 70%), radial-gradient(ellipse 80% 60% at 80% 10%, rgba(126,200,200,0.1) 0%, rgba(8,12,20,0) 55%)"
      }
    }
  },
  plugins: []
};

export default config;