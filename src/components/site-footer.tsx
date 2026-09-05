import { Link } from "@tanstack/react-router";

import { NuruWordmark } from "@/components/nuru-logo";
import { DEPARTMENTS } from "@/lib/departments";
import { AFRICAN_LANGUAGES } from "@/lib/languages";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <NuruWordmark />
          <p className="mt-4 max-w-[38ch] text-sm text-muted-foreground">
            One AI. Built for Africa. Connected to the world. Nuru unifies specialist AI
            departments, {AFRICAN_LANGUAGES.length}+ African languages and a business hub into a
            single intelligent workspace.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Departments
          </h2>
          <ul className="space-y-2 text-sm">
            {DEPARTMENTS.slice(1, 8).map((d) => (
              <li key={d.id}>
                <Link to={d.path} className="text-muted-foreground hover:text-foreground">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/app" className="text-muted-foreground hover:text-foreground">
                AI Platform
              </Link>
            </li>
            <li>
              <Link to="/app/hub" className="text-muted-foreground hover:text-foreground">
                Africa Business Hub
              </Link>
            </li>
            <li>
              <Link to="/app/workspace" className="text-muted-foreground hover:text-foreground">
                My Workspace
              </Link>
            </li>
            <li>
              <Link to="/app/settings" className="text-muted-foreground hover:text-foreground">
                Settings
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nuru AI by Africa Opportunity Hub — built for Africa,
        connected to the world.
      </div>

    </footer>
  );
}
