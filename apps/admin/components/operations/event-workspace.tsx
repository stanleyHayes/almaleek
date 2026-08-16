"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoadingDots } from "../state-primitives";

type EventItem = {
  name: string;
  date: string;
  month: string;
  venue: string;
  sold: number;
  capacity: number;
  status: string;
  revenue: string;
};

const seedEvents: EventItem[] = [
  {
    name: "Live comedy night",
    date: "18",
    month: "SEP",
    venue: "National Theatre",
    sold: 412,
    capacity: 500,
    status: "On sale",
    revenue: "GH₵ 18,540",
  },
  {
    name: "Creator roundtable",
    date: "25",
    month: "SEP",
    venue: "Basecamp, Osu",
    sold: 78,
    capacity: 120,
    status: "Selling",
    revenue: "GH₵ 7,020",
  },
  {
    name: "Campus showcase",
    date: "03",
    month: "OCT",
    venue: "UG Great Hall",
    sold: 290,
    capacity: 300,
    status: "Waitlist",
    revenue: "GH₵ 11,600",
  },
];

export function EventWorkspace() {
  const [events, setEvents] = useState(seedEvents);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/events", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error || "Unable to load events");
        }
        return response.json();
      })
      .then(
        (
          items: {
            name: string;
            starts_at: string;
            venue: string;
            capacity: number;
            status: string;
          }[],
        ) => {
          if (items.length)
            setEvents(
              items.map((item) => {
                const date = new Date(item.starts_at);
                return {
                  name: item.name,
                  date: String(date.getDate()).padStart(2, "0"),
                  month: date
                    .toLocaleDateString("en-GB", { month: "short" })
                    .toUpperCase(),
                  venue: item.venue,
                  sold: 0,
                  capacity: item.capacity,
                  status: item.status.replaceAll("_", " "),
                  revenue: "GH₵ 0",
                };
              }),
            );
        },
      )
      .catch((error) => {
        if (error.name !== "AbortError")
          setNotice(
            error instanceof Error
              ? `${error.message}; showing the demo roster.`
              : "Live event service is unavailable; showing the demo roster.",
          );
      });
    return () => controller.abort();
  }, []);

  const createEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    const dateValue = String(data.get("date"));
    const parsed = new Date(`${dateValue}T12:00:00`);
    const capacity = Number(data.get("capacity")) || 100;
    const optimistic = {
      name: String(data.get("name")),
      date: String(parsed.getDate()).padStart(2, "0"),
      month: parsed
        .toLocaleDateString("en-GB", { month: "short" })
        .toUpperCase(),
      venue: String(data.get("venue")),
      sold: 0,
      capacity,
      status: String(data.get("status")),
      revenue: "GH₵ 0",
    };
    setEvents((items) => [optimistic, ...items]);
    setNotice("Saving event to the live roster…");
    try {
      const startsAt = new Date(
        `${dateValue}T${String(data.get("time"))}:00`,
      ).toISOString();
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          starts_at: startsAt,
          venue: data.get("venue"),
          capacity,
          status: String(data.get("status")).toLowerCase().replaceAll(" ", "_"),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Unable to save event");
      setNotice("Event saved to the live roster.");
      form.reset();
      setOpen(false);
    } catch (error) {
      setEvents((items) => items.filter((item) => item !== optimistic));
      setNotice(
        error instanceof Error
          ? `Event was not saved: ${error.message}`
          : "Event was not saved. Please retry.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="top-strip">
        <div>
          <p className="eyebrow">Event operations</p>
          <h1>Live experience pipeline</h1>
          <p className="page-intro">
            Plan events, monitor ticket velocity and keep every venue-ready
            detail close.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => setOpen(true)}
        >
          ＋ Create event
        </button>
      </header>
      {notice && (
        <div className="workspace-toast" role="status">
          <span>✓</span>
          {notice}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      <div className="stats-grid">
        <article className="stat-card">
          <p>Upcoming events</p>
          <strong>{events.length + 5}</strong>
          <small>Next 60 days</small>
        </article>
        <article className="stat-card">
          <p>Tickets sold</p>
          <strong>
            {events
              .reduce((sum, item) => sum + item.sold, 972)
              .toLocaleString()}
          </strong>
          <small>Across all channels</small>
        </article>
        <article className="stat-card">
          <p>Gross revenue</p>
          <strong>GH₵ 137k</strong>
          <small>+18.4% this month</small>
        </article>
        <article className="stat-card">
          <p>Avg. check-in</p>
          <strong>87%</strong>
          <small>Healthy attendance</small>
        </article>
      </div>
      <section className="workspace-section">
        <div className="workspace-section-head">
          <div>
            <p className="eyebrow">Upcoming roster</p>
            <h2>Events in motion</h2>
          </div>
          <span>{events.length} priority events</span>
        </div>
        <div className="operation-card-grid">
          {events.map((item) => {
            const progress = Math.min(
              100,
              Math.round((item.sold / item.capacity) * 100),
            );
            return (
              <article
                className="operation-card event-card"
                key={`${item.name}-${item.date}`}
              >
                <div className="operation-card-top">
                  <div className="event-date">
                    <b>{item.date}</b>
                    <span>{item.month}</span>
                  </div>
                  <span
                    className={`status-pill ${item.status === "Waitlist" ? "warning" : ""}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="card-kicker">{item.venue}</p>
                  <h3>{item.name}</h3>
                </div>
                <div className="ticket-progress">
                  <span>
                    <b>{item.sold}</b> / {item.capacity} tickets
                    <i>{progress}%</i>
                  </span>
                  <div>
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <footer>
                  <span>
                    <small>Gross revenue</small>
                    <strong>{item.revenue}</strong>
                  </span>
                  <button type="button" aria-label={`Open ${item.name}`}>
                    ↗
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
      {open && (
        <div
          className="drawer-root"
          role="dialog"
          aria-modal="true"
          aria-label="Create event"
        >
          <button
            className="drawer-scrim"
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <aside className="form-drawer">
            <header>
              <div>
                <p className="eyebrow">New experience</p>
                <h2>Create event</h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>
            <form onSubmit={createEvent}>
              <div className="drawer-section">
                <h3>Event details</h3>
                <p>
                  Give your team the essentials. Ticketing can be expanded after
                  creation.
                </p>
                <label>
                  Event name
                  <input
                    name="name"
                    required
                    placeholder="e.g. Accra creator summit"
                  />
                </label>
                <div className="drawer-form-grid">
                  <label>
                    Date
                    <input name="date" type="date" required />
                  </label>
                  <label>
                    Start time
                    <input name="time" type="time" required />
                  </label>
                </div>
                <label>
                  Venue
                  <input name="venue" required placeholder="Venue or online" />
                </label>
                <div className="drawer-form-grid">
                  <label>
                    Capacity
                    <input
                      name="capacity"
                      type="number"
                      min="1"
                      required
                      defaultValue="100"
                    />
                  </label>
                  <label>
                    Status
                    <select name="status" defaultValue="Draft">
                      <option>Draft</option>
                      <option>On sale</option>
                      <option>Invite only</option>
                    </select>
                  </label>
                </div>
              </div>
              <footer>
                <button
                  className="button button-soft"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <LoadingDots label="Creating event" />
                  ) : (
                    "Create event"
                  )}
                </button>
              </footer>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
