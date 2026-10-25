"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ROLE_META, ROLE_ORDER, type ActiveRole } from "../../lib/roles";
import { useDismiss } from "../../lib/useDismiss";

interface RoleSwitcherDropdownProps {
  activeRole: ActiveRole;
  availableRoles: ActiveRole[];
  isSwitching?: boolean;
  /** Short label ("Buyer") for the mobile top bar. */
  compact?: boolean;
  onSwitchRole: (target: ActiveRole) => void | Promise<void>;
}

export default function RoleSwitcherDropdown({
  activeRole,
  availableRoles,
  isSwitching = false,
  compact = false,
  onSwitchRole,
}: RoleSwitcherDropdownProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const current = ROLE_META[activeRole];
  const hasMerchant = availableRoles.includes("merchant");
  const hasCreator = availableRoles.includes("creator");

  const handleSelect = async (role: ActiveRole) => {
    setError(null);
    if (role === activeRole) {
      close();
      return;
    }
    try {
      await onSwitchRole(role);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengganti role.");
    }
  };

  return (
    <div className="gn-popover-root" ref={rootRef}>
      <button
        type="button"
        className={`gn-role-pill${compact ? " gn-role-pill-compact" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="gn-dot" style={{ backgroundColor: current.dotColor }} aria-hidden="true" />
        <span>{compact ? current.pillLabel.split(" ")[0] : current.pillLabel}</span>
        <svg className="gn-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className={`gn-popover gn-role-popover${compact ? " gn-popover-start" : ""}`} role="menu" aria-label="Pilih mode akun">
          <p className="gn-popover-title">Mode aktif</p>
          <ul className="gn-role-list">
            {ROLE_ORDER.filter((r) => availableRoles.includes(r)).map((role) => {
              const meta = ROLE_META[role];
              const selected = role === activeRole;
              return (
                <li key={role}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    disabled={isSwitching}
                    className={`gn-role-option${selected ? " is-selected" : ""}`}
                    onClick={() => handleSelect(role)}
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

          {(!hasMerchant || !hasCreator) && (
            <div className="gn-popover-footer">
              {!hasMerchant && (
                <Link href="/merchant/kyc" className="gn-popover-link" onClick={close}>
                  Daftar Jadi Merchant Resmi (KYC)
                </Link>
              )}
              {!hasCreator && (
                <Link href="/creator/join" className="gn-popover-link" onClick={close}>
                  Gabung Program Kreator
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
