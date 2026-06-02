import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lapstream brand palette — original, not F1 trademarks.
        // (Token prefix stays `apex` internally to avoid churn; not user-visible.)
        apex: {
          bg: "#0a0a0f",
          panel: "#13131c",
          border: "#23232f",
          accent: "#ff2d55", // hot magenta-red
          accent2: "#00e5ff", // cyan
          muted: "#8b8b9e",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
