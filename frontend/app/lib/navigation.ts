export interface NavTab {
  label: string;
  href: string;
  live?: boolean;
  isActive: (pathname: string) => boolean;
}

export const NAV_TABS: NavTab[] = [
  { label: "Feed", href: "/", isActive: (p) => p === "/" || p.startsWith("/feed") },
  { label: "Explore Shop", href: "/discover", isActive: (p) => p.startsWith("/discover") },
  { label: "Live", href: "/live", live: true, isActive: (p) => p.startsWith("/live") },
  { label: "Creators", href: "/creators", isActive: (p) => p.startsWith("/creators") },
];

/** Routes that render their own full-screen chrome and must not get the shell navigation. */
export const SHELL_HIDDEN_ROUTES = ["/login", "/register", "/admin"];

export function isShellHidden(pathname: string): boolean {
  return SHELL_HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
