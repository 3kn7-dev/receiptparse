import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#7dd4a0", dark: "#3a6b4a", light: "#a8e6c0" },
        surface: { DEFAULT: "#0f0f18", dark: "#0a0a0f", card: "#0c0c16" },
        border: { DEFAULT: "#1e1e2e", light: "#2a2a3a" }
      },
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
