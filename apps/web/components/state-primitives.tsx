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

export function InlineSkeleton({ width = "12rem" }: { width?: string }) {
  return (
    <span
      className="skeleton inline-skeleton"
      style={{ width }}
      aria-hidden="true"
    />
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
          <path d="M13 28c0-8 5-14 12-14 6 0 10 4 10 10 0 7-5 11-12 11H10" />
          <path d="m10 35 5-5m-5 5 5 5" />
          <circle cx="35" cy="13" r="3" />
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
      aria-label="Loading page"
    >
      <div className="container skeleton-stack">
        <span className="skeleton skeleton-kicker" />
        <span className="skeleton skeleton-heading" />
        <span className="skeleton skeleton-heading skeleton-heading-short" />
        <span className="skeleton skeleton-copy" />
        <div className="skeleton-grid">
          {Array.from({ length: cards }, (_, index) => (
            <span className="skeleton skeleton-card" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
