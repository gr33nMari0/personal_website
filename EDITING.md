# Editing your website (no command line needed)

Everything visible on the site lives in **one file**: `data/profile.json`.
Change that file, and the site rebuilds and republishes itself within a few
minutes. You never need to touch any other file for routine updates.

## The two ways to edit

### Option A — the built-in editor (easiest)

1. Go to **https://peterwoodhead.com/edit/** (it's unlisted, not linked from
   the site).
2. Change anything in the labelled fields. Use **+ Add** to add links, jobs or
   roles, the **↑ ↓** buttons to reorder them, and **Remove** to delete one.
3. The **Check, download, publish** box at the bottom tells you if something
   needs fixing and shows a preview of the file.
4. Click **Download profile.json**.
5. Click **edit data/profile.json on GitHub** — you'll be asked to sign in to
   GitHub if you aren't already (the editor itself never holds your password
   or any key).
6. On GitHub, select everything in the file, delete it, and paste in the
   contents of your downloaded file (open it in any text editor to copy it).
   Press **Commit changes** with the branch set to `main`.

### Option B — edit the file directly on GitHub

Open the repository on GitHub → `data` → `profile.json` → pencil icon. The
file has `_comment` notes throughout explaining every field. Commit to `main`
when done.

## Common tasks

- **Add a job**: in `experience.items`, copy an existing entry from `{` to `}`,
  paste it above the first one, and change the fields. Watch the commas — every
  entry except the last needs one after its closing `}`.
- **Add a link**: same pattern in `socials.items`. The `icon` field must be one
  of `linkedin`, `github`, `x`, `linktree`, `mail`, `link`.
- **Hide a whole section**: set that section's `"visible": true` to `false`.
  Also remove its entry from `nav.items` so the menu doesn't point at nothing.
- **Change the photo**: replace the file `public/images/profile.jpg` with a new
  JPEG **using that exact name** (on GitHub: open the `public/images` folder →
  Add file → Upload files). It updates the hero card and the image people see
  when they share your link.
- **Add your resume**: upload the PDF as `public/resume.pdf`, then set
  `resume.enabled` to `true` in the data file. Buttons appear everywhere
  automatically.
- **Contact form**: already wired to Formspree (form ID `mgogwpzj` in
  `contact.form.formspreeId`). Messages arrive in the Formspree dashboard —
  log in at formspree.io to read them or forward to email. To swap forms,
  replace the ID and the matching `endpoint` URL. The form only appears once
  that's set.

## How publishing works

Every commit to `main` starts an automatic pipeline (the **Actions** tab on
GitHub): it checks your content, regenerates the share image and other derived
files, builds the site, and deploys it. Allow 2–3 minutes, then hard-refresh
the site (Cmd+Shift+R).

**If the pipeline fails**, open the Actions tab and click the red run. The
content checker speaks plain English — it will say exactly which field is
wrong (for example, a link that isn't a full URL, or a missing photo). Fix the
field and commit again.

## Undoing a mistake

On GitHub: repository → **Commits** (the clock icon) → find the last good
commit → **⋯ → Revert** (or open `data/profile.json` at that commit, copy its
contents, and commit them back). The site redeploys the old version
automatically.

## What must never go in the file

`data/profile.json` is published on the internet **exactly as written**. Never
put in it:

- phone numbers (the pipeline refuses to build if it spots one)
- home address, passwords, API keys, tokens
- anyone else's personal details

The email address currently in the file is there deliberately and is
acknowledged with the `allowPublicEmail` flag.

## Sharing your link and seeing an old preview?

Social sites remember old previews for a while. Paste your URL into LinkedIn's
Post Inspector (linkedin.com/post-inspector) or Facebook's Sharing Debugger to
make them look again, or test with `https://peterwoodhead.com/?v=2`.

## Hero badges & the Tech Fest button

- The pills at the top of the page come from `person.badges` — one line each
  in the editor. Delete them all to show no pills.
- The big green hero button is `person.featuredCta` (label + URL). Clear the
  URL to hide the button. The "Tech Fest" item in the menu is the last entry
  in `nav.items` — it opens in a new tab because it has `"external": true`.

## The QR code

The QR code at the bottom of the contact section is generated automatically
on every build and always points at the site's own address (`site.origin`).
There is nothing to update by hand — if the domain ever changes, the next
build regenerates it. Hide it by setting `contactSection.qr.visible` to false.
