import type { Config } from "tailwindcss";

/**
 * DESIGN TOKENS — "Signal" system
 * ---------------------------------------------------------------
 * Dark-mode-first, editorial-meets-technical. Two typefaces carry
 * the personality (Fraunces display / Inter body), a mono face
 * (JetBrains Mono) marks data & timestamps, and a two-tone amber/
 * violet "signal" gradient is the recurring motif tying the AI
 * digital-twin concept to the visual language (see
 * components/portfolio/signal-waveform.tsx).
 * ---------------------------------------------------------------
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        void: "#0A0B0F",
        surface: {
          DEFAULT: "#14161C",
          raised: "#1B1E27",
          glass: "rgba(255,255,255,0.045)",
        },
        border: "rgba(255,255,255,0.09)",
        foreground: {
          DEFAULT: "#F4F3F1",
          muted: "#9A9CA6",
          faint: "#5C5F6B",
        },
        signal: {
          amber: "#F5A623",
          "amber-dim": "#8A5E1D",
          violet: "#7C6CF0",
          "violet-dim": "#443C82",
        },
        state: {
          success: "#34D399",
          danger: "#F2696E",
          warning: "#F5A623",
        },
        // shadcn-style semantic aliases used by components/ui/*
        background: "#0A0B0F",
        primary: { DEFAULT: "#F5A623", foreground: "#14100A" },
        secondary: { DEFAULT: "#1B1E27", foreground: "#F4F3F1" },
        muted: { DEFAULT: "#1B1E27", foreground: "#9A9CA6" },
        accent: { DEFAULT: "#7C6CF0", foreground: "#F4F3F1" },
        destructive: { DEFAULT: "#F2696E", foreground: "#F4F3F1" },
        card: { DEFAULT: "#14161C", foreground: "#F4F3F1" },
        popover: { DEFAULT: "#14161C", foreground: "#F4F3F1" },
        input: "rgba(255,255,255,0.09)",
        ring: "#F5A623",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      backgroundImage: {
        "signal-gradient": "linear-gradient(135deg, #F5A623 0%, #7C6CF0 100%)",
        "glass-sheen": "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-signal": {
          "0%, 100%": { transform: "scaleY(0.3)", opacity: "0.5" },
          "50%": { transform: "scaleY(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-signal": "pulse-signal 1.2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
