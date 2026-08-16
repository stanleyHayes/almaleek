"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientApiUrl } from "@/lib/client-api";
import { PageSkeleton } from "./state-primitives";

type Invitation = {
  token: string;
  name: string;
  email: string;
  role: string;
  status: "pending" | "accepted";
  expires_at: string;
};
const roleNames: Record<string, string> = {
  creator: "Creator",
  collaborator: "Collaborator",
  brand_partner: "Brand partner",
  community_member: "Community member",
  academy_member: "Academy member",
};

export function InviteExperience({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<
    "loading" | "ready" | "invalid" | "expired" | "accepted" | "config"
  >("loading");
  const [invite, setInvite] = useState<Invitation | null>(null);
  useEffect(() => {
    const base = getClientApiUrl();
    if (!base) {
      queueMicrotask(() => setState("config"));
      return;
    }
    const controller = new AbortController();
    fetch(`${base}/api/invitations/${encodeURIComponent(token)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const value = (await response.json()) as Invitation;
        setInvite(value);
        if (value.status === "accepted") setState("accepted");
        else if (new Date(value.expires_at).getTime() <= Date.now())
          setState("expired");
        else setState("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState("invalid");
      });
    return () => controller.abort();
  }, [token]);
  const begin = () => {
    if (!invite) return;
    const role = roleNames[invite.role];
    if (!role) {
      setState("invalid");
      return;
    }
    localStorage.setItem(
      "alm.client.pendingInvite",
      JSON.stringify({
        token: invite.token,
        name: invite.name,
        email: invite.email,
        role,
      }),
    );
    localStorage.removeItem("alm.client.auth");
    localStorage.removeItem("alm.client.onboarded");
    router.push("/onboarding");
  };
  if (state === "loading") return <PageSkeleton cards={2} />;
  const states = {
    invalid: [
      "Invitation unavailable",
      "This invitation link is invalid or could not be verified. Ask the AL Maleek team for a fresh link.",
    ],
    expired: [
      "Invitation expired",
      "This invitation has passed its expiry date. Ask the AL Maleek team to send another.",
    ],
    accepted: [
      "Invitation already accepted",
      "This invitation has already been used. Sign in with the account created from it.",
    ],
    config: [
      "Invitation service unavailable",
      "The invitation service is not configured for this deployment. Contact the AL Maleek team.",
    ],
  } as const;
  if (state !== "ready" || !invite) {
    const [title, body] = states[state as keyof typeof states];
    return (
      <main className="invite-page">
        <section className="invite-card invite-state">
          <span className="invite-seal">
            <Image
              src="/brand/al-maleek-mark.png"
              width={58}
              height={58}
              alt="AL Maleek"
            />
          </span>
          <p className="eyebrow">Private invitation</p>
          <h1>{title}</h1>
          <p>{body}</p>
          {state === "accepted" && (
            <Link className="primary-action" href="/sign-in">
              Sign in <span>→</span>
            </Link>
          )}
          <a href="mailto:circle@almaleek.com">Contact Circle support</a>
        </section>
      </main>
    );
  }
  return (
    <main className="invite-page">
      <section className="invite-card">
        <span className="invite-seal">
          <Image
            src="/brand/al-maleek-mark.png"
            width={58}
            height={58}
            alt="AL Maleek"
          />
        </span>
        <p className="eyebrow">
          Private invitation · {token.slice(0, 6).toUpperCase()}
        </p>
        <h1>You have a place in the circle.</h1>
        <p>
          <strong>{invite.name}</strong>, AL Maleek invited you to join as a{" "}
          <strong>{roleNames[invite.role]}</strong>. Accept to set up your
          profile and see the work shared with {invite.email}.
        </p>
        <div className="invite-access">
          <span>◇ Role-specific workspace</span>
          <span>◎ Shared files & feedback</span>
          <span>¤ Agreements & payments</span>
        </div>
        <button className="primary-action" onClick={begin}>
          Accept invitation <span>→</span>
        </button>
        <small>
          Verified invitation · Expires{" "}
          {new Date(invite.expires_at).toLocaleDateString()}
        </small>
      </section>
    </main>
  );
}
