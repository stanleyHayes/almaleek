"use client";

import { FormEvent, useState } from "react";
import { LoadingDots } from "./state-primitives";

type Kind = "academy" | "shop" | "partnership" | "work" | "ticket";
const apiUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NEXT_PUBLIC_APP_ENV === "production"
    ? "https://api.almaleek.com"
    : "http://localhost:8080")
).replace(/\/$/, "");

const copy: Record<
  Kind,
  { eyebrow: string; title: string; action: string; success: string }
> = {
  academy: {
    eyebrow: "Start learning",
    title: "Join the waitlist",
    action: "Get access info",
    success:
      "You are on the Academy list. We will send access details to your email.",
  },
  shop: {
    eyebrow: "Early access list",
    title: "Get first notice on drops",
    action: "Notify me",
    success: "Early access is yours. We will email you before the next drop.",
  },
  partnership: {
    eyebrow: "Let’s talk",
    title: "Pitch your opportunity",
    action: "Submit proposal",
    success:
      "Your proposal is with our partnerships desk. Expect a reply within two business days.",
  },
  work: {
    eyebrow: "Start a conversation",
    title: "Tell us about your brief",
    action: "Send enquiry",
    success:
      "Brief received. Our team will review the fit and respond by email.",
  },
  ticket: {
    eyebrow: "Ticketing",
    title: "Reserve your spot",
    action: "Reserve ticket",
    success:
      "Your reservation is saved. We will send checkout details as soon as sales open.",
  },
};

function Fields({ kind }: { kind: Kind }) {
  if (kind === "academy")
    return (
      <>
        <label className="field">
          <span>Name</span>
          <input name="name" required placeholder="Your name" />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label className="field">
          <span>Focus area</span>
          <select name="focus" required defaultValue="">
            <option value="" disabled>
              Choose a track
            </option>
            <option>Content strategy</option>
            <option>Comedy & performance</option>
            <option>Business systems</option>
          </select>
        </label>
      </>
    );
  if (kind === "shop")
    return (
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </label>
    );
  if (kind === "partnership")
    return (
      <>
        <label className="field">
          <span>Company</span>
          <input name="company" required placeholder="Brand or organization" />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="hello@brand.com"
          />
        </label>
        <label className="field">
          <span>Goal</span>
          <textarea
            name="goal"
            required
            rows={4}
            placeholder="Tell us about the partnership or campaign"
          />
        </label>
      </>
    );
  if (kind === "work")
    return (
      <>
        <label className="field">
          <span>Brand / organization</span>
          <input name="company" required placeholder="Your company" />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            placeholder="hello@brand.com"
          />
        </label>
        <label className="field">
          <span>Opportunity type</span>
          <select name="type" required defaultValue="">
            <option value="" disabled>
              Choose a category
            </option>
            <option>Campaign partnership</option>
            <option>Event appearance</option>
            <option>Brand sponsorship</option>
            <option>Content collaboration</option>
          </select>
        </label>
      </>
    );
  return (
    <>
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </label>
      <label className="field">
        <span>Event</span>
        <select name="event" required defaultValue="">
          <option value="" disabled>
            Choose an event
          </option>
          <option>City Night Live</option>
          <option>Campus Comedy Jam</option>
          <option>Creator Circle Showcase</option>
        </select>
      </label>
      <label className="field">
        <span>Ticket type</span>
        <select name="tier" required defaultValue="">
          <option value="" disabled>
            Select tier
          </option>
          <option>General admission</option>
          <option>VIP</option>
          <option>Table package</option>
        </select>
      </label>
    </>
  );
}

export function PublicActionForm({ kind }: { kind: Kind }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "offline" | "error"
  >("idle");
  const details = copy[kind];
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;
    try {
      setStatus("loading");
      const payload = {
        kind,
        name: values.name || values.company || values.email,
        email: values.email,
        organization: values.company || "",
        message:
          values.goal ||
          values.focus ||
          values.type ||
          [values.event, values.tier].filter(Boolean).join(" · "),
      };
      const response = await fetch(`${apiUrl}/api/intakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => null))?.error || "Request failed",
        );
      form.reset();
      setStatus("success");
    } catch (error) {
      try {
        const key = "almaleek.public.drafts";
        const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
        localStorage.setItem(
          key,
          JSON.stringify(
            [
              {
                id: crypto.randomUUID(),
                kind,
                createdAt: new Date().toISOString(),
                ...values,
              },
              ...existing,
            ].slice(0, 25),
          ),
        );
        setStatus("offline");
      } catch {
        setStatus("error");
      }
      console.warn("AL Maleek intake submission failed", error);
    }
  };
  const message =
    status === "success"
      ? details.success
      : status === "offline"
        ? "The service is temporarily unavailable. Your draft is saved on this device only; please retry later."
        : status === "error"
          ? "We could not save that request. Please try again or email hello@almaleekgh.com."
          : "";
  return (
    <form className="form-card" onSubmit={submit}>
      <p className="eyebrow">{details.eyebrow}</p>
      <h3>{details.title}</h3>
      <div className="form-grid">
        <Fields kind={kind} />
        <button
          type="submit"
          className="button button-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <LoadingDots label="Sending request" />
          ) : (
            details.action
          )}
        </button>
      </div>
      {message && (
        <p
          className={status === "success" ? "success-message" : "error-message"}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
