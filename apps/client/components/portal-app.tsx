"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState, LoadingDots, PageSkeleton } from "./state-primitives";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getClientApiUrl } from "@/lib/client-api";

const roles = [
  "Creator",
  "Collaborator",
  "Brand partner",
  "Community member",
  "Academy member",
] as const;
type Role = (typeof roles)[number];
type Overlay = "role" | "search" | "notifications" | "account" | null;
const common = [
  ["/", "Today", "⌂"],
  ["/messages", "Messages", "◌"],
  ["/opportunities", "Opportunities", "↗"],
] as const;
const roleLinks: Record<Role, readonly (readonly [string, string, string])[]> =
  {
    Creator: [
      ["/collaborations", "Collaborations", "◇"],
      ["/campaigns", "Campaigns & ads", "◎"],
      ["/earnings", "Earnings", "¤"],
      ["/media-kit", "Media kit", "▤"],
    ],
    Collaborator: [
      ["/collaborations", "My projects", "◇"],
      ["/deliverables", "Deliverables", "✓"],
      ["/files", "Shared files", "▱"],
      ["/earnings", "Payments", "¤"],
    ],
    ["Brand partner"]: [
      ["/campaigns", "Campaigns", "◎"],
      ["/collaborations", "Proposals", "◇"],
      ["/reports", "Reports", "▤"],
      ["/billing", "Billing", "¤"],
    ],
    ["Community member"]: [
      ["/community", "Community", "◈"],
      ["/events", "Events & access", "◫"],
      ["/benefits", "Member benefits", "✦"],
      ["/orders", "Orders", "▱"],
    ],
    ["Academy member"]: [
      ["/academy", "My learning", "▤"],
      ["/sessions", "Live sessions", "◫"],
      ["/community", "Cohort space", "◈"],
      ["/certificates", "Certificates", "✓"],
    ],
  };
const copy: Record<string, [string, string, string]> = {
  home: [
    "Your circle today",
    "Welcome back, Adjoa.",
    "Everything AL Maleek needs from you—and everything waiting for you—in one calm view.",
  ],
  collaborations: [
    "Work together",
    "Collaborations",
    "Briefs, milestones, approvals and conversations for every shared project.",
  ],
  campaigns: [
    "Brand work",
    "Campaigns & ads",
    "Approve creative, share ad permissions and follow performance.",
  ],
  earnings: [
    "Your money",
    "Earnings & payouts",
    "Track cleared earnings, payout details and payment history.",
  ],
  messages: [
    "Stay aligned",
    "Messages",
    "Project conversations and direct updates from the AL Maleek team.",
  ],
  opportunities: [
    "What is open",
    "Opportunities",
    "Invitations, campaign briefs and events matched to your access.",
  ],
  profile: [
    "Your identity",
    "Profile",
    "Keep your personal and collaboration details up to date.",
  ],
  security: [
    "Account protection",
    "Security & access",
    "Manage your password and trusted sessions.",
  ],
  preferences: [
    "Make it yours",
    "Preferences",
    "Choose how your Circle works and what reaches you.",
  ],
  notifications: [
    "Activity centre",
    "Notifications",
    "Review changes across your work, learning, payments and community.",
  ],
};
const routeItems: Record<string, [string, string, string][]> = {
  community: [
    [
      "August member room",
      "A practical conversation about building work that travels.",
      "Thursday",
    ],
    [
      "Creator introductions",
      "Meet 24 new people in this month’s Circle.",
      "Open",
    ],
  ],
  events: [
    ["City Night Live", "Osu · 24 Aug", "Confirmed"],
    ["Campus comedy circuit", "Legon · 3 Sep", "Invited"],
  ],
  academy: [
    ["Creator Business 101", "Module 4 · Pricing your work", "86%"],
    ["Performance Lab", "Live practice room", "Thursday"],
  ],
  sessions: [
    [
      "Building a repeatable content engine",
      "Thursday · 18:00 GMT",
      "Reserved",
    ],
  ],
  certificates: [["Content Systems", "Issued 4 August 2026", "Download"]],
  deliverables: [
    ["City Night social cut", "Due tomorrow", "Needs review"],
    ["Culture Capsule final edit", "Due 21 Aug", "In progress"],
  ],
  files: [
    ["City Night brief v3.pdf", "Updated 12 minutes ago", "4.2 MB"],
    ["Culture Capsule edit.mp4", "Updated 1 hour ago", "86 MB"],
  ],
  reports: [
    ["City Night performance", "Reach, clicks and conversion", "Updated today"],
  ],
  benefits: [["Studio day pass", "One complimentary booking", "Available"]],
  orders: [["Circle annual membership", "Renewal · 14 Jan 2027", "Active"]],
  ["media-kit"]: [
    ["Audience snapshot", "82k combined community reach", "Current"],
    ["Brand assets", "Portraits, biography and logos", "8 files"],
  ],
};

export function PortalApp({ section }: { section: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("Creator");
  const [grantedRoles, setGrantedRoles] = useState<readonly Role[]>([
    "Community member",
  ]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [nav, setNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const popovers = useRef<HTMLDivElement>(null);
  const onboarding = section === "onboarding";
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void (async () => {
        const memberID = new URLSearchParams(window.location.search).get(
          "member",
        );
        if (section === "community" && memberID) {
          const base = getClientApiUrl();
          if (base) {
            const response = await fetch(
              `${base}/api/community/members?id=${encodeURIComponent(memberID)}`,
            );
            if (response.ok) {
              const member = await response.json();
              localStorage.setItem(
                "alm.community.member",
                JSON.stringify(member),
              );
              localStorage.setItem("alm.client.auth", "true");
              const current = JSON.parse(
                localStorage.getItem("alm.client.verifiedRoles") ?? "[]",
              ) as Role[];
              const next = [
                ...new Set([
                  ...current.filter((item) => roles.includes(item)),
                  "Community member" as Role,
                ]),
              ];
              localStorage.setItem("alm.client.role", "Community member");
              localStorage.setItem(
                "alm.client.grantedRoles",
                JSON.stringify(next),
              );
              localStorage.setItem(
                "alm.client.verifiedRoles",
                JSON.stringify(next),
              );
            }
          }
        }
        const grants = JSON.parse(
          localStorage.getItem("alm.client.verifiedRoles") ?? "null",
        ) as Role[] | null;
        const saved = localStorage.getItem("alm.client.role") as Role | null;
        const allowed =
          grants?.filter((item) => roles.includes(item)) ??
          (saved && roles.includes(saved) ? [saved] : ["Community member"]);
        setGrantedRoles(allowed.length ? allowed : ["Community member"]);
        if (saved && allowed.includes(saved)) setRole(saved);
        else setRole(allowed[0]);
        setCollapsed(
          localStorage.getItem("alm.client.sidebar.collapsed") === "true",
        );
        setReady(true);
        if (!onboarding && localStorage.getItem("alm.client.auth") !== "true")
          router.replace("/sign-in");
      })();
    });
    return () => cancelAnimationFrame(frame);
  }, [onboarding, router, section]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlay(null);
        setNav(false);
        setTour(null);
      }
    };
    const away = (e: PointerEvent) => {
      const target = e.target as Element;
      if (overlay === "role" && target.closest(".role-picker")) return;
      if (overlay && !popovers.current?.contains(target)) setOverlay(null);
    };
    addEventListener("keydown", key);
    document.addEventListener("pointerdown", away);
    return () => {
      removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", away);
    };
  }, [overlay]);
  if (!ready) return <PageSkeleton />;
  if (onboarding)
    return (
      <Onboarding
        finish={async (next) => {
          const raw = localStorage.getItem("alm.client.pendingInvite");
          if (raw) {
            const pending = JSON.parse(raw) as { token: string };
            const base = getClientApiUrl();
            if (!base) throw new Error("Invitation service is not configured.");
            const response = await fetch(
              `${base}/api/invitations/${encodeURIComponent(pending.token)}/accept`,
              { method: "POST" },
            );
            if (!response.ok)
              throw new Error(
                "The invitation could not be accepted. Request a fresh link.",
              );
            const existing = JSON.parse(
              localStorage.getItem("alm.client.verifiedRoles") ?? "[]",
            ) as Role[];
            const verified = [
              ...new Set([
                ...existing.filter((item) => roles.includes(item)),
                next,
              ]),
            ];
            localStorage.setItem(
              "alm.client.grantedRoles",
              JSON.stringify(verified),
            );
            localStorage.setItem(
              "alm.client.verifiedRoles",
              JSON.stringify(verified),
            );
            localStorage.removeItem("alm.client.pendingInvite");
          }
          localStorage.setItem("alm.client.auth", "true");
          localStorage.setItem("alm.client.onboarded", "true");
          localStorage.setItem("alm.client.role", next);
          router.replace("/");
        }}
      />
    );
  const activeCopy = copy[section] ?? [
    "Your workspace",
    section.replaceAll("-", " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    "Everything shared with you for this part of your access.",
  ];
  const links = [...common, ...roleLinks[role]];
  const choose = (next: Role) => {
    setRole(next);
    localStorage.setItem("alm.client.role", next);
    setOverlay(null);
  };
  const toggle = () =>
    setCollapsed((v) => {
      localStorage.setItem("alm.client.sidebar.collapsed", String(!v));
      return !v;
    });
  const signOut = () => {
    localStorage.removeItem("alm.client.auth");
    router.replace("/sign-in");
  };
  return (
    <div
      className="portal-shell"
      data-nav={nav ? "open" : "closed"}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <a href="#portal-content" className="portal-skip">
        Skip to workspace
      </a>
      <aside className="portal-sidebar" aria-label="Circle navigation">
        <Link href="/" className="portal-brand">
          <span>
            <Image
              src="/brand/al-maleek-mark.png"
              width={40}
              height={40}
              alt=""
              priority
            />
          </span>
          <b>
            AL MALEEK<small>Circle</small>
          </b>
        </Link>
        <button
          className="mobile-dismiss"
          aria-label="Close navigation"
          onClick={() => setNav(false)}
        >
          ×
        </button>
        <button
          className="client-collapse"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggle}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m12.5 4.5-5 5.5 5 5.5" />
          </svg>
        </button>
        <div className="role-picker">
          <small>Participating as</small>
          <button
            onClick={() => setOverlay(overlay === "role" ? null : "role")}
            aria-expanded={overlay === "role"}
            aria-haspopup="listbox"
          >
            <span>{role.slice(0, 2).toUpperCase()}</span>
            <b>
              {role}
              <small>Switch access view</small>
            </b>
            <i>⌄</i>
          </button>
          {overlay === "role" && (
            <div role="listbox" aria-label="Choose access role">
              {grantedRoles.map((item) => (
                <button
                  key={item}
                  role="option"
                  aria-selected={role === item}
                  onClick={() => choose(item)}
                >
                  <span>{item.slice(0, 2).toUpperCase()}</span>
                  <b>{item}</b>
                  {role === item && <i>✓</i>}
                </button>
              ))}
            </div>
          )}
        </div>
        <nav>
          {links.map(([href, label, icon]) => {
            const active =
              section === "home" ? href === "/" : href === `/${section}`;
            return (
              <Link
                href={href}
                key={href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => setNav(false)}
              >
                <span>{icon}</span>
                <b>{label}</b>
              </Link>
            );
          })}
        </nav>
        <Link href="/messages" className="sidebar-support">
          <span>?</span>
          <div>
            <b>Need a hand?</b>
            <small>Message the Circle team</small>
          </div>
        </Link>
        <Link href="/profile" className="portal-person">
          <span>AN</span>
          <b>
            Adjoa Nartey<small>@adjoanartey</small>
          </b>
          <i>···</i>
        </Link>
      </aside>
      <button
        className="portal-scrim"
        aria-label="Close navigation"
        onClick={() => setNav(false)}
      />
      <main className="portal-main">
        <header className="portal-topbar">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setNav(true)}
          >
            ☰
          </button>
          <div className="access-ribbon">
            <span className="live-pip" />
            <b>{role} access</b>
            <small>Invitation verified · 3 items need you</small>
          </div>
          <div className="portal-tools" ref={popovers}>
            <div>
              <button
                aria-label="Search"
                aria-expanded={overlay === "search"}
                onClick={() =>
                  setOverlay(overlay === "search" ? null : "search")
                }
              >
                ⌕
              </button>
              {overlay === "search" && (
                <Search close={() => setOverlay(null)} />
              )}
            </div>
            <div>
              <button
                aria-label="Notifications, 3 unread"
                aria-expanded={overlay === "notifications"}
                onClick={() =>
                  setOverlay(
                    overlay === "notifications" ? null : "notifications",
                  )
                }
              >
                ◌<i>3</i>
              </button>
              {overlay === "notifications" && (
                <Notices close={() => setOverlay(null)} />
              )}
            </div>
            <div>
              <button
                className="client-account-trigger"
                aria-label="Open account menu"
                aria-expanded={overlay === "account"}
                onClick={() =>
                  setOverlay(overlay === "account" ? null : "account")
                }
              >
                AN<span>Adjoa Nartey</span>
                <i>⌄</i>
              </button>
              {overlay === "account" && (
                <Account
                  close={() => setOverlay(null)}
                  replay={() => {
                    setOverlay(null);
                    setTour(0);
                  }}
                  signOut={signOut}
                />
              )}
            </div>
          </div>
        </header>
        <div className="portal-content" id="portal-content">
          <header className="portal-heading">
            <div>
              <p className="eyebrow">{activeCopy[0]}</p>
              <h1>{activeCopy[1]}</h1>
              <p>{activeCopy[2]}</p>
            </div>
            <Link className="primary-action" href="/messages">
              Ask the team <span>↗</span>
            </Link>
          </header>
          <Section section={section} role={role} />
        </div>
      </main>
      {tour !== null && <Tour step={tour} set={setTour} />}
    </div>
  );
}

function Search({ close }: { close: () => void }) {
  const [q, setQ] = useState("");
  const all = [
    ...common,
    ...roles.flatMap((r) => roleLinks[r]),
    ["/profile", "Profile", "◉"],
    ["/security", "Security", "◇"],
    ["/preferences", "Preferences", "≋"],
  ] as const;
  const found = all
    .filter((x) => x[1].toLowerCase().includes(q.toLowerCase()))
    .filter((x, i, a) => a.findIndex((y) => y[0] === x[0]) === i)
    .slice(0, 7);
  return (
    <section
      className="client-popover client-search"
      role="dialog"
      aria-label="Search Circle"
    >
      <p className="eyebrow">Quick find</p>
      <h2>Where do you want to go?</h2>
      <label>
        <span>⌕</span>
        <input
          data-testid="client-search-input"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your Circle…"
        />
      </label>
      <div>
        {found.map((x) => (
          <Link href={x[0]} key={x[0]} onClick={close}>
            <span>
              {x[2]} {x[1]}
            </span>
            <i>→</i>
          </Link>
        ))}
        {!found.length && (
          <EmptyState
            compact
            title="No matching destination"
            description={`Nothing in your Circle matches “${q}”. Try a role, workspace or account setting.`}
          />
        )}
      </div>
    </section>
  );
}
function Notices({ close }: { close: () => void }) {
  return (
    <section
      className="client-popover client-notifications"
      role="dialog"
      aria-label="Recent notifications"
    >
      <header>
        <div>
          <p className="eyebrow">Live desk</p>
          <h2>Notifications</h2>
        </div>
        <Link href="/notifications" onClick={close}>
          View all
        </Link>
      </header>
      {[
        [
          "/collaborations",
          "Brief ready",
          "City Night Live needs your approval",
        ],
        ["/earnings", "Payment cleared", "GH₵ 4,500 is ready"],
        ["/sessions", "Session reminder", "Content Engine starts Thursday"],
      ].map((x) => (
        <Link href={x[0]} key={x[1]} onClick={close}>
          <i />
          <span>
            <b>{x[1]}</b>
            <small>{x[2]}</small>
          </span>
        </Link>
      ))}
    </section>
  );
}
function Account({
  close,
  replay,
  signOut,
}: {
  close: () => void;
  replay: () => void;
  signOut: () => void;
}) {
  const items = [
    ["/profile", "◉", "My profile", "Identity and collaboration details"],
    ["/security", "◇", "Security", "Password and trusted sessions"],
    ["/preferences", "≋", "Preferences", "Notifications and workspace"],
    ["/notifications", "◌", "Notifications", "Your recent Circle activity"],
  ];
  return (
    <div className="client-popover client-account-menu" role="menu">
      <header>
        <b>Adjoa Nartey</b>
        <span>adjoa@example.com</span>
        <small>Verified Circle member</small>
      </header>
      {items.map((x) => (
        <Link href={x[0]} key={x[0]} role="menuitem" onClick={close}>
          <i>{x[1]}</i>
          <span>
            <b>{x[2]}</b>
            <small>{x[3]}</small>
          </span>
        </Link>
      ))}
      <button role="menuitem" onClick={replay}>
        <i>⌁</i>
        <span>
          <b>Replay onboarding</b>
          <small>Show me around again</small>
        </span>
      </button>
      <button className="client-sign-out" role="menuitem" onClick={signOut}>
        <i>↪</i>
        <span>
          <b>Sign out</b>
          <small>End this Circle session</small>
        </span>
      </button>
    </div>
  );
}
function Onboarding({ finish }: { finish: (role: Role) => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>("Creator");
  const [allowed, setAllowed] = useState<readonly Role[]>(roles);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [identity, setIdentity] = useState({
    name: "Adjoa Nartey",
    email: "adjoa@example.com",
  });
  const [pendingVerified, setPendingVerified] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const frame = requestAnimationFrame(async () => {
      const raw = localStorage.getItem("alm.client.pendingInvite");
      if (!raw) {
        setPendingVerified(null);
        return;
      }
      try {
        const pending = JSON.parse(raw) as { token: string };
        const base = getClientApiUrl();
        if (!base || !pending.token)
          throw new Error("Invitation verification is unavailable.");
        const response = await fetch(
          `${base}/api/invitations/${encodeURIComponent(pending.token)}`,
          { signal: controller.signal },
        );
        if (!response.ok)
          throw new Error("This invitation is no longer valid.");
        const verified = (await response.json()) as {
          name: string;
          email: string;
          role: string;
          status: string;
          expires_at: string;
        };
        const roleMap: Record<string, Role> = {
          creator: "Creator",
          collaborator: "Collaborator",
          brand_partner: "Brand partner",
          community_member: "Community member",
          academy_member: "Academy member",
        };
        const invited = roleMap[verified.role];
        if (
          !invited ||
          verified.status !== "pending" ||
          new Date(verified.expires_at).getTime() <= Date.now()
        )
          throw new Error("This invitation is expired or already accepted.");
        setIdentity({ name: verified.name, email: verified.email });
        setRole(invited);
        setAllowed([invited]);
        setPendingVerified(true);
      } catch {
        if (!controller.signal.aborted) {
          setPendingVerified(false);
          setError(
            "This invitation could not be verified. Open the verified link again.",
          );
        }
      }
    });
    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
    };
  }, []);
  const complete = async () => {
    if (
      localStorage.getItem("alm.client.pendingInvite") &&
      pendingVerified !== true
    ) {
      setError("Verify this invitation before continuing.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await finish(role);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Invitation acceptance failed.",
      );
      setSubmitting(false);
    }
  };
  return (
    <main className="onboarding-page">
      <div className="onboarding-progress" aria-label={`Step ${step + 1} of 4`}>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i <= step ? "active" : ""} />
        ))}
      </div>
      <section className="onboarding-card">
        {step === 0 && (
          <div>
            <span className="onboarding-seal">
              <Image
                src="/brand/al-maleek-mark.png"
                width={62}
                height={62}
                alt="AL Maleek"
              />
            </span>
            <p className="eyebrow">Invitation verified</p>
            <h1>Welcome, {identity.name}.</h1>
            <p>
              Your work, community, learning and payments now have one
              considered home.
            </p>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="eyebrow">Make it yours</p>
            <h1>How should we introduce you?</h1>
            <div className="onboarding-fields">
              <label>
                Display name
                <input key={identity.name} defaultValue={identity.name} />
              </label>
              <label>
                Public handle
                <input key={identity.email} defaultValue={identity.email} />
              </label>
              <label>
                What do you do?
                <textarea defaultValue="Creator and culture storyteller based in Accra." />
              </label>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="eyebrow">Your access</p>
            <h1>Choose your starting view.</h1>
            <p>You can switch between every role granted to you later.</p>
            <div className="onboarding-roles">
              {allowed.map((x) => (
                <button
                  className={role === x ? "selected" : ""}
                  onClick={() => setRole(x)}
                  key={x}
                >
                  <span>{x.slice(0, 2).toUpperCase()}</span>
                  <b>{x}</b>
                  {role === x && <i>✓</i>}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="eyebrow">You are ready</p>
            <h1>Your Circle is open.</h1>
            <p>
              Start with the items that need your attention. Your account tools
              are always in the top-right.
            </p>
            <div className="onboarding-summary">
              <span>✓ Profile ready</span>
              <span>✓ {role} view selected</span>
              <span>✓ Notifications on</span>
            </div>
          </div>
        )}
        <footer>
          {step ? (
            <button onClick={() => setStep((x) => x - 1)}>Back</button>
          ) : (
            <span />
          )}
          {error && (
            <p className="onboarding-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-action"
            disabled={submitting}
            onClick={() =>
              step === 3 ? void complete() : setStep((x) => x + 1)
            }
          >
            {submitting ? (
              <LoadingDots label="Accepting invitation" />
            ) : step === 3 ? (
              "Enter my Circle →"
            ) : (
              "Continue →"
            )}
          </button>
        </footer>
      </section>
    </main>
  );
}
const tourSteps = [
  [
    "Your role passport",
    "Switch between every access view AL Maleek has granted you.",
  ],
  [
    "Everything in reach",
    "The sidebar adapts to collaborations, campaigns, learning or community.",
  ],
  [
    "Your personal desk",
    "Search, activity, security and preferences live in the top-right.",
  ],
];
function Tour({
  step,
  set,
}: {
  step: number;
  set: (value: number | null) => void;
}) {
  return (
    <div className="client-tour" role="dialog" aria-modal="true">
      <article>
        <p>
          Circle tour · {step + 1}/{tourSteps.length}
        </p>
        <h2>{tourSteps[step][0]}</h2>
        <span>{tourSteps[step][1]}</span>
        <footer>
          <button onClick={() => set(null)}>Close</button>
          <button
            className="primary-action"
            onClick={() =>
              step === tourSteps.length - 1 ? set(null) : set(step + 1)
            }
          >
            {step === tourSteps.length - 1 ? "Done" : "Next →"}
          </button>
        </footer>
      </article>
    </div>
  );
}
function Settings({ section }: { section: string }) {
  const [notice, setNotice] = useState("");
  const submit = (text: string) => (e: FormEvent) => {
    e.preventDefault();
    setNotice(text);
  };
  const securitySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get("newPassword") !== values.get("confirmPassword")) {
      setNotice("Passwords do not match.");
      return;
    }
    localStorage.setItem(
      "alm.client.security.lastPasswordChange",
      new Date().toISOString(),
    );
    setNotice("✓ Password updated. Other sessions were signed out.");
    form.reset();
  };
  const preferencesSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    localStorage.setItem(
      "alm.client.preferences",
      JSON.stringify({
        projectActivity: values.has("projectActivity"),
        payments: values.has("payments"),
        community: values.has("community"),
        timezone: String(values.get("timezone")),
      }),
    );
    setNotice("✓ Preferences saved across your devices.");
  };
  if (section === "profile")
    return (
      <>
        <p className="client-toast" role="status">
          {notice}
        </p>
        <form
          className="client-settings-grid"
          onSubmit={submit("✓ Profile changes saved.")}
        >
          <article>
            <span className="settings-avatar">AN</span>
            <h2>Adjoa Nartey</h2>
            <p>Creator and culture storyteller based in Accra.</p>
            <small>Verified Circle member</small>
          </article>
          <section>
            <h2>Profile details</h2>
            <label>
              Display name
              <input defaultValue="Adjoa Nartey" required />
            </label>
            <label>
              Public handle
              <input defaultValue="@adjoanartey" required />
            </label>
            <label>
              About you
              <textarea defaultValue="Creator and culture storyteller based in Accra." />
            </label>
            <button className="primary-action">Save profile</button>
          </section>
        </form>
      </>
    );
  if (section === "security")
    return (
      <>
        <p className="client-toast" role="status">
          {notice}
        </p>
        <form className="client-settings-card" onSubmit={securitySubmit}>
          <h2>Change password</h2>
          <p>Use at least 12 characters. Other sessions will be signed out.</p>
          <label>
            Current password
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            New password
            <input
              name="newPassword"
              type="password"
              minLength={12}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              minLength={12}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="primary-action">Update password</button>
        </form>
      </>
    );
  return (
    <>
      <p className="client-toast" role="status">
        {notice}
      </p>
      <form className="client-settings-card" onSubmit={preferencesSubmit}>
        <h2>Communication and workspace</h2>
        <div className="client-toggle-list">
          {[
            ["Project activity", "Briefs, approvals and messages"],
            ["Payments", "Payout and invoice changes"],
            ["Community and learning", "Events, sessions and member news"],
          ].map((x, index) => (
            <label key={x[0]}>
              <span>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </span>
              <input
                name={["projectActivity", "payments", "community"][index]}
                type="checkbox"
                defaultChecked
              />
            </label>
          ))}
        </div>
        <label>
          Timezone
          <select name="timezone" defaultValue="Africa/Accra">
            <option>Africa/Accra</option>
            <option>Europe/London</option>
          </select>
        </label>
        <button className="primary-action">Save preferences</button>
      </form>
    </>
  );
}
const notificationItems = [
  ["Brief ready", "City Night Live needs your approval", "12 minutes ago"],
  ["Payment cleared", "GH₵ 4,500 is available", "38 minutes ago"],
] as const;
function NotificationsFeed() {
  const [read, setRead] = useState<string[]>([]);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setRead(
        JSON.parse(
          localStorage.getItem("alm.client.notifications.read") ?? "[]",
        ) as string[],
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  const markRead = (title: string) =>
    setRead((current) => {
      const next = current.includes(title) ? current : [...current, title];
      localStorage.setItem(
        "alm.client.notifications.read",
        JSON.stringify(next),
      );
      return next;
    });
  return (
    <div className="client-feed">
      {notificationItems.map((item) => (
        <article
          key={item[0]}
          className={read.includes(item[0]) ? "read" : "unread"}
        >
          <span>✦</span>
          <div>
            <h2>{item[0]}</h2>
            <p>{item[1]}</p>
          </div>
          <time>{item[2]}</time>
          <button
            aria-label={`Mark ${item[0]} read`}
            onClick={() => markRead(item[0])}
          >
            {read.includes(item[0]) ? "Read" : "Mark read"}
          </button>
        </article>
      ))}
    </div>
  );
}
type MemberRecord = {
  name: string;
  email: string;
  tier: "free" | "insider" | "front_row";
  subscription_status: string;
  entitlements: string[];
};
type MembershipPlanRecord = {
  code: "free" | "insider" | "front_row";
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  cta: string;
  benefits: string[];
};
function MemberCommunity() {
  const [member, setMember] = useState<MemberRecord | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setMember(
          JSON.parse(localStorage.getItem("alm.community.member") ?? "null"),
        );
      } catch {
        setMember(null);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const paid =
    member?.subscription_status === "active" && member.tier !== "free";
  const tier =
    member?.tier === "front_row"
      ? "Front Row"
      : member?.tier === "insider"
        ? "Insiders"
        : "Circle Free";
  return (
    <div className="member-hub">
      <article className="membership-pass">
        <p className="eyebrow">Your membership</p>
        <h2>{tier}</h2>
        <p>
          {member ? `${member.name} · ${member.email}` : "Community access"}
        </p>
        <span className="status-pill">
          {member?.subscription_status === "active" ? "Active" : "Free access"}
        </span>
        <Link className="primary-action" href="/benefits">
          {paid ? "Manage membership" : "Upgrade membership"}
        </Link>
      </article>
      <section className="exclusive-grid">
        <article>
          <span>Open</span>
          <h2>Community room</h2>
          <p>
            Introductions, announcements and conversations for every member.
          </p>
        </article>
        <article className={!paid ? "locked" : ""}>
          <span>{paid ? "Unlocked" : "Members only"}</span>
          <h2>Behind the work</h2>
          <p>
            Exclusive stories, recordings and notes from inside the process.
          </p>
          {!paid && <Link href="/benefits">Upgrade to unlock →</Link>}
        </article>
        <article className={member?.tier !== "front_row" ? "locked" : ""}>
          <span>{member?.tier === "front_row" ? "Unlocked" : "Front Row"}</span>
          <h2>Private sessions</h2>
          <p>Priority tickets, intimate rooms and premium experiences.</p>
          {member?.tier !== "front_row" && (
            <Link href="/benefits">See Front Row →</Link>
          )}
        </article>
      </section>
    </div>
  );
}
function MembershipBenefits() {
  const [member, setMember] = useState<MemberRecord | null>(null),
    [plans, setPlans] = useState<MembershipPlanRecord[]>([]),
    [notice, setNotice] = useState(""),
    [changing, setChanging] = useState<string | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setMember(
          JSON.parse(localStorage.getItem("alm.community.member") ?? "null"),
        );
      } catch {
        setMember(null);
      }
      const base = getClientApiUrl();
      if (base)
        fetch(`${base}/api/membership/plans?active=true`)
          .then(async (response) => {
            const body = await response.json();
            if (!response.ok) throw new Error(body.error);
            setPlans(body);
          })
          .catch(() =>
            setNotice("Membership plans are temporarily unavailable."),
          );
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const change = async (tier: "free" | "insider" | "front_row") => {
    if (!member) return;
    setChanging(tier);
    const base = getClientApiUrl();
    if (!base) {
      setNotice("Membership service is not configured.");
      setChanging(null);
      return;
    }
    const response = await fetch(`${base}/api/community/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: member.name, email: member.email, tier }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setNotice(payload?.error ?? "Membership could not be updated.");
      setChanging(null);
      return;
    }
    localStorage.setItem("alm.community.member", JSON.stringify(payload));
    setMember(payload);
    setNotice(
      `✓ ${plans.find((plan) => plan.code === tier)?.name ?? tier} membership is now active.`,
    );
    setChanging(null);
  };
  return (
    <>
      <p className="client-toast" role="status">
        {notice}
      </p>
      <div className="membership-tiers">
        {plans.map((plan) => (
          <article
            key={plan.code}
            className={member?.tier === plan.code ? "current" : ""}
          >
            <p className="eyebrow">
              {member?.tier === plan.code
                ? "Current plan"
                : plan.price_cents === 0
                  ? "Free"
                  : `$${plan.price_cents / 100} / ${plan.interval}`}
            </p>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <button
              className="primary-action"
              disabled={member?.tier === plan.code || changing !== null}
              onClick={() => void change(plan.code)}
            >
              {changing === plan.code ? (
                <LoadingDots label="Updating membership" />
              ) : member?.tier === plan.code ? (
                "Active"
              ) : plan.code === "free" ? (
                "Switch to free"
              ) : (
                plan.cta
              )}
            </button>
          </article>
        ))}
      </div>
      <p className="membership-note">
        Paid-plan activation uses the product’s membership contract. Connect the
        production payment provider before launch so access changes are driven
        by verified payment webhooks.
      </p>
    </>
  );
}
function Section({ section, role }: { section: string; role: Role }) {
  if (["profile", "security", "preferences"].includes(section))
    return <Settings section={section} />;
  if (section === "notifications") return <NotificationsFeed />;
  if (section === "community" && role === "Community member")
    return <MemberCommunity />;
  if (section === "benefits" && role === "Community member")
    return <MembershipBenefits />;
  if (section === "home")
    return (
      <>
        <section className="attention-grid">
          <article className="hero-task">
            <p>Next action</p>
            <span className="task-number">01</span>
            <h2>Review the City Night campaign brief</h2>
            <div>
              <span>Due tomorrow</span>
              <Link href="/collaborations">Open brief →</Link>
            </div>
          </article>
          <article className="money-card">
            <p>Cleared earnings</p>
            <strong>GH₵ 8,450</strong>
            <span>Next payout · 23 Aug</span>
            <Link href="/earnings">View earnings ↗</Link>
          </article>
          <article className="pulse-card">
            <p>Circle pulse</p>
            <div className="pulse-people">
              <span>AM</span>
              <span>KN</span>
              <span>EC</span>
              <span>+8</span>
            </div>
            <h3>11 people active in your projects</h3>
            <Link href="/messages">Join the conversation →</Link>
          </article>
        </section>
        <section className="work-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">In motion</p>
              <h2>Your active work</h2>
            </div>
            <Link href="/collaborations">See all →</Link>
          </div>
          <div className="work-cards">
            <Card
              href="/collaborations"
              tone="mint"
              title="City Night Live campaign"
            />
            <Card
              href="/collaborations"
              tone="lilac"
              title="Culture Capsule film"
            />
            <Card
              href="/opportunities"
              tone="peach"
              title="Campus comedy circuit"
            />
          </div>
        </section>
        <section className="activity-band">
          <div>
            <p className="eyebrow">Your access</p>
            <h2>{role} passport</h2>
          </div>
          {roleLinks[role].slice(0, 3).map((x, i) => (
            <Link href={x[0]} key={x[0]}>
              <span>{x[2]}</span>
              <b>{x[1]}</b>
              <small>{["Ready for you", "2 updates", "All clear"][i]}</small>
            </Link>
          ))}
        </section>
      </>
    );
  if (["collaborations", "campaigns", "opportunities"].includes(section))
    return (
      <div className="workspace-list">
        {[
          ["City Night Live", "Creative approval", "Tomorrow", "mint"],
          ["Culture Capsule", "Edit in progress", "21 Aug", "lilac"],
          ["Campus comedy circuit", "Invitation received", "24 Aug", "peach"],
        ].map((x) => (
          <article key={x[0]} className={x[3]}>
            <span className="project-code">
              {x[0]
                .split(" ")
                .map((v) => v[0])
                .join("")}
            </span>
            <div>
              <small>{x[1]}</small>
              <h2>{x[0]}</h2>
              <p>AL Maleek × {role} · Brief, files, milestones and messages</p>
            </div>
            <time>{x[2]}</time>
            <Link href="/messages">Open workspace ↗</Link>
          </article>
        ))}
      </div>
    );
  if (["earnings", "billing"].includes(section))
    return (
      <>
        <section className="finance-hero">
          <div>
            <p className="eyebrow">Available balance</p>
            <strong>GH₵ 8,450.00</strong>
            <span>Bank ending 2048 · Payouts verified</span>
          </div>
          <Link className="primary-action" href="/profile">
            Manage payout
          </Link>
        </section>
        <div className="transaction-list">
          {[
            ["City Night Live", "GH₵ 4,500", "Cleared"],
            ["Culture Capsule", "GH₵ 2,750", "Pending"],
          ].map((x) => (
            <article key={x[0]}>
              <span>¤</span>
              <div>
                <b>{x[0]}</b>
                <small>Campaign milestone</small>
              </div>
              <strong>{x[1]}</strong>
              <i>{x[2]}</i>
            </article>
          ))}
        </div>
      </>
    );
  const items = routeItems[section] ?? [
    [
      "Your access is ready",
      `New ${section.replaceAll("-", " ")} activity will appear here.`,
      "All clear",
    ],
  ];
  return (
    <div className="client-feed">
      {items.map((x) => (
        <article key={x[0]}>
          <span>✦</span>
          <div>
            <h2>{x[0]}</h2>
            <p>{x[1]}</p>
          </div>
          <time>{x[2]}</time>
          <Link href="/messages">Open →</Link>
        </article>
      ))}
    </div>
  );
}
function Card({
  href,
  tone,
  title,
}: {
  href: string;
  tone: string;
  title: string;
}) {
  return (
    <Link href={href} className={tone}>
      <div>
        <span>In motion</span>
        <i>↗</i>
      </div>
      <h3>{title}</h3>
      <p>Brief, files and milestones</p>
      <footer>
        <div>
          <i style={{ width: "68%" }} />
        </div>
        <b>68%</b>
      </footer>
    </Link>
  );
}
