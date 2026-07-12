/**
 * Design token layer — "Structured Precision", carried over from the original
 * cybersite and given a real light mode.
 *
 * Every colour maps to a CSS custom property defined in app/globals.css, which
 * holds TWO complete, deliberately paired schemes (:root = light, .dark = dark).
 * Components use only these semantic names, so both themes stay in lockstep.
 *
 * Contrast rules (verified, not assumed — see README):
 *  - `primary` is deepened in light mode (#1c7a4b on white ≈ 4.9:1) because the
 *    dark-mode green (#7fd49a) would fail on a light background.
 *  - Light text on the green `primary` fill uses `primary-contrast`, which is
 *    near-black in dark mode and white in light mode.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1120px" },
    },
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        "surface-2": "rgb(var(--c-surface-2) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        "primary-strong": "rgb(var(--c-primary-strong) / <alpha-value>)",
        "primary-contrast": "rgb(var(--c-primary-contrast) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(1.5rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "hex-drift": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-104px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "hex-drift": "hex-drift 60s linear infinite",
      },
    },
  },
  plugins: [],
};
