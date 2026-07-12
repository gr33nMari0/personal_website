import profile, { asset } from "@/lib/data";
import { Mail, MapPin, Download, ExternalLink, Shield, SOCIAL_ICONS, LinkedIn } from "@/lib/icons";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";

export function Contact() {
  const cs = profile.contactSection;
  if (!cs?.visible) return null;
  const email = profile.contact.email;
  const socials = profile.socials?.visible ? profile.socials.items : [];
  const linkedin = socials.find((s) => s.icon === "linkedin");
  const others = socials.filter((s) => s.icon !== "linkedin");

  return (
    <section id="contact" className="bg-surface-2 py-24" aria-labelledby="contact-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-3">{cs.eyebrow}</p>
          <h2 id="contact-heading" className="section-heading mb-4">{cs.heading}</h2>
          <p className="mb-12 max-w-lg text-muted">{cs.blurb}</p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Direct channels */}
            <div className="space-y-4">
              {email && (
                <div className="card card-hover flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="mb-0.5 font-mono text-xs text-muted">Email</p>
                    <a href={`mailto:${email}`} className="link-underline font-display text-sm font-medium break-all">
                      {email}
                    </a>
                  </div>
                </div>
              )}
              <div className="card card-hover flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="mb-0.5 font-mono text-xs text-muted">Location</p>
                  <p className="font-display text-sm font-medium">{profile.person.location}</p>
                </div>
              </div>
              <ContactForm />
            </div>

            {/* Profiles */}
            <div className="card p-6">
              {linkedin && (
                <div className="mb-6">
                  <p className="mb-3 font-mono text-xs text-muted">Professional enquiries</p>
                  <a
                    href={linkedin.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-lg border border-line/10 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-muted group-hover:text-primary"><LinkedIn size={18} /></span>
                      <span>
                        <span className="block font-display text-sm font-bold">LinkedIn</span>
                        <span className="block text-xs text-muted">{cs.linkedinNote}</span>
                      </span>
                    </span>
                    <span className="text-muted/50 group-hover:text-primary"><ExternalLink /></span>
                  </a>
                </div>
              )}

              {email && (
                <div className="mb-6">
                  <p className="mb-3 font-mono text-xs text-muted">Let's chat</p>
                  <a
                    href={`mailto:${email}`}
                    className="group flex items-center justify-between rounded-lg border border-line/10 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-muted group-hover:text-primary"><Mail size={18} /></span>
                      <span>
                        <span className="block font-display text-sm font-bold">Email</span>
                        <span className="block text-xs text-muted">{cs.emailNote}</span>
                      </span>
                    </span>
                    <span className="text-muted/50 group-hover:text-primary"><ExternalLink /></span>
                  </a>
                </div>
              )}

              {others.length > 0 && (
                <div className="border-t border-line/10 pt-6">
                  <p className="mb-3 font-mono text-xs text-muted">Other profiles</p>
                  <ul className="space-y-2">
                    {others.map((s) => {
                      const Icon = SOCIAL_ICONS[s.icon] || SOCIAL_ICONS.link;
                      return (
                        <li key={s.href}>
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between rounded-lg border border-line/10 p-2.5 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-muted group-hover:text-primary"><Icon size={14} /></span>
                              <span className="font-display font-medium">{s.label}</span>
                            </span>
                            <span className="text-muted/50 group-hover:text-primary"><ExternalLink size={11} /></span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {profile.resume.enabled && (
                <div className="mt-6 border-t border-line/10 pt-6">
                  <a href={asset(profile.resume.path)} download className="btn-primary w-full">
                    <Download size={15} /> {profile.resume.label}
                  </a>
                </div>
              )}
            </div>
          </div>

          {profile.contactSection.qr?.visible && (
            <div className="mt-12 flex justify-center">
              <figure className="card flex flex-col items-center gap-3 p-6">
                {/* White backing keeps the code scannable in both themes */}
                <div className="rounded-xl bg-white p-3 shadow-inner">
                  <img
                    src={asset("/qr.svg")}
                    alt={`QR code linking to ${profile.site.origin}`}
                    width="132"
                    height="132"
                    loading="lazy"
                  />
                </div>
                <figcaption className="font-mono text-xs text-muted">
                  {profile.contactSection.qr.caption}
                </figcaption>
              </figure>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line/10 bg-surface-2 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="text-primary/60"><Shield size={14} /></span>
          {profile.footer.line}
        </p>
        <p className="max-w-md text-center font-mono text-xs text-muted/60 sm:text-right">
          {profile.footer.privacyNote}
        </p>
      </div>
    </footer>
  );
}
