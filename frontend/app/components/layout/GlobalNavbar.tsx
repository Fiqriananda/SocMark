"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNotifications } from "../../context/NotificationContext";
import { NAV_TABS } from "../../lib/navigation";
import { ROLE_META } from "../../lib/roles";
import { useDismiss } from "../../lib/useDismiss";
import GlobalSearchInput from "./GlobalSearchInput";
import NavActionBadges from "./NavActionBadges";
import RoleSwitcherDropdown from "./RoleSwitcherDropdown";

export function Wordmark() {
  return (
    <Link href="/" className="gn-brand" aria-label="SocMark, ke beranda">
      <span className="gn-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" />
          <path d="M8.5 14.5c1 1.5 2.5 2 3.5 2s2.5-.5 3.5-2" />
        </svg>
      </span>
      <span>SocMark</span>
      <span className="gn-brand-dot" aria-hidden="true" />
    </Link>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  if (!user) return null;

  return (
    <div className="gn-popover-root" ref={ref}>
      <button
        type="button"
        className="gn-avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu akun ${user.displayName}`}
        onClick={() => setOpen((v) => !v)}
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt="" width={32} height={32} className="gn-avatar-img" />
        ) : (
          <span className="gn-avatar-fallback" aria-hidden="true">
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="gn-online-dot" aria-hidden="true" />
      </button>

      {open && (
        <div className="gn-popover gn-user-popover" role="menu">
          <div className="gn-user-head">
            <p className="gn-user-name">{user.displayName}</p>
            <p className="gn-user-handle">@{user.username}</p>
          </div>
          <Link href="/profile" role="menuitem" className="gn-menu-item" onClick={close}>
            Profil Saya
          </Link>
          <Link href="/settings" role="menuitem" className="gn-menu-item" onClick={close}>
            Pengaturan Akun
          </Link>
          <button
            type="button"
            role="menuitem"
            className="gn-menu-item gn-menu-item-danger"
            onClick={() => {
              close();
              logout();
              router.push("/login");
            }}
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

/** Desktop / tablet top bar (>= 768px). Hidden on mobile via CSS. */
export default function GlobalNavbar() {
  const pathname = usePathname();
  const { status, user, activeRole, isSwitchingRole, switchRole } = useAuth();
  const { cartCount } = useCart();
  const { unreadMessages, unreadNotifications } = useNotifications();
  const workspace = ROLE_META[activeRole].workspace;

  return (
    <header className="gn-navbar">
      <nav className="gn-navbar-inner" aria-label="Navigasi utama">
        <div className="gn-zone gn-zone-left">
          <Wordmark />
          <ul className="gn-tabs">
            {NAV_TABS.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className={`gn-tab${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {tab.live && <span className="gn-live-dot" aria-hidden="true" />}
                    <span>{tab.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="gn-zone gn-zone-center">
          <GlobalSearchInput />
        </div>

        <div className="gn-zone gn-zone-right">
          {status === "loading" && <span className="gn-skeleton" aria-hidden="true" />}

          {status === "guest" && (
            <div className="gn-auth-buttons">
              <Link href="/login" className="gn-btn gn-btn-ghost">
                Login
              </Link>
              <Link href="/register" className="gn-btn gn-btn-solid">
                Register
              </Link>
            </div>
          )}

          {status === "authenticated" && user && (
            <>
              {workspace && (
                <Link
                  href={workspace.href}
                  className={`gn-btn gn-btn-outline${pathname.startsWith(workspace.href) ? " is-active" : ""}`}
                >
                  {workspace.label}
                </Link>
              )}
              <RoleSwitcherDropdown
                activeRole={activeRole}
                availableRoles={user.roles}
                isSwitching={isSwitchingRole}
                onSwitchRole={switchRole}
              />
              <NavActionBadges
                cartCount={cartCount}
                messageCount={unreadMessages}
                notificationCount={unreadNotifications}
              />
              <UserMenu />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
