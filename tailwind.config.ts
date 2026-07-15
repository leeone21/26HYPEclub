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
        // 브랜드 토큰
        "brand-accent": "var(--color-brand-accent)",
        "brand-accent-hover": "var(--color-brand-accent-hover)",

        // 배경 레이어
        "bg-base": "var(--color-bg-base)",
        "bg-surface": "var(--color-bg-surface)",
        "bg-surface-2": "var(--color-bg-surface-2)",

        // 텍스트
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",

        // 경계
        border: "var(--color-border)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.25rem, 7vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(1.75rem, 5vw, 3.25rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 4vw, 2.25rem)", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
      },
      spacing: {
        "section": "5rem",
        "section-sm": "3rem",
      },
      screens: {
        // 모바일 우선: min-width 확장 방식
        sm: "390px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
