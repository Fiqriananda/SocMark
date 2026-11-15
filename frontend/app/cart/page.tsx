"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, type CartItem } from "../context/CartContext";
import Footer from "../components/Footer";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/* SVG Checkbox — draws both the unchecked (empty box) and checked (box + tick) states. */
function CheckboxSvg({ checked }: { checked: boolean }) {
  return (
    <svg className="cart-checkbox-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect className="checkbox-box" x="1.5" y="1.5" width="17" height="17" rx="5" />
      {checked && <path className="checkbox-tick" d="m6 10.2 2.8 2.8L14 7.5" />}
    </svg>
  );
}

/* Native <input type="checkbox"> (accessible) + inline SVG for the visual states. */
function Checkbox({
  checked,
  label,
  onChange,
  className,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  className: string;
}) {
  return (
    <span className={`cart-checkbox-wrap${checked ? " is-checked" : ""}`}>
      <input
        type="checkbox"
        className={`${className} cart-checkbox-input`}
        checked={checked}
        aria-label={label}
        onChange={onChange}
      />
      <CheckboxSvg checked={checked} />
    </span>
  );
}

function StoreIcon() {
  return (
    <svg className="shop-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10h18l-1.5-6h-15L3 10Z" />
      <path d="M5 10v10h14V10M9 20v-6h6v6M3 10c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="attribution-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2" width="13" height="12" rx="3" />
      <path d="m6.5 5.25 4 2.75-4 2.75v-5.5Z" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 5.5h13M8 5.5V3.75h4V5.5m3.5 0-.75 11h-9.5l-.75-11M8.25 8.5v5.5m3.5-5.5v5.5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="arrow-right-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 10h13m-5-5 5 5-5 5" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="shield-check-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function EmptyBagIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M13 22h38l3 33H10l3-33Z" />
      <path d="M23 24v-5a9 9 0 0 1 18 0v5" />
      <path d="M25 36h14" />
    </svg>
  );
}

function groupByShop(items: CartItem[]) {
  const groups = new Map<string, CartItem[]>();
  for (const item of items) {
    const group = groups.get(item.shopId) ?? [];
    group.push(item);
    groups.set(item.shopId, group);
  }
  return Array.from(groups.entries());
}

export default function CartPage() {
  const router = useRouter();
  const { hydrated, items, cartCount, setItemQuantity, removeCartItem } = useCart();
  const [unselectedIds, setUnselectedIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const removalTimers = useRef(new Map<string, number>());

  useEffect(
    () => () => {
      removalTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => !unselectedIds.has(item.id)),
    [items, unselectedIds],
  );
  const selectedCount = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  const discount = promoApplied ? Math.min(10, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const shopGroups = useMemo(() => groupByShop(items), [items]);
  const isEmpty = items.length === 0;

  const toggleItem = (id: string) => {
    setUnselectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setUnselectedIds((previous) => {
      const next = new Set(previous);
      if (allSelected) items.forEach((item) => next.add(item.id));
      else items.forEach((item) => next.delete(item.id));
      return next;
    });
  };

  const toggleShop = (shopItems: CartItem[]) => {
    const shopSelected = shopItems.every((item) => !unselectedIds.has(item.id));
    setUnselectedIds((previous) => {
      const next = new Set(previous);
      shopItems.forEach((item) => {
        if (shopSelected) next.add(item.id);
        else next.delete(item.id);
      });
      return next;
    });
  };

  const removeItem = (item: CartItem) => {
    if (removingIds.has(item.id)) return;
    setRemovingIds((previous) => new Set(previous).add(item.id));
    const timer = window.setTimeout(() => {
      removeCartItem(item.id);
      setUnselectedIds((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
      setRemovingIds((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
      removalTimers.current.delete(item.id);
    }, 220);
    removalTimers.current.set(item.id, timer);
  };

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() !== "SOCMARK10") {
      setPromoApplied(false);
      setPromoMessage("Invalid promo code. Try SOCMARK10.");
      return;
    }
    setPromoApplied(true);
    setPromoMessage("SOCMARK10 applied. $10 off your selected items.");
  };

  return (
    <>
      <main className="cart-page">
        <div className="cart-container">
          <header className="cart-header">
            <h1>
              Shopping Cart{" "}
              <span className="cart-badge-count">
                ({cartCount} {cartCount === 1 ? "item" : "items"})
              </span>
            </h1>
            <button
              type="button"
              className="btn-select-all"
              aria-pressed={allSelected}
              hidden={isEmpty}
              onClick={toggleAll}
            >
              <span className={`cart-checkbox-wrap${allSelected ? " is-checked" : ""}`}>
                <CheckboxSvg checked={allSelected} />
              </span>
              <span>Select All</span>
            </button>
          </header>

          <div className="cart-content-layout" hidden={isEmpty}>
            {/* Kolom utama: list produk dikelompokkan per toko */}
            <section className="cart-items-section" aria-label="Items in your cart">
              {shopGroups.map(([shopId, shopItems]) => {
                const shopSelected = shopItems.every((item) => !unselectedIds.has(item.id));
                return (
                  <article className="shop-cart-card" key={shopId}>
                    <header className="shop-header">
                      <Checkbox
                        className="shop-checkbox"
                        checked={shopSelected}
                        label={`Select all items from ${shopItems[0].shopName}`}
                        onChange={() => toggleShop(shopItems)}
                      />
                      <div className="shop-info">
                        <StoreIcon />
                        <h3>{shopItems[0].shopName}</h3>
                        {shopItems.some((item) => item.officialStore) && (
                          <span className="badge-official">Official Store</span>
                        )}
                      </div>
                    </header>

                    <ul className="cart-item-list">
                      {shopItems.map((item) => (
                        <li
                          className={`cart-item-row${removingIds.has(item.id) ? " is-removing" : ""}`}
                          key={item.id}
                        >
                          <Checkbox
                            className="item-checkbox"
                            checked={!unselectedIds.has(item.id)}
                            label={`Select ${item.title}`}
                            onChange={() => toggleItem(item.id)}
                          />
                          <Image
                            className="item-thumb"
                            src={item.image}
                            alt={item.title}
                            width={88}
                            height={88}
                            unoptimized
                          />
                          <div className="item-details">
                            <h4 className="item-title">{item.title}</h4>
                            <div className="item-variant-tag">Varian: {item.variant}</div>

                            {/* Attribution tag (ciri khas SocMark) */}
                            <div className="creator-attribution-badge">
                              <PlayIcon />
                              <span>
                                Ditambahkan dari video <strong>{item.sourceCreator}</strong>
                              </span>
                            </div>

                            <div className="item-price-row">
                              <span className="unit-price">{currency.format(item.unitPrice)}</span>
                              <div className="quantity-controller" aria-label={`Quantity for ${item.title}`}>
                                <button
                                  type="button"
                                  className="btn-qty-minus"
                                  aria-label={`Decrease quantity of ${item.title}`}
                                  disabled={item.quantity <= 1}
                                  onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                                >
                                  <MinusIcon />
                                </button>
                                <span className="qty-value" aria-live="polite">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="btn-qty-plus"
                                  aria-label={`Increase quantity of ${item.title}`}
                                  onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                                >
                                  <PlusIcon />
                                </button>
                              </div>
                              <button
                                type="button"
                                className="btn-remove-item"
                                aria-label={`Remove ${item.title} from cart`}
                                onClick={() => removeItem(item)}
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </section>

            {/* Kolom kanan: ringkasan belanja (sticky order summary) */}
            <aside className="cart-summary-sidebar" aria-label="Order summary">
              <div className="summary-card">
                <h2>Order Summary</h2>

                <div className="promo-input-group">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") applyPromo();
                    }}
                    placeholder="Enter coupon or promo code"
                    aria-label="Coupon or promo code"
                  />
                  <button type="button" className="btn-apply-promo" onClick={applyPromo}>
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`promo-message${promoApplied ? " is-success" : " is-error"}`} role="status">
                    {promoMessage}
                  </p>
                )}

                <div className="summary-calculation">
                  <div className="summary-row">
                    <span>Selected Items Subtotal</span>
                    <span className="price-val">{currency.format(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Shipping</span>
                    <span className="price-val">Calculated next</span>
                  </div>
                  <div className="summary-row discount">
                    <span>Platform Voucher</span>
                    <span className="discount-val">-{currency.format(discount)}</span>
                  </div>
                  <hr className="divider" />
                  <div className="summary-total-row">
                    <span className="total-label">Estimated Total</span>
                    <span className="total-price">{currency.format(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-checkout-primary"
                  disabled={selectedCount === 0}
                  onClick={() => router.push("/checkout")}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRightIcon />
                </button>

                <div className="escrow-assurance-notice">
                  <ShieldCheckIcon />
                  <p>
                    Transaksi dilindungi oleh <strong>SocMark Escrow Protection</strong>
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* Empty state (conditional render) — tersembunyi sampai keranjang selesai dimuat dan benar-benar kosong */}
          <section className="cart-empty-state" hidden={!hydrated || !isEmpty}>
            <div className="empty-state-graphic">
              <EmptyBagIcon />
            </div>
            <h2>Keranjang Belanja Masih Kosong</h2>
            <p>Jelajahi video tren terbaru atau cari barang favorit Anda sekarang!</p>
            <button type="button" className="btn-explore" onClick={() => router.push("/")}>
              Explore Feed
            </button>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
