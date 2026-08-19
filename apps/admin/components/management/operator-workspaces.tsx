"use client";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { EmptyState, LoadingDots, PageSkeleton } from "../state-primitives";

type Intake = {
  id: string;
  kind: string;
  name: string;
  email: string;
  created_at: string;
};
type Member = {
  id: string;
  name: string;
  email: string;
  tier: string;
  membership_status: string;
  subscription_status: string;
  created_at: string;
};
type Story = { title: string; type: string; status: string };
const clientUrl =
  process.env.NEXT_PUBLIC_CLIENT_URL ??
  (process.env.NEXT_PUBLIC_APP_ENV === "production"
    ? "https://circle.almaleek.com"
    : "http://localhost:3102");
const save = (key: string, value: unknown) =>
  localStorage.setItem(key, JSON.stringify(value));
function Notice({ text }: { text: string }) {
  return text ? (
    <div className="workspace-toast" role="status">
      <span>✓</span>
      {text}
    </div>
  ) : null;
}
function Drawer({
  title,
  close,
  submit,
  children,
  pending = false,
}: {
  title: string;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  pending?: boolean;
}) {
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [close]);
  return (
    <div
      className="drawer-root"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="drawer-scrim"
        aria-label="Close dialog"
        onClick={close}
      />
      <aside className="form-drawer">
        <header>
          <div>
            <p className="eyebrow">Workspace action</p>
            <h2>{title}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={close}>
            ×
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="drawer-section">
            <span ref={first} tabIndex={-1} />
            {children}
          </div>
          <footer>
            <button
              type="button"
              className="button button-soft"
              onClick={close}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={pending}
            >
              {pending ? <LoadingDots label="Saving" /> : "Save"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}

export function CommunityOperations() {
  const [items, setItems] = useState<Intake[]>([]),
    [members, setMembers] = useState<Member[]>([]),
    [open, setOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [invite, setInvite] = useState(""),
    [inviting, setInviting] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    Promise.all([
      fetch("/api/admin/intakes", { signal: c.signal }),
      fetch("/api/admin/community-members", { signal: c.signal }),
    ])
      .then(async ([intakes, membersResponse]) => {
        if (!intakes.ok || !membersResponse.ok)
          throw new Error("Unable to load live community records");
        return Promise.all([intakes.json(), membersResponse.json()]);
      })
      .then(([nextItems, nextMembers]) => {
        setItems(nextItems);
        setMembers(nextMembers);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setNotice(
            e instanceof Error
              ? e.message
              : "Live community service is unavailable.",
          );
      });
    return () => c.abort();
  }, []);
  const exportCsv = () => {
    const blob = new Blob(
      [
        "Name,Email,Kind\n" +
          items.map((x) => `${x.name},${x.email},${x.kind}`).join("\n"),
      ],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "community-intakes.csv";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Live intake report exported.");
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setInviting(true);
    try {
      const r = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.get("name"),
          email: d.get("email"),
          role: d.get("role"),
        }),
      });
      const record = await r.json();
      if (!r.ok) throw new Error(record.error || "Unable to create invitation");
      setInvite(`${clientUrl}/invite/${record.token}`);
      setNotice(
        `Invitation created for ${record.name}; expires ${new Date(record.expires_at).toLocaleDateString()}.`,
      );
      setOpen(false);
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Unable to create invitation.",
      );
    } finally {
      setInviting(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(invite);
      setNotice("Invitation link copied.");
    } catch {
      setNotice(
        "Clipboard access was blocked. Select and copy the link manually.",
      );
    }
  };
  return (
    <>
      <header className="top-strip">
        <div>
          <p className="eyebrow">Audience operations</p>
          <h1>Community & membership</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="button button-soft"
            onClick={exportCsv}
          >
            Export intakes
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setOpen(true)}
          >
            + Invite privileged access
          </button>
        </div>
      </header>
      <Notice text={notice} />
      {invite && (
        <article className="panel-card invite-output">
          <div>
            <p className="eyebrow">Circle invitation</p>
            <h2>Invitation link ready</h2>
            <p>{invite}</p>
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={copy}
          >
            Copy link
          </button>
        </article>
      )}
      <div className="stats-grid">
        <article className="stat-card">
          <p>Self-joined members</p>
          <strong>{members.length}</strong>
          <small>
            {members.filter((x) => x.tier !== "free").length} paid memberships
          </small>
        </article>
        <article className="stat-card">
          <p>Applications</p>
          <strong>
            {
              items.filter((x) =>
                ["partnership", "work", "academy"].includes(x.kind),
              ).length
            }
          </strong>
          <small>Require team review</small>
        </article>
      </div>
      <section className="management-grid">
        <article className="panel-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Member directory</p>
              <h2>Community memberships</h2>
            </div>
            <span className="status-pill">{members.length} active</span>
          </div>
          {members.length ? (
            <div className="user-list">
              {members.slice(0, 8).map((x) => (
                <div className="user-row" key={x.id}>
                  <span className="user-avatar">
                    {x.name
                      .split(" ")
                      .map((v) => v[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <strong>{x.name}</strong>
                    <small>{x.email}</small>
                  </div>
                  <div>
                    <strong>{x.tier.replace("_", " ")}</strong>
                    <small>{x.subscription_status}</small>
                  </div>
                  <span className="status-pill">{x.membership_status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your community is ready for its first member"
              description="Self-joined members will appear here with their plan, payment access and membership status."
            />
          )}
        </article>
        <aside className="panel-card community-actions">
          <p className="eyebrow">Access policy</p>
          <h2>Community is open. Workspaces are approved.</h2>
          <p>
            Fans self-join. Creators and partners apply; collaborators, Academy
            members and approved partners receive invitations.
          </p>
          <a
            className="button button-primary"
            href={`${clientUrl}/sign-in`}
            target="_blank"
            rel="noreferrer"
          >
            Open Circle sign in ↗
          </a>
        </aside>
      </section>
      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Application queue</p>
            <h2>Commercial and programme requests</h2>
          </div>
          <span className="status-pill">{items.length} captured</span>
        </div>
        {items.length ? (
          <div className="user-list">
            {items.slice(0, 8).map((x) => (
              <div className="user-row" key={x.id}>
                <span className="user-avatar">
                  {x.kind.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <strong>{x.name}</strong>
                  <small>{x.email}</small>
                </div>
                <div>
                  <strong>{x.kind}</strong>
                  <small>{new Date(x.created_at).toLocaleDateString()}</small>
                </div>
                <span className="status-pill">Review</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="The intake queue is clear"
            description="New partnership, Academy, shop and work enquiries will collect here for review."
          />
        )}
      </article>
      {open && (
        <Drawer
          title="Invite privileged access"
          close={() => setOpen(false)}
          submit={submit}
          pending={inviting}
        >
          <p>
            Community members join themselves. Use invitations for approved
            creators, collaborators, partners and Academy access.
          </p>
          <label>
            Full name
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Access role
            <select name="role">
              <option value="creator">Approved creator</option>
              <option value="collaborator">Collaborator</option>
              <option value="brand_partner">Approved brand partner</option>
              <option value="academy_member">Academy member</option>
            </select>
          </label>
        </Drawer>
      )}
    </>
  );
}

const seed: Story[] = [
  { title: "The room before the room", type: "Feature", status: "Ready" },
  { title: "City Night Live recap", type: "Video", status: "Review" },
];
export function ContentOperations() {
  const [stories, setStories] = useState(seed),
    [open, setOpen] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("almaleek.admin.content") ?? "null",
        );
        if (Array.isArray(saved)) setStories(saved);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget),
      next = [
        {
          title: String(d.get("title")),
          type: String(d.get("type")),
          status: String(d.get("status")),
        },
        ...stories,
      ];
    setStories(next);
    save("almaleek.admin.content", next);
    setOpen(false);
    setNotice("Story saved to this browser’s editorial workspace.");
  };
  return (
    <>
      <header className="top-strip">
        <div>
          <p className="eyebrow">Media & publishing</p>
          <h1>Content studio</h1>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setOpen(true)}
        >
          + New story
        </button>
      </header>
      <Notice text={notice} />
      <article className="panel-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Editorial queue</p>
            <h2>Recent content</h2>
          </div>
          <Link className="text-button" href="/settings">
            Publishing settings →
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Story</th>
                <th>Format</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((x) => (
                <tr key={x.title}>
                  <td>{x.title}</td>
                  <td>{x.type}</td>
                  <td>
                    <span className="status-pill">{x.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      {open && (
        <Drawer title="New story" close={() => setOpen(false)} submit={submit}>
          <label>
            Story title
            <input name="title" required />
          </label>
          <label>
            Format
            <select name="type">
              <option>Feature</option>
              <option>Video</option>
              <option>Press note</option>
            </select>
          </label>
          <label>
            Status
            <select name="status">
              <option>Draft</option>
              <option>Review</option>
              <option>Ready</option>
            </select>
          </label>
        </Drawer>
      )}
    </>
  );
}

type HeroContent = {
  eyebrow: string;
  headline: string;
  lede: string;
};
type PageCard = {
  kicker: string;
  title: string;
  text: string;
};
type PageContent = {
  hero: HeroContent;
  cards: PageCard[];
  muted_eyebrow: string;
  muted_heading: string;
  muted_points: string[];
};
type WorkOfferingCard = PageCard & {
  image: string;
  points: string[];
};
type WorkWithPageContent = Omit<PageContent, "cards"> & {
  cards: WorkOfferingCard[];
};
type HomeContent = {
  hero: HeroContent;
  hero_card_pill: string;
  hero_card_title: string;
  hero_card_points: string[];
  stats: Array<{ value: string; label: string }>;
  journey_eyebrow: string;
  journey_heading: string;
  journey: Array<{ title: string; text: string; href: string }>;
  pillars_eyebrow: string;
  pillars_heading: string;
  pillars: string[];
  next_eyebrow: string;
  next_heading: string;
  next_moves: Array<{
    title: string;
    text: string;
    link_label: string;
    href: string;
  }>;
};
type PagesContent = {
  academy: PageContent;
  live: PageContent & {
    events: Array<{ date: string; title: string; text: string; image: string }>;
  };
  community: PageContent;
  media: PageContent & {
    stories: Array<{
      kind: string;
      title: string;
      meta: string;
      image: string;
    }>;
    press_eyebrow: string;
    press_heading: string;
    press_lede: string;
    press_email: string;
  };
  partnerships: PageContent;
  shop: PageContent;
  work_with: WorkWithPageContent;
};
const EMPTY_HERO: HeroContent = { eyebrow: "", headline: "", lede: "" };
const EMPTY_PAGE: PageContent = {
  hero: EMPTY_HERO,
  cards: [],
  muted_eyebrow: "",
  muted_heading: "",
  muted_points: [],
};
const EMPTY_HOME: HomeContent = {
  hero: EMPTY_HERO,
  hero_card_pill: "",
  hero_card_title: "",
  hero_card_points: [],
  stats: [],
  journey_eyebrow: "",
  journey_heading: "",
  journey: [],
  pillars_eyebrow: "",
  pillars_heading: "",
  pillars: [],
  next_eyebrow: "",
  next_heading: "",
  next_moves: [],
};
type SiteSettings = {
  footer_description: string;
  contact_email: string;
  location: string;
  home: HomeContent;
  pages: PagesContent;
  about_eyebrow: string;
  about_headline: string;
  about_introduction: string;
  about_story: string;
  about_mission: string;
  founder_name: string;
  founder_role: string;
  brands: Array<{
    name: string;
    category: string;
    description: string;
    url: string;
  }>;
  social_profiles: Array<{
    platform: string;
    handle: string;
    url: string;
    audience: string;
  }>;
};
const mergePage = (page: Partial<PageContent> | undefined): PageContent => ({
  hero: { ...EMPTY_HERO, ...page?.hero },
  cards: page?.cards ?? EMPTY_PAGE.cards,
  muted_eyebrow: page?.muted_eyebrow ?? "",
  muted_heading: page?.muted_heading ?? "",
  muted_points: page?.muted_points ?? EMPTY_PAGE.muted_points,
});
const mergeHome = (home: Partial<HomeContent> | undefined): HomeContent => ({
  ...EMPTY_HOME,
  ...home,
  hero: { ...EMPTY_HERO, ...home?.hero },
});
export function SettingsOperations() {
  const [site, setSite] = useState<SiteSettings | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/site-settings", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Unable to load CMS settings");
        setSite({
          ...body,
          home: mergeHome(body.home),
          pages: {
            academy: mergePage(body.pages?.academy),
            live: {
              ...mergePage(body.pages?.live),
              events: (body.pages?.live?.events ?? []).map(
                (event: {
                  date: string;
                  title: string;
                  text: string;
                  image?: string;
                }) => ({ ...event, image: event.image ?? "" }),
              ),
            },
            community: mergePage(body.pages?.community),
            media: {
              ...mergePage(body.pages?.media),
              stories: (body.pages?.media?.stories ?? []).map(
                (story: {
                  kind: string;
                  title: string;
                  meta: string;
                  image?: string;
                }) => ({ ...story, image: story.image ?? "" }),
              ),
              press_eyebrow: body.pages?.media?.press_eyebrow ?? "",
              press_heading: body.pages?.media?.press_heading ?? "",
              press_lede: body.pages?.media?.press_lede ?? "",
              press_email: body.pages?.media?.press_email ?? "",
            },
            partnerships: mergePage(body.pages?.partnerships),
            shop: mergePage(body.pages?.shop),
            work_with: {
              ...mergePage(body.pages?.work_with),
              cards: (body.pages?.work_with?.cards ?? []).map(
                (card: {
                  kicker: string;
                  title: string;
                  text: string;
                  image?: string;
                  points?: string[];
                }) => ({
                  ...card,
                  image: card.image ?? "",
                  points: card.points ?? [],
                }),
              ),
            },
          },
        });
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });
    return () => controller.abort();
  }, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!site) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Unable to publish site settings");
        return;
      }
      setSite(body);
      setNotice("All public page copy and site settings published.");
    } finally {
      setSaving(false);
    }
  };
  const update = (key: keyof SiteSettings, value: unknown) =>
    setSite((current) => (current ? { ...current, [key]: value } : current));
  const updateHome = (patch: Partial<HomeContent>) =>
    setSite((current) =>
      current ? { ...current, home: { ...current.home, ...patch } } : current,
    );
  const updatePage = <K extends keyof PagesContent>(
    page: K,
    patch: Partial<PagesContent[K]>,
  ) =>
    setSite((current) =>
      current
        ? {
            ...current,
            pages: {
              ...current.pages,
              [page]: { ...current.pages[page], ...patch },
            },
          }
        : current,
    );
  if (!site)
    return error ? (
      <>
        <header className="top-strip">
          <div>
            <p className="eyebrow">Public CMS</p>
            <h1>Brand & site settings</h1>
          </div>
        </header>
        <p className="error-message" role="alert">
          {error}
        </p>
      </>
    ) : (
      <PageSkeleton cards={3} />
    );
  const updateHero = (page: keyof PagesContent, patch: Partial<HeroContent>) =>
    updatePage(page, { hero: { ...site.pages[page].hero, ...patch } });
  const updateHomeHero = (patch: Partial<HeroContent>) =>
    updateHome({ hero: { ...site.home.hero, ...patch } });
  const renderPageSection = (
    page: "academy" | "partnerships" | "shop" | "work_with",
    title: string,
    helper: string,
  ) => (
    <section className="panel-card cms-section">
      <div>
        <p className="eyebrow">Public pages · {title}</p>
        <h2>{title}</h2>
        <p>{helper}</p>
      </div>
      <div className="light-form-grid">
        <label>
          Eyebrow
          <input
            value={site.pages[page].hero.eyebrow}
            onChange={(e) => updateHero(page, { eyebrow: e.target.value })}
          />
        </label>
        <label>
          Headline
          <input
            value={site.pages[page].hero.headline}
            onChange={(e) => updateHero(page, { headline: e.target.value })}
          />
        </label>
        <label className="full-field">
          Lede
          <textarea
            rows={3}
            value={site.pages[page].hero.lede}
            onChange={(e) => updateHero(page, { lede: e.target.value })}
          />
        </label>
      </div>
      <div className="cms-repeaters">
        {page === "work_with"
          ? site.pages.work_with.cards.map((card, index) => (
              <article key={`work-with-card-${index}`}>
                <label>
                  Kicker
                  <input
                    value={card.kicker}
                    onChange={(e) =>
                      updatePage("work_with", {
                        cards: site.pages.work_with.cards.map((item, i) =>
                          i === index
                            ? { ...item, kicker: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={card.title}
                    onChange={(e) =>
                      updatePage("work_with", {
                        cards: site.pages.work_with.cards.map((item, i) =>
                          i === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Text
                  <textarea
                    rows={3}
                    value={card.text}
                    onChange={(e) =>
                      updatePage("work_with", {
                        cards: site.pages.work_with.cards.map((item, i) =>
                          i === index
                            ? { ...item, text: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Image URL (optional)
                  <input
                    type="url"
                    value={card.image}
                    onChange={(e) =>
                      updatePage("work_with", {
                        cards: site.pages.work_with.cards.map((item, i) =>
                          i === index
                            ? { ...item, image: e.target.value }
                            : item,
                        ),
                      })
                    }
                    placeholder="https://…"
                  />
                  <small>Leave blank to use the branded artwork</small>
                </label>
                <label className="full-field">
                  What you get (one per line)
                  <textarea
                    rows={4}
                    value={card.points.join("\n")}
                    onChange={(e) =>
                      updatePage("work_with", {
                        cards: site.pages.work_with.cards.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                points: e.target.value.split("\n"),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updatePage("work_with", {
                      cards: site.pages.work_with.cards.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  Remove card
                </button>
              </article>
            ))
          : site.pages[page].cards.map((card, index) => (
              <article key={`${page}-card-${index}`}>
                <label>
                  Kicker
                  <input
                    value={card.kicker}
                    onChange={(e) =>
                      updatePage(page, {
                        cards: site.pages[page].cards.map((item, i) =>
                          i === index
                            ? { ...item, kicker: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={card.title}
                    onChange={(e) =>
                      updatePage(page, {
                        cards: site.pages[page].cards.map((item, i) =>
                          i === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Text
                  <textarea
                    rows={3}
                    value={card.text}
                    onChange={(e) =>
                      updatePage(page, {
                        cards: site.pages[page].cards.map((item, i) =>
                          i === index
                            ? { ...item, text: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updatePage(page, {
                      cards: site.pages[page].cards.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  Remove card
                </button>
              </article>
            ))}
        <button
          type="button"
          className="button button-soft"
          onClick={() =>
            page === "work_with"
              ? updatePage("work_with", {
                  cards: [
                    ...site.pages.work_with.cards,
                    {
                      kicker: "New",
                      title: "New card",
                      text: "",
                      image: "",
                      points: [],
                    },
                  ],
                })
              : updatePage(page, {
                  cards: [
                    ...site.pages[page].cards,
                    { kicker: "New", title: "New card", text: "" },
                  ],
                })
          }
        >
          + Add card
        </button>
      </div>
      <div className="light-form-grid">
        <label>
          Muted eyebrow
          <input
            value={site.pages[page].muted_eyebrow}
            onChange={(e) =>
              updatePage(page, { muted_eyebrow: e.target.value })
            }
          />
        </label>
        <label>
          Muted heading
          <input
            value={site.pages[page].muted_heading}
            onChange={(e) =>
              updatePage(page, { muted_heading: e.target.value })
            }
          />
        </label>
        <label className="full-field">
          Muted points — one per line
          <textarea
            rows={4}
            value={site.pages[page].muted_points.join("\n")}
            onChange={(e) =>
              updatePage(page, { muted_points: e.target.value.split("\n") })
            }
          />
        </label>
      </div>
    </section>
  );
  return (
    <form onSubmit={submit}>
      <header className="top-strip">
        <div>
          <p className="eyebrow">Public CMS</p>
          <h1>Brand & site settings</h1>
          <p>
            Control the copy across every public page, plus the brand story,
            portfolio, social presence and footer.
          </p>
        </div>
        <button
          type="submit"
          className="button button-primary"
          disabled={saving}
        >
          {saving ? (
            <LoadingDots label="Publishing settings" />
          ) : (
            "Save and publish"
          )}
        </button>
      </header>
      <Notice text={notice} />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div className="cms-settings-stack">
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">About AL Maleek</p>
            <h2>Founder story</h2>
            <p>This copy powers the public About page.</p>
          </div>
          <div className="light-form-grid">
            <label>
              Founder name
              <input
                value={site.founder_name}
                onChange={(e) => update("founder_name", e.target.value)}
                required
              />
            </label>
            <label>
              Founder role
              <input
                value={site.founder_role}
                onChange={(e) => update("founder_role", e.target.value)}
                required
              />
            </label>
            <label>
              Eyebrow
              <input
                value={site.about_eyebrow}
                onChange={(e) => update("about_eyebrow", e.target.value)}
                required
              />
            </label>
            <label className="full-field">
              Headline
              <input
                value={site.about_headline}
                onChange={(e) => update("about_headline", e.target.value)}
                required
              />
            </label>
            <label className="full-field">
              Introduction
              <textarea
                rows={3}
                value={site.about_introduction}
                onChange={(e) => update("about_introduction", e.target.value)}
                required
              />
            </label>
            <label className="full-field">
              His story
              <textarea
                rows={6}
                value={site.about_story}
                onChange={(e) => update("about_story", e.target.value)}
                required
              />
            </label>
            <label className="full-field">
              Mission
              <textarea
                rows={4}
                value={site.about_mission}
                onChange={(e) => update("about_mission", e.target.value)}
                required
              />
            </label>
          </div>
        </section>
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Venture portfolio</p>
            <h2>Current brands</h2>
            <p>Show partners the ecosystem their support can grow.</p>
          </div>
          <div className="cms-repeaters">
            {site.brands.map((brand, index) => (
              <article key={`${brand.name}-${index}`}>
                <label>
                  Name
                  <input
                    value={brand.name}
                    onChange={(e) =>
                      update(
                        "brands",
                        site.brands.map((item, i) =>
                          i === index
                            ? { ...item, name: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Category
                  <input
                    value={brand.category}
                    onChange={(e) =>
                      update(
                        "brands",
                        site.brands.map((item, i) =>
                          i === index
                            ? { ...item, category: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Destination
                  <input
                    value={brand.url}
                    onChange={(e) =>
                      update(
                        "brands",
                        site.brands.map((item, i) =>
                          i === index ? { ...item, url: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label className="full-field">
                  Description
                  <textarea
                    rows={3}
                    value={brand.description}
                    onChange={(e) =>
                      update(
                        "brands",
                        site.brands.map((item, i) =>
                          i === index
                            ? { ...item, description: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "brands",
                      site.brands.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove brand
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                update("brands", [
                  ...site.brands,
                  {
                    name: "New brand",
                    category: "Venture",
                    description: "Describe the value this brand creates.",
                    url: "/",
                  },
                ])
              }
            >
              + Add brand
            </button>
          </div>
        </section>
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Reach</p>
            <h2>Social media presence</h2>
            <p>Use real profile URLs, handles and a short audience context.</p>
          </div>
          <div className="cms-repeaters">
            {site.social_profiles.map((profile, index) => (
              <article key={`${profile.platform}-${index}`}>
                <label>
                  Platform
                  <select
                    value={profile.platform}
                    onChange={(e) =>
                      update(
                        "social_profiles",
                        site.social_profiles.map((item, i) =>
                          i === index
                            ? { ...item, platform: e.target.value }
                            : item,
                        ),
                      )
                    }
                  >
                    <option>instagram</option>
                    <option>tiktok</option>
                    <option>youtube</option>
                    <option>x</option>
                    <option>facebook</option>
                    <option>linkedin</option>
                  </select>
                </label>
                <label>
                  Handle
                  <input
                    value={profile.handle}
                    onChange={(e) =>
                      update(
                        "social_profiles",
                        site.social_profiles.map((item, i) =>
                          i === index
                            ? { ...item, handle: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Profile URL
                  <input
                    type="url"
                    value={profile.url}
                    onChange={(e) =>
                      update(
                        "social_profiles",
                        site.social_profiles.map((item, i) =>
                          i === index ? { ...item, url: e.target.value } : item,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Audience / content
                  <input
                    value={profile.audience}
                    onChange={(e) =>
                      update(
                        "social_profiles",
                        site.social_profiles.map((item, i) =>
                          i === index
                            ? { ...item, audience: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "social_profiles",
                      site.social_profiles.filter((_, i) => i !== index),
                    )
                  }
                >
                  Remove profile
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                update("social_profiles", [
                  ...site.social_profiles,
                  {
                    platform: "instagram",
                    handle: "@almaleek",
                    url: "https://instagram.com/almaleek",
                    audience: "Community",
                  },
                ])
              }
            >
              + Add social profile
            </button>
          </div>
        </section>
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Global footer</p>
            <h2>Contact & positioning</h2>
          </div>
          <div className="light-form-grid">
            <label className="full-field">
              Footer description
              <textarea
                rows={3}
                value={site.footer_description}
                onChange={(e) => update("footer_description", e.target.value)}
                required
              />
            </label>
            <label>
              Contact email
              <input
                type="email"
                value={site.contact_email}
                onChange={(e) => update("contact_email", e.target.value)}
                required
              />
            </label>
            <label>
              Location
              <input
                value={site.location}
                onChange={(e) => update("location", e.target.value)}
                required
              />
            </label>
          </div>
        </section>
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Public pages · Home</p>
            <h2>Home page</h2>
            <p>
              Hero, stats, journey, pillars and next moves on the public home
              page (/).
            </p>
          </div>
          <div className="light-form-grid">
            <label>
              Eyebrow
              <input
                value={site.home.hero.eyebrow}
                onChange={(e) => updateHomeHero({ eyebrow: e.target.value })}
              />
            </label>
            <label>
              Headline
              <input
                value={site.home.hero.headline}
                onChange={(e) => updateHomeHero({ headline: e.target.value })}
              />
            </label>
            <label className="full-field">
              Lede
              <textarea
                rows={3}
                value={site.home.hero.lede}
                onChange={(e) => updateHomeHero({ lede: e.target.value })}
              />
            </label>
            <label>
              Hero card pill
              <input
                value={site.home.hero_card_pill}
                onChange={(e) =>
                  updateHome({ hero_card_pill: e.target.value })
                }
              />
            </label>
            <label>
              Hero card title
              <input
                value={site.home.hero_card_title}
                onChange={(e) =>
                  updateHome({ hero_card_title: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Hero card points — one per line
              <textarea
                rows={4}
                value={site.home.hero_card_points.join("\n")}
                onChange={(e) =>
                  updateHome({ hero_card_points: e.target.value.split("\n") })
                }
              />
            </label>
          </div>
          <div className="cms-repeaters">
            {site.home.stats.map((stat, index) => (
              <article key={`stat-${index}`}>
                <label>
                  Value
                  <input
                    value={stat.value}
                    onChange={(e) =>
                      updateHome({
                        stats: site.home.stats.map((item, i) =>
                          i === index
                            ? { ...item, value: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Label
                  <input
                    value={stat.label}
                    onChange={(e) =>
                      updateHome({
                        stats: site.home.stats.map((item, i) =>
                          i === index
                            ? { ...item, label: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateHome({
                      stats: site.home.stats.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove stat
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                updateHome({
                  stats: [
                    ...site.home.stats,
                    { value: "0", label: "New stat" },
                  ],
                })
              }
            >
              + Add stat
            </button>
          </div>
          <div className="light-form-grid">
            <label>
              Journey eyebrow
              <input
                value={site.home.journey_eyebrow}
                onChange={(e) =>
                  updateHome({ journey_eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Journey heading
              <input
                value={site.home.journey_heading}
                onChange={(e) =>
                  updateHome({ journey_heading: e.target.value })
                }
              />
            </label>
          </div>
          <div className="cms-repeaters">
            {site.home.journey.map((step, index) => (
              <article key={`journey-${index}`}>
                <label>
                  Title
                  <input
                    value={step.title}
                    onChange={(e) =>
                      updateHome({
                        journey: site.home.journey.map((item, i) =>
                          i === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Link href
                  <input
                    value={step.href}
                    onChange={(e) =>
                      updateHome({
                        journey: site.home.journey.map((item, i) =>
                          i === index
                            ? { ...item, href: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Text
                  <textarea
                    rows={3}
                    value={step.text}
                    onChange={(e) =>
                      updateHome({
                        journey: site.home.journey.map((item, i) =>
                          i === index
                            ? { ...item, text: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateHome({
                      journey: site.home.journey.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove journey card
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                updateHome({
                  journey: [
                    ...site.home.journey,
                    { title: "New path", text: "", href: "/" },
                  ],
                })
              }
            >
              + Add journey card
            </button>
          </div>
          <div className="light-form-grid">
            <label>
              Pillars eyebrow
              <input
                value={site.home.pillars_eyebrow}
                onChange={(e) =>
                  updateHome({ pillars_eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Pillars heading
              <input
                value={site.home.pillars_heading}
                onChange={(e) =>
                  updateHome({ pillars_heading: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Pillars — one per line
              <textarea
                rows={4}
                value={site.home.pillars.join("\n")}
                onChange={(e) =>
                  updateHome({ pillars: e.target.value.split("\n") })
                }
              />
            </label>
            <label>
              Next-move eyebrow
              <input
                value={site.home.next_eyebrow}
                onChange={(e) => updateHome({ next_eyebrow: e.target.value })}
              />
            </label>
            <label>
              Next-move heading
              <input
                value={site.home.next_heading}
                onChange={(e) => updateHome({ next_heading: e.target.value })}
              />
            </label>
          </div>
          <div className="cms-repeaters">
            {site.home.next_moves.map((move, index) => (
              <article key={`next-move-${index}`}>
                <label>
                  Title
                  <input
                    value={move.title}
                    onChange={(e) =>
                      updateHome({
                        next_moves: site.home.next_moves.map((item, i) =>
                          i === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Link label
                  <input
                    value={move.link_label}
                    onChange={(e) =>
                      updateHome({
                        next_moves: site.home.next_moves.map((item, i) =>
                          i === index
                            ? { ...item, link_label: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Link href
                  <input
                    value={move.href}
                    onChange={(e) =>
                      updateHome({
                        next_moves: site.home.next_moves.map((item, i) =>
                          i === index
                            ? { ...item, href: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Text
                  <textarea
                    rows={3}
                    value={move.text}
                    onChange={(e) =>
                      updateHome({
                        next_moves: site.home.next_moves.map((item, i) =>
                          i === index
                            ? { ...item, text: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateHome({
                      next_moves: site.home.next_moves.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  Remove next-move card
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                updateHome({
                  next_moves: [
                    ...site.home.next_moves,
                    {
                      title: "New audience",
                      text: "",
                      link_label: "Learn more →",
                      href: "/",
                    },
                  ],
                })
              }
            >
              + Add next-move card
            </button>
          </div>
        </section>
        {renderPageSection(
          "academy",
          "Academy",
          "Hero, programme cards and the muted closing block on /academy.",
        )}
        {renderPageSection(
          "partnerships",
          "Partnerships",
          "Hero, partnership cards and the muted closing block on /partnerships.",
        )}
        {renderPageSection(
          "shop",
          "Shop",
          "Hero, category cards and the muted closing block on /shop.",
        )}
        {renderPageSection(
          "work_with",
          "Work with Al Maleek",
          "Hero, service cards and the muted closing block on /work-with-al-maleek.",
        )}
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Public pages · Live</p>
            <h2>Live events</h2>
            <p>
              Hero, upcoming events and the muted closing block on
              /events/live. Leave the image blank to use the branded poster
              artwork.
            </p>
          </div>
          <div className="light-form-grid">
            <label>
              Eyebrow
              <input
                value={site.pages.live.hero.eyebrow}
                onChange={(e) => updateHero("live", { eyebrow: e.target.value })}
              />
            </label>
            <label>
              Headline
              <input
                value={site.pages.live.hero.headline}
                onChange={(e) =>
                  updateHero("live", { headline: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Lede
              <textarea
                rows={3}
                value={site.pages.live.hero.lede}
                onChange={(e) => updateHero("live", { lede: e.target.value })}
              />
            </label>
          </div>
          <div className="cms-repeaters">
            {site.pages.live.events.map((event, index) => (
              <article key={`live-event-${index}`}>
                <label>
                  Date
                  <input
                    value={event.date}
                    onChange={(e) =>
                      updatePage("live", {
                        events: site.pages.live.events.map((item, i) =>
                          i === index
                            ? { ...item, date: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={event.title}
                    onChange={(e) =>
                      updatePage("live", {
                        events: site.pages.live.events.map((item, i) =>
                          i === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Text
                  <textarea
                    rows={3}
                    value={event.text}
                    onChange={(e) =>
                      updatePage("live", {
                        events: site.pages.live.events.map((item, i) =>
                          i === index
                            ? { ...item, text: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label className="full-field">
                  Image URL (optional)
                  <input
                    type="url"
                    value={event.image}
                    onChange={(e) =>
                      updatePage("live", {
                        events: site.pages.live.events.map((item, i) =>
                          i === index
                            ? { ...item, image: e.target.value }
                            : item,
                        ),
                      })
                    }
                    placeholder="https://…"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updatePage("live", {
                      events: site.pages.live.events.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  Remove event
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                updatePage("live", {
                  events: [
                    ...site.pages.live.events,
                    { date: "TBA", title: "New event", text: "", image: "" },
                  ],
                })
              }
            >
              + Add event
            </button>
          </div>
          <div className="light-form-grid">
            <label>
              Muted eyebrow
              <input
                value={site.pages.live.muted_eyebrow}
                onChange={(e) =>
                  updatePage("live", { muted_eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Muted heading
              <input
                value={site.pages.live.muted_heading}
                onChange={(e) =>
                  updatePage("live", { muted_heading: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Muted points — one per line
              <textarea
                rows={4}
                value={site.pages.live.muted_points.join("\n")}
                onChange={(e) =>
                  updatePage("live", {
                    muted_points: e.target.value.split("\n"),
                  })
                }
              />
            </label>
          </div>
        </section>
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Public pages · Community</p>
            <h2>Community</h2>
            <p>
              Hero and the muted closing block on /community. The membership
              plans grid is managed in the Plans workspace.
            </p>
          </div>
          <div className="light-form-grid">
            <label>
              Eyebrow
              <input
                value={site.pages.community.hero.eyebrow}
                onChange={(e) =>
                  updateHero("community", { eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Headline
              <input
                value={site.pages.community.hero.headline}
                onChange={(e) =>
                  updateHero("community", { headline: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Lede
              <textarea
                rows={3}
                value={site.pages.community.hero.lede}
                onChange={(e) =>
                  updateHero("community", { lede: e.target.value })
                }
              />
            </label>
            <label>
              Muted eyebrow
              <input
                value={site.pages.community.muted_eyebrow}
                onChange={(e) =>
                  updatePage("community", { muted_eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Muted heading
              <input
                value={site.pages.community.muted_heading}
                onChange={(e) =>
                  updatePage("community", { muted_heading: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Muted points — one per line
              <textarea
                rows={4}
                value={site.pages.community.muted_points.join("\n")}
                onChange={(e) =>
                  updatePage("community", {
                    muted_points: e.target.value.split("\n"),
                  })
                }
              />
            </label>
          </div>
        </section>
        <section className="panel-card cms-section">
          <div>
            <p className="eyebrow">Public pages · Media</p>
            <h2>Media</h2>
            <p>
              Hero, editorial stories and the press room on /media. Leave the
              image blank to use the branded poster artwork.
            </p>
          </div>
          <div className="light-form-grid">
            <label>
              Eyebrow
              <input
                value={site.pages.media.hero.eyebrow}
                onChange={(e) =>
                  updateHero("media", { eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Headline
              <input
                value={site.pages.media.hero.headline}
                onChange={(e) =>
                  updateHero("media", { headline: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Lede
              <textarea
                rows={3}
                value={site.pages.media.hero.lede}
                onChange={(e) => updateHero("media", { lede: e.target.value })}
              />
            </label>
          </div>
          <div className="cms-repeaters">
            {site.pages.media.stories.map((story, index) => (
              <article key={`media-story-${index}`}>
                <label>
                  Kind
                  <input
                    value={story.kind}
                    onChange={(e) =>
                      updatePage("media", {
                        stories: site.pages.media.stories.map((item, i) =>
                          i === index
                            ? { ...item, kind: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Title
                  <input
                    value={story.title}
                    onChange={(e) =>
                      updatePage("media", {
                        stories: site.pages.media.stories.map((item, i) =>
                          i === index
                            ? { ...item, title: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Meta
                  <input
                    value={story.meta}
                    onChange={(e) =>
                      updatePage("media", {
                        stories: site.pages.media.stories.map((item, i) =>
                          i === index
                            ? { ...item, meta: e.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Image URL (optional)
                  <input
                    type="url"
                    value={story.image}
                    onChange={(e) =>
                      updatePage("media", {
                        stories: site.pages.media.stories.map((item, i) =>
                          i === index
                            ? { ...item, image: e.target.value }
                            : item,
                        ),
                      })
                    }
                    placeholder="https://…"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updatePage("media", {
                      stories: site.pages.media.stories.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  Remove story
                </button>
              </article>
            ))}
            <button
              type="button"
              className="button button-soft"
              onClick={() =>
                updatePage("media", {
                  stories: [
                    ...site.pages.media.stories,
                    { kind: "Story", title: "New story", meta: "", image: "" },
                  ],
                })
              }
            >
              + Add story
            </button>
          </div>
          <div className="light-form-grid">
            <label>
              Press eyebrow
              <input
                value={site.pages.media.press_eyebrow}
                onChange={(e) =>
                  updatePage("media", { press_eyebrow: e.target.value })
                }
              />
            </label>
            <label>
              Press heading
              <input
                value={site.pages.media.press_heading}
                onChange={(e) =>
                  updatePage("media", { press_heading: e.target.value })
                }
              />
            </label>
            <label className="full-field">
              Press lede
              <textarea
                rows={3}
                value={site.pages.media.press_lede}
                onChange={(e) =>
                  updatePage("media", { press_lede: e.target.value })
                }
              />
            </label>
            <label>
              Press email
              <input
                type="email"
                value={site.pages.media.press_email}
                onChange={(e) =>
                  updatePage("media", { press_email: e.target.value })
                }
              />
            </label>
          </div>
        </section>
      </div>
    </form>
  );
}
