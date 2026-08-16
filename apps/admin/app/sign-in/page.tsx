"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LoadingDots } from "../../components/state-primitives";
export default function SignIn() {
  const router = useRouter(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [showPassword, setShowPassword] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to sign in");
      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="admin-auth">
      <section>
        <Image
          src="/brand/al-maleek-mark.png"
          width={58}
          height={58}
          alt="AL Maleek"
        />
        <p className="eyebrow">Studio OS</p>
        <h1>Welcome back to the operating room.</h1>
      </section>
      <form onSubmit={submit}>
        <p className="eyebrow">Secure administrator access</p>
        <h2>Sign in</h2>
        <div className="auth-field">
          <label htmlFor="admin-email">Email</label>
          <span className="auth-input-shell">
            <span className="auth-input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 6.5h16v11H4z" />
                <path d="m5 7 7 5 7-5" />
              </svg>
            </span>
            <input
              id="admin-email"
              name="email"
              type="email"
              placeholder="name@company.com"
              required
              autoComplete="username"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "sign-in-error" : undefined}
            />
          </span>
        </div>
        <div className="auth-field">
          <label htmlFor="admin-password">Password</label>
          <span className="auth-input-shell password-field">
            <span className="auth-input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              minLength={8}
              required
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "sign-in-error" : undefined}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
            >
              <span aria-hidden="true">{showPassword ? "◉" : "◌"}</span>
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </div>
        {error && (
          <div
            className="auth-alert"
            id="sign-in-error"
            role="alert"
            aria-live="assertive"
          >
            <span className="auth-alert-icon" aria-hidden="true">
              !
            </span>
            <span>
              <strong>Sign-in unsuccessful</strong>
              <small>{error} Check your details and try again.</small>
            </span>
            <button
              type="button"
              aria-label="Dismiss sign-in error"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}
        <button
          className="button button-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <LoadingDots label="Signing in" />
          ) : (
            "Sign in securely →"
          )}
        </button>
        <small>
          Your session is protected with a signed, secure HttpOnly cookie.
        </small>
      </form>
    </main>
  );
}
