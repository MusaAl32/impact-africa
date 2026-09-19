import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { AccountMenu } from "@/components/account-menu";
import { DeptIcon } from "@/components/dept-icon";
import { NuruWordmark } from "@/components/nuru-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/departments";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3" aria-label="Nuru departments">
      {DEPARTMENTS.map((d) => {
        const active = d.path === "/app" ? pathname === "/app" : pathname.startsWith(d.path);
        return (
          <Link
            key={d.id}
            to={d.path}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/12 font-medium text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <DeptIcon name={d.icon} className="size-4 shrink-0" />
            <span className="truncate">{d.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" aria-label="Nuru AI home">
            <NuruWordmark />
          </Link>
          <AccountMenu compact />
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
          <Link to="/" aria-label="Nuru AI home">
            <NuruWordmark />
          </Link>
          <div className="flex items-center gap-1">
            <AccountMenu compact />
            <Button
              size="icon"
              variant="ghost"
              aria-label={open ? "Close navigation" : "Open navigation"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </header>

        {open && (
          <div className="border-b border-border bg-card lg:hidden">
            <div className="max-h-[60vh] overflow-y-auto">{nav}</div>
          </div>
        )}

        {/* Required: nested routes render here. */}
        <Outlet />
      </div>
    </div>
  );
}
