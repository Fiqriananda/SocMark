"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStorage, STORAGE_KEYS, writeStorage } from "../lib/session";

interface CartContextValue {
  cartCount: number;
  setCartCount: (count: number) => void;
  /**
   * Optimistically bump the counter, then run `commit` (e.g. the Zero-Click Cart
   * request). If `commit` rejects, the counter rolls back.
   */
  addToCart: (quantity?: number, commit?: () => Promise<unknown>) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCountState] = useState(0);

  useEffect(() => {
    const stored = Number(readStorage(STORAGE_KEYS.cart));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only rehydration from localStorage
    if (Number.isFinite(stored) && stored > 0) setCartCountState(Math.floor(stored));
  }, []);

  const setCartCount = useCallback((count: number) => {
    const safe = Math.max(0, Math.floor(count));
    setCartCountState(safe);
    writeStorage(STORAGE_KEYS.cart, String(safe));
  }, []);

  const addToCart = useCallback(
    async (quantity = 1, commit?: () => Promise<unknown>) => {
      setCartCountState((prev) => {
        const next = prev + quantity;
        writeStorage(STORAGE_KEYS.cart, String(next));
        return next;
      });
      if (!commit) return;
      try {
        await commit();
      } catch (error) {
        setCartCountState((prev) => {
          const next = Math.max(0, prev - quantity);
          writeStorage(STORAGE_KEYS.cart, String(next));
          return next;
        });
        throw error;
      }
    },
    [],
  );

  const value = useMemo(() => ({ cartCount, setCartCount, addToCart }), [cartCount, setCartCount, addToCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
