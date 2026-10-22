"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { CountBadge, useBumpOnIncrease } from "./NavActionBadges";
import { openSearchPalette } from "./GlobalSearchInput";
import { Wordmark } from "./GlobalNavbar";
import RoleSwitcherDropdown from "./RoleSwitcherDropdown";

/** Compact header for < 768px. */
export default function MobileTopBar() {
  const { status, user, activeRole, isSwitchingRole, switchRole } = useAuth();
  const { cartCount } = useCart();
  const bump = useBumpOnIncrease(cartCount);

  return (
    <header className="gn-mobile-top">
      <Wordmark />
      <div className="gn-mobile-top-actions">
        <button type="button" className="gn-mobile-link" onClick={openSearchPalette}>
          Search
        </button>

        {status === "authenticated" && user && (
          <>
            <Link
              href="/cart"
              className="gn-mobile-link"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} item` : "Cart"}
            >
              <span>Cart</span>
              <CountBadge count={cartCount} bump={bump} />
            </Link>
            <RoleSwitcherDropdown
              compact
              activeRole={activeRole}
              availableRoles={user.roles}
              isSwitching={isSwitchingRole}
              onSwitchRole={switchRole}
            />
          </>
        )}

        {status === "guest" && (
          <Link href="/login" className="gn-btn gn-btn-solid gn-btn-sm">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
