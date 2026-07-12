/**
 * lib/data.js — the only bridge between content and components.
 *
 * Components must import `profile` from here (never read JSON directly) and
 * must route every asset reference through asset() and every absolute URL
 * through absUrl(). That is what makes the same source build correctly on
 * peterwoodhead.com (root) AND on a sub-path host like
 * username.github.io/repo — by changing environment variables only.
 *
 *   NEXT_PUBLIC_BASE_PATH   e.g. ""            (custom domain, the default)
 *                           e.g. "/peterwoodhead.com" (project-pages sub-path)
 *   NEXT_PUBLIC_SITE_ORIGIN e.g. "https://peterwoodhead.com" (defaults to
 *                           the origin in data/profile.json)
 */
import profile from "../data/profile.json";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_ORIGIN || profile.site.origin
).replace(/\/$/, "");

/** Prefix a bundled-asset path ("/images/profile.jpg") with the base path. */
export function asset(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path; // already absolute
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}

/**
 * Build a full absolute URL for things that leave the page — Open Graph
 * images, canonical URLs, JSON-LD, the sitemap. Social scrapers cannot fetch
 * relative URLs, so these must always be absolute at the deployed host.
 */
export function absUrl(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${BASE_PATH}${clean}`;
}

/** Tiny safe emphasis: turns **text** into accent spans. Text-only, no HTML. */
export function emphasize(text) {
  return String(text).split(/\*\*(.+?)\*\*/g);
}

export default profile;
