import "./globals.css";
import profile, { asset, absUrl } from "@/lib/data";

/**
 * All metadata derives from data/profile.json.
 * OG/Twitter image URLs go through absUrl() — social scrapers can only fetch
 * ABSOLUTE urls at the deployed host, which is exactly what absUrl builds.
 * The image itself (public/og.png) is regenerated from this same data on
 * every build by scripts/generate-og.mjs.
 */
export const metadata = {
  metadataBase: new URL(absUrl("/")),
  title: profile.site.title,
  description: profile.site.description,
  alternates: { canonical: absUrl("/") },
  manifest: asset("/site.webmanifest"),
  icons: {
    icon: [
      { url: asset("/favicon.svg"), type: "image/svg+xml" },
      { url: asset("/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: asset("/apple-touch-icon.png"), sizes: "180x180" }],
  },
  openGraph: {
    type: "profile",
    title: profile.site.title,
    description: profile.site.description,
    url: absUrl("/"),
    siteName: profile.person.name,
    locale: profile.site.locale,
    images: [
      {
        url: absUrl("/og.png"),
        width: 1200,
        height: 630,
        alt: `${profile.person.name} — ${profile.person.headline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: profile.site.title,
    description: profile.site.description,
    images: [absUrl("/og.png")],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: profile.site.themeColorLight },
    { media: "(prefers-color-scheme: dark)", color: profile.site.themeColorDark },
  ],
};

/**
 * Applied inline in <head>, before first paint, so there is never a flash of
 * the wrong theme. Stored preference wins; otherwise the OS setting decides.
 */
const themeInit = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function jsonLd() {
  const sameAs = (profile.socials?.items || []).map((s) => s.href);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.person.name,
    url: absUrl("/"),
    image: absUrl(profile.person.photo),
    jobTitle: profile.person.headline,
    email: profile.contact.email ? `mailto:${profile.contact.email}` : undefined,
    address: { "@type": "PostalAddress", addressLocality: "Canberra", addressRegion: "ACT", addressCountry: "AU" },
    affiliation: { "@type": "CollegeOrUniversity", name: "Australian National University" },
    sameAs,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
