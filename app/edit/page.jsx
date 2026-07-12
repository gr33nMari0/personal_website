"use client";
/**
 * /edit/ — a lightweight content editor for the non-technical owner.
 *
 * Loads the live copy of data/profile.json (published to /data/profile.json
 * by the prebuild step), presents labelled form fields, lets you add / remove
 * / reorder repeatable items, validates with the same rules as the build-time
 * validator, previews the result, and produces a fresh profile.json to
 * download. Publishing then happens through GitHub's own signed-in editor via
 * the "Open on GitHub" link — no token, key, or secret ever lives in this
 * page (a purely static host cannot keep one safe).
 *
 * All values are written via .value/textContent — never innerHTML — so
 * nothing in the data file can inject markup.
 */
import { useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/data";

/* Same core rules as scripts/validate-content.mjs, kept deliberately small. */
function validate(data) {
  const errors = [];
  const warnings = [];
  const need = (cond, msg) => { if (!cond) errors.push(msg); };
  try {
    need(data.site?.title, "site.title is required");
    need(data.site?.description, "site.description is required");
    need(/^https:\/\//.test(data.site?.origin || ""), "site.origin must start with https://");
    need(data.person?.name, "person.name is required");
    need(data.person?.photoAlt, "person.photoAlt (image alt text) is required");
    (data.socials?.items || []).forEach((s, i) => {
      need(s.label, `socials.items[${i}].label is required`);
      need(/^https?:\/\//.test(s.href || ""), `socials.items[${i}].href must be a full URL`);
    });
    const text = JSON.stringify(data);
    if (/\+?61\s?4\d{2}[\s-]?\d{3}[\s-]?\d{3}|\b04\d{2}\s?\d{3}\s?\d{3}\b/.test(text)) {
      warnings.push("Something in the file looks like an Australian mobile number — this file is public, remove it unless that's deliberate.");
    }
    const d = (data.site?.description || "").length;
    if (d < 90 || d > 140) warnings.push(`site.description is ${d} characters — aim for 110–120 so social previews don't truncate.`);
  } catch (e) {
    errors.push(`Could not validate: ${e.message}`);
  }
  return { errors, warnings };
}

function Field({ label, value, onChange, textarea, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-xs text-muted">{label}</span>
      {textarea ? (
        <textarea rows={3} className="field" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="field" value={value || ""} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="mt-1 block text-xs text-muted/70">{hint}</span>}
    </label>
  );
}

function Row({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function ItemControls({ index, total, onMove, onRemove }) {
  return (
    <div className="flex gap-1">
      <button type="button" className="btn-outline px-2 py-1 text-xs" disabled={index === 0}
        onClick={() => onMove(index, -1)} aria-label="Move up">↑</button>
      <button type="button" className="btn-outline px-2 py-1 text-xs" disabled={index === total - 1}
        onClick={() => onMove(index, 1)} aria-label="Move down">↓</button>
      <button type="button" className="btn-outline px-2 py-1 text-xs" onClick={() => onRemove(index)}
        aria-label="Remove item">Remove</button>
    </div>
  );
}

export default function EditPage() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(asset("/data/profile.json"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e) => setLoadError(e.message));
  }, []);

  const { errors, warnings } = useMemo(
    () => (data ? validate(data) : { errors: [], warnings: [] }),
    [data]
  );

  if (loadError) {
    return (
      <main id="main" className="container py-24">
        <h1 className="section-heading mb-6">Content editor</h1>
        <p className="text-muted">
          Couldn't load the current content ({loadError}). Run a build first — the
          prebuild step publishes data/profile.json to /data/profile.json — or edit
          data/profile.json directly in the repository.
        </p>
      </main>
    );
  }
  if (!data) {
    return (
      <main id="main" className="container py-24">
        <p className="font-mono text-sm text-muted">Loading current content…</p>
      </main>
    );
  }

  const set = (path, value) => {
    setSaved(false);
    setData((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined || obj[keys[i]] === null) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const listOps = (path) => {
    const get = (obj) => path.split(".").reduce((o, k) => o[k], obj);
    return {
      move: (i, dir) =>
        setData((prev) => {
          const next = structuredClone(prev);
          const arr = get(next);
          const [item] = arr.splice(i, 1);
          arr.splice(i + dir, 0, item);
          return next;
        }),
      remove: (i) =>
        setData((prev) => {
          const next = structuredClone(prev);
          get(next).splice(i, 1);
          return next;
        }),
      add: (template) =>
        setData((prev) => {
          const next = structuredClone(prev);
          get(next).push(structuredClone(template));
          return next;
        }),
    };
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile.json";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  const githubEditUrl = `${(data.site.repo || "").replace(/\/$/, "")}/edit/main/data/profile.json`;
  const socials = listOps("socials.items");
  const jobs = listOps("experience.items");
  const roles = listOps("community.items");

  return (
    <main id="main" className="container max-w-3xl py-20">
      <p className="eyebrow mb-3">Owner tools</p>
      <h1 className="section-heading mb-4">Content editor</h1>
      <p className="mb-10 text-sm leading-relaxed text-muted">
        Everything on the site comes from one file. Edit below, then <strong>Download
        profile.json</strong> and replace <code className="font-mono text-primary">data/profile.json</code> on
        GitHub — the site rebuilds and deploys itself. Nothing here is sent anywhere;
        it all stays in your browser until you download it.
      </p>

      <div className="space-y-10">
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Site & identity</h2>
          <Field label="Site title (browser tab, search results)" value={data.site.title} onChange={(v) => set("site.title", v)} />
          <Field label="Site description (social previews — aim for 110–120 characters)" textarea
            value={data.site.description} onChange={(v) => set("site.description", v)}
            hint={`${data.site.description.length} characters`} />
          <Row>
            <Field label="Name" value={data.person.name} onChange={(v) => set("person.name", v)} />
            <Field label="Headline" value={data.person.headline} onChange={(v) => set("person.headline", v)} />
          </Row>
          <Row>
            <Field label="Location" value={data.person.location} onChange={(v) => set("person.location", v)} />
            <Field label="Hero badges (one per line, empty to hide)" textarea
              value={(data.person.badges || []).join("\n")}
              onChange={(v) => set("person.badges", v.split("\n").map((b) => b.trim()).filter(Boolean))} />
          </Row>
          <Row>
            <Field label="Hero button label" value={data.person.featuredCta?.label}
              onChange={(v) => set("person.featuredCta.label", v)} />
            <Field label="Hero button URL (empty to hide)" value={data.person.featuredCta?.href}
              onChange={(v) => set("person.featuredCta.href", v)} />
          </Row>
          <Field label="Intro line (hero)" textarea value={data.person.tagline} onChange={(v) => set("person.tagline", v)} />
          <Field label="Photo alt text" value={data.person.photoAlt} onChange={(v) => set("person.photoAlt", v)} />
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Links</h2>
            <button type="button" className="btn-outline px-3 py-1.5 text-xs"
              onClick={() => socials.add({ label: "New link", href: "https://", icon: "link" })}>
              + Add link
            </button>
          </div>
          {data.socials.items.map((s, i) => (
            <div key={i} className="rounded-lg border border-line/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">Link {i + 1}</span>
                <ItemControls index={i} total={data.socials.items.length} onMove={socials.move} onRemove={socials.remove} />
              </div>
              <Row>
                <Field label="Label" value={s.label} onChange={(v) => set(`socials.items.${i}.label`, v)} />
                <Field label="Icon (linkedin / github / x / linktree / mail / link)" value={s.icon} onChange={(v) => set(`socials.items.${i}.icon`, v)} />
              </Row>
              <div className="mt-4">
                <Field label="URL" value={s.href} onChange={(v) => set(`socials.items.${i}.href`, v)} />
              </div>
            </div>
          ))}
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Work experience</h2>
            <button type="button" className="btn-outline px-3 py-1.5 text-xs"
              onClick={() => jobs.add({ role: "Role", org: "Organisation", orgUrl: "", period: "", description: "", tags: [] })}>
              + Add job
            </button>
          </div>
          {data.experience.items.map((j, i) => (
            <div key={i} className="rounded-lg border border-line/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">Job {i + 1}</span>
                <ItemControls index={i} total={data.experience.items.length} onMove={jobs.move} onRemove={jobs.remove} />
              </div>
              <Row>
                <Field label="Role" value={j.role} onChange={(v) => set(`experience.items.${i}.role`, v)} />
                <Field label="Organisation" value={j.org} onChange={(v) => set(`experience.items.${i}.org`, v)} />
              </Row>
              <div className="mt-4 space-y-4">
                <Field label="Period (free text)" value={j.period} onChange={(v) => set(`experience.items.${i}.period`, v)} />
                <Field label="Description" textarea value={j.description} onChange={(v) => set(`experience.items.${i}.description`, v)} />
                <Field label="Tags (comma separated)" value={(j.tags || []).join(", ")}
                  onChange={(v) => set(`experience.items.${i}.tags`, v.split(",").map((t) => t.trim()).filter(Boolean))} />
              </div>
            </div>
          ))}
        </section>

        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Community & leadership</h2>
            <button type="button" className="btn-outline px-3 py-1.5 text-xs"
              onClick={() => roles.add({ featured: false, role: "Role", org: "Organisation", period: "", description: "", tags: [] })}>
              + Add role
            </button>
          </div>
          {data.community.items.map((r, i) => (
            <div key={i} className="rounded-lg border border-line/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-muted">Role {i + 1}</span>
                <ItemControls index={i} total={data.community.items.length} onMove={roles.move} onRemove={roles.remove} />
              </div>
              <Row>
                <Field label="Role" value={r.role} onChange={(v) => set(`community.items.${i}.role`, v)} />
                <Field label="Organisation" value={r.org} onChange={(v) => set(`community.items.${i}.org`, v)} />
              </Row>
              <div className="mt-4 space-y-4">
                <Field label="Period" value={r.period} onChange={(v) => set(`community.items.${i}.period`, v)} />
                <Field label="Description" textarea value={r.description} onChange={(v) => set(`community.items.${i}.description`, v)} />
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input type="checkbox" checked={!!r.featured}
                    onChange={(e) => set(`community.items.${i}.featured`, e.target.checked)} />
                  Featured (large card with link button)
                </label>
              </div>
            </div>
          ))}
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Conferences & upskilling</h2>
          <Field label="Featured conference title" value={data.upskilling?.featured?.title}
            onChange={(v) => set("upskilling.featured.title", v)} />
          <Field label="Featured conference note (e.g. who sponsored it)" value={data.upskilling?.featured?.note}
            onChange={(v) => set("upskilling.featured.note", v)} />
          <Field label="Featured conference description" textarea value={data.upskilling?.featured?.description}
            onChange={(v) => set("upskilling.featured.description", v)} />
          <Field label="Conferences attended regularly (comma separated)"
            value={(data.upskilling?.conferences?.items || []).join(", ")}
            onChange={(v) => set("upskilling.conferences.items", v.split(",").map((t) => t.trim()).filter(Boolean))} />
          <Field label="Bookshelf (one per line as Title — Author)" textarea
            value={(data.upskilling?.reading?.items || []).map((b) => `${b.title} — ${b.by || ""}`.trim()).join("\n")}
            onChange={(v) => set("upskilling.reading.items",
              v.split("\n").map((line) => {
                const [title, ...rest] = line.split("—");
                return { title: (title || "").trim(), by: rest.join("—").trim() };
              }).filter((b) => b.title))}
            hint="Use an em dash or hyphen-minus won't split; copy the — from an existing line." />
        </section>

        {/* Validation + preview + handoff */}
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold">Check, download, publish</h2>

          {errors.length > 0 && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
              <p className="mb-2 font-bold">Fix before publishing:</p>
              <ul className="list-inside list-disc space-y-1">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
              <p className="mb-2 font-bold">Worth checking:</p>
              <ul className="list-inside list-disc space-y-1">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}
          {errors.length === 0 && warnings.length === 0 && (
            <p className="text-sm text-primary">All checks pass.</p>
          )}

          <details className="rounded-lg border border-line/10 p-4">
            <summary className="cursor-pointer font-mono text-xs text-muted">Preview the file</summary>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-muted">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>

          <ol className="list-inside list-decimal space-y-2 text-sm text-muted">
            <li>
              <button type="button" onClick={download} disabled={errors.length > 0} className="btn-primary disabled:opacity-40">
                Download profile.json
              </button>
              {saved && <span className="ml-3 text-primary">Downloaded ✓</span>}
            </li>
            <li>
              Open the file on GitHub (you'll be signed in there — this page holds no
              credentials):{" "}
              <a href={githubEditUrl} target="_blank" rel="noopener noreferrer" className="link-underline text-primary">
                edit data/profile.json on GitHub
              </a>
            </li>
            <li>Replace the contents with your downloaded file and commit to <code className="font-mono">main</code>. GitHub Actions rebuilds and deploys automatically (2–3 minutes).</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
