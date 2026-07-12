"use client";
/**
 * Fixed navbar. Links, name and the optional resume button all come from
 * data/profile.json. Anchors are plain <a href="#..."> so navigation works
 * with JavaScript disabled; scroll smoothing is handled in CSS.
 */
import { useEffect, useState } from "react";
import profile, { asset } from "@/lib/data";
import { Shield, Menu, Close, Download, ExternalLink } from "@/lib/icons";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = profile.nav.items;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line/10 bg-bg/90 backdrop-blur-md" : "bg-transparent"
      }`}
      aria-label="Primary"
    >
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="group flex items-center gap-2">
          <Shield size={20} />
          <span className="sr-only">Back to top —</span>
          <span className="font-display text-sm font-bold tracking-wide">
            {profile.person.name}
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-1 font-display text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              {l.label}
              {l.external && <ExternalLink size={11} />}
            </a>
          ))}
          {profile.resume.enabled && (
            <a href={asset(profile.resume.path)} download className="btn-primary px-4 py-2 text-xs">
              <Download size={13} /> Resume
            </a>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg border border-line/15 p-2 text-muted hover:text-ink"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line/10 bg-surface px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 py-1 font-display text-sm font-medium text-muted hover:text-primary"
              >
                {l.label}
                {l.external && <ExternalLink size={11} />}
              </a>
            ))}
            {profile.resume.enabled && (
              <a href={asset(profile.resume.path)} download className="btn-primary w-fit px-4 py-2 text-xs">
                <Download size={13} /> Resume
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
