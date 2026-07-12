import profile, { asset } from "@/lib/data";
import { MapPin, Mail, Download, ChevronDown, ExternalLink, SOCIAL_ICONS } from "@/lib/icons";

export default function Hero() {
  const p = profile.person;
  const socials = profile.socials?.visible ? profile.socials.items : [];

  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
      <div className="container relative z-10 pb-20 pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Text */}
          <div className="animate-fade-up">
            {(p.badges?.length > 0 || p.availability) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {(p.badges?.length ? p.badges : [p.availability]).map((b) => (
                  <p key={b} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
                    <span className="font-mono text-xs font-medium text-primary">{b}</span>
                  </p>
                ))}
              </div>
            )}

            <h1 className="mb-4 font-display text-5xl font-bold leading-tight lg:text-6xl">
              {p.firstName}{" "}
              <span className="text-primary [text-shadow:0_0_24px_rgb(var(--c-primary)/0.45)]">
                {p.lastName}
              </span>
            </h1>

            <p className="mb-2 font-display text-xl font-medium text-muted">{p.headline}</p>
            <p className="mb-8 flex items-center gap-1.5 text-sm text-muted">
              <span className="text-primary/70"><MapPin size={13} /></span>
              {p.location}
            </p>

            <p className="mb-10 max-w-lg leading-relaxed text-muted">{p.tagline}</p>

            <div className="mb-10 flex flex-wrap gap-4">
              {p.featuredCta?.href && (
                <a
                  href={p.featuredCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <ExternalLink size={15} /> {p.featuredCta.label}
                </a>
              )}
              {profile.resume.enabled && (
                <a href={asset(profile.resume.path)} download className="btn-outline">
                  <Download size={15} /> {profile.resume.label}
                </a>
              )}
              <a href="#contact" className={p.featuredCta?.href || profile.resume.enabled ? "btn-outline" : "btn-primary"}>
                <Mail size={15} /> Get in touch
              </a>
            </div>

            {socials.length > 0 && (
              <ul className="flex flex-wrap items-center gap-5">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.icon] || SOCIAL_ICONS.link;
                  return (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-muted transition-colors hover:text-primary"
                      >
                        <span className="transition-transform group-hover:scale-110">
                          <Icon size={18} />
                        </span>
                        <span className="hidden font-display text-sm font-medium sm:inline">
                          {s.label}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Profile card */}
          <div className="hidden justify-end lg:flex">
            <div className="card w-72 overflow-hidden shadow-[0_0_60px_rgb(var(--c-primary)/0.10),0_24px_48px_rgb(0_0_0/0.25)]">
              <div className="relative h-64 overflow-hidden">
                {/* Plain <img>: static export, no image server; dimensions prevent layout shift */}
                <img
                  src={asset(p.photo)}
                  alt={p.photoAlt}
                  width="288"
                  height="256"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
                <p className="mb-4 font-mono text-xs text-primary">{profile.about.facts?.[2]?.value || p.headline}</p>
                <div className="space-y-2.5 text-xs text-muted">
                  {profile.contact.email && (
                    <p className="flex items-center gap-2.5">
                      <span className="shrink-0 text-primary/70"><Mail size={12} /></span>
                      <a href={`mailto:${profile.contact.email}`} className="link-underline break-all">
                        {profile.contact.email}
                      </a>
                    </p>
                  )}
                  <p className="flex items-center gap-2.5">
                    <span className="shrink-0 text-primary/70"><MapPin size={12} /></span>
                    {p.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted/60 hover:text-primary motion-safe:animate-bounce"
        aria-label="Scroll to About section"
      >
        <span className="font-mono text-xs">scroll</span>
        <ChevronDown />
      </a>
    </section>
  );
}
