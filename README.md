# peterwoodhead.com

Personal site for Peter Woodhead — fully static, fully data-driven, built with
Next.js 14 (App Router, JSX, `output: 'export'`) and Tailwind CSS 3.4, deployed
to GitHub Pages by GitHub Actions and served at **https://peterwoodhead.com**
behind Cloudflare.

The design carries over the "Structured Precision" identity from the original
cybersite — navy-slate, electric green, Space Grotesk / DM Sans / JetBrains
Mono, left-border headings, the hexagon lattice — and fixes what was broken:
real Open Graph support with a build-time-generated share image, paired
light/dark colour schemes applied before first paint, self-hosted fonts, no
canvas animation loop, and a structure that GitHub Pages actually understands.

## The one file that matters

**All content lives in [`data/profile.json`](data/profile.json).** Every
section, link, job, role, and piece of copy is read from it — nothing an owner
would want to change is in component code. Each block in the file carries its
own `_comment` explaining what it controls. Two ways to edit it:

1. Directly on GitHub (or in WebStorm) — it's plain JSON with inline notes.
2. Through the browser editor at **`/edit/`** on the live site — form fields,
   add/remove/reorder, validation, preview, then download-and-commit. See
   [EDITING.md](EDITING.md) for the walkthrough written for a non-technical
   owner.

### Worked example: adding a job end to end

Say you start tutoring at ANU. Open `data/profile.json`, find
`experience.items`, and add a new object **at the top** (newest first):

```json
{
  "role": "Casual Academic Tutor",
  "org": "Australian National University",
  "orgUrl": "https://cecc.anu.edu.au/",
  "period": "Feb 2027 – present · Canberra",
  "description": "Tutoring first-year computing labs.",
  "tags": ["Teaching", "Computing"]
}
```

Commit to `main`. That's the whole change: the Actions workflow validates the
file, regenerates the derived assets, rebuilds, and deploys. Two to three
minutes later it's live. No component was touched.

### Section visibility

Every major section has a `"visible"` flag — set it to `false` and the section
disappears cleanly (navigation still works because `nav.items` is yours to
edit too). Empty arrays and missing optional fields degrade gracefully and
never break the build.

## Replaceable assets (stable filenames)

Drop a replacement file at the exact path and the site updates everywhere with
no code change:

| File | Used for | Notes |
|---|---|---|
| `public/images/profile.jpg` | Hero card **and** the generated share image | Any JPEG; roughly square crops best |
| `public/favicon.svg` | Favicon + all PNG icons | PNGs regenerate from it at build time |
| `public/resume.pdf` | Resume download buttons | Optional. Buttons render **only** when `resume.enabled` is `true` in the data file, so a missing PDF never breaks anything — set the flag after dropping the file |

## Build-time generation (never hand-maintain these)

`npm run build` triggers `prebuild` automatically, which runs:

1. **`scripts/validate-content.mjs`** — fails the build with plain-language
   messages if the data file is malformed, links don't look like links, alt
   text is missing, or anything resembling private data (phone numbers,
   unacknowledged personal email) is about to be published.
2. **`scripts/generate-assets.mjs`** — regenerates from the data file:
   - `public/og.png` — the 1200×630 Open Graph image (satori + resvg), built
     from the current name, headline, location and profile photo, so the share
     image can never drift from the content
   - `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — rasterised
     from `favicon.svg`
   - `public/site.webmanifest`, `robots.txt`, `sitemap.xml` — with absolute
     URLs at the configured origin
   - `public/data/profile.json` — the copy the `/edit/` page loads

All generated files are gitignored; the build recreates them every time.

## Local development

```bash
npm ci          # install exactly the lockfile
npm run dev     # dev server at http://localhost:3000
npm run build   # validate → generate → static export to out/
npm run preview # serve the out/ folder locally
npm run validate-content  # just the content checks
```

Node 22 (see `.nvmrc`). `.idea/` is gitignored for WebStorm.

## Hosting portability — the two helpers

The site must build correctly at a **root domain** (peterwoodhead.com) and at a
**sub-path** (gr33nmari0.github.io/repo) by changing configuration only:

- `asset(path)` in `lib/data.js` prefixes every bundled-asset reference
  (images, icons, the data file, resume) with `NEXT_PUBLIC_BASE_PATH`. Raw
  `src="/images/…"` references do **not** inherit Next's basePath — everything
  goes through the helper, without exception.
- `absUrl(path)` builds full absolute URLs from `NEXT_PUBLIC_SITE_ORIGIN` for
  everything that leaves the page: canonical, Open Graph/Twitter image,
  JSON-LD, sitemap. Social scrapers cannot fetch relative URLs, so the share
  image **must** be absolute at the host the build is actually served from.

| Deployment | `NEXT_PUBLIC_BASE_PATH` | `NEXT_PUBLIC_SITE_ORIGIN` |
|---|---|---|
| peterwoodhead.com (current) | `""` (default) | `https://peterwoodhead.com` (default, from the data file) |
| gr33nmari0.github.io/peterwoodhead.com | `/peterwoodhead.com` | `https://gr33nmari0.github.io` |

Both variables are set (commented) at the top of
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Both
configurations were built and grep-verified during development.

## Deploying

### GitHub Pages (current)

1. Push this repository to GitHub.
2. **Settings → Pages → Source: GitHub Actions** (the workflow also attempts to
   self-enable this on first run).
3. Push to `main` — the workflow installs from the lockfile on Node 22,
   validates content, builds, runs output quality checks (CNAME present and
   correct, 404/robots/sitemap/og.png exist, OG URL absolute at the deployed
   origin), then deploys. Concurrency is serialized so two pushes can't race.
4. Custom domain: `public/CNAME` already contains `peterwoodhead.com`, so
   Pages keeps the domain across deploys. DNS/Cloudflare setup lives in
   [DNS.md](DNS.md).

### Other hosts

The build output (`out/`) is plain HTML/CSS/JS. Cloudflare Pages: build command
`npm run build`, output directory `out`. Vercel: framework preset Next.js
works as-is. Handing to the ANU web team: send them the `out/` folder.

## Before-launch checklist

- [ ] `site.origin` in `data/profile.json` and `NEXT_PUBLIC_SITE_ORIGIN` in the
      workflow both say `https://peterwoodhead.com`
- [ ] `site.repo` points at the real GitHub repository (powers the `/edit/`
      commit link)
- [ ] DNS configured per [DNS.md](DNS.md) and the Pages custom-domain check is
      green with **Enforce HTTPS** on
- [ ] Share preview tested (see the caching gotcha below)
- [ ] `resume.enabled` is `false` unless `public/resume.pdf` exists

### The social-cache gotcha

Facebook, LinkedIn, X, Discord and friends cache link previews **hard**, and so
do browsers. After changing the OG image or description, the old preview will
keep appearing until the URL is re-scraped: use the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) /
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to force a
refresh, or share a cache-busted URL (`https://peterwoodhead.com/?v=2`) to
verify the new preview. This is scraper caching, not a build problem.

## Decisions & defaults (where the brief was silent)

- **Fonts:** kept the original site's Space Grotesk / DM Sans / JetBrains Mono
  (the design you asked to carry over), self-hosted via `@fontsource` — no
  font CDN.
- **Hex background:** rebuilt as a pure-SVG pattern with a slow CSS drift
  instead of the old mouse-tracking canvas loop — zero main-thread cost, and it
  stops under `prefers-reduced-motion`.
- **Phone number:** the old site published one; this build deliberately does
  not, and the validator hard-fails if a phone-shaped number ever lands in the
  data file. Public email is acknowledged via `contact.allowPublicEmail`.
- **Contact form:** powered by Formspree via `@formspree/react`. It renders
  only when `contact.form.formspreeId` is set (currently `mgogwpzj`), so the
  site never shows a form that silently discards messages. The matching
  `endpoint` URL doubles as a no-JavaScript fallback (plain HTML POST), and a
  hidden `_gotcha` honeypot provides basic anti-spam. Submissions land in the
  Formspree dashboard.
- **`/edit/` publishing:** download-and-commit through GitHub's signed-in web
  editor. A purely static host cannot hold a token safely, so no one-click
  publish credential exists anywhere in the frontend by design.
- **Theming:** both schemes are fully defined side by side in
  `app/globals.css`; an inline script applies the right one before first
  paint. Contrast was computed, not eyeballed — every text/background pairing
  in both schemes clears WCAG AA (4.5:1), most clear AAA.

## Repository structure

```
data/profile.json        ← ALL content (single source of truth)
lib/data.js              ← data access + asset()/absUrl() portability helpers
lib/icons.js             ← hand-inlined SVG icons (no icon library)
app/layout.jsx           ← metadata, OG/Twitter, JSON-LD, theme-before-paint
app/page.jsx             ← assembles the sections
app/edit/page.jsx        ← browser content editor (owner tool)
app/not-found.jsx        ← exported as 404.html
components/              ← sections; every one reads only from profile.json
scripts/validate-content.mjs
scripts/generate-assets.mjs
public/                  ← CNAME, favicon.svg, images/ + generated assets
.github/workflows/deploy.yml
EDITING.md               ← plain-language guide for routine content updates
DNS.md                   ← domain / Cloudflare setup, kept separate on purpose
```
