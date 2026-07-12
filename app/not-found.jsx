import profile from "@/lib/data";
import { Shield } from "@/lib/icons";

/** Exported by Next as out/404.html — GitHub Pages serves it automatically. */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="text-primary"><Shield size={40} /></span>
      <h1 className="font-display text-5xl font-bold">
        404<span className="text-primary">.</span>
      </h1>
      <p className="max-w-sm text-muted">
        That page doesn't exist. The whole site lives on one page — head back and
        you'll find everything there.
      </p>
      <a href={process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : "/"} className="btn-primary">
        Back to {profile.person.firstName}'s homepage
      </a>
    </main>
  );
}
