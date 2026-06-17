/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Tabular monospace numerals: the "data product" signature applied to
        // every headline number (health age, score, metrics).
        mono: [
          "ui-monospace",
          "SF Mono",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        // Editorial serif, used sparingly on a few hero headlines to add a
        // premium "longevity journal" accent that sans-only wellness apps lack.
        serif: [
          "Georgia",
          "Cambria",
          "Songti SC",
          "STSong",
          "Noto Serif SC",
          "serif",
        ],
      },
      colors: {
        // Page + text tokens. Use these instead of arbitrary hex values.
        surface: "#f5f7f6",
        ink: {
          DEFAULT: "#0c211d",
          soft: "#46584f",
          faint: "#71837a",
        },
        line: "#e2e8e4",
        primary: {
          50: "#eefdf8",
          100: "#d5f8ee",
          200: "#aef0df",
          300: "#7be1cc",
          400: "#43c8b2",
          500: "#1fae9d",
          600: "#148b80",
          700: "#126f68",
          800: "#135955",
          900: "#124946",
          950: "#0a2e2a",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(12, 33, 29, 0.04), 0 10px 28px -14px rgba(12, 33, 29, 0.14)",
        lift: "0 2px 4px rgba(12, 33, 29, 0.06), 0 18px 44px -16px rgba(12, 33, 29, 0.22)",
        glow: "0 24px 70px -24px rgba(18, 111, 104, 0.55)",
      },
      borderRadius: {
        card: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bar-fill": {
          "0%": { width: "0%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "bar-fill": "bar-fill 0.9s ease-out both",
      },
    },
  },
  plugins: [],
};
