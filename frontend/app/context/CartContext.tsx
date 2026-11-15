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

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  unitPrice: number;
  image: string;
  shopId: string;
  shopName: string;
  officialStore: boolean;
  variant: string;
  sourceCreator: string;
  sourcePostId: number;
  quantity: number;
}

interface NewCartItem extends Omit<CartItem, "quantity"> {
  quantity?: number;
}

interface CartContextValue {
  hydrated: boolean;
  cartCount: number;
  items: CartItem[];
  addCartItem: (item: NewCartItem) => void;
  setItemQuantity: (id: string, quantity: number) => void;
  removeCartItem: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    typeof item.image === "string" &&
    typeof item.shopId === "string" &&
    typeof item.shopName === "string" &&
    typeof item.officialStore === "boolean" &&
    typeof item.variant === "string" &&
    typeof item.sourceCreator === "string" &&
    typeof item.sourcePostId === "number" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function readCartItems(): CartItem[] {
  const raw = readStorage(STORAGE_KEYS.cartItems);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rehydrate the client cart from localStorage once
    setItems(readCartItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const count = items.reduce((total, item) => total + item.quantity, 0);
    writeStorage(STORAGE_KEYS.cartItems, JSON.stringify(items));
    writeStorage(STORAGE_KEYS.cart, String(count));
  }, [hydrated, items]);

  const addCartItem = useCallback((item: NewCartItem) => {
    const quantity =
      item.quantity && Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    setItems((previous) => {
      const existing = previous.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return previous.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem,
        );
      }
      return [...previous, { ...item, quantity }];
    });
  }, []);

  const setItemQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new RangeError("Jumlah produk harus minimal 1.");
    }
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const removeCartItem = useCallback((id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );
  const value = useMemo(
    () => ({ hydrated, cartCount, items, addCartItem, setItemQuantity, removeCartItem }),
    [hydrated, cartCount, items, addCartItem, setItemQuantity, removeCartItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
