import Link from "next/link";

const publicSiteUrl =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://almaleek.com"
    : "http://127.0.0.1:3100");

function CircleMark() {
  return (
    <span className="circle-state-mark" aria-hidden="true">
      <b>AM</b>
      <i />
    </span>
  );
}

export function CircleSplash() {
  return (
    <main
      className="circle-state circle-splash"
      aria-busy="true"
      aria-live="polite"
    >
      <CircleMark />
      <p>AL Maleek Circle</p>
      <h1>Your room is getting ready.</h1>
      <div className="circle-state-progress" aria-hidden="true">
        <span />
      </div>
      <span className="sr-only">Loading your Circle workspace</span>
    </main>
  );
}

export function CircleNotFound() {
  return (
    <main className="circle-state circle-not-found">
      <div className="circle-error-code" aria-hidden="true">
        404
      </div>
      <CircleMark />
      <p>Wrong doorway</p>
      <h1>This space is not part of your Circle.</h1>
      <p className="circle-state-copy">
        Return to your workspace or explore the public AL Maleek experience.
      </p>
      <nav aria-label="Circle page not found options">
        <Link className="client-primary-button" href="/">
          Go to my Circle
        </Link>
        <Link href="/community">Open community →</Link>
        <a href={publicSiteUrl}>Visit AL Maleek →</a>
      </nav>
    </main>
  );
}
