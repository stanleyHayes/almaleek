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
          <rect x="11" y="13" width="26" height="23" rx="8" />
          <path d="M17 26h14M21 20h6" />
          <circle cx="35" cy="13" r="4" />
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

export function PageSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div
      className="page-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <div className="skeleton-stack">
        <span className="skeleton skeleton-kicker" />
        <span className="skeleton skeleton-heading" />
        <div className="skeleton-grid">
          {Array.from({ length: cards }, (_, index) => (
            <span className="skeleton skeleton-card" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
