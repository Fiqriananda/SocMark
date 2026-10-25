"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isFeed = pathname === "/" || pathname === "/feed";
  const isDiscover = pathname.startsWith("/discover");
  const isProfile = pathname.startsWith("/profile");
  const isOrders = pathname.startsWith("/orders");
  const isChat = pathname.startsWith("/chat");
  const isLogin = pathname.startsWith("/login");
  const isRegister = pathname.startsWith("/register");

  return (
    <header className="app-navbar">
      <nav>
        <Link href="/" className="app-nav-brand">
          <div className="brand-logo-small">
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
              <rect width="18" height="18" x="3" y="3" rx="5" />
              <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
              <path d="M8.5 14.5c1 1.5 2.5 2 3.5 2s2.5-.5 3.5-2" />
            </svg>
          </div>
          <span>SocMark</span>
        </Link>
        <ul className="app-nav-links">
          <li>
            <Link href="/" className={isFeed ? "active" : ""}>
              Feed
            </Link>
          </li>
          <li>
            <Link href="/discover" className={isDiscover ? "active" : ""}>
              Discover
            </Link>
          </li>
          <li>
            <Link href="/orders" className={isOrders ? "active" : ""}>
              Orders
            </Link>
          </li>
          <li>
            <Link href="/chat" className={isChat ? "active" : ""}>
              Chat
            </Link>
          </li>
          <li>
            <Link href="/profile" className={isProfile ? "active" : ""}>
              Profile
            </Link>
          </li>
          <li>
            <Link href="/login" className={isLogin ? "active" : ""}>
              Sign In
            </Link>
          </li>
          <li>
            <Link href="/register" className={isRegister ? "active" : ""}>
              Sign Up
            </Link>
          </li>
          <li>
            <Link href="/admin" className={pathname.startsWith("/admin") ? "active" : ""}>
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
