import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brounic: {
          orange: "#F7941D",
          accent: "#FFB347",
          black: "#111111",
          dark: "#2E2E2E",
          light: "#F5F5F5",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};

export default config;
