"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavActionBadgesProps {
  cartCount: number;
  messageCount: number;
  notificationCount: number;
}

export function formatBadge(count: number): string {
  return count > 99 ? "99+" : String(count);
}

/** Counter pill. Renders nothing when the value is 0 (or invalid). */
export function CountBadge({ count, bump = false }: { count: number; bump?: boolean }) {
  if (!Number.isFinite(count) || count <= 0) return null;
  return (
    <span className={`gn-badge${bump ? " gn-badge-bump" : ""}`} aria-hidden="true">
      {formatBadge(count)}
    </span>
  );
}

/** Returns true briefly whenever `value` increases, to trigger the bump animation. */
export function useBumpOnIncrease(value: number): boolean {
  const previous = useRef(value);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (value > previous.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 450);
      previous.current = value;
      return () => window.clearTimeout(timer);
    }
    previous.current = value;
  }, [value]);

  return bump;
}

export default function NavActionBadges({
  cartCount,
  messageCount,
  notificationCount,
}: NavActionBadgesProps) {
  const pathname = usePathname();
  const cartBump = useBumpOnIncrease(cartCount);

  const items = [
    {
      id: "gn-action-cart",
      href: "/cart",
      label: "Cart",
      count: cartCount,
      bump: cartBump,
      noun: "item di keranjang",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3.5 4.5h2l2.2 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4l1.3-6.3H6.2" />
          <circle cx="10" cy="19.5" r="1" />
          <circle cx="17" cy="19.5" r="1" />
        </svg>
      ),
    },
    {
      id: "gn-action-messages",
      href: "/messages",
      label: "Messages",
      count: messageCount,
      bump: false,
      noun: "pesan belum dibaca",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5.5h16v12H9l-5 3v-15Z" />
          <path d="M8 10h8M8 13.5h5" />
        </svg>
      ),
    },
    {
      id: "gn-action-notifications",
      href: "/notifications",
      label: "Notifications",
      count: notificationCount,
      bump: false,
      noun: "notifikasi baru",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8.5h17C20.5 16 18 16 18 9Z" />
          <path d="M10 20h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="gn-actions" role="group" aria-label="Aksi cepat">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`gn-action ${item.id}${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
            aria-label={item.count > 0 ? `${item.label}, ${item.count} ${item.noun}` : item.label}
          >
            {item.icon}
            <CountBadge count={item.count} bump={item.bump} />
          </Link>
        );
      })}
    </div>
  );
}
