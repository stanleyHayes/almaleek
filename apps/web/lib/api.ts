export type CreatorRegistrationInput = {
  name: string;
  handle: string;
  email: string;
  bio?: string;
  status?: string;
};

export function getApiBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080";
  return base.replace(/\/$/, "");
}

export async function registerCreator(input: CreatorRegistrationInput) {
  const response = await fetch(`${getApiBaseUrl()}/api/creators`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      handle: input.handle,
      email: input.email,
      bio: input.bio ?? "Community member",
      status: input.status ?? "active",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Unable to register creator");
  }

  return response.json();
}

export type MembershipTier = "free" | "insider" | "front_row";
export type MembershipPlan = {
  code: MembershipTier;
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

export async function getMembershipPlans() {
  const response = await fetch(
    `${getApiBaseUrl()}/api/membership/plans?active=true`,
    { cache: "no-store" },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(payload?.error ?? "Unable to load membership plans");
  return payload as MembershipPlan[];
}

export async function joinCommunity(input: {
  name: string;
  email: string;
  tier: MembershipTier;
}) {
  const response = await fetch(`${getApiBaseUrl()}/api/community/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(payload?.error ?? "Unable to join the community");
  return payload as {
    id: string;
    name: string;
    email: string;
    tier: MembershipTier;
    entitlements: string[];
    subscription_status: string;
  };
}
