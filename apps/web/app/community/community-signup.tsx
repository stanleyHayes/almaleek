"use client";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  joinCommunity,
  type MembershipPlan,
  type MembershipTier,
} from "@/lib/api";
import { LoadingDots } from "@/components/state-primitives";

type FormState = {
  name: string;
  email: string;
  tier: MembershipTier;
};

const initialState: FormState = {
  name: "",
  email: "",
  tier: "free",
};
const clientUrl =
  process.env.NEXT_PUBLIC_CLIENT_URL ??
  (process.env.NEXT_PUBLIC_APP_ENV === "production"
    ? "https://circle.almaleek.com"
    : "http://localhost:3102");

export function CommunitySignup({ plans }: { plans: MembershipPlan[] }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [memberId, setMemberId] = useState("");
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [activeTier, setActiveTier] = useState(0);
  const membershipRef = useRef<HTMLDivElement>(null);
  const membershipTiers = plans.map((plan, index) => ({
    value: plan.code,
    name: plan.name,
    price:
      plan.price_cents === 0
        ? "Free"
        : `$${plan.price_cents / 100} / ${plan.interval}`,
    description: plan.benefits.join(", "),
    tone: ["mint", "lilac", "peach"][index % 3],
  }));
  const tier =
    membershipTiers.find((item) => item.value === form.tier) ??
    membershipTiers[0];

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!membershipRef.current?.contains(event.target as Node))
        setMembershipOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  const chooseTier = (index: number) => {
    const choice = membershipTiers[index];
    setForm((current) => ({ ...current, tier: choice.value }));
    setActiveTier(index);
    setMembershipOpen(false);
  };

  const handleTierKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setMembershipOpen(false);
      return;
    }
    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End" &&
      event.key !== "Enter" &&
      event.key !== " "
    )
      return;
    event.preventDefault();
    if (!membershipOpen) {
      setMembershipOpen(true);
      setActiveTier(
        membershipTiers.findIndex((item) => item.value === form.tier),
      );
      return;
    }
    if (event.key === "Enter" || event.key === " ")
      return chooseTier(activeTier);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? membershipTiers.length - 1
          : event.key === "ArrowDown"
            ? (activeTier + 1) % membershipTiers.length
            : (activeTier - 1 + membershipTiers.length) %
              membershipTiers.length;
    setActiveTier(next);
  };

  const updateField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!form.name.trim() || !form.email.trim()) {
        throw new Error("Name and email are required");
      }

      const member = await joinCommunity({
        name: form.name.trim(),
        email: form.email.trim(),
        tier: form.tier,
      });

      setStatus("success");
      localStorage.setItem("alm.community.member", JSON.stringify(member));
      localStorage.setItem("alm.client.auth", "true");
      localStorage.setItem("alm.client.role", "Community member");
      localStorage.setItem(
        "alm.client.grantedRoles",
        JSON.stringify(["Community member"]),
      );
      setMemberId(member.id);
      setForm(initialState);
      setMessage(
        member.tier === "free"
          ? "Welcome to the Circle. Your free community access is active."
          : `Welcome to ${member.tier === "insider" ? "Insiders" : "Front Row"}. Your member-only access is active.`,
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your request right now.",
      );
    }
  };

  return (
    <form className="form-card" id="join-community" onSubmit={handleSubmit}>
      <p className="eyebrow">Get updates</p>
      <h3>Create your community membership</h3>
      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={updateField}
            required
          />
        </label>
        <div className="field membership-field" ref={membershipRef}>
          <span id="membership-label">Membership</span>
          <input type="hidden" name="tier" value={form.tier} />
          <button
            type="button"
            className="membership-trigger"
            aria-labelledby="membership-label membership-selection"
            aria-haspopup="listbox"
            aria-expanded={membershipOpen}
            onClick={() => setMembershipOpen((open) => !open)}
            onKeyDown={handleTierKeys}
          >
            <span className={`membership-mark ${tier.tone}`} aria-hidden="true">
              {tier.name.slice(0, 1)}
            </span>
            <span id="membership-selection">
              <strong>{tier.name}</strong>
              <small>{tier.price}</small>
            </span>
            <span className="membership-chevron" aria-hidden="true">
              ⌄
            </span>
          </button>
          {membershipOpen ? (
            <div
              className="membership-menu"
              role="listbox"
              aria-labelledby="membership-label"
            >
              <header>
                <span>Choose your access</span>
                <small>Change or cancel any time</small>
              </header>
              {membershipTiers.map((item, index) => (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={form.tier === item.value}
                  className={activeTier === index ? "is-active" : undefined}
                  onMouseEnter={() => setActiveTier(index)}
                  onClick={() => chooseTier(index)}
                  onKeyDown={handleTierKeys}
                >
                  <span
                    className={`membership-mark ${item.tone}`}
                    aria-hidden="true"
                  >
                    {item.name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="membership-price">
                    <strong>{item.price}</strong>
                    <i aria-hidden="true">
                      {form.tier === item.value ? "✓" : "→"}
                    </i>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={updateField}
            required
          />
        </label>
        <button
          type="submit"
          className="button button-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <LoadingDots label="Creating membership" />
          ) : form.tier === "free" ? (
            "Join free"
          ) : (
            "Start membership"
          )}
        </button>
      </div>
      {message ? (
        <div>
          <p
            className={
              status === "success" ? "success-message" : "error-message"
            }
            role="status"
          >
            {message}
          </p>
          {status === "success" && memberId ? (
            <a
              className="button button-primary"
              href={`${clientUrl}/community?member=${encodeURIComponent(memberId)}`}
            >
              Enter your Circle →
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
