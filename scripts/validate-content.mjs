#!/usr/bin/env node
/**
 * Content validator — runs before every build, locally and in CI.
 * Fails fast (exit 1) with plain-language messages naming the offending field.
 * Warnings print but do not fail the build.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "data", "profile.json");

const errors = [];
const warnings = [];

let data;
try {
  data = JSON.parse(readFileSync(dataPath, "utf8"));
} catch (e) {
  console.error(`✖ data/profile.json does not parse as JSON: ${e.message}`);
  process.exit(1);
}

const isUrl = (v) => typeof v === "string" && /^https?:\/\/[^\s]+\.[^\s]+/.test(v);
const req = (cond, msg) => { if (!cond) errors.push(msg); };

/* ── Required shape ────────────────────────────────────────────────────── */
req(typeof data.site?.title === "string" && data.site.title.length > 0, "site.title is missing — this is the browser-tab / search-result title.");
req(typeof data.site?.description === "string" && data.site.description.length > 0, "site.description is missing — it powers search results and social previews.");
req(isUrl(data.site?.origin) && data.site.origin.startsWith("https://"), "site.origin must be the full https:// address the site is served from (social images break otherwise).");
req(typeof data.person?.name === "string" && data.person.name.length > 0, "person.name is missing.");
req(typeof data.person?.headline === "string" && data.person.headline.length > 0, "person.headline is missing.");
req(typeof data.person?.photo === "string" && data.person.photo.length > 0, "person.photo is missing — it should point at a file in public/, e.g. /images/profile.jpg.");
req(typeof data.person?.photoAlt === "string" && data.person.photoAlt.length > 0, "person.photoAlt is missing — every image needs alt text.");

/* Photo file must actually exist in public/ */
if (data.person?.photo && !existsSync(path.join(root, "public", data.person.photo))) {
  errors.push(`person.photo points at ${data.person.photo}, but public${data.person.photo} does not exist.`);
}

/* Resume: only when enabled must the file exist */
if (data.resume?.enabled) {
  if (!existsSync(path.join(root, "public", data.resume.path || ""))) {
    errors.push(`resume.enabled is true but public${data.resume.path} is missing — drop the PDF there or set enabled back to false.`);
  }
} else if (existsSync(path.join(root, "public", "resume.pdf"))) {
  warnings.push("public/resume.pdf exists but resume.enabled is false — set it to true to show the download buttons.");
}

/* Links must look like links */
(data.socials?.items || []).forEach((s, i) => {
  req(s.label, `socials.items[${i}] has no label.`);
  req(isUrl(s.href), `socials.items[${i}] ("${s.label || "?"}") — href "${s.href}" doesn't look like a full URL.`);
});
(data.community?.items || []).forEach((c, i) => {
  if (c.link?.href) req(isUrl(c.link.href), `community.items[${i}] ("${c.role}") — link.href "${c.link.href}" doesn't look like a full URL.`);
});
(data.experience?.items || []).forEach((j, i) => {
  if (j.orgUrl) req(isUrl(j.orgUrl), `experience.items[${i}] ("${j.role}") — orgUrl "${j.orgUrl}" doesn't look like a full URL.`);
});

/* Contact form: Formspree ID shape, endpoint URL when present */
if (data.contact?.form?.formspreeId) {
  req(/^[a-z0-9]+$/i.test(data.contact.form.formspreeId), "contact.form.formspreeId doesn't look like a Formspree ID (letters/digits only, e.g. mgogwpzj).");
}
if (data.contact?.form?.endpoint) {
  req(isUrl(data.contact.form.endpoint), "contact.form.endpoint is set but doesn't look like a URL — the form would silently discard messages.");
}

/* Hero badges and featured button */
if (data.person?.badges !== undefined) {
  req(Array.isArray(data.person.badges) && data.person.badges.every((b) => typeof b === "string" && b.length > 0), "person.badges must be a list of short text strings (one per hero pill).");
}
if (data.person?.featuredCta?.href) {
  req(isUrl(data.person.featuredCta.href), `person.featuredCta.href "${data.person.featuredCta.href}" doesn't look like a full URL.`);
  req(data.person.featuredCta.label, "person.featuredCta has a link but no label — the button would be blank.");
}

/* Nav: anchors or full URLs; external links must be real URLs */
(data.nav?.items || []).forEach((n, i) => {
  req(n.label, `nav.items[${i}] has no label.`);
  req((n.href || "").startsWith("#") || isUrl(n.href), `nav.items[${i}] ("${n.label || "?"}") — href "${n.href}" must be a #section anchor or a full URL.`);
  if (n.external) req(isUrl(n.href), `nav.items[${i}] ("${n.label || "?"}") is marked external but its href isn't a full URL.`);
});

/* Upskilling block, when visible, needs its lists well-formed */
if (data.upskilling?.visible) {
  (data.upskilling.reading?.items || []).forEach((b, i) => {
    req(b.title, `upskilling.reading.items[${i}] has no title.`);
  });
  (data.upskilling.listening?.items || []).forEach((b, i) => {
    req(b.title, `upskilling.listening.items[${i}] has no title.`);
  });
  (data.upskilling.conferences?.items || []).forEach((c, i) => {
    req(typeof c === "string" && c.length > 0, `upskilling.conferences.items[${i}] must be a short text string.`);
  });
}

/* ── Privacy checks (this file is published verbatim) ─────────────────── */
const text = JSON.stringify(data);
if (/\+?61\s?4\d{2}[\s-]?\d{3}[\s-]?\d{3}|\b04\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/.test(text)) {
  errors.push("Something in profile.json looks like an Australian mobile number. This file is public — remove it (or restructure it so it no longer matches a phone pattern if it truly isn't one).");
}
if (/\b\d{2,4}[\s-]\d{3}[\s-]\d{3,4}\b/.test(text)) {
  warnings.push("A number sequence in the file resembles a phone number — double-check nothing private is being published.");
}
const personalEmail = /[A-Za-z0-9._%+-]+@(gmail|hotmail|outlook|yahoo|protonmail|proton|icloud)\.[a-z.]+/i;
if (personalEmail.test(text) && !data.contact?.allowPublicEmail) {
  warnings.push("A personal-provider email address appears in the file. If publishing it is deliberate, set contact.allowPublicEmail: true to acknowledge.");
}

/* ── Quality nudges ───────────────────────────────────────────────────── */
const dLen = (data.site?.description || "").length;
if (dLen && (dLen < 90 || dLen > 140)) {
  warnings.push(`site.description is ${dLen} characters — aim for 110–120 so link previews don't truncate.`);
}

/* ── Report ───────────────────────────────────────────────────────────── */
for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\nContent validation failed: ${errors.length} error(s) in data/profile.json.`);
  process.exit(1);
}
console.log(`✓ Content validation passed (${warnings.length} warning(s)).`);
