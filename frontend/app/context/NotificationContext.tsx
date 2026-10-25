"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface NotificationContextValue {
  /** Unread negotiation messages (#4.7). */
  unreadMessages: number;
  /** Social activity + order status alerts. */
  unreadNotifications: number;
  setUnreadMessages: (count: number) => void;
  setUnreadNotifications: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const value = useMemo(
    () => ({ unreadMessages, unreadNotifications, setUnreadMessages, setUnreadNotifications }),
    [unreadMessages, unreadNotifications],
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
