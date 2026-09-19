export function NuruLogo({ className = "size-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl ${className}`}
      style={{ backgroundImage: "var(--gradient-gold)", boxShadow: "var(--glow-gold)" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" stroke="currentColor" strokeWidth="2.2">
        <g className="text-primary-foreground">
          <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
          <path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2M5.2 5.2l2.3 2.3M16.5 16.5l2.3 2.3M18.8 5.2l-2.3 2.3M7.5 16.5l-2.3 2.3" strokeLinecap="round" />
        </g>
      </svg>
    </span>
  );
}

export const NuruMark = NuruLogo;

export function NuruWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <NuruLogo className="size-8" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">Nuru AI</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Built for Africa
          </span>
        </span>
      )}
    </span>
  );
}
