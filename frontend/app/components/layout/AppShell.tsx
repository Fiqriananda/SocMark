"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isShellHidden } from "../../lib/navigation";
import GlobalNavbar from "./GlobalNavbar";
import { SearchPalette } from "./GlobalSearchInput";
import MobileBottomDock from "./MobileBottomDock";
import MobileTopBar from "./MobileTopBar";

/**
 * Master layout wrapper. Mount once in the root layout:
 *   <Providers><AppShell>{children}</AppShell></Providers>
 * Auth screens and /admin render their own chrome, so the shell stays out of their way.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isShellHidden(pathname)) return <>{children}</>;

  return (
    <div className="gn-shell">
      <GlobalNavbar />
      <MobileTopBar />
      <div className="gn-shell-content">{children}</div>
      <MobileBottomDock />
      <SearchPalette />
    </div>
  );
}
