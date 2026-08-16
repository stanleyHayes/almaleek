"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SignIn() {
  const router = useRouter();
  const [forgot, setForgot] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (forgot) {
      setSent(true);
      return;
    }
    localStorage.setItem("alm.client.auth", "true");
    router.push(
      localStorage.getItem("alm.client.onboarded") === "true"
        ? "/"
        : "/onboarding",
    );
  };
  return (
    <main className="auth-page">
      <section className="auth-story">
        <span className="auth-logo">
          <Image
            src="/brand/al-maleek-mark.png"
            width={58}
            height={58}
            alt="AL Maleek"
          />
        </span>
        <p className="eyebrow">AL Maleek Circle</p>
        <h1>Your invitation into the work.</h1>
        <p>
          Collaborations, campaigns, community, learning and payments—held in
          one clear place.
        </p>
        <div className="auth-proof">
          <span>Invite-only access</span>
          <span>Role-aware workspace</span>
          <span>Secure activity</span>
        </div>
      </section>
      <section className="auth-card">
        <p className="eyebrow">
          {forgot ? "Account recovery" : "Welcome back"}
        </p>
        <h2>{forgot ? "Reset your password" : "Sign in to your circle"}</h2>
        {sent ? (
          <div className="auth-success" role="status">
            <span>✓</span>
            <h3>Check your inbox</h3>
            <p>
              If an account matches that email, a secure reset link is on its
              way.
            </p>
            <button
              type="button"
              onClick={() => {
                setForgot(false);
                setSent(false);
              }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              Email address
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>
            {!forgot && (
              <div className="auth-field">
                <label htmlFor="circle-password">Password</label>
                <span className="password-field">
                  <input
                    id="circle-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <span aria-hidden="true">{showPassword ? "◉" : "◌"}</span>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </span>
              </div>
            )}
            {!forgot && (
              <div className="auth-row">
                <label className="check">
                  <input type="checkbox" />
                  Keep me signed in
                </label>
                <button type="button" onClick={() => setForgot(true)}>
                  Forgot password?
                </button>
              </div>
            )}
            <button className="primary-action" type="submit">
              {forgot ? "Send reset link" : "Sign in"} <span>→</span>
            </button>
            {forgot && (
              <button
                className="auth-back"
                type="button"
                onClick={() => setForgot(false)}
              >
                Back to sign in
              </button>
            )}
          </form>
        )}
        <p className="auth-help">
          Access comes through an invitation. Need help?{" "}
          <a href="mailto:circle@almaleek.com">Contact the team</a>.
        </p>
      </section>
    </main>
  );
}
