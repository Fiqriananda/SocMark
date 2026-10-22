"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const OPEN_SEARCH_EVENT = "socmark:openSearch";

export function openSearchPalette() {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}

/** Desktop search trigger (center zone). Opens the global command palette. */
export default function GlobalSearchInput() {
  const [shortcut, setShortcut] = useState("Ctrl+K");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only platform detection
    if (/Mac|iPhone|iPad/i.test(navigator.platform)) setShortcut("⌘K");
  }, []);

  return (
    <button
      type="button"
      className="gn-search"
      onClick={openSearchPalette}
      aria-label="Cari produk, kreator, dan toko"
      aria-keyshortcuts="Control+K Meta+K"
    >
      <svg className="gn-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4 4" />
      </svg>
      <span className="gn-search-placeholder">Cari produk, kreator, atau toko</span>
      <kbd className="gn-kbd">{shortcut}</kbd>
    </button>
  );
}

const QUICK_LINKS = [
  { label: "Explore Shop", href: "/discover" },
  { label: "Creators", href: "/creators" },
  { label: "Live", href: "/live" },
];

/** Mounted once in AppShell. Listens for Cmd/Ctrl+K and the openSearch event. */
export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "Escape") {
        close();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/discover?q=${encodeURIComponent(q)}`);
    close();
  };

  return (
    <div className="gn-palette-overlay" onMouseDown={close}>
      <div
        className="gn-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian global"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <form onSubmit={submit}>
          <input
            ref={inputRef}
            className="gn-palette-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk, kreator, dan etalase toko"
            aria-label="Kata kunci pencarian"
          />
        </form>
        <div className="gn-palette-section">
          <p className="gn-popover-title">Pintasan</p>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  className="gn-palette-item"
                  onClick={() => {
                    router.push(link.href);
                    close();
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
