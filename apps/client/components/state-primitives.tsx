import type { ReactNode } from "react";

export function LoadingDots({ label = "Loading" }: { label?: string }) {
  return (
    <>
      <span className="loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="sr-only">{label}</span>
    </>
  );
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`empty-state${compact ? " empty-state-compact" : ""}`}>
      <span className="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="13" />
          <path d="M24 16v8l6 4" />
          <path d="M11 13 8 10m29 3 3-3" />
        </svg>
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action && <div className="empty-state-action">{action}</div>}
    </section>
  );
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div
      className="page-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading Circle"
    >
      <div className="skeleton-shell">
        <aside>
          <span className="skeleton skeleton-logo" />
          {Array.from({ length: 6 }, (_, index) => (
            <span className="skeleton skeleton-nav" key={index} />
          ))}
        </aside>
        <section>
          <span className="skeleton skeleton-kicker" />
          <span className="skeleton skeleton-heading" />
          <div className="skeleton-grid">
            {Array.from({ length: cards }, (_, index) => (
              <span className="skeleton skeleton-card" key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
