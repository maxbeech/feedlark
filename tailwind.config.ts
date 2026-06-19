import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand: a warm, sunlit "lark" orange — distinct from Canny's cold purple.
        brand: {
          50: "#fff8f1",
          100: "#ffecd9",
          200: "#fed3a8",
          300: "#fdb274",
          400: "#fb8b3c",
          500: "#f26a18",
          600: "#df520c",
          700: "#b93d0e",
          800: "#933214",
          900: "#782c14",
        },
        // Warm charcoal ink (stone-based) so the whole palette agrees with the orange.
        ink: {
          DEFAULT: "#1c1714",
          soft: "#4a423c",
          muted: "#857a70",
        },
        // Warm paper neutrals replace cold slate for backgrounds + hairlines.
        paper: "#fcfaf6",
        cream: "#f6f0e6",
        sand: {
          100: "#f4efe7",
          200: "#e9e1d4",
          300: "#d9cdb9",
        },
        // A muted spruce as a secondary accent (the "shipped" half of the loop).
        spruce: {
          50: "#f0f7f4",
          100: "#d6ebe2",
          500: "#2f8f6f",
          600: "#1f7058",
          700: "#1a5946",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "ui-serif", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // Soft, warm, layered shadows — premium depth without a heavy drop.
        soft: "0 1px 2px rgba(28,23,20,0.04), 0 8px 24px -12px rgba(28,23,20,0.12)",
        lift: "0 2px 4px rgba(28,23,20,0.04), 0 18px 40px -18px rgba(28,23,20,0.22)",
        glow: "0 20px 60px -24px rgba(223,82,12,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "vote-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        "vote-pop": "vote-pop 0.35s ease-out",
        "rise-in": "rise-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
