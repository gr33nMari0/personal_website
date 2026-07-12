# Domain setup: peterwoodhead.com → GitHub Pages behind Cloudflare

Kept separate from the code docs so it can be updated independently.

## Records to create in Cloudflare DNS

With the domain's nameservers on Cloudflare, add:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | DNS only *(grey cloud — see below)* |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| CNAME | `www` | `gr33nmari0.github.io` | DNS only |

(These are GitHub Pages' anycast IPs; confirm against GitHub's current docs if
this file is old.)

## GitHub side

1. Repo → **Settings → Pages** → Custom domain: `peterwoodhead.com` → Save.
   GitHub runs a DNS check; wait for the green tick.
2. Tick **Enforce HTTPS** once the certificate is issued (can take up to an
   hour after DNS propagates).
3. The repository already ships `public/CNAME` containing `peterwoodhead.com`,
   which ends up in every deploy — this is what stops Pages from dropping the
   custom domain on each redeploy. If you ever change domains, update **both**
   `public/CNAME` and `site.origin` in `data/profile.json` (plus
   `NEXT_PUBLIC_SITE_ORIGIN` in `.github/workflows/deploy.yml`).

## Cloudflare proxy (orange cloud) — do it in this order

Start with all records **DNS only (grey cloud)** until GitHub has issued its
certificate and the Pages DNS check is green. Only then, optionally, switch the
records to **Proxied (orange cloud)** if you want Cloudflare's CDN/analytics in
front. If you proxy:

- Cloudflare → **SSL/TLS → Overview** → set mode to **Full (strict)**. Never
  "Flexible" — that combination with GitHub's HTTPS redirect causes an
  infinite redirect loop.
- Cloudflare → **Rules** or **SSL/TLS → Edge Certificates** → enable **Always
  Use HTTPS**.
- If GitHub's custom-domain check ever needs re-verifying, temporarily grey-
  cloud the records (the check needs to see GitHub's own IPs).

## Changing the domain later

1. Buy/point the new domain at Cloudflare and recreate the records above.
2. Update `public/CNAME`, `site.origin` in `data/profile.json`, and
   `NEXT_PUBLIC_SITE_ORIGIN` in the workflow.
3. Update the custom domain in repo Settings → Pages.
4. Re-scrape social previews (LinkedIn Post Inspector / Facebook Sharing
   Debugger) — they cache the old card aggressively.

## Verifying it worked

- `https://peterwoodhead.com` loads with a padlock and no redirect loop
- `https://peterwoodhead.com/sitemap.xml` and `/robots.txt` reference
  `https://peterwoodhead.com`
- `https://peterwoodhead.com/og.png` loads (this is the social share image)
- A LinkedIn/Discord paste of the URL shows the generated card
