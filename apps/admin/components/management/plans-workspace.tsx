"use client";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState, LoadingDots, PageSkeleton } from "../state-primitives";
type Plan = {
  code: string;
  name: string;
  kicker: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  cta: string;
  benefits: string[];
  active: boolean;
  sort_order: number;
};
export function PlansWorkspace() {
  const [plans, setPlans] = useState<Plan[]>([]),
    [editing, setEditing] = useState<Plan | null>(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/plans", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load plans");
        setPlans(body);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    setNotice("");
    const data = new FormData(event.currentTarget);
    const next = {
      ...editing,
      name: String(data.get("name")),
      kicker: String(data.get("kicker")),
      description: String(data.get("description")),
      price_cents: Math.round(Number(data.get("price")) * 100),
      cta: String(data.get("cta")),
      benefits: String(data.get("benefits"))
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
      active: data.get("active") === "on",
    };
    try {
      const response = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error || "Unable to save plan");
        return;
      }
      setPlans((current) =>
        current.map((plan) => (plan.code === body.code ? body : plan)),
      );
      setEditing(null);
      setNotice(
        `${body.name} is now live across the public community and Circle.`,
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <header className="top-strip">
        <div>
          <p className="eyebrow">Revenue & access</p>
          <h1>Membership plans</h1>
          <p>
            Control public packages, pricing, benefits and availability from one
            source.
          </p>
        </div>
        <span className="status-pill">
          {plans.filter((plan) => plan.active).length} published
        </span>
      </header>
      {notice && (
        <p className="success-message" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <section className="plan-admin-grid" aria-busy={loading}>
        {loading ? (
          <PageSkeleton cards={3} />
        ) : plans.length ? (
          plans.map((plan, index) => (
            <article
              className={`plan-admin-card tone-${index + 1}`}
              key={plan.code}
            >
              <header>
                <span>{plan.kicker}</span>
                <i className={plan.active ? "is-live" : ""}>
                  {plan.active ? "Published" : "Hidden"}
                </i>
              </header>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <strong>
                {plan.price_cents === 0 ? "Free" : `$${plan.price_cents / 100}`}
                <small>
                  {plan.price_cents === 0 ? " forever" : ` / ${plan.interval}`}
                </small>
              </strong>
              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <button
                className="button button-soft"
                type="button"
                onClick={() => setEditing(plan)}
              >
                Edit {plan.name}
              </button>
            </article>
          ))
        ) : (
          <EmptyState
            title="No membership plans yet"
            description="Create the first package to publish pricing and access across Community and Circle."
          />
        )}
      </section>
      {editing && (
        <div
          className="plan-editor-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form
            className="plan-editor"
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editing.name}`}
            onSubmit={save}
          >
            <header>
              <div>
                <p className="eyebrow">Plan · {editing.code}</p>
                <h2>Edit {editing.name}</h2>
              </div>
              <button
                type="button"
                aria-label="Close plan editor"
                onClick={() => setEditing(null)}
              >
                ×
              </button>
            </header>
            <div className="light-form-grid">
              <label>
                Name
                <input name="name" defaultValue={editing.name} required />
              </label>
              <label>
                Kicker
                <input name="kicker" defaultValue={editing.kicker} required />
              </label>
              <label>
                Monthly price (USD)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editing.price_cents / 100}
                  required
                />
              </label>
              <label>
                Button label
                <input name="cta" defaultValue={editing.cta} required />
              </label>
              <label className="full-field">
                Description
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing.description}
                  required
                />
              </label>
              <label className="full-field">
                Benefits · one per line
                <textarea
                  name="benefits"
                  rows={5}
                  defaultValue={editing.benefits.join("\n")}
                  required
                />
              </label>
              <label className="plan-active">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={editing.active}
                />
                <span>
                  <strong>Published</strong>
                  <small>Show this plan publicly and allow selection.</small>
                </span>
              </label>
            </div>
            <footer>
              <button
                type="button"
                className="button button-soft"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="button button-primary" disabled={saving}>
                {saving ? (
                  <LoadingDots label="Saving plan" />
                ) : (
                  "Save and publish"
                )}
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
