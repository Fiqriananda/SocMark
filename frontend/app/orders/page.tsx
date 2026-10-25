"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import "./orders.css";

type OrderStatus =
  | "Pending Payment"
  | "In Escrow / Processing"
  | "Shipped"
  | "Completed"
  | "Disputed";

type TrackingEvent = {
  label: string;
  time: string;
};

type Order = {
  id: string;
  product: string;
  variant: string;
  seller: string;
  quantity: number;
  itemPrice: number;
  total: number;
  date: string;
  status: OrderStatus;
  courier?: string;
  trackingNumber?: string;
  currentStep: number;
  tracking: TrackingEvent[];
};

type Filter = "All" | OrderStatus;
type IconName = "package" | "shop" | "truck" | "shield" | "check" | "chat" | "alert" | "chevron" | "close" | "clock";

const INITIAL_ORDERS: Order[] = [
  {
    id: "SOC-2026-9081",
    product: "Oversized Heavyweight Tee",
    variant: "Color: Black | Size: XL",
    seller: "Urban Streetwear Official",
    quantity: 1,
    itemPrice: 38,
    total: 46.5,
    date: "24 Oct 2026, 14:30",
    status: "Shipped",
    courier: "J&T Express",
    trackingNumber: "JT889210293",
    currentStep: 2,
    tracking: [
      { label: "Order Paid", time: "24 Oct, 14:35" },
      { label: "Packed by Seller", time: "24 Oct, 18:20" },
      { label: "In Transit (Hub Jaksel)", time: "25 Oct, 09:15" },
      { label: "Out for Delivery", time: "Estimated today" },
      { label: "Received & Escrow Released", time: "--" },
    ],
  },
  {
    id: "SOC-2026-9075",
    product: "Wireless Headphones Pro",
    variant: "Color: Midnight | Warranty: 1 year",
    seller: "AudioHub Official",
    quantity: 1,
    itemPrice: 72,
    total: 79.5,
    date: "23 Oct 2026, 11:20",
    status: "In Escrow / Processing",
    courier: "AnterAja",
    trackingNumber: "ANT729100314",
    currentStep: 1,
    tracking: [
      { label: "Order Paid", time: "23 Oct, 11:26" },
      { label: "Being prepared by seller", time: "23 Oct, 14:10" },
      { label: "Handed to courier", time: "Waiting" },
      { label: "Out for Delivery", time: "Waiting" },
      { label: "Received & Escrow Released", time: "Waiting" },
    ],
  },
  {
    id: "SOC-2026-9062",
    product: "Minimalist Everyday Backpack",
    variant: "Color: Olive | Size: 20L",
    seller: "Urban Goods",
    quantity: 1,
    itemPrice: 52,
    total: 59.25,
    date: "22 Oct 2026, 16:45",
    status: "Pending Payment",
    currentStep: 0,
    tracking: [],
  },
  {
    id: "SOC-2026-9048",
    product: "Ceramic Pour-over Set",
    variant: "Color: Sand | Set of 3",
    seller: "Clay & Co.",
    quantity: 1,
    itemPrice: 34,
    total: 41.5,
    date: "18 Oct 2026, 09:12",
    status: "Completed",
    courier: "SiCepat",
    trackingNumber: "SC442108731",
    currentStep: 4,
    tracking: [
      { label: "Order Paid", time: "18 Oct, 09:15" },
      { label: "Packed by Seller", time: "18 Oct, 12:30" },
      { label: "In Transit", time: "19 Oct, 08:45" },
      { label: "Out for Delivery", time: "20 Oct, 10:05" },
      { label: "Received & Escrow Released", time: "20 Oct, 14:22" },
    ],
  },
  {
    id: "SOC-2026-9021",
    product: "Handmade Leather Card Holder",
    variant: "Color: Cognac",
    seller: "Atelier Nusa",
    quantity: 1,
    itemPrice: 28,
    total: 35.5,
    date: "16 Oct 2026, 13:04",
    status: "Disputed",
    courier: "JNE Express",
    trackingNumber: "JNE889209171",
    currentStep: 3,
    tracking: [
      { label: "Order Paid", time: "16 Oct, 13:10" },
      { label: "Packed by Seller", time: "16 Oct, 16:30" },
      { label: "In Transit", time: "17 Oct, 08:12" },
      { label: "Delivered", time: "18 Oct, 11:50" },
      { label: "Received & Escrow Released", time: "On hold" },
    ],
  },
];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "All", label: "All Orders" },
  { value: "Pending Payment", label: "Pending Payment" },
  { value: "In Escrow / Processing", label: "In Escrow" },
  { value: "Shipped", label: "Shipped" },
  { value: "Completed", label: "Completed" },
  { value: "Disputed", label: "Disputed" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  "Pending Payment": "Pending Payment",
  "In Escrow / Processing": "Processing (Escrow Secured)",
  Shipped: "Shipped (Escrow Secured)",
  Completed: "Completed",
  Disputed: "Dispute in Review",
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    "aria-hidden": true as const,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "package":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></svg>;
    case "shop":
      return <svg {...common}><path d="M3 10h18l-1.5-6h-15L3 10Z" /><path d="M5 10v10h14V10M9 20v-6h6v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></svg>;
    case "truck":
      return <svg {...common}><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" /><path d="M17 10v3h4" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="M12 8v4M12 16h.01" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "chat":
      return <svg {...common}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z" /></svg>;
    case "alert":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>;
    case "chevron":
      return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
    case "close":
      return <svg {...common}><path d="m18 6-12 12M6 6l12 12" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
  }
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function OrderCard({
  order,
  expanded,
  onToggleTracking,
  onConfirm,
  onDispute,
}: {
  order: Order;
  expanded: boolean;
  onToggleTracking: (id: string) => void;
  onConfirm: (order: Order) => void;
  onDispute: (order: Order) => void;
}) {
  const canRaiseDispute = order.status === "Shipped" || order.status === "In Escrow / Processing";
  const isCompleted = order.status === "Completed";

  return (
    <article className="order-card">
      <header className="order-card-header">
        <div className="order-meta-left">
          <span className="order-package-icon"><Icon name="package" /></span>
          <span className="order-id">Order #{order.id}</span>
          <span className="order-date">{order.date}</span>
        </div>
        <span className={`order-status-badge status-${order.status === "In Escrow / Processing" ? "processing" : order.status.toLowerCase().replaceAll(" ", "-")}`}>
          {order.status === "Shipped" && <Icon name="truck" />}
          {order.status === "Pending Payment" && <Icon name="clock" />}
          {order.status === "Completed" && <Icon name="check" />}
          {order.status === "Disputed" && <Icon name="alert" />}
          {STATUS_LABELS[order.status]}
        </span>
      </header>

      <div className="order-shop-tag">
        <Icon name="shop" />
        <span>Seller: <strong>{order.seller}</strong></span>
      </div>

      <ul className="order-items-list">
        <li className="order-item">
          <div className="order-thumb" aria-hidden="true"><Icon name="package" /></div>
          <div className="order-item-info">
            <h2>{order.product}</h2>
            <p className="variant">{order.variant}</p>
            <p className="qty-price">{order.quantity} × {formatPrice(order.itemPrice)}</p>
          </div>
          <span className="item-total">{formatPrice(order.itemPrice * order.quantity)}</span>
        </li>
      </ul>

      {order.status === "Pending Payment" ? (
        <div className="escrow-order-banner payment-pending-banner">
          <Icon name="clock" />
          <div>
            <p className="banner-title">Payment is waiting for you</p>
            <p className="banner-note">Selesaikan pembayaran agar dana Anda terlindungi oleh Escrow SocMark.</p>
          </div>
        </div>
      ) : order.status === "Disputed" ? (
        <div className="escrow-order-banner dispute-banner">
          <Icon name="alert" />
          <div>
            <p className="banner-title">Dispute sedang ditinjau</p>
            <p className="banner-note">Dana tetap aman di escrow hingga tim SocMark menyelesaikan laporan Anda.</p>
          </div>
        </div>
      ) : (
        <div className={`escrow-order-banner ${isCompleted ? "released-banner" : ""}`}>
          <Icon name="shield" />
          <div>
            <p className="banner-title">
              {isCompleted ? <>Dana sebesar <strong>{formatPrice(order.total)}</strong> telah diteruskan ke penjual.</> : <>Dana sebesar <strong>{formatPrice(order.total)}</strong> berada di Escrow SocMark.</>}
            </p>
            <p className="banner-note">
              {isCompleted
                ? "Transaksi selesai. Terima kasih telah berbelanja di SocMark."
                : "Dana otomatis dilepas ke penjual dalam 48 jam setelah barang terkirim jika tidak ada komplain."}
            </p>
          </div>
        </div>
      )}

      {order.tracking.length > 0 && (
        <section className="tracking-timeline-box" aria-label={`Courier tracking for order ${order.id}`}>
          <button
            className="timeline-toggle"
            type="button"
            aria-expanded={expanded}
            onClick={() => onToggleTracking(order.id)}
          >
            <span>
              <strong>Courier Tracking</strong>
              <small>{order.courier} · Tracking: #{order.trackingNumber}</small>
            </span>
            <span className="timeline-toggle-action">{expanded ? "Hide details" : "Show details"} <Icon name="chevron" /></span>
          </button>
          {expanded && (
            <ol className="stepper-track">
              {order.tracking.map((event, index) => {
                const done = index < order.currentStep || isCompleted;
                const active = index === order.currentStep && !isCompleted;
                return (
                  <li className={`step-point${done ? " done" : ""}${active ? " active" : ""}`} key={event.label}>
                    <span className="circle-node">
                      {done ? <Icon name="check" /> : active && index === 2 ? <Icon name="truck" /> : null}
                    </span>
                    <span className="node-label">{event.label}</span>
                    <time>{event.time}</time>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      <footer className="order-card-footer">
        <div className="total-amount-box">
          <span className="caption">Total Order</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
        <div className="order-action-buttons">
          <Link className="btn-secondary" href="/chat">
            <Icon name="chat" /><span>Contact Seller</span>
          </Link>
          {canRaiseDispute && (
            <button className="btn-outline" type="button" onClick={() => onDispute(order)}>
              <Icon name="alert" /><span>Raise Dispute</span>
            </button>
          )}
          {order.status === "Shipped" && (
            <button className="btn-primary" type="button" onClick={() => onConfirm(order)}>
              <Icon name="check" /><span>Confirm Received & Release Payment</span>
            </button>
          )}
          {order.status === "Pending Payment" && (
            <Link className="btn-primary" href="/checkout">
              <span>Complete Payment</span>
            </Link>
          )}
          {isCompleted && <span className="completed-note"><Icon name="check" /> Payment released</span>}
        </div>
      </footer>
    </article>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set(["SOC-2026-9081"]));
  const [confirmationOrder, setConfirmationOrder] = useState<Order | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<Order | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [toast, setToast] = useState("");

  const visibleOrders = activeFilter === "All"
    ? orders
    : orders.filter((order) => order.status === activeFilter);

  function toggleTracking(id: string) {
    setExpandedOrders((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmDelivery() {
    if (!confirmationOrder) return;
    setOrders((current) => current.map((order) => order.id === confirmationOrder.id
      ? { ...order, status: "Completed", currentStep: 4 }
      : order));
    setConfirmationOrder(null);
    setToast(`Payment for order #${confirmationOrder.id} has been released.`);
  }

  function submitDispute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!disputeOrder || disputeReason.trim().length < 10) return;
    setOrders((current) => current.map((order) => order.id === disputeOrder.id
      ? { ...order, status: "Disputed" }
      : order));
    setToast(`Dispute for order #${disputeOrder.id} has been submitted.`);
    setDisputeOrder(null);
    setDisputeReason("");
  }

  return (
    <>
      <Navbar />
      <main className="orders-page">
        <div className="orders-container">
          <header className="orders-header">
            <p className="orders-eyebrow">YOUR SHOPPING ACTIVITY</p>
            <h1>My Orders &amp; Escrow Status</h1>
            <p>Lacak status pengiriman dan pelepasan dana transaksi Anda.</p>
          </header>

          <nav className="orders-tabs" aria-label="Filter orders">
            {FILTERS.map(({ value, label }) => {
              const count = value === "All" ? orders.length : orders.filter((order) => order.status === value).length;
              return (
                <button
                  className={`tab-item${activeFilter === value ? " active" : ""}`}
                  type="button"
                  key={value}
                  aria-pressed={activeFilter === value}
                  onClick={() => setActiveFilter(value)}
                >
                  {label}<span>{count}</span>
                </button>
              );
            })}
          </nav>

          <section className="orders-list-section" aria-label={`${FILTERS.find((filter) => filter.value === activeFilter)?.label} orders`}>
            <div className="orders-results-heading">
              <h2>{activeFilter === "All" ? "Order History" : FILTERS.find((filter) => filter.value === activeFilter)?.label}</h2>
              <span>{visibleOrders.length} {visibleOrders.length === 1 ? "order" : "orders"}</span>
            </div>
            {visibleOrders.length > 0 ? (
              <div className="orders-list">
                {visibleOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedOrders.has(order.id)}
                    onToggleTracking={toggleTracking}
                    onConfirm={setConfirmationOrder}
                    onDispute={(selectedOrder) => {
                      setDisputeOrder(selectedOrder);
                      setDisputeReason("");
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="orders-empty-state">
                <span><Icon name="package" /></span>
                <h3>No orders in this category</h3>
                <p>Pesanan dengan status ini akan muncul di sini.</p>
                <button type="button" onClick={() => setActiveFilter("All")}>View all orders</button>
              </div>
            )}
          </section>
        </div>
      </main>

      {confirmationOrder && (
        <div className="orders-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setConfirmationOrder(null);
        }}>
          <section className="orders-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <button className="modal-close" type="button" aria-label="Close dialog" onClick={() => setConfirmationOrder(null)}><Icon name="close" /></button>
            <span className="modal-icon confirm-modal-icon"><Icon name="shield" /></span>
            <h2 id="confirm-title">Confirm you received this order?</h2>
            <p>Setelah dikonfirmasi, <strong>{formatPrice(confirmationOrder.total)}</strong> akan langsung diteruskan ke rekening penjual. Aksi ini tidak dapat dibatalkan.</p>
            <div className="modal-order-ref">Order #{confirmationOrder.id}</div>
            <div className="modal-actions">
              <button className="btn-modal-secondary" type="button" onClick={() => setConfirmationOrder(null)}>Not yet</button>
              <button className="btn-primary" type="button" onClick={confirmDelivery}><Icon name="check" /> Yes, release payment</button>
            </div>
          </section>
        </div>
      )}

      {disputeOrder && (
        <div className="orders-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDisputeOrder(null);
        }}>
          <section className="orders-modal dispute-modal" role="dialog" aria-modal="true" aria-labelledby="dispute-title">
            <button className="modal-close" type="button" aria-label="Close dialog" onClick={() => setDisputeOrder(null)}><Icon name="close" /></button>
            <span className="modal-icon dispute-modal-icon"><Icon name="alert" /></span>
            <h2 id="dispute-title">Report an issue</h2>
            <p>Jelaskan masalah pada pesanan #{disputeOrder.id}. Dana escrow akan tetap aman saat tim kami meninjau laporan.</p>
            <form onSubmit={submitDispute}>
              <label htmlFor="dispute-reason">What happened?</label>
              <textarea
                id="dispute-reason"
                value={disputeReason}
                onChange={(event) => setDisputeReason(event.target.value)}
                placeholder="Contoh: barang yang diterima rusak atau tidak sesuai deskripsi..."
                minLength={10}
                maxLength={1000}
                required
              />
              <span className="form-hint">Minimum 10 characters · {disputeReason.length}/1000</span>
              <div className="modal-actions">
                <button className="btn-modal-secondary" type="button" onClick={() => setDisputeOrder(null)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={disputeReason.trim().length < 10}>Submit dispute</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="orders-toast" role="status">
          <Icon name="check" />{toast}
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast("")}><Icon name="close" /></button>
        </div>
      )}
    </>
  );
}
