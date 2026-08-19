"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { InlineSkeleton } from "./state-primitives";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events/live", label: "Live" },
  { href: "/community", label: "Community" },
  { href: "/media", label: "Media" },
];

/* Lower-frequency pages that sit behind the desktop "More" dropdown. */
const moreLinks = [
  {
    href: "/shop",
    label: "Shop",
    description: "Merch, drops & digital goods",
    icon: "bag",
  },
  {
    href: "/academy",
    label: "Academy",
    description: "Learn the craft & the business",
    icon: "book",
  },
  {
    href: "/partnerships",
    label: "Partnerships",
    description: "Brand collaborations that fit",
    icon: "arrow",
  },
  {
    href: "/work-with-al-maleek",
    label: "Work with us",
    description: "Bookings, skits & campaigns",
    icon: "mail",
  },
] as const;

function linkIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop-only "More" menu holding the lower-frequency pages (patterned on
 * the Joe Kuntani header groups). Pointer users get hover; keyboard and touch
 * users get the click toggle; Escape and outside pointer close it. The
 * trigger announces `aria-current="true"` while a child page is active.
 */
function NavDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  /* True while the pointer is hovering — a click in that state pins the menu
     open instead of toggling the hover state straight back off. */
  const hoverOpen = useRef(false);
  const childActive = moreLinks.some((link) => linkIsActive(pathname, link.href));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="nav-dropdown-wrap"
      onMouseEnter={() => {
        hoverOpen.current = true;
        setOpen(true);
      }}
      onMouseLeave={() => {
        hoverOpen.current = false;
        setOpen(false);
      }}
    >
      <button
        type="button"
        className={`nav-link nav-trigger${childActive ? " active" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={childActive ? "true" : undefined}
        onClick={() => {
          if (hoverOpen.current) {
            hoverOpen.current = false;
            return;
          }
          setOpen((value) => !value);
        }}
      >
        More
        <svg
          aria-hidden="true"
          className="nav-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul className="nav-dropdown" data-open={open} aria-label="More pages">
        {moreLinks.map((link) => {
          const active = linkIsActive(pathname, link.href);
          const titleID = `nav-more-${link.label.toLowerCase().replace(/[^a-z]+/g, "-")}-title`;
          const descriptionID = `${titleID}-description`;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nav-dropdown-link"
                aria-labelledby={titleID}
                aria-describedby={descriptionID}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="nav-dropdown-icon" aria-hidden="true">
                  <Icon name={link.icon} />
                </span>
                <span className="nav-dropdown-copy">
                  <span className="nav-dropdown-title" id={titleID}>
                    {link.label}
                  </span>
                  <span className="nav-dropdown-desc" id={descriptionID}>
                    {link.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* Footer link with active-route indication, mirroring the main nav. */
function FooterNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ComponentProps<typeof Icon>["name"];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = linkIsActive(pathname, href);
  return (
    <Link
      href={href}
      className={active ? "active" : undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon name={icon} />
      {children}
    </Link>
  );
}

/* Route icons for the mobile drawer, keyed by top-level path segment. */
const MENU_ICONS: Record<string, ReactNode> = {
  "": (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.75v.5" />
    </>
  ),
  events: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  community: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6m0-5c3 0 5 1.5 6 4" />
    </>
  ),
  media: (
    <>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5z" />
      <path d="m4 12.5 8 4.25 8-4.25" />
      <path d="m4 17 8 4.25L20 17" />
    </>
  ),
  shop: (
    <>
      <path d="M5 8h14l-1.2 12.5H6.2z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
};

const MENU_FALLBACK_ICON = <path d="m12 4 8 8-8 8-8-8z" />;

/** Always `aria-hidden` — the adjacent text label carries the accessible name. */
function MenuNavIcon({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const segment = href.replace(/^\/+/, "").split("/")[0]?.toLowerCase() ?? "";
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {MENU_ICONS[segment] ?? MENU_FALLBACK_ICON}
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {open ? (
        <>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="6" cy="6" r="1.6" fill="currentColor" />
          <circle cx="12" cy="6" r="1.6" fill="currentColor" />
          <circle cx="18" cy="6" r="1.6" fill="currentColor" />
          <circle cx="6" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="18" cy="12" r="1.6" fill="currentColor" />
          <circle cx="6" cy="18" r="1.6" fill="currentColor" />
          <circle cx="12" cy="18" r="1.6" fill="currentColor" />
          <circle cx="18" cy="18" r="1.6" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

/**
 * Full-screen mobile menu laid out as a bracketed tile grid (patterned on the
 * Joe Kuntani shell). Focus trap, body scroll lock and Escape-to-close. The
 * index number and icon inside each tile are `aria-hidden` so the link's
 * accessible name stays the bare label.
 */
function SiteMobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="site-menu"
    >
      <div className="site-menu-glow" aria-hidden="true" />
      <div className="site-menu-top">
        <Link
          href="/"
          className="brand"
          aria-label="AL Maleek home"
          onClick={onClose}
        >
          <span className="brand-mark">
            <Image
              src="/brand/al-maleek-mark.png"
              width={38}
              height={38}
              alt=""
            />
          </span>
          <span>
            AL MALEEK<small>Ghanaian comedy in motion</small>
          </span>
        </Link>
        <button
          ref={closeRef}
          type="button"
          className="site-menu-close"
          aria-label="Close menu"
          onClick={onClose}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile navigation" className="site-menu-nav">
        <ul className="site-menu-grid">
          {primaryLinks.map((link, index) => {
            const active = linkIsActive(pathname, link.href);
            return (
              <li key={link.href} className="site-menu-cell">
                <Link
                  className="site-menu-tile"
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  data-active={active ? "true" : "false"}
                  onClick={onClose}
                >
                  <span className="site-menu-corners" aria-hidden="true" />
                  <span className="site-menu-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <MenuNavIcon href={link.href} className="site-menu-icon" />
                  <span className="site-menu-label">{link.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="site-menu-cell site-menu-cta-cell">
            <Link
              className="site-menu-cta-tile"
              href="/community"
              onClick={onClose}
            >
              <span className="site-menu-corners" aria-hidden="true" />
              <span className="site-menu-index" aria-hidden="true">
                {String(primaryLinks.length + 1).padStart(2, "0")}
              </span>
              <MenuNavIcon href="/community" className="site-menu-icon" />
              <span className="site-menu-cta-label">Join the community</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

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

/**
 * Thumb-reach tab bar on small screens (patterned on the Joe Kuntani bottom
 * nav): two shortcuts either side of a centered join action. Docks flush to
 * the screen edges when the footer scrolls into view.
 */
const BOTTOM_NAV_LEAD = [
  { href: "/", label: "Home" },
  { href: "/events/live", label: "Live" },
];
const BOTTOM_NAV_TRAIL = [
  { href: "/media", label: "Media" },
  { href: "/shop", label: "Shop" },
];

function MobileBottomNav({ pathname }: { pathname: string }) {
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const footer = document.querySelector(".footer");
    if (!footer || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setDocked(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  const joinActive = linkIsActive(pathname, "/community");
  const renderTab = (link: { href: string; label: string }) => {
    const active = linkIsActive(pathname, link.href);
    return (
      <li key={link.href} className="bottom-nav-item">
        <Link
          href={link.href}
          className="bottom-nav-link"
          aria-current={active ? "page" : undefined}
          data-active={active ? "true" : "false"}
        >
          <MenuNavIcon href={link.href} className="bottom-nav-icon" />
          <span className="bottom-nav-label">{link.label}</span>
        </Link>
      </li>
    );
  };
  return (
    <nav
      className="bottom-nav"
      aria-label="Quick navigation"
      data-docked={docked ? "true" : "false"}
    >
      <ul className="bottom-nav-list">
        {BOTTOM_NAV_LEAD.map(renderTab)}
        <li className="bottom-nav-item">
          <Link
            href="/community"
            className="bottom-nav-action"
            aria-current={joinActive ? "page" : undefined}
            data-active={joinActive ? "true" : "false"}
          >
            <MenuNavIcon href="/community" className="bottom-nav-icon" />
            <span className="bottom-nav-label">Join</span>
          </Link>
        </li>
        {BOTTOM_NAV_TRAIL.map(renderTab)}
      </ul>
    </nav>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollFrame = useRef<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${getApiBaseUrl()}/api/site/settings`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => body && setSettings(body))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  /* Docked full-width at the top of the page; morphs into the floating pill
     once the page scrolls (patterned on the Joe Kuntani header). */
  useEffect(() => {
    const update = () => {
      scrollFrame.current = null;
      setScrolled(window.scrollY > 48);
    };
    const onScroll = () => {
      if (scrollFrame.current !== null) return;
      scrollFrame.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      if (scrollFrame.current !== null)
        cancelAnimationFrame(scrollFrame.current);
      // StrictMode re-runs this effect: without resetting the ref, the remount
      // sees a stale frame id and never schedules again.
      scrollFrame.current = null;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const clientUrl =
    process.env.NEXT_PUBLIC_CLIENT_URL ??
    (process.env.NEXT_PUBLIC_APP_ENV === "production"
      ? "https://circle.almaleek.com"
      : "http://localhost:3102");
  return (
    <>
      <header
        className="topbar"
        data-nav-state={scrolled ? "floating" : "docked"}
      >
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
              AL MALEEK<small>Ghanaian comedy in motion</small>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            {primaryLinks.map((link) => {
              const active = linkIsActive(pathname, link.href);
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
            <NavDropdown pathname={pathname} />
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              className="nav-menu-button"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon open={menuOpen} />
            </button>
            <a
              href={`${clientUrl}/sign-in`}
              className="button button-primary nav-cta"
              target="_blank"
              rel="noreferrer"
            >
              Circle sign in
            </a>
          </div>
        </div>
      </header>
      <SiteMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
      <MobileBottomNav pathname={pathname} />
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
                  <FooterNavLink href="/about" icon="people">
                    About AL Maleek
                  </FooterNavLink>
                </li>
                <li>
                  <FooterNavLink href="/events/live" icon="calendar">
                    Live events
                  </FooterNavLink>
                </li>
                <li>
                  <FooterNavLink href="/media" icon="play">
                    Media & stories
                  </FooterNavLink>
                </li>
                <li>
                  <FooterNavLink href="/community" icon="people">
                    Community
                  </FooterNavLink>
                </li>
              </ul>
            </div>
            <div>
              <h4>Build</h4>
              <ul>
                <li>
                  <FooterNavLink href="/shop" icon="bag">
                    Shop
                  </FooterNavLink>
                </li>
                <li>
                  <FooterNavLink href="/academy" icon="book">
                    Academy
                  </FooterNavLink>
                </li>
                <li>
                  <FooterNavLink href="/partnerships" icon="arrow">
                    Partnerships
                  </FooterNavLink>
                </li>
                <li>
                  <FooterNavLink href="/work-with-al-maleek" icon="arrow">
                    Work with us
                  </FooterNavLink>
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
            <span>Made in Accra for comedy, community & culture.</span>
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
