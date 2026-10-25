"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./checkout.css";

/* ---------- Data mock ---------- */
const COURIERS = [
  {
    id: "express",
    name: "Express Escrow Courier (1-2 Days)",
    desc: "Includes real-time GPS tracking & insurance",
    price: 12,
  },
  {
    id: "standard",
    name: "Standard Postal Delivery (3-5 Days)",
    desc: "Regular recorded parcel delivery",
    price: 5,
  },
] as const;

const PAYMENTS = [
  { id: "va", title: "Virtual Account / Instant Bank Transfer", icon: "bank" },
  { id: "card", title: "Credit / Debit Card (Visa, Mastercard)", icon: "card" },
  { id: "wallet", title: "E-Wallet (GoPay, OVO, ShopeePay)", icon: "wallet" },
] as const;

const ITEM = {
  name: "Oversized Heavyweight Tee",
  qty: 1,
  price: 38,
  variant: "Black / XL",
};
const ESCROW_FEE = 1.5;
const VOUCHER = 5;

const formatUSD = (n: number) => `$${n.toFixed(2)}`;

/* ---------- Ikon inline SVG ---------- */
const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const CheckIcon = () => (
  <svg className="step-check" {...svgProps}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LocationPinIcon = () => (
  <svg className="location-pin-icon" {...svgProps}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TruckIcon = () => (
  <svg className="truck-icon" {...svgProps}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CreditCardIcon = ({ className = "credit-card-icon" }: { className?: string }) => (
  <svg className={className} {...svgProps}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const ShieldLockIcon = () => (
  <svg className="shield-lock-icon" {...svgProps}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M10 11V9a2 2 0 0 1 4 0v2" />
  </svg>
);

const BankIcon = () => (
  <svg className="bank-icon" {...svgProps}>
    <path d="M3 21h18" />
    <path d="M3 10h18" />
    <path d="M12 3 3 10h18z" />
    <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
  </svg>
);

const WalletIcon = () => (
  <svg className="wallet-icon" {...svgProps}>
    <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);

const LockIcon = () => (
  <svg className="lock-icon" {...svgProps}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PaymentIcon = ({ type }: { type: (typeof PAYMENTS)[number]["icon"] }) => {
  if (type === "bank") return <BankIcon />;
  if (type === "card") return <CreditCardIcon className="card-icon" />;
  return <WalletIcon />;
};

/* ---------- Halaman ---------- */
export default function CheckoutPage() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [courier, setCourier] = useState<(typeof COURIERS)[number]["id"]>("express");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENTS)[number]["id"]>("va");
  const [isLoading, setIsLoading] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState({
    name: "John Doe",
    phone: "+62 812-3456-7890",
    full: "Jl. Sudirman No. 45, Kompleks Bisnis Sentral, Jakarta Selatan, 12190",
  });
  const [draft, setDraft] = useState(address);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const selectedCourier = COURIERS.find((c) => c.id === courier)!;
  const itemsSubtotal = ITEM.price * ITEM.qty;
  const shippingFee = selectedCourier.price;
  const grandTotal = itemsSubtotal + shippingFee + ESCROW_FEE - VOUCHER;

  const openAddressModal = () => {
    setDraft(address);
    setShowAddressModal(true);
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.phone.trim() || !draft.full.trim()) return;
    setAddress(draft);
    setShowAddressModal(false);
  };

  const handlePlaceOrder = () => {
    if (isLoading) return;
    setIsLoading(true);
    // Simulasi proses pembayaran, lalu redirect ke /orders
    timerRef.current = setTimeout(() => {
      router.push("/orders");
    }, 2000);
  };

  return (
    <div className="checkout-page">
      <Navbar />
      <main className="checkout-container">
        <header className="checkout-header">
          <div className="checkout-heading">
            <div className="checkout-heading-badge">
              <span className="checkout-badge-pulse" aria-hidden="true" />
              Secure shopping
            </div>
            <h1>Checkout</h1>
            <p>Review your order, delivery, and payment details before placing your order.</p>
          </div>
          <div className="step-indicator">
            <span className="step completed">
              <CheckIcon /> Cart
            </span>
            <span className="step-separator">──</span>
            <span className="step active">2. Checkout &amp; Shipping</span>
            <span className="step-separator">──</span>
            <span className="step pending">3. Payment Success</span>
          </div>
        </header>

        <div className="checkout-grid">
          {/* Kolom Kiri: Alamat, Ekspedisi, Metode Pembayaran */}
          <section className="checkout-steps-section">
            {/* Langkah 1: Alamat Pengiriman */}
            <article className="checkout-card address-card">
              <header className="card-header">
                <div className="title-box">
                  <LocationPinIcon />
                  <h2>Shipping Address</h2>
                </div>
                <button
                  type="button"
                  className="btn-change-address"
                  onClick={openAddressModal}
                >
                  Change Address
                </button>
              </header>
              <div className="selected-address-box">
                <span className="badge-default-address">Primary</span>
                <p className="recipient-name">
                  {address.name} <span className="phone">({address.phone})</span>
                </p>
                <p className="full-address">{address.full}</p>
              </div>
            </article>

            {/* Langkah 2: Opsi Pengiriman & Ekspedisi */}
            <article className="checkout-card courier-card">
              <header className="card-header">
                <div className="title-box">
                  <TruckIcon />
                  <h2>Delivery Service</h2>
                </div>
              </header>
              <div className="courier-option-group">
                {COURIERS.map((c) => (
                  <label
                    key={c.id}
                    className={`courier-option${courier === c.id ? " active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="courier"
                      checked={courier === c.id}
                      onChange={() => setCourier(c.id)}
                    />
                    <div className="courier-meta">
                      <span className="courier-name">{c.name}</span>
                      <span className="courier-desc">{c.desc}</span>
                    </div>
                    <span className="courier-price">{formatUSD(c.price)}</span>
                  </label>
                ))}
              </div>
            </article>

            {/* Langkah 3: Metode Pembayaran Bergaransi Escrow */}
            <article className="checkout-card payment-method-card">
              <header className="card-header">
                <div className="title-box">
                  <CreditCardIcon />
                  <h2>Payment Method</h2>
                </div>
              </header>

              <div className="escrow-banner-highlight">
                <ShieldLockIcon />
                <div className="escrow-text">
                  <h4>100% SocMark Escrow Protection</h4>
                  <p>
                    Dana Anda disimpan secara aman di rekening penampungan resmi
                    SocMark dan baru diteruskan ke rekening penjual setelah Anda
                    mengonfirmasi barang diterima dengan baik.
                  </p>
                </div>
              </div>

              <div className="payment-options-accordion">
                {PAYMENTS.map((p) => (
                  <label
                    key={p.id}
                    className={`payment-channel${paymentMethod === p.id ? " active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === p.id}
                      onChange={() => setPaymentMethod(p.id)}
                    />
                    <span className="channel-title">{p.title}</span>
                    <PaymentIcon type={p.icon} />
                  </label>
                ))}
              </div>
            </article>
          </section>

          {/* Kolom Kanan: Item Review & Breakdown Biaya */}
          <aside className="checkout-summary-sidebar">
            <div className="order-final-card">
              <h3>Order Review</h3>
              <ul className="checkout-item-preview">
                <li className="preview-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/mock-thumb.jpg" alt="Product" className="mini-thumb" />
                  <div className="mini-details">
                    <h5>{ITEM.name}</h5>
                    <span>
                      Qty: {ITEM.qty} × {formatUSD(ITEM.price)} ({ITEM.variant})
                    </span>
                  </div>
                  <span className="item-subtotal">{formatUSD(itemsSubtotal)}</span>
                </li>
              </ul>

              <div className="cost-breakdown">
                <div className="cost-row">
                  <span>Items Subtotal</span>
                  <span>{formatUSD(itemsSubtotal)}</span>
                </div>
                <div className="cost-row">
                  <span>Shipping Fee</span>
                  <span>{formatUSD(shippingFee)}</span>
                </div>
                <div className="cost-row">
                  <span>Escrow Platform Fee</span>
                  <span>{formatUSD(ESCROW_FEE)}</span>
                </div>
                <div className="cost-row discount">
                  <span>Voucher Applied</span>
                  <span>-{formatUSD(VOUCHER)}</span>
                </div>
                <hr className="divider" />
                <div className="cost-total-row">
                  <span>Grand Total</span>
                  <span className="final-price">{formatUSD(grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                className={`btn-place-order${isLoading ? " loading" : ""}`}
                onClick={handlePlaceOrder}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <LockIcon />
                    <span>Pay &amp; Activate Escrow Protection</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>

      {/* Modal Ganti Alamat */}
      {showAddressModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          onClick={() => setShowAddressModal(false)}
        >
          <form
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveAddress}
          >
            <h3 id="address-modal-title">Change Shipping Address</h3>

            <label className="field">
              <span>Recipient Name</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Full Address</span>
              <textarea
                rows={3}
                value={draft.full}
                onChange={(e) => setDraft({ ...draft, full: e.target.value })}
                required
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddressModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
