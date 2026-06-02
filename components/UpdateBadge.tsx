/** A small muted pill that tells visitors how fresh the data on a page is. */
export function UpdateBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-apex-border bg-apex-panel/60 px-3 py-1 text-xs text-apex-muted">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
        className="text-apex-accent2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      {children}
    </span>
  );
}
