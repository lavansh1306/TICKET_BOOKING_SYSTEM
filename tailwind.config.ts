import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        brand: {
          navy: "var(--accent)",
          indigo: "var(--accent-light)",
          dark: "var(--accent-dark)",
          darker: "var(--accent-strong)",
          surface: "var(--bg-secondary)",
        },
        neu: {
          base: "var(--neu-base)",
          dark: "var(--neu-dark)",
          light: "var(--neu-light)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        draw: "draw 2s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0px rgba(79, 70, 229, 0.15)" },
          "50%": { boxShadow: "0 0 24px rgba(79, 70, 229, 0.5)" },
        },
        draw: {
          from: { strokeDashoffset: "1" },
          to: { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
