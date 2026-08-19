"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingDots } from "./state-primitives";
import { Select } from "./select";

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
          <Select
            aria-label="Focus area"
            name="focus"
            required
            placeholder="Choose a track"
            options={[
              { value: "Content strategy", label: "Content strategy" },
              { value: "Comedy & performance", label: "Comedy & performance" },
              { value: "Business systems", label: "Business systems" },
            ]}
          />
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
        <Select
          aria-label="Event"
          name="event"
          required
          placeholder="Choose an event"
          options={[
            { value: "City Night Live", label: "City Night Live" },
            { value: "Campus Comedy Jam", label: "Campus Comedy Jam" },
            {
              value: "Creator Circle Showcase",
              label: "Creator Circle Showcase",
            },
          ]}
        />
      </label>
      <label className="field">
        <span>Ticket type</span>
        <Select
          aria-label="Ticket type"
          name="tier"
          required
          placeholder="Select tier"
          options={[
            { value: "General admission", label: "General admission" },
            { value: "VIP", label: "VIP" },
            { value: "Table package", label: "Table package" },
          ]}
        />
      </label>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Stepwise enquiry flow (work + partnership), patterned on the        */
/* Joe Kuntani booking dossier: intent → details → contact → review,   */
/* with per-step validation and a draft autosaved on the device.       */
/* ------------------------------------------------------------------ */

type EnquiryKind = "partnership" | "work";

type EnquiryValues = {
  type: string;
  source: string;
  brief: string;
  budget: string;
  timeline: string;
  name: string;
  company: string;
  email: string;
  phone: string;
};

const BLANK_ENQUIRY: EnquiryValues = {
  type: "",
  source: "",
  brief: "",
  budget: "",
  timeline: "",
  name: "",
  company: "",
  email: "",
  phone: "",
};

const ENQUIRY_STEPS = [
  { label: "Intent", heading: "What are we building together?" },
  { label: "Details", heading: "Shape the engagement" },
  { label: "Contact", heading: "Who should we reply to?" },
  { label: "Review", heading: "Final check before it lands" },
];

const OPPORTUNITY_TYPES: Record<EnquiryKind, string[]> = {
  work: [
    "Campaign partnership",
    "Event appearance",
    "Brand sponsorship",
    "Content collaboration",
  ],
  partnership: [
    "Sponsorship",
    "Campaign",
    "Event partnership",
    "Media collaboration",
  ],
};

const SOURCE_OPTIONS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "X",
  "Referral",
  "Press",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under GH₵10,000",
  "GH₵10,000 – GH₵50,000",
  "GH₵50,000+",
  "Prefer to discuss",
];

const DRAFT_KEY = "almaleek.enquiry.draft";

function stepIsValid(step: number, values: EnquiryValues) {
  if (step === 0) return Boolean(values.type && values.source);
  if (step === 1) return Boolean(values.brief.trim() && values.budget);
  if (step === 2)
    return (
      values.name.trim().length >= 2 &&
      values.company.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(values.email)
    );
  return true;
}

function composeMessage(values: EnquiryValues) {
  const summary = [values.type, values.budget, values.timeline]
    .filter(Boolean)
    .join(" · ");
  const lines = [
    summary,
    "",
    values.brief,
    values.source ? `Heard about us via: ${values.source}` : "",
    values.phone ? `Phone: ${values.phone}` : "",
  ];
  return lines.filter((line, index) => line || index === 1).join("\n").trim();
}

function SteppedEnquiry({ kind }: { kind: EnquiryKind }) {
  const details = copy[kind];
  // Restore any in-progress draft lazily on mount, then autosave on change.
  const [restored] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        kind?: EnquiryKind;
        values?: Partial<EnquiryValues>;
        step?: number;
      };
      return parsed.kind === kind && parsed.values ? parsed : null;
    } catch {
      return null;
    }
  });
  const [step, setStep] = useState(() =>
    Math.min(Math.max(restored?.step ?? 0, 0), 3),
  );
  const [values, setValues] = useState<EnquiryValues>(() => ({
    ...BLANK_ENQUIRY,
    ...restored?.values,
  }));
  const [error, setError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "offline" | "error"
  >("idle");

  useEffect(() => {
    if (status === "success") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ kind, values, step }));
    } catch {
      /* storage unavailable — the flow still works without drafts */
    }
  }, [kind, values, step, status]);

  const update =
    (name: keyof EnquiryValues) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setValues((current) => ({ ...current, [name]: event.target.value }));

  const choose = (name: keyof EnquiryValues) => (value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const goNext = () => {
    if (!stepIsValid(step, values)) {
      setError("Complete the required fields before continuing.");
      return;
    }
    setError("");
    setStep((current) => Math.min(3, current + 1));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stepIsValid(2, values)) {
      setError("Review your contact details before sending.");
      return;
    }
    try {
      setStatus("loading");
      const response = await fetch(`${apiUrl}/api/intakes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: values.name,
          email: values.email,
          organization: values.company,
          message: composeMessage(values),
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => null))?.error || "Request failed",
        );
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* nothing to clear */
      }
      setStatus("success");
    } catch (submissionError) {
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
      console.warn("AL Maleek intake submission failed", submissionError);
    }
  };

  if (status === "success")
    return (
      <div className="form-card">
        <p className="eyebrow">{details.eyebrow}</p>
        <h3>{details.title}</h3>
        <p className="success-message" role="status">
          {details.success}
        </p>
      </div>
    );

  const message =
    status === "offline"
      ? "The service is temporarily unavailable. Your draft is saved on this device only; please retry later."
      : status === "error"
        ? "We could not save that request. Please try again or email hello@almaleekgh.com."
        : "";

  return (
    <form className="form-card" onSubmit={submit} noValidate>
      <p className="eyebrow">{details.eyebrow}</p>
      <h3>{details.title}</h3>

      <ol className="form-steps" aria-label="Enquiry progress">
        {ENQUIRY_STEPS.map((item, index) => (
          <li
            key={item.label}
            aria-current={step === index ? "step" : undefined}
            data-complete={index < step ? "true" : "false"}
          >
            {item.label}
          </li>
        ))}
      </ol>
      <p className="form-step-heading">
        <span>
          Step {step + 1} of {ENQUIRY_STEPS.length}
        </span>
        {ENQUIRY_STEPS[step].heading}
      </p>

      <div className="form-grid">
        {step === 0 && (
          <>
            <label className="field">
              <span>Opportunity type</span>
              <Select
                aria-label="Opportunity type"
                required
                placeholder="Choose a category"
                value={values.type}
                onChange={choose("type")}
                options={OPPORTUNITY_TYPES[kind].map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </label>
            <label className="field">
              <span>How did you hear about us?</span>
              <Select
                aria-label="How did you hear about us?"
                required
                placeholder="Choose one"
                value={values.source}
                onChange={choose("source")}
                options={SOURCE_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </label>
          </>
        )}
        {step === 1 && (
          <>
            <label className="field">
              <span>Your brief</span>
              <textarea
                aria-label="Your brief"
                required
                rows={4}
                placeholder="Tell us about the campaign, event, or collaboration"
                value={values.brief}
                onChange={update("brief")}
              />
            </label>
            <label className="field">
              <span>Budget range</span>
              <Select
                aria-label="Budget range"
                required
                placeholder="Choose a range"
                value={values.budget}
                onChange={choose("budget")}
                options={BUDGET_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </label>
            <label className="field">
              <span>Timeline (optional)</span>
              <input
                aria-label="Timeline"
                type="date"
                value={values.timeline}
                onChange={update("timeline")}
              />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <label className="field">
              <span>Your name</span>
              <input
                aria-label="Your name"
                required
                placeholder="Full name"
                value={values.name}
                onChange={update("name")}
              />
            </label>
            <label className="field">
              <span>Brand / organization</span>
              <input
                aria-label="Brand or organization"
                required
                placeholder="Your company"
                value={values.company}
                onChange={update("company")}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                aria-label="Email"
                type="email"
                required
                placeholder="hello@brand.com"
                value={values.email}
                onChange={update("email")}
              />
            </label>
            <label className="field">
              <span>Phone (optional)</span>
              <input
                aria-label="Phone"
                type="tel"
                placeholder="+233 ..."
                value={values.phone}
                onChange={update("phone")}
              />
            </label>
          </>
        )}
        {step === 3 && (
          <dl className="form-summary">
            <div>
              <dt>Opportunity</dt>
              <dd>{values.type}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>
                {values.budget}
                {values.timeline ? ` · by ${values.timeline}` : ""}
              </dd>
            </div>
            <div>
              <dt>Brief</dt>
              <dd>{values.brief}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                {values.name} · {values.company} · {values.email}
                {values.phone ? ` · ${values.phone}` : ""}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="error-message" role="status">
          {message}
        </p>
      )}

      <div className="form-nav">
        {step > 0 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setError("");
              setStep((current) => current - 1);
            }}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            className="button button-primary"
            onClick={goNext}
          >
            Continue
          </button>
        ) : (
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
        )}
      </div>
      <p className="form-draft-note">Your draft is saved on this device as you go.</p>
    </form>
  );
}

export function PublicActionForm({ kind }: { kind: Kind }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "offline" | "error"
  >("idle");
  const details = copy[kind];

  if (kind === "work" || kind === "partnership")
    return <SteppedEnquiry kind={kind} />;

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
