"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShowcase from "../components/AuthShowcase";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <article className="auth-left">
        <div className="auth-form-wrapper">
          <header className="auth-brand-wrapper">
            <Link href="/" className="brand-icon-box">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="5" />
                <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
                <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
                <path d="M8.5 14.5c1 1.5 2.5 2 3.5 2s2.5-.5 3.5-2" />
              </svg>
            </Link>
            <div className="auth-header">
              <h1>Welcome to SocMark</h1>
              <p>Please enter your email and password to sign in.</p>
            </div>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="grace@org.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-row-remember">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {error && (
              <p role="alert" style={{ color: "#dc2626", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-continue" disabled={submitting}>
              {submitting ? "Signing in..." : "Continue"}
            </button>

            <p className="form-secondary-link">
              Have trouble signing in? <Link href="/register">Sign up</Link>
            </p>
          </form>
        </div>

        <footer className="auth-bottom-terms">
          <p>
            By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>
        </footer>
      </article>

      <AuthShowcase />
    </main>
  );
}
