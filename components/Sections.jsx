import profile, { emphasize } from "@/lib/data";
import { Zap, Users, ExternalLink, Award, BookOpen, Headphones } from "@/lib/icons";
import Reveal from "./Reveal";

/** Renders a paragraph where **spans** from the data file become accent text. */
function Emphasis({ text }) {
  return (
    <p>
      {emphasize(text).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-medium text-primary">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

function SectionHeader({ eyebrow, heading }) {
  return (
    <>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="section-heading mb-12">{heading}</h2>
    </>
  );
}

export function About() {
  const a = profile.about;
  if (!a?.visible) return null;
  return (
    <section id="about" className="py-24" aria-labelledby="about-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-3">{a.eyebrow}</p>
          <h2 id="about-heading" className="section-heading mb-8">{a.heading}</h2>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4 leading-relaxed text-muted">
              {a.paragraphs.map((t, i) => <Emphasis key={i} text={t} />)}
            </div>
            {a.facts?.length > 0 && (
              <dl className="grid h-fit grid-cols-2 gap-4">
                {a.facts.map((f) => (
                  <div key={f.label} className="card p-4">
                    <dt className="mb-1 font-mono text-xs text-primary">{f.label}</dt>
                    <dd className="font-display text-sm font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Skills() {
  const s = profile.skills;
  if (!s?.visible || !s.groups?.length) return null;
  return (
    <section id="skills" className="bg-surface-2 py-24" aria-labelledby="skills-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-3">{s.eyebrow}</p>
          <h2 id="skills-heading" className="section-heading mb-12">{s.heading}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {s.groups.map((g) => (
              <div key={g.title} className="card card-hover p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {g.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="chip">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Experience() {
  const e = profile.experience;
  const edu = profile.education;
  if (!e?.visible || !e.items?.length) return null;
  return (
    <section id="experience" className="py-24" aria-labelledby="experience-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-3">{e.eyebrow}</p>
          <h2 id="experience-heading" className="section-heading mb-4">{e.heading}</h2>
          {e.note && <p className="mb-12 max-w-2xl text-sm leading-relaxed text-muted">{e.note}</p>}
          <div className="grid gap-6 md:grid-cols-2">
            {e.items.map((job) => (
              <article key={`${job.role}-${job.org}`} className="card card-hover relative overflow-hidden p-6">
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary/50" />
                <div className="pl-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-bold">{job.role}</h3>
                    <span className="shrink-0 font-mono text-xs text-muted">{job.period}</span>
                  </div>
                  <p className="mb-3 font-display text-sm font-medium text-primary">
                    {job.orgUrl ? (
                      <a href={job.orgUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                        {job.org}
                      </a>
                    ) : job.org}
                  </p>
                  <p className="mb-4 text-sm leading-relaxed text-muted">{job.description}</p>
                  {job.tags?.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {job.tags.map((t) => <li key={t} className="chip">{t}</li>)}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>

          {edu?.visible && edu.items?.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">Education</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {edu.items.map((item) => (
                  <article key={item.title} className="card card-hover relative overflow-hidden p-5">
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary/40" />
                    <div className="pl-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="font-display text-sm font-bold">{item.title}</h4>
                        <span className="shrink-0 font-mono text-xs text-muted">{item.period}</span>
                      </div>
                      <p className="mb-2 font-display text-xs font-medium text-primary">{item.org}</p>
                      <p className="text-xs leading-relaxed text-muted">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function Community() {
  const c = profile.community;
  if (!c?.visible || !c.items?.length) return null;
  const featured = c.items.filter((i) => i.featured);
  const compact = c.items.filter((i) => !i.featured);

  return (
    <section id="community" className="bg-surface-2 py-24" aria-labelledby="community-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-3">{c.eyebrow}</p>
          <h2 id="community-heading" className="section-heading mb-12">{c.heading}</h2>

          <div className="space-y-6">
            {featured.map((item, idx) => (
              <article key={item.role + item.org} className="card card-hover relative overflow-hidden p-6">
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary" />
                <div className="pl-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                        <span className="text-primary">{idx === 0 ? <Zap /> : <Users />}</span>
                        {item.role}
                      </h3>
                      <p className="mt-0.5 font-display text-sm font-medium text-primary">{item.org}</p>
                    </div>
                    <span className="chip shrink-0">{item.period}</span>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted">{item.description}</p>
                  {item.tags?.length > 0 && (
                    <ul className="mb-4 flex flex-wrap gap-2">
                      {item.tags.map((t) => <li key={t} className="chip">{t}</li>)}
                    </ul>
                  )}
                  {item.link?.href && (
                    <a
                      href={item.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      <ExternalLink size={13} /> {item.link.label}
                    </a>
                  )}
                </div>
              </article>
            ))}

            {compact.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                {compact.map((item) => (
                  <article key={item.role + item.org} className="card card-hover relative overflow-hidden p-5">
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary/40" />
                    <div className="pl-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-bold">{item.role}</h3>
                        <span className="shrink-0 font-mono text-xs text-muted">{item.period}</span>
                      </div>
                      <p className="mb-2 font-display text-xs font-medium text-primary">{item.org}</p>
                      <p className="text-xs leading-relaxed text-muted">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Upskilling() {
  const u = profile.upskilling;
  if (!u?.visible) return null;
  return (
    <section id="upskilling" className="py-24" aria-labelledby="upskilling-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow mb-3">{u.eyebrow}</p>
          <h2 id="upskilling-heading" className="section-heading mb-4">{u.heading}</h2>
          {u.intro && <p className="mb-12 max-w-2xl text-sm leading-relaxed text-muted">{u.intro}</p>}

          {u.featured?.title && (
            <article className="card card-hover relative mb-6 overflow-hidden p-6">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-primary" />
              <div className="pl-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                      <span className="text-primary"><Award /></span>
                      {u.featured.title}
                    </h3>
                    <p className="mt-0.5 font-display text-sm font-medium text-primary">{u.featured.note}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted">{u.featured.description}</p>
                {u.featured.tags?.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {u.featured.tags.map((t) => <li key={t} className="chip">{t}</li>)}
                  </ul>
                )}
              </div>
            </article>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {u.conferences?.items?.length > 0 && (
              <div className="card card-hover p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                  <span className="text-primary"><Users size={15} /></span>
                  {u.conferences.title}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {u.conferences.items.map((c) => <li key={c} className="chip">{c}</li>)}
                </ul>
              </div>
            )}
            {u.reading?.items?.length > 0 && (
              <div className="card card-hover p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                  <span className="text-primary"><BookOpen size={15} /></span>
                  {u.reading.title}
                </h3>
                <ul className="space-y-3">
                  {u.reading.items.map((b) => (
                    <li key={b.title} className="text-sm">
                      <span className="block font-display font-medium leading-snug">{b.title}</span>
                      <span className="font-mono text-xs text-muted">{b.by}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {u.listening?.items?.length > 0 && (
              <div className="card card-hover p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold">
                  <span className="text-primary"><Headphones size={15} /></span>
                  {u.listening.title}
                </h3>
                <ul className="space-y-3">
                  {u.listening.items.map((b) => (
                    <li key={b.title} className="text-sm">
                      <span className="block font-display font-medium leading-snug">{b.title}</span>
                      <span className="font-mono text-xs text-muted">{b.by}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
