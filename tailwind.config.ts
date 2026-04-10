import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Montserrat", "system-ui", "sans-serif"],
        sans: ["Montserrat", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "SF Mono", "Menlo", "monospace"],
      },
      colors: {
        // IAM design system semantic colors (mapped to CSS vars so dark mode works)
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          soft: "var(--primary-d)",
          foreground: "#ffffff",
        },
        text: "var(--text)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted)",
        },
        subtle: "var(--subtle)",
        success: "var(--success-500)",
        warning: "var(--warning-500)",
        danger: "var(--error-500)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
