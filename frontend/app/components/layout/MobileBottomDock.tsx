"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { canCreate, ROLE_META, ROLE_ORDER } from "../../lib/roles";
import { useDismiss } from "../../lib/useDismiss";
import { CountBadge } from "./NavActionBadges";

/** Sticky 5-column dock for < 768px: Feed, Shop, Create, Inbox, Me. */
export default function MobileBottomDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, activeRole, isSwitchingRole, switchRole, logout } = useAuth();
  const { unreadMessages, unreadNotifications } = useNotifications();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  useDismiss(sheetRef, sheetOpen, closeSheet);

  const createEnabled = status === "authenticated" && canCreate(activeRole);
  const createHref = ROLE_META[activeRole].workspace?.href ?? "#";
  const inboxCount = unreadMessages + unreadNotifications;

  const isFeed = pathname === "/" || pathname.startsWith("/feed");
  const isShop = pathname.startsWith("/discover");
  const isInbox = pathname.startsWith("/messages") || pathname.startsWith("/notifications");
  const isMe = pathname.startsWith("/profile") || sheetOpen;

  const handleSwitch = async (role: typeof activeRole) => {
    setError(null);
    try {
      await switchRole(role);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengganti role.");
    }
  };

  return (
    <>
      {sheetOpen && <div className="gn-sheet-backdrop" aria-hidden="true" />}
      {sheetOpen && (
        <div className="gn-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="Menu akun">
          {status === "authenticated" && user ? (
            <>
              <div className="gn-user-head">
                <p className="gn-user-name">{user.displayName}</p>
                <p className="gn-user-handle">@{user.username}</p>
              </div>

              <p className="gn-popover-title">Mode aktif</p>
              <ul className="gn-role-list">
                {ROLE_ORDER.filter((r) => user.roles.includes(r)).map((role) => {
                  const meta = ROLE_META[role];
                  const selected = role === activeRole;
                  return (
                    <li key={role}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        disabled={isSwitchingRole}
                        className={`gn-role-option${selected ? " is-selected" : ""}`}
                        onClick={() => handleSwitch(role)}
                      >
                        <span className="gn-dot" style={{ backgroundColor: meta.dotColor }} aria-hidden="true" />
                        <span className="gn-role-option-text">
                          <span className="gn-role-option-name">{meta.pillLabel}</span>
                          <span className="gn-role-option-desc">{meta.description}</span>
                        </span>
                        {selected && <span className="gn-role-option-state">Aktif</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {error && (
                <p className="gn-popover-error" role="alert">
                  {error}
                </p>
              )}

              <div className="gn-popover-footer">
                <Link href="/profile" className="gn-menu-item" onClick={closeSheet}>
                  Profil Saya
                </Link>
                <Link href="/settings" className="gn-menu-item" onClick={closeSheet}>
                  Pengaturan Akun
                </Link>
                {!user.roles.includes("merchant") && (
                  <Link href="/merchant/kyc" className="gn-popover-link" onClick={closeSheet}>
                    Daftar Jadi Merchant Resmi (KYC)
                  </Link>
                )}
                {!user.roles.includes("creator") && (
                  <Link href="/creator/join" className="gn-popover-link" onClick={closeSheet}>
                    Gabung Program Kreator
                  </Link>
                )}
                <button
                  type="button"
                  className="gn-menu-item gn-menu-item-danger"
                  onClick={() => {
                    closeSheet();
                    logout();
                    router.push("/login");
                  }}
                >
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <div className="gn-sheet-guest">
              <p className="gn-user-name">Masuk ke SocMark</p>
              <Link href="/login" className="gn-btn gn-btn-solid" onClick={closeSheet}>
                Login
              </Link>
              <Link href="/register" className="gn-btn gn-btn-outline" onClick={closeSheet}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <nav className="gn-dock" aria-label="Navigasi bawah">
        <Link href="/" className={`gn-dock-item${isFeed ? " is-active" : ""}`} aria-current={isFeed ? "page" : undefined}>
          Feed
        </Link>
        <Link href="/discover" className={`gn-dock-item${isShop ? " is-active" : ""}`} aria-current={isShop ? "page" : undefined}>
          Shop
        </Link>

        {createEnabled ? (
          <Link href={createHref} className="gn-dock-create">
            Create
          </Link>
        ) : (
          <button
            type="button"
            className="gn-dock-create"
            disabled
            aria-disabled="true"
            title="Hanya untuk Creator dan Merchant"
          >
            Create
          </button>
        )}

        <Link href="/messages" className={`gn-dock-item${isInbox ? " is-active" : ""}`} aria-current={isInbox ? "page" : undefined}>
          <span>Inbox</span>
          <CountBadge count={inboxCount} />
        </Link>
        <button
          type="button"
          className={`gn-dock-item${isMe ? " is-active" : ""}`}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen((v) => !v)}
        >
          Me
        </button>
      </nav>
    </>
  );
}
