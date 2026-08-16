import Link from "next/link";

function Mark() {
  return (
    <span className="admin-state-mark" aria-hidden="true">
      <b>AM</b>
      <i />
    </span>
  );
}

export function AdminSplash() {
  return (
    <main
      className="admin-state admin-splash"
      id="main-content"
      aria-busy="true"
      aria-live="polite"
    >
      <Mark />
      <p>AL Maleek operations</p>
      <h1>Preparing your command room.</h1>
      <div className="admin-state-loader" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="sr-only">Loading administration workspace</span>
    </main>
  );
}

export function AdminNotFound() {
  return (
    <main className="admin-state admin-not-found" id="main-content">
      <Mark />
      <div>
        <p className="eyebrow">404 · Workspace unavailable</p>
        <h1>That operation is not in this room.</h1>
        <p>
          The destination may have moved or your bookmark may be out of date.
        </p>
      </div>
      <nav aria-label="Admin page not found options">
        <Link className="button button-primary" href="/">
          Return to overview
        </Link>
        <Link className="button button-soft" href="/events">
          Open events
        </Link>
        <Link href="/settings">Review settings →</Link>
      </nav>
    </main>
  );
}
