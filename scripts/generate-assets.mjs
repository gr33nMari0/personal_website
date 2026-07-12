#!/usr/bin/env node
/**
 * Prebuild generation — everything computable from data/profile.json is
 * generated here so it can never drift out of sync with the content:
 *
 *   public/og.png            1200×630 social-share image, rebuilt from the
 *                            current name/headline/photo on every build
 *   public/icon-192.png      web-app icons rasterised from public/favicon.svg
 *   public/icon-512.png
 *   public/apple-touch-icon.png
 *   public/site.webmanifest  name/colours from the data file
 *   public/robots.txt        points at the sitemap on the deployed origin
 *   public/sitemap.xml       absolute URLs at the deployed origin
 *   public/data/profile.json copy of the content file for the /edit/ page
 *
 * Honours the same env vars as the app:
 *   NEXT_PUBLIC_SITE_ORIGIN, NEXT_PUBLIC_BASE_PATH
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (...p) => path.join(root, "public", ...p);
const profile = JSON.parse(readFileSync(path.join(root, "data", "profile.json"), "utf8"));

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN || profile.site.origin).replace(/\/$/, "");
const SITE_URL = `${ORIGIN}${BASE_PATH}`;

const font = (pkg, file) =>
  readFileSync(path.join(root, "node_modules", "@fontsource", pkg, "files", file));

/* ── 1. Open Graph image ─────────────────────────────────────────────────
   Built from live data: name, headline, location, photo. Dark navy + the
   electric green accent, hex motif — same identity as the site itself.   */
async function generateOg() {
  const photo = `data:image/jpeg;base64,${readFileSync(pub("images", "profile.jpg")).toString("base64")}`;

  const hex = (cx, cy, r, opacity) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="#7fd49a" stroke-opacity="${opacity}" stroke-width="2"/>`;
  };
  const hexes = [
    hex(1080, 90, 70, 0.35), hex(1160, 210, 55, 0.22), hex(1040, 300, 40, 0.15),
    hex(120, 560, 60, 0.25), hex(230, 600, 42, 0.15),
  ].join("");
  const hexBgSvg = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${hexes}</svg>`
  ).toString("base64")}`;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1200, height: 630, display: "flex", position: "relative",
          background: "linear-gradient(135deg, #0b1120 0%, #0f1623 55%, #14213a 100%)",
          fontFamily: "Space Grotesk", color: "#e8ecf1",
        },
        children: [
          { type: "img", props: { src: hexBgSvg, width: 1200, height: 630, style: { position: "absolute", top: 0, left: 0 } } },
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 780 },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 28 },
                    children: [
                      { type: "div", props: { style: { width: 10, height: 10, borderRadius: 999, background: "#7fd49a" } } },
                      { type: "div", props: { style: { fontFamily: "JetBrains Mono", fontSize: 24, color: "#7fd49a", letterSpacing: 4 }, children: SITE_URL.replace(/^https?:\/\//, "").toUpperCase() } },
                    ],
                  },
                },
                { type: "div", props: { style: { fontSize: 84, fontWeight: 700, lineHeight: 1.05, display: "flex", flexWrap: "wrap" }, children: [
                  { type: "span", props: { children: profile.person.firstName + "\u00A0" } },
                  { type: "span", props: { style: { color: "#7fd49a" }, children: profile.person.lastName } },
                ] } },
                { type: "div", props: { style: { fontSize: 34, color: "#93a1b5", marginTop: 22 }, children: profile.person.headline } },
                { type: "div", props: { style: { fontFamily: "JetBrains Mono", fontSize: 22, color: "#7fd49a", marginTop: 18 }, children: profile.person.location } },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: { position: "absolute", right: 90, top: 135, width: 360, height: 360, display: "flex",
                borderRadius: 999, overflow: "hidden", border: "6px solid #7fd49a",
                boxShadow: "0 0 80px rgba(127,212,154,0.35)" },
              children: [{ type: "img", props: { src: photo, width: 360, height: 360, style: { objectFit: "cover" } } }],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Space Grotesk", data: font("space-grotesk", "space-grotesk-latin-700-normal.woff"), weight: 700, style: "normal" },
        { name: "Space Grotesk", data: font("space-grotesk", "space-grotesk-latin-400-normal.woff"), weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: font("jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"), weight: 400, style: "normal" },
      ],
    }
  );

  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  writeFileSync(pub("og.png"), png);
  console.log(`✓ public/og.png (${(png.length / 1024).toFixed(0)} kB) — served at ${SITE_URL}/og.png`);
}

/* ── 2. Icons from public/favicon.svg ───────────────────────────────────── */
function generateIcons() {
  const svg = readFileSync(pub("favicon.svg"), "utf8");
  for (const [file, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
    const png = new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();
    writeFileSync(pub(file), png);
  }
  console.log("✓ icon-192.png, icon-512.png, apple-touch-icon.png (from favicon.svg)");
}

/* ── 3. Manifest, robots, sitemap ───────────────────────────────────────── */
function generateMeta() {
  writeFileSync(
    pub("site.webmanifest"),
    JSON.stringify(
      {
        name: profile.person.name,
        short_name: profile.person.firstName,
        description: profile.site.description,
        start_url: `${BASE_PATH}/`,
        display: "standalone",
        background_color: profile.site.themeColorDark,
        theme_color: profile.site.themeColorDark,
        icons: [
          { src: `${BASE_PATH}/icon-192.png`, sizes: "192x192", type: "image/png" },
          { src: `${BASE_PATH}/icon-512.png`, sizes: "512x512", type: "image/png" },
        ],
      },
      null,
      2
    )
  );

  writeFileSync(pub("robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${SITE_URL}/`]; // /edit/ is an owner tool, deliberately unlisted
  writeFileSync(
    pub("sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
      `\n</urlset>\n`
  );
  console.log(`✓ site.webmanifest, robots.txt, sitemap.xml (origin ${SITE_URL})`);
}

/* ── 4. Publish the content file for the /edit/ page ────────────────────── */
function publishData() {
  mkdirSync(pub("data"), { recursive: true });
  copyFileSync(path.join(root, "data", "profile.json"), pub("data", "profile.json"));
  console.log("✓ public/data/profile.json (feeds the /edit/ editor)");
}

/* ── 5. QR code for the contact section ─────────────────────────────────── */
async function generateQr() {
  if (!profile.contactSection?.qr?.visible) return;
  const { default: QRCode } = await import("qrcode");
  // Black-on-white with a quiet zone: maximum scanner compatibility. The
  // component renders it on a white card so it works in both themes.
  const svg = await QRCode.toString(SITE_URL, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
  writeFileSync(pub("qr.svg"), svg);
  console.log(`✓ public/qr.svg (points at ${SITE_URL})`);
}

await generateOg();
generateIcons();
generateMeta();
publishData();
await generateQr();
