"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShowcase from "../components/AuthShowcase";

export default function RegisterPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [termsAgree, setTermsAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/profile");
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
              <h1>Create an Account</h1>
              <p>Join the SocMark social and marketplace network.</p>
            </div>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Grace Hopper"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="grace_h"
                required
              />
            </div>

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
              <label htmlFor="account-type">Account Role</label>
              <select
                id="account-type"
                name="account-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select account role
                </option>
                <option value="buyer">Buyer &amp; Community Member</option>
                <option value="seller">Merchant &amp; Store Owner</option>
                <option value="creator">Creator &amp; Affiliate</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself or your store..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar-file">Profile Avatar</label>
              <input
                type="file"
                id="avatar-file"
                name="avatar-file"
                accept="image/*"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms-agree"
                name="terms-agree"
                checked={termsAgree}
                onChange={(e) => setTermsAgree(e.target.checked)}
                required
              />
              <label htmlFor="terms-agree">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button type="submit" className="btn-continue">
              Create Account
            </button>

            <p className="form-secondary-link">
              Already have an account? <Link href="/login">Sign in</Link>
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
