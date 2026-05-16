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
        swatch: {
          red: "#FF0000",
          black: "#000000",
          white: "#FFFFFF",
          yellow: "#FFD700",
          gray: "#F5F5F5",
          "gray-dark": "#1A1A1A",
          "gray-mid": "#666666",
          "gray-light": "#E5E5E5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
        display: ["var(--font-inter)", "Arial Black", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-once": "bounce 1s ease-in-out 1",
      },
    },
  },
  plugins: [],
};

export default config;
