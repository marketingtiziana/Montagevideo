import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F8FB",
        grid: "#E3E6EE",
        navy: "#0F1535",
        indigo: "#4F6BFF",
        sky: "#3FA9F5",
        slate: "#64748B",
        mint: "#2BB39A",
        periwinkle: "#7C8CF8",
        deep: "#1E3A8A",
        bad: "#E5484D",
        good: "#30A46C",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 21, 53, 0.18), 0 2px 6px -2px rgba(15, 21, 53, 0.08)",
        card: "0 18px 40px -18px rgba(15, 21, 53, 0.25), 0 4px 10px -4px rgba(15, 21, 53, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
