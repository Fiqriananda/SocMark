"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./checkout.css";

const couriers = [
  { id: "express", name: "Express Escrow Courier (1-2 Days)", price: 12 },
  { id: "standard", name: "Standard Postal Delivery (3-5 Days)", price: 5 },
] as const;

const payments = [
  { id: "va", title: "Virtual Account / Instant Bank Transfer", icon: "bank" },
  { id: "card", title: "Credit / Debit Card (Visa, Mastercard)", icon: "card" },
  { id: "wallet", title: "E-Wallet (GoPay, OVO, ShopeePay)", icon: "wallet" },
] as const;

const item = { name: "Oversized Heavyweight Tee", price: 38, variant: "Black / XL" };
const initialAddress = {
  name: "John Doe",
  phone: "+62 812-3456-7890",
  full: "Jl. Sudirman No. 45, Kompleks Bisnis Sentral, Jakarta Selatan, 12190",
};
const escrowFee = 1.5;
const voucher = 5;
const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

type IconName = "check" | "pin" | "truck" | "card" | "shield" | "bank" | "wallet" | "lock";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "check" && <path d="m5 12 4 4L19 6" />}
      {name === "pin" && <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>}
      {name === "truck" && <><path d="M2 4h13v13H2zM15 9h4l3 3v5h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>}
      {name === "card" && <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /></>}
      {name === "shield" && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>}
      {name === "bank" && <><path d="m3 10 9-7 9 7M4 11h16M5 11v8m5-8v8m4-8v8m5-8v8M3 21h18" /></>}
      {name === "wallet" && <><path d="M20 8V5H6a2 2 0 0 0 0 4h15v11H6a3 3 0 0 1-3-3V7" /><path d="M16 14h5" /></>}
      {name === "lock" && <><rect x="4" y="11" width="16" height="11" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></>}
    </svg>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [courier, setCourier] = useState<(typeof couriers)[number]["id"]>("express");
  const [payment, setPayment] = useState<(typeof payments)[number]["id"]>("va");
  const [address, setAddress] = useState(initialAddress);
  const [draft, setDraft] = useState(initialAddress);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const shipping = couriers.find((option) => option.id === courier)?.price ?? 0;
  const total = item.price + shipping + escrowFee - voucher;

  function openAddressModal() {
    setDraft(address);
    setShowAddressModal(true);
  }

  function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddress(draft);
    setShowAddressModal(false);
  }

  function placeOrder() {
    if (loading) return;
    setLoading(true);
    timer.current = setTimeout(() => router.push("/orders"), 2000);
  }

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
            <span className="step completed"><Icon name="check" className="step-check" /> Cart</span>
            <span className="step-separator">──</span>
            <span className="step active">2. Checkout &amp; Shipping</span>
            <span className="step-separator">──</span>
            <span className="step pending">3. Payment Success</span>
          </div>
        </header>

        <div className="checkout-grid">
          <section className="checkout-steps-section">
            <article className="checkout-card address-card">
              <header className="card-header">
                <div className="title-box"><Icon name="pin" className="location-pin-icon" /><h2>Shipping Address</h2></div>
                <button type="button" className="btn-change-address" onClick={openAddressModal}>Change Address</button>
              </header>
              <div className="selected-address-box">
                <span className="badge-default-address">Primary</span>
                <p className="recipient-name">{address.name} <span className="phone">({address.phone})</span></p>
                <p className="full-address">{address.full}</p>
              </div>
            </article>

            <article className="checkout-card courier-card">
              <header className="card-header">
                <div className="title-box"><Icon name="truck" className="truck-icon" /><h2>Delivery Service</h2></div>
              </header>
              <div className="courier-option-group">
                {couriers.map((option) => (
                  <label className={`courier-option${courier === option.id ? " active" : ""}`} key={option.id}>
                    <input type="radio" name="courier" checked={courier === option.id} onChange={() => setCourier(option.id)} />
                    <span className="courier-meta">
                      <span className="courier-name">{option.name}</span>
                      <span className="courier-desc">Includes tracking and delivery protection</span>
                    </span>
                    <span className="courier-price">{formatMoney(option.price)}</span>
                  </label>
                ))}
              </div>
            </article>

            <article className="checkout-card payment-method-card">
              <header className="card-header">
                <div className="title-box"><Icon name="card" className="credit-card-icon" /><h2>Payment Method</h2></div>
              </header>
              <div className="escrow-banner-highlight">
                <Icon name="shield" className="shield-lock-icon" />
                <div className="escrow-text">
                  <h4>100% SocMark Escrow Protection</h4>
                  <p>Dana diteruskan kepada penjual setelah Anda mengonfirmasi barang diterima dengan baik.</p>
                </div>
              </div>
              <div className="payment-options-accordion">
                {payments.map((option) => (
                  <label className={`payment-channel${payment === option.id ? " active" : ""}`} key={option.id}>
                    <input type="radio" name="payment" checked={payment === option.id} onChange={() => setPayment(option.id)} />
                    <span className="channel-title">{option.title}</span>
                    <Icon name={option.icon} className={`${option.icon}-icon`} />
                  </label>
                ))}
              </div>
            </article>
          </section>

          <aside className="checkout-summary-sidebar">
            <div className="order-final-card">
              <h3>Order Review</h3>
              <ul className="checkout-item-preview">
                <li className="preview-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/mock-thumb.jpg" alt="Product" className="mini-thumb" />
                  <div className="mini-details">
                    <h5>{item.name}</h5>
                    <span>Qty: 1 × {formatMoney(item.price)} ({item.variant})</span>
                  </div>
                  <span className="item-subtotal">{formatMoney(item.price)}</span>
                </li>
              </ul>
              <div className="cost-breakdown">
                <div className="cost-row"><span>Items Subtotal</span><span>{formatMoney(item.price)}</span></div>
                <div className="cost-row"><span>Shipping Fee</span><span>{formatMoney(shipping)}</span></div>
                <div className="cost-row"><span>Escrow Platform Fee</span><span>{formatMoney(escrowFee)}</span></div>
                <div className="cost-row discount"><span>Voucher Applied</span><span>-{formatMoney(voucher)}</span></div>
                <hr className="divider" />
                <div className="cost-total-row"><span>Grand Total</span><span className="final-price">{formatMoney(total)}</span></div>
              </div>
              <button type="button" className={`btn-place-order${loading ? " loading" : ""}`} onClick={placeOrder} disabled={loading} aria-busy={loading}>
                {loading ? <><span className="spinner" aria-hidden="true" /><span>Processing Payment...</span></> : <><Icon name="lock" className="lock-icon" /><span>Pay &amp; Activate Escrow Protection</span></>}
              </button>
            </div>
          </aside>
        </div>

        {showAddressModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="address-modal-title" onClick={() => setShowAddressModal(false)}>
            <form className="modal-box" onClick={(event) => event.stopPropagation()} onSubmit={saveAddress}>
              <h3 id="address-modal-title">Change Shipping Address</h3>
              <label className="field"><span>Recipient Name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label>
              <label className="field"><span>Phone</span><input type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} required /></label>
              <label className="field"><span>Full Address</span><textarea rows={3} value={draft.full} onChange={(event) => setDraft({ ...draft, full: event.target.value })} required /></label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
