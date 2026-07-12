"use client";
/**
 * Contact form wired to Formspree via @formspree/react (the site is React, so
 * this is the matching integration). It renders ONLY when a Formspree form ID
 * is configured in data/profile.json, so the site never shows a form that
 * silently discards messages.
 *
 * Progressive enhancement: the <form> also carries action/method pointing at
 * the same Formspree endpoint, so with JavaScript disabled the browser falls
 * back to a plain HTML POST (Formspree then shows its own thank-you page).
 * With JavaScript, @formspree/react intercepts the submit and shows the
 * inline success state instead. The hidden _gotcha field is Formspree's
 * standard honeypot for basic anti-spam.
 */
import { useForm, ValidationError } from "@formspree/react";
import profile from "@/lib/data";

export default function ContactForm() {
  const { formspreeId, endpoint } = profile.contact.form || {};
  if (!formspreeId) return null;
  return <FormspreeForm formspreeId={formspreeId} endpoint={endpoint} />;
}

function FormspreeForm({ formspreeId, endpoint }) {
  const [state, handleSubmit] = useForm(formspreeId);

  if (state.succeeded) {
    return (
      <div className="card mt-8 p-6" role="status">
        <h3 className="mb-2 font-display text-sm font-bold text-primary">Message sent ✓</h3>
        <p className="text-sm text-muted">
          Thanks for reaching out — I read everything and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      action={endpoint || `https://formspree.io/f/${formspreeId}`}
      method="POST"
      onSubmit={handleSubmit}
      className="card mt-8 space-y-4 p-6"
    >
      <h3 className="font-display text-sm font-bold">Send a message</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          Your name
          <input id="name" name="name" required className="field mt-1" autoComplete="name" />
        </label>
        <label className="block text-xs text-muted">
          Your email
          <input id="email" name="email" type="email" required className="field mt-1" autoComplete="email" />
        </label>
      </div>
      <ValidationError prefix="Email" field="email" errors={state.errors} className="block text-xs text-red-400" />
      <label className="block text-xs text-muted">
        Message
        <textarea id="message" name="message" required rows={4} className="field mt-1" />
      </label>
      <ValidationError prefix="Message" field="message" errors={state.errors} className="block text-xs text-red-400" />
      {/* Honeypot — hidden from people, tempting to bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="_gotcha" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" disabled={state.submitting} className="btn-primary disabled:opacity-50">
        {state.submitting ? "Sending…" : "Send message"}
      </button>
      <ValidationError errors={state.errors} className="block text-xs text-red-400" />
      <p className="text-xs text-muted/70">
        Delivered via Formspree. {profile.footer.privacyNote}
      </p>
    </form>
  );
}
