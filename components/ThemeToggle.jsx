"use client";
/**
 * Light/dark toggle. The initial theme is applied by an inline script in
 * app/layout.jsx BEFORE first paint (no flash); this component only flips it
 * afterwards and persists the choice. The two schemes are defined side by
 * side in app/globals.css.
 */
import { useEffect, useState } from "react";
import { Sun, Moon } from "@/lib/icons";

export default function ThemeToggle() {
  const [dark, setDark] = useState(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-line/15 p-2 text-muted transition-colors hover:border-primary/40 hover:text-primary"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark === true}
    >
      {/* Render both, CSS decides — avoids a hydration flash of the wrong icon */}
      <span className="hidden dark:inline"><Sun /></span>
      <span className="dark:hidden"><Moon /></span>
    </button>
  );
}
