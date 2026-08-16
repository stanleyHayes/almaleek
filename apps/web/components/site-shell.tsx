"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { InlineSkeleton } from "./state-primitives";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events/live", label: "Live" },
  { href: "/community", label: "Community" },
  { href: "/media", label: "Media" },
];

type SiteSettings = {
  footer_description: string;
  contact_email: string;
  location: string;
  social_profiles: Array<{
    platform: string;
    handle: string;
    url: string;
    audience: string;
  }>;
};

export function SocialIcon({ platform }: { platform: string }) {
  const common = {
    className: "social-icon",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (platform) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.4" cy="6.7" r=".7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 4v10.2a4.2 4.2 0 1 1-3.4-4.1" />
          <path d="M14 4c.8 2.5 2.4 4 5 4.5" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21 8.2a3 3 0 0 0-2.1-2.1C17.1 5.6 12 5.6 12 5.6s-5.1 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.8.5 6.9.5 6.9.5s5.1 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8Z" />
          <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M5 4l14 16M19 4 5 20" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 21v-8h3l.5-3H14V8.3c0-1 .4-1.8 1.9-1.8H18V3.8c-.6-.1-1.6-.3-2.8-.3-2.8 0-4.7 1.7-4.7 4.8V10H8v3h2.5v8" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="9" width="4" height="12" />
          <circle cx="5" cy="5" r="2" />
          <path d="M11 21V9h4v2c1-1.5 2.5-2.4 4.2-2 1.8.4 2.8 1.8 2.8 4.5V21h-4v-6.5c0-1.5-.5-2.5-1.8-2.5-1.4 0-2.2 1-2.2 3v6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      );
  }
}

function Icon({
  name,
}: {
  name:
    "arrow" | "calendar" | "people" | "play" | "bag" | "book" | "mail" | "pin";
}) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4m8-4v4M3 10h18" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6m0-5c3 0 5 1.5 6 4" />
      </>
    ),
    play: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="4" />
        <path d="m10 9 5 3-5 3Z" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l-1 13H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    book: (
      <>
        <path d="M4 5a4 4 0 0 1 4-2h4v17H8a4 4 0 0 0-4 2V5Zm16 0a4 4 0 0 0-4-2h-4v17h4a4 4 0 0 1 4 2V5Z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  };
  return (
    <svg
      className="line-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${getApiBaseUrl()}/api/site/settings`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => body && setSettings(body))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const clientUrl =
    process.env.NEXT_PUBLIC_CLIENT_URL ??
    (process.env.NEXT_PUBLIC_APP_ENV === "production"
      ? "https://circle.almaleek.com"
      : "http://localhost:3102");
  return (
    <>
      <header className="topbar">
        <div className="container nav-wrap">
          <Link href="/" className="brand" aria-label="AL Maleek home">
            <span className="brand-mark">
              <Image
                src="/brand/al-maleek-mark.png"
                width={38}
                height={38}
                alt=""
                priority
              />
            </span>
            <span>
              AL MALEEK<small>Culture in motion</small>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            {primaryLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="nav-actions">
            <a href={`${clientUrl}/sign-in`} className="nav-portal">
              Circle sign in
            </a>
            <Link href="/community" className="button button-primary nav-cta">
              Join the community
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="footer">
        <div className="container">
          <section className="footer-lead">
            <div>
              <div className="brand brand-footer">
                <span className="brand-mark">
                  <Image
                    src="/brand/al-maleek-mark.png"
                    width={38}
                    height={38}
                    alt=""
                  />
                </span>
                <span>AL MALEEK</span>
              </div>
              <h2>Stay close to what moves culture.</h2>
            </div>
            <Link className="footer-join" href="/community">
              <span>
                <Icon name="people" />
              </span>
              <div>
                <small>Community access</small>
                <strong>Join the inner circle</strong>
              </div>
              <Icon name="arrow" />
            </Link>
          </section>
          <div className="footer-grid">
            <div className="footer-intro">
              <p>
                {settings?.footer_description ?? (
                  <InlineSkeleton width="19rem" />
                )}
              </p>
              <div className="social-row">
                {settings?.social_profiles.map((profile) => (
                  <a
                    href={profile.url}
                    key={profile.platform}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${profile.platform} · ${profile.handle}`}
                    title={`${profile.handle} · ${profile.audience}`}
                  >
                    <SocialIcon platform={profile.platform} />
                  </a>
                ))}
                {!settings && (
                  <>
                    <InlineSkeleton width="44px" />
                    <InlineSkeleton width="44px" />
                    <InlineSkeleton width="44px" />
                  </>
                )}
              </div>
            </div>
            <div>
              <h4>Experience</h4>
              <ul>
                <li>
                  <Link href="/about">
                    <Icon name="people" />
                    About AL Maleek
                  </Link>
                </li>
                <li>
                  <Link href="/events/live">
                    <Icon name="calendar" />
                    Live events
                  </Link>
                </li>
                <li>
                  <Link href="/media">
                    <Icon name="play" />
                    Media & stories
                  </Link>
                </li>
                <li>
                  <Link href="/community">
                    <Icon name="people" />
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Build</h4>
              <ul>
                <li>
                  <Link href="/shop">
                    <Icon name="bag" />
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/academy">
                    <Icon name="book" />
                    Academy
                  </Link>
                </li>
                <li>
                  <Link href="/partnerships">
                    <Icon name="arrow" />
                    Partnerships
                  </Link>
                </li>
                <li>
                  <Link href="/work-with-al-maleek">
                    <Icon name="arrow" />
                    Work with us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Find us</h4>
              <ul>
                <li>
                  <a href={`${clientUrl}/sign-in`}>
                    <Icon name="people" />
                    Circle sign in
                  </a>
                </li>
                <li>
                  {settings ? (
                    <a href={`mailto:${settings.contact_email}`}>
                      <Icon name="mail" />
                      {settings.contact_email}
                    </a>
                  ) : (
                    <span>
                      <Icon name="mail" />
                      <InlineSkeleton width="9rem" />
                    </span>
                  )}
                </li>
                <li>
                  <span>
                    <Icon name="pin" />
                    {settings?.location ?? <InlineSkeleton width="7rem" />}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-note">
            <span>© 2026 AL Maleek</span>
            <span>Made for culture, community, creativity & opportunity.</span>
            <span>
              <Link href="/privacy">Privacy</Link> ·{" "}
              <Link href="/terms">Terms</Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
