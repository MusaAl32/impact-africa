import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { NuruWordmark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Platform", hash: "#platform" },
  { label: "Departments", hash: "#departments" },
  { label: "Languages", hash: "#languages" },
  { label: "Business Hub", hash: "#hub" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="Nuru AI home">
          <NuruWordmark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.hash}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link to="/app">Open Nuru</Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col p-4" aria-label="Mobile">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.hash}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <Button asChild className="mt-3">
              <Link to="/app" onClick={() => setOpen(false)}>
                Open Nuru
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
