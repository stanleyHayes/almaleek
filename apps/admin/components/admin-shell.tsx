"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { EmptyState } from "./state-primitives";

const groups = [
  { label: "Workspace", items: [{ href: "/", label: "Overview", icon: "⌂" }] },
  {
    label: "Audience",
    items: [
      { href: "/community", label: "Community", icon: "◎" },
      { href: "/creators", label: "Creators", icon: "◇" },
      { href: "/academy-members", label: "Academy members", icon: "◈" },
    ],
  },
  {
    label: "Publish",
    items: [
      { href: "/content", label: "Content studio", icon: "▤" },
      { href: "/events", label: "Events & tickets", icon: "◫" },
      { href: "/shop", label: "Shop & orders", icon: "▱" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/plans", label: "Membership plans", icon: "◒" },
      { href: "/partnerships", label: "Partnerships", icon: "↗" },
      { href: "/payments", label: "Payments", icon: "¤" },
    ],
  },
  {
    label: "Access",
    items: [
      { href: "/users", label: "Users & roles", icon: "♙" },
      { href: "/permissions", label: "Permissions", icon: "⌾" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Brand profile", icon: "◉" },
      { href: "/security", label: "Security", icon: "◇" },
      { href: "/preferences", label: "Preferences", icon: "≋" },
      { href: "/settings", label: "Settings", icon: "⚙" },
    ],
  },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsUnread, setNotificationsUnread] = useState(3);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setCollapsed(
        window.localStorage.getItem("alm.admin.sidebar.collapsed") === "true",
      ),
    );
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setNotificationsOpen(false);
        setAccountOpen(false);
        setSearchOpen(false);
        setTourOpen(false);
      }
    };
    const dismissPopovers = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".topbar-popover-root")) {
        setNotificationsOpen(false);
        setAccountOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    document.addEventListener("pointerdown", dismissPopovers);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", dismissPopovers);
    };
  }, []);
  useEffect(() => {
    if (pathname === "/sign-in") return;
    const controller = new AbortController();
    fetch("/api/admin/session", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) =>
        response.ok ? response.json() : { authenticated: false },
      )
      .then((body) => {
        if (!body.authenticated) router.replace("/sign-in");
      })
      // StrictMode double-mount aborts the first effect's fetch — that abort
      // is expected cleanup, not a failed session check.
      .catch((reason) => {
        if (reason?.name !== "AbortError") router.replace("/sign-in");
      });
    return () => controller.abort();
  }, [pathname, router]);

  const toggleCollapsed = () =>
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("alm.admin.sidebar.collapsed", String(next));
      return next;
    });

  if (pathname === "/sign-in") return <>{children}</>;

  return (
    <div
      className="admin-shell"
      data-mobile-nav={mobileOpen ? "open" : "closed"}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <a className="admin-skip" href="#admin-content">
        Skip to workspace
      </a>
      <aside className="sidebar" aria-label="Administration">
        <div className="sidebar-brand-row">
          <Link
            href="/"
            className="brand-block"
            aria-label="AL Maleek dashboard"
            onClick={() => setMobileOpen(false)}
          >
            <span className="brand-glyph">
              <Image
                src="/brand/al-maleek-mark.png"
                width={38}
                height={38}
                alt=""
                priority
              />
            </span>
            <span>
              AL MALEEK<small>Studio OS</small>
            </span>
          </Link>
          <button
            className="mobile-close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
        </div>
        <button
          className="collapse-button"
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleCollapsed}
        >
          <span className="collapse-chevron" aria-hidden="true" />
        </button>
        <div className="workspace-chip">
          <span>Workspace</span>
          <strong>AL Maleek ecosystem</strong>
          <small>Production view</small>
        </div>
        <nav className="nav-list" aria-label="Administration">
          {groups.map((group) => (
            <section className="nav-group" key={group.label}>
              <p className="nav-heading">{group.label}</p>
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {active && <i>•</i>}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
        <Link
          href="/profile"
          className="sidebar-account"
          onClick={() => setMobileOpen(false)}
        >
          <span className="avatar">HS</span>
          <span>
            <strong>Hayford Stanley</strong>
            <small>Super admin</small>
          </span>
          <b>···</b>
        </Link>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="admin-stage">
        <header className="admin-topbar">
          <button
            className="menu-button"
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <div>
            <strong>Operations workspace</strong>
            <span>
              <i className="live-dot" /> All systems operational
            </span>
          </div>
          <div className="admin-tools">
            <div className="topbar-popover-root">
              <button
                type="button"
                className="icon-button"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen((value) => !value);
                  setNotificationsOpen(false);
                  setAccountOpen(false);
                }}
              >
                ⌕
              </button>
              {searchOpen && (
                <SearchPopover onClose={() => setSearchOpen(false)} />
              )}
            </div>
            <div className="topbar-popover-root">
              <button
                type="button"
                className="icon-button notification-trigger"
                aria-label={`Notifications, ${notificationsUnread} unread`}
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setAccountOpen(false);
                }}
              >
                <span aria-hidden="true">◌</span>
                {notificationsUnread > 0 && <b>{notificationsUnread}</b>}
              </button>
              {notificationsOpen && (
                <NotificationsPopover
                  onClose={() => setNotificationsOpen(false)}
                  onMarkAll={() => setNotificationsUnread(0)}
                />
              )}
            </div>
            <div className="topbar-popover-root">
              <button
                type="button"
                className="account-trigger"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                onClick={() => {
                  setAccountOpen((value) => !value);
                  setNotificationsOpen(false);
                }}
              >
                <span className="avatar">HS</span>
                <span>
                  <strong>Hayford Stanley</strong>
                  <small>Super admin</small>
                </span>
                <b>⌄</b>
              </button>
              {accountOpen && (
                <AccountMenu
                  onClose={() => setAccountOpen(false)}
                  onTour={() => {
                    setAccountOpen(false);
                    setTourStep(0);
                    setTourOpen(true);
                  }}
                  onSignOut={async () => {
                    await fetch("/api/admin/session", { method: "DELETE" });
                    setAccountOpen(false);
                    router.replace("/sign-in");
                  }}
                />
              )}
            </div>
          </div>
        </header>
        <main className="content-panel" id="admin-content">
          {children}
        </main>
      </div>
      {tourOpen && (
        <AdminTour
          step={tourStep}
          onStep={setTourStep}
          onClose={() => setTourOpen(false)}
        />
      )}
    </div>
  );
}

function NotificationsPopover({
  onClose,
  onMarkAll,
}: {
  onClose: () => void;
  onMarkAll: () => void;
}) {
  const items = [
    {
      href: "/payments",
      title: "Payment settled",
      text: "GH₵ 4,850 from City Night Live",
      time: "12m",
    },
    {
      href: "/community",
      title: "11 new join requests",
      text: "Insiders applications need review",
      time: "38m",
    },
    {
      href: "/academy-members",
      title: "Academy cohort updated",
      text: "Three learners completed Module 4",
      time: "2h",
    },
  ];
  return (
    <section
      className="topbar-popover notifications-popover"
      role="dialog"
      aria-label="Notifications"
    >
      <header>
        <div>
          <p>Live desk</p>
          <h2>Notifications</h2>
        </div>
        <button type="button" onClick={onMarkAll}>
          Mark all read
        </button>
      </header>
      <div className="notification-feed">
        {items.map((item) => (
          <Link key={item.title} href={item.href} onClick={onClose}>
            <i />
            <span>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
              <time>{item.time} ago</time>
            </span>
          </Link>
        ))}
      </div>
      <footer>
        <Link href="/notifications" onClick={onClose}>
          View activity centre →
        </Link>
      </footer>
    </section>
  );
}

function AccountMenu({
  onClose,
  onTour,
  onSignOut,
}: {
  onClose: () => void;
  onTour: () => void;
  onSignOut: () => void;
}) {
  const items = [
    ["/profile", "◉", "My profile", "Brand and account details"],
    ["/security", "◇", "Security & MFA", "Password and authenticator"],
    ["/preferences", "≋", "Preferences", "Alerts and workspace density"],
    ["/users", "♙", "Users & roles", "Invite and manage staff"],
  ] as const;
  return (
    <div className="topbar-popover account-menu" role="menu">
      <div className="account-identity">
        <strong>Hayford Stanley</strong>
        <span>hayfordstanley@gmail.com</span>
        <small>Super admin</small>
      </div>
      <div className="account-menu-items">
        {items.map(([href, icon, title, sub]) => (
          <Link key={href} href={href} role="menuitem" onClick={onClose}>
            <i>{icon}</i>
            <span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </span>
          </Link>
        ))}
        <button type="button" role="menuitem" onClick={onTour}>
          <i>⌁</i>
          <span>
            <strong>Replay onboarding</strong>
            <small>Show me around again</small>
          </span>
        </button>
      </div>
      <button
        className="sign-out"
        type="button"
        role="menuitem"
        onClick={onSignOut}
      >
        <i>↪</i>
        <span>
          <strong>Sign out</strong>
          <small>End this protected session</small>
        </span>
      </button>
    </div>
  );
}

function SearchPopover({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const destinations = [
    ["Users & roles", "/users"],
    ["Academy members", "/academy-members"],
    ["Payments", "/payments"],
    ["Events & tickets", "/events"],
    ["Brand profile", "/profile"],
    ["Security & MFA", "/security"],
    ["Preferences", "/preferences"],
  ];
  const matches = destinations.filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section
      className="topbar-popover search-popover"
      role="dialog"
      aria-label="Search admin"
    >
      <header>
        <p className="eyebrow">Quick find</p>
        <h2>Go anywhere</h2>
        <label>
          <span>⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, payments, settings…"
            aria-label="Search workspace"
          />
        </label>
      </header>
      <div>
        {matches.map(([name, href]) => (
          <Link href={href} key={href} onClick={onClose}>
            <span>{name}</span>
            <i>→</i>
          </Link>
        ))}
        {matches.length === 0 && (
          <EmptyState
            compact
            title="No matching workspace"
            description={`Nothing in Studio OS matches “${query}”. Try a module, person or setting.`}
          />
        )}
      </div>
    </section>
  );
}

const tourSteps = [
  [
    "Welcome to Studio OS",
    "Publish the brand, run live experiences, manage members, and keep business operations in one place.",
  ],
  [
    "Your navigation",
    "The grouped sidebar keeps Audience, Publish, Business, Access, and Account tools available everywhere.",
  ],
  [
    "Your account controls",
    "Profile, security, preferences, notifications, team access, and this tutorial live in the top-right corner.",
  ],
  [
    "People and permissions",
    "Invite staff, assign roles, review permissions, and manage Academy and community members.",
  ],
  [
    "Money and activity",
    "Payments and notifications connect revenue events to the workspaces where your team can act.",
  ],
];
function AdminTour({
  step,
  onStep,
  onClose,
}: {
  step: number;
  onStep: (step: number) => void;
  onClose: () => void;
}) {
  const [title, body] = tourSteps[step];
  const last = step === tourSteps.length - 1;
  return (
    <div
      className="tour-root"
      role="dialog"
      aria-modal="true"
      aria-label="Admin onboarding tutorial"
    >
      <div className="tour-card">
        <p>
          Step {step + 1} of {tourSteps.length}
        </p>
        <h2>{title}</h2>
        <span>{body}</span>
        <div>
          <button type="button" onClick={onClose}>
            Skip
          </button>
          <span>
            <button
              type="button"
              disabled={step === 0}
              onClick={() => onStep(Math.max(0, step - 1))}
            >
              Back
            </button>
            <button
              className="tour-next"
              type="button"
              onClick={() => (last ? onClose() : onStep(step + 1))}
            >
              {last ? "Done" : "Next"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
