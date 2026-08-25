import { Link } from "@tanstack/react-router";
import { useState } from "react";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Problem Map", to: "/problem-map" },
  { label: "Opportunities", to: "/opportunities" },
  { label: "Solutions", to: "/solutions" },
  { label: "Ecosystem", to: "/ecosystem" },
  { label: "Research", to: "/research" },
  { label: "Builders", to: "/builders" },
  { label: "Projects", to: "/projects" },
  { label: "Insights", to: "/insights" },
  { label: "About", to: "/about" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex flex-col" onClick={() => setOpen(false)}>
          <span className="font-mono text-[10px] uppercase tracking-tighter text-muted-foreground">
            Intelligence platform
          </span>
          <span className="text-lg font-extrabold uppercase tracking-tighter">Map.Africa</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
          <div className="hidden items-center gap-4 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            to="/ecosystem"
            className="rounded-sm bg-foreground px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-background"
          >
            Join Ecosystem
          </Link>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            to="/submit"
            onClick={() => setOpen(false)}
            className="mt-5 block rounded-sm border border-border py-3 text-center text-[11px] font-bold uppercase tracking-widest"
          >
            Submit a Problem
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
