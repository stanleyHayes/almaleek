import Link from "next/link";

function BrandGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <path d="M11 47 27 15l9 17 9-17 8 32h-9l-3-15-5 10-5-10-7 15Z" />
      <path d="M25 50h24L37 39Z" className="state-glyph-accent" />
    </svg>
  );
}

export function BrandSplash() {
  return (
    <main
      className="brand-state brand-splash"
      id="main-content"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="state-orbit" aria-hidden="true" />
      <div className="state-mark">
        <BrandGlyph />
      </div>
      <p className="state-kicker">AL Maleek</p>
      <h1>Culture is moving.</h1>
      <p>Bringing the next room into focus.</p>
      <div className="state-progress" aria-hidden="true">
        <span />
      </div>
      <span className="sr-only">Loading AL Maleek</span>
    </main>
  );
}

export function BrandNotFound() {
  return (
    <main className="brand-state brand-not-found" id="main-content">
      <div className="state-number" aria-hidden="true">
        404
      </div>
      <section>
        <p className="state-kicker">This room has moved</p>
        <h1>The culture is still here.</h1>
        <p>
          The page you followed may have changed, but there is plenty happening
          across the AL Maleek ecosystem.
        </p>
        <nav aria-label="Page not found options" className="state-actions">
          <Link className="button button-primary" href="/">
            Return home
          </Link>
          <Link className="state-text-link" href="/about">
            Meet AL Maleek →
          </Link>
          <Link className="state-text-link" href="/community">
            Join the community →
          </Link>
        </nav>
      </section>
      <aside aria-label="Suggested destination">
        <span>Still moving</span>
        <strong>Live rooms, stories and new opportunities.</strong>
        <Link href="/events/live">See what is live →</Link>
      </aside>
    </main>
  );
}
