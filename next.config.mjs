/**
 * Static export configuration.
 *
 * NEXT_PUBLIC_BASE_PATH controls where the site is mounted:
 *   ""                      → root domain (peterwoodhead.com) — the default
 *   "/peterwoodhead.com"    → GitHub project pages sub-path
 * The same variable also feeds lib/data.js asset()/absUrl(), so flipping it
 * re-points every asset and every social/canonical URL in one move.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // plain HTML/CSS/JS — no server, no database
  basePath,
  trailingSlash: true,       // /edit/ → edit/index.html (GitHub Pages friendly)
  images: { unoptimized: true }, // no image server in a static export
  reactStrictMode: true,
};

export default nextConfig;
