"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMembershipPlans, type MembershipPlan } from "@/lib/api";
import { CommunitySignup } from "./community-signup";
import { EmptyState, PageSkeleton } from "@/components/state-primitives";

export type CommunityMutedContent = {
  muted_eyebrow: string;
  muted_heading: string;
  muted_points: string[];
};

const DEFAULT_MUTED_CONTENT: CommunityMutedContent = {
  muted_eyebrow: "Why community matters",
  muted_heading:
    "Built for retention, value, and participation that actually means something.",
  muted_points: [
    "Member-driven access and engagement loops that keep fans invested.",
    "Polls, Q&A sessions, challenges, and insider updates that create belonging.",
    "Clear pathways into premium experiences, event access, and brand moments.",
  ],
};

export function CommunityExperience({
  mutedContent = DEFAULT_MUTED_CONTENT,
}: {
  mutedContent?: CommunityMutedContent;
}) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getMembershipPlans()
      .then(setPlans)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load membership plans",
        ),
      )
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <>
      <section className="section-block">
        <div className="container tier-grid">
          {plans.map((plan) => (
            <article className="tier-card" key={plan.code}>
              <span className="card-kicker">{plan.kicker}</span>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <span className="price">${plan.price_cents / 100}</span>
              <Link
                href="#join-community"
                className={
                  plan.code === "insider"
                    ? "button button-primary"
                    : "button button-secondary"
                }
              >
                {plan.cta}
              </Link>
            </article>
          ))}
          {!plans.length && !error ? (
            <EmptyState
              title="No membership plans are published"
              description="New ways to join the Circle will appear here as soon as the AL Maleek team publishes them."
            />
          ) : null}
          {error ? (
            <div className="plans-error" role="alert">
              <strong>Plans are temporarily unavailable.</strong>
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      </section>
      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">{mutedContent.muted_eyebrow}</p>
            <h2>{mutedContent.muted_heading}</h2>
            <ul className="detail-list">
              {mutedContent.muted_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          {plans.length ? (
            <CommunitySignup plans={plans} />
          ) : error ? (
            <div className="form-card plans-form-wait">
              <p className="eyebrow">Membership</p>
              <h3>Membership is unavailable</h3>
              <p>Please try again shortly.</p>
            </div>
          ) : (
            <EmptyState
              title="Membership will open soon"
              description="There are no published options to choose from yet."
            />
          )}
        </div>
      </section>
    </>
  );
}
