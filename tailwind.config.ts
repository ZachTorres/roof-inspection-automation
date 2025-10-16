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
        background: "var(--background)",
        foreground: "var(--foreground)",
        'uc-navy': {
          DEFAULT: '#071830',
          dark: '#051220',
          light: '#0a2040',
        },
        'uc-blue': {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1e40af',
        },
        'uc-accent': {
          DEFAULT: '#3b82f6',
          light: '#93c5fd',
        },
      },
    },
  },
  plugins: [],
};
export default config;
