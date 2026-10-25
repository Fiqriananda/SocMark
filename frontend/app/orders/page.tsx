
"use client";

import { useMemo, useState } from "react";

type OrderStatus =
  | "Pending Payment"
  | "In Escrow / Processing"
  | "Shipped"
  | "Completed"
  | "Disputed";

type Order = {
  id: string;
  product: string;
  category: string;
  seller: string;
  initials: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  date: string;
  estimatedDelivery: string;
  trackingNumber: string;
  courier: string;
  currentStep: number;
  expanded: boolean;
};

type IconName =
  | "package"
  | "clock"
  | "shield"
  | "truck"
  | "check"
  | "alert"
  | "search"
  | "chevron"
  | "arrow"
  | "close"
  | "message"
  | "calendar"
  | "box"
  | "wallet"
  | "help"
  | "refresh";

const INITIAL_ORDERS: Order[] = [
  {
    id: "SOC-2026-9081",
    product: "Mechanical Keyboard RGB",
    category: "Electronics",
    seller: "TechStore Official",
    initials: "TS",
    price: 1250000,
    quantity: 1,
    status: "Shipped",
    date: "22 Okt 2026",
    estimatedDelivery: "27 Okt 2026",
    trackingNumber: "JNE1234567890",
    courier: "JNE Express",
    currentStep: 3,
    expanded: true,
  },
  {
    id: "SOC-2026-9075",
    product: "Wireless Headphones Pro",
    category: "Electronics",
    seller: "AudioHub",
    initials: "AH",
    price: 875000,
    quantity: 1,
    status: "In Escrow / Processing",
    date: "23 Okt 2026",
    estimatedDelivery: "29 Okt 2026",
    trackingNumber: "SPX987654321",
    courier: "SPX Express",
    currentStep: 1,
    expanded: false,
  },
  {
    id: "SOC-2026-9062",
    product: "Minimalist Backpack",
    category: "Fashion",
    seller: "Urban Goods",
    initials: "UG",
    price: 450000,
    quantity: 1,
    status: "Pending Payment",
    date: "24 Okt 2026",
    estimatedDelivery: "—",
    trackingNumber: "—",
    courier: "Belum dikirim",
    currentStep: 0,
    expanded: false,
  },
  {
    id: "SOC-2026-9048",
    product: "Smart Watch Series 5",
    category: "Electronics",
    seller: "Gadget Corner",
    initials: "GC",
    price: 2100000,
    quantity: 1,
    status: "Completed",
    date: "15 Okt 2026",
    estimatedDelivery: "19 Okt 2026",
    trackingNumber: "JNE456789123",
    courier: "JNE Express",
    currentStep: 4,
    expanded: false,
  },
  {
    id: "SOC-2026-9031",
    product: "Wireless Gaming Mouse",
    category: "Electronics",
    seller: "Pixel Supply",
    initials: "PS",
    price: 625000,
    quantity: 1,
    status: "Disputed",
    date: "18 Okt 2026",
    estimatedDelivery: "21 Okt 2026",
    trackingNumber: "SICEPAT12345",
    courier: "SiCepat",
    currentStep: 2,
    expanded: false,
  },
];

const FILTERS = [
  "All Orders",
  "Pending Payment",
  "In Escrow / Processing",
  "Shipped",
  "Completed",
  "Disputed",
] as const;

type Filter = (typeof FILTERS)[number];

const STEPS = [
  { title: "Order Paid", description: "Pembayaran berhasil dikonfirmasi" },
  { title: "Packed by Seller", description: "Pesanan sedang disiapkan penjual" },
  { title: "In Transit", description: "Paket sedang dalam perjalanan" },
  { title: "Out for Delivery", description: "Kurir mengantarkan paket" },
  { title: "Received & Escrow Released", description: "Barang diterima, dana dilepas" },
];

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  };

  const paths: Record<IconName, React.ReactNode> = {
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8M7.5 5.5l9 5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v12H3z" />
        <path d="M14 10h4l3 4v4h-7z" />
        <circle cx="7.5" cy="18" r="1.5" />
        <circle cx="17.5" cy="18" r="1.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4m0 4h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18M16 14h2" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-1.2 1.1-1.8 1.3-1.8 2.8M12 17h.01" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusStyle(status: OrderStatus) {
  switch (status) {
    case "Pending Payment":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "In Escrow / Processing":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "Shipped":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Disputed":
      return "bg-rose-50 text-rose-700 ring-rose-200";
  }
}

function getStatusIcon(status: OrderStatus): IconName {
  switch (status) {
    case "Pending Payment":
      return "clock";
    case "In Escrow / Processing":
      return "shield";
    case "Shipped":
      return "truck";
    case "Completed":
      return "check";
    case "Disputed":
      return "alert";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeFilter, setActiveFilter] = useState<Filter>("All Orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modal, setModal] = useState<"confirm" | "dispute" | null>(null);
  const [disputeReason, setDisputeReason] = useState("Barang tidak sesuai");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [notice, setNotice] = useState("");

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All Orders" || order.status === activeFilter;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.product.toLowerCase().includes(query) ||
        order.seller.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  function updateOrder(id: string, updates: Partial<Order>) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      )
    );
  }

  function toggleTracking(id: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, expanded: !order.expanded } : order
      )
    );
  }

  function openModal(type: "confirm" | "dispute", orderId: string) {
    setSelectedOrderId(orderId);
    setModal(type);
    setNotice("");
  }

  function closeModal() {
    setModal(null);
    setSelectedOrderId(null);
    setDisputeDetails("");
  }

  function confirmDelivery() {
    if (!selectedOrder) return;

    updateOrder(selectedOrder.id, {
      status: "Completed",
      currentStep: 4,
    });

    setNotice(
      `Pesanan ${selectedOrder.id} ditandai selesai. Status escrow diperbarui pada demo ini.`
    );
    closeModal();
  }

  function submitDispute(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedOrder || !disputeDetails.trim()) return;

    updateOrder(selectedOrder.id, {
      status: "Disputed",
    });

    setNotice(
      `Dispute untuk ${selectedOrder.id} berhasil dicatat pada demo ini.`
    );
    closeModal();
    setDisputeDetails("");
  }

  const countFor = (filter: Filter) =>
    filter === "All Orders"
      ? orders.length
      : orders.filter((order) => order.status === filter).length;

  const totalSpent = orders
    .filter((order) => order.status === "Completed")
    .reduce((total, order) => total + order.price * order.quantity, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div
  className="w-full px-4 py-8 sm:px-6 lg:px-8"
  style={{ marginLeft: "auto", marginRight: "auto" }}
>
        {/* Page heading */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Icon name="package" size={17} />
              <span>Marketplace / Orders</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Orders
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Pantau pesanan, lacak pengiriman, dan kelola pembayaran escrow
              kamu dalam satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:self-auto">
            <div className="flex size-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Icon name="shield" size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Escrow Protection</p>
              <p className="text-sm font-semibold">Buyer protected</p>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section
          aria-label="Order summary"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            title="Total Orders"
            value={orders.length.toString()}
            detail="Semua pesanan"
            icon="package"
            color="indigo"
          />
          <SummaryCard
            title="In Progress"
            value={orders
              .filter(
                (order) =>
                  order.status === "In Escrow / Processing" ||
                  order.status === "Shipped"
              )
              .length.toString()}
            detail="Pesanan sedang diproses"
            icon="truck"
            color="sky"
          />
          <SummaryCard
            title="Completed"
            value={countFor("Completed").toString()}
            detail="Pesanan selesai"
            icon="check"
            color="emerald"
          />
          <SummaryCard
            title="Total Completed"
            value={formatRupiah(totalSpent)}
            detail="Nilai pesanan selesai"
            icon="wallet"
            color="violet"
            compact
          />
        </section>

        {/* Main orders panel */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Order History</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kelola dan pantau semua transaksi kamu.
                </p>
              </div>

              <label className="relative block w-full lg:max-w-xs">
                <span className="sr-only">Cari pesanan</span>
                <Icon
                  name="search"
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari pesanan atau penjual..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            {/* Status filters */}
            <div
              className="mt-6 flex gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="Filter status pesanan"
            >
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={activeFilter === filter}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    activeFilter === filter
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  {filter}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs ${
                      activeFilter === filter
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {countFor(filter)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders list */}
          <div className="space-y-5 p-4 sm:p-6">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-16 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Icon name="package" size={28} />
                </div>
                <h3 className="text-base font-semibold">
                  Tidak ada pesanan ditemukan
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Coba ubah filter atau kata kunci pencarian kamu.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("All Orders");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  Reset filter
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 transition hover:border-slate-300"
                >
                  {/* Order header */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Order ID</p>
                        <p className="mt-0.5 text-sm font-bold">
                          {order.id}
                        </p>
                      </div>
                      <div className="hidden h-8 w-px bg-slate-200 sm:block" />
                      <div>
                        <p className="text-xs text-slate-500">Order Date</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          <Icon name="calendar" size={14} />
                          {order.date}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(order.status)}`}
                    >
                      <Icon name={getStatusIcon(order.status)} size={14} />
                      {order.status}
                    </span>
                  </div>

                  {/* Product information */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-600 sm:size-20">
                          <Icon name="box" size={32} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            {order.category}
                          </p>
                          <h3 className="mt-1 font-semibold text-slate-900">
                            {order.product}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                                {order.initials}
                              </span>
                              {order.seller}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>Qty: {order.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:min-w-40 sm:text-right">
                        <p className="text-xs text-slate-500">Total Price</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {formatRupiah(order.price * order.quantity)}
                        </p>
                        {order.status === "In Escrow / Processing" ||
                        order.status === "Shipped" ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-violet-600 sm:justify-end">
                            <Icon name="shield" size={13} />
                            Protected by escrow
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Shipping tracking */}
                    {(order.status === "Shipped" ||
                      order.status === "Completed" ||
                      order.status === "Disputed") && (
                      <div className="mt-5 rounded-xl border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => toggleTracking(order.id)}
                          aria-expanded={order.expanded}
                          className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                              <Icon name="truck" size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                Shipment Tracking
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {order.courier} · {order.trackingNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {order.status === "Shipped" && (
                              <span className="hidden rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 sm:inline">
                                Est. {order.estimatedDelivery}
                              </span>
                            )}
                            <span
                              className={`text-slate-400 transition-transform ${order.expanded ? "rotate-180" : ""}`}
                            >
                              <Icon name="chevron" size={20} />
                            </span>
                          </div>
                        </button>

                        {order.expanded && (
                          <div className="border-t border-slate-100 px-4 pb-5 pt-5 sm:px-6">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold">
                                  Delivery progress
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {order.status === "Completed"
                                    ? "Pesanan telah selesai."
                                    : order.status === "Disputed"
                                      ? "Pesanan memiliki laporan sengketa."
                                      : "Ikuti perjalanan paket kamu."}
                                </p>
                              </div>
                              {order.status === "Shipped" && (
                                <span className="text-xs font-semibold text-sky-700">
                                  Est. {order.estimatedDelivery}
                                </span>
                              )}
                            </div>

                            <ol className="space-y-0">
                              {STEPS.map((step, index) => {
                                const isDone = index < order.currentStep;
                                const isCurrent =
                                  index === order.currentStep &&
                                  order.status !== "Completed";

                                return (
                                  <li
                                    key={step.title}
                                    className="relative flex gap-3 pb-5 last:pb-0"
                                  >
                                    {index < STEPS.length - 1 && (
                                      <span
                                        className={`absolute left-[13px] top-7 h-[calc(100%-8px)] w-0.5 ${
                                          isDone
                                            ? "bg-emerald-400"
                                            : "bg-slate-200"
                                        }`}
                                      />
                                    )}

                                    <span
                                      className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                                        isDone
                                          ? "bg-emerald-500 text-white"
                                          : isCurrent
                                            ? "bg-sky-500 text-white"
                                            : "border-2 border-slate-200 bg-white text-slate-400"
                                      }`}
                                    >
                                      {isDone ? (
                                        <Icon name="check" size={15} />
                                      ) : (
                                        <span className="text-xs font-bold">
                                          {index + 1}
                                        </span>
                                      )}
                                    </span>

                                    <div className="pt-0.5">
                                      <p
                                        className={`text-sm font-semibold ${
                                          isDone
                                            ? "text-emerald-700"
                                            : isCurrent
                                              ? "text-sky-700"
                                              : "text-slate-400"
                                        }`}
                                      >
                                        {step.title}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        {step.description}
                                      </p>
                                    </div>
                                  </li>
                                );
                              })}
                            </ol>

                            <div className="mt-5 flex items-start gap-2 rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-700">
                              <Icon
                                name="shield"
                                size={16}
                                className="mt-0.5 shrink-0"
                              />
                              <p>
                                Dana escrow tetap terlindungi selama transaksi
                                berlangsung. Pastikan barang diterima dan
                                diperiksa sebelum menyelesaikan pesanan.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      {order.status === "Pending Payment" && (
                        <button
                          type="button"
                          onClick={() =>
                            setNotice(
                              "Simulasi pembayaran: integrasi payment gateway belum tersedia."
                            )
                          }
                          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Pay Now
                        </button>
                      )}

                      {order.status === "Shipped" && (
                        <button
                          type="button"
                          onClick={() => openModal("confirm", order.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <Icon name="check" size={16} />
                          Confirm Received & Release
                        </button>
                      )}

                      {order.status === "In Escrow / Processing" && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700">
                          <Icon name="shield" size={16} />
                          Dana dilindungi escrow
                        </span>
                      )}

                      {order.status !== "Completed" &&
                        order.status !== "Disputed" && (
                          <button
                            type="button"
                            onClick={() => openModal("dispute", order.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Icon name="alert" size={16} />
                            Report a Problem
                          </button>
                        )}

                      {order.status === "Disputed" && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                          <Icon name="alert" size={16} />
                          Dispute under review
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setNotice(
                            `Simulasi: fitur chat dengan ${order.seller} belum terhubung ke layanan pesan.`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <Icon name="message" size={16} />
                        Contact Seller
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500 sm:px-6">
            Menampilkan {filteredOrders.length} dari {orders.length} pesanan.
            Data pada halaman ini merupakan simulasi frontend.
          </div>
        </section>

        {/* Help banner */}
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
              <Icon name="help" size={23} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Need help with your order?
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Kamu dapat melaporkan masalah transaksi melalui fitur dispute.
                Pastikan informasi yang diberikan akurat.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setNotice(
                "Pusat bantuan masih berupa placeholder pada demo frontend."
              )
            }
            className="shrink-0 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Visit Help Center
          </button>
        </section>

        {/* Toast / inline notification */}
        {notice && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-40 flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <span className="mt-0.5 text-emerald-600">
              <Icon name="check" size={20} />
            </span>
            <p className="flex-1 text-sm leading-5 text-slate-700">
              {notice}
            </p>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setNotice("")}
              className="text-slate-400 hover:text-slate-700"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        {/* Confirm delivery modal */}
        {modal === "confirm" && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="shield" size={25} />
              </div>
              <h2 id="confirm-title" className="text-xl font-bold">
                Confirm Order Received?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Apakah kamu sudah menerima dan memeriksa{" "}
                <strong>{selectedOrder.product}</strong>? Konfirmasi ini akan
                menandai pesanan selesai dan memperbarui status escrow pada
                simulasi ini.
              </p>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Order ID</p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedOrder.id}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Order total</span>
                  <span className="font-bold">
                    {formatRupiah(
                      selectedOrder.price * selectedOrder.quantity
                    )}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-amber-700">
                Perhatian: dalam transaksi nyata, pelepasan dana harus
                diproses dan divalidasi oleh backend.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelivery}
                  className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Confirm Received
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Dispute modal */}
        {modal === "dispute" && selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="dispute-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Icon name="alert" size={25} />
              </div>
              <h2 id="dispute-title" className="text-xl font-bold">
                Report an Issue
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sampaikan masalah pada pesanan {selectedOrder.id}. Laporan ini
                hanya disimpan di state frontend selama demo.
              </p>

              <form onSubmit={submitDispute} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="dispute-reason"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Reason for dispute
                  </label>
                  <select
                    id="dispute-reason"
                    value={disputeReason}
                    onChange={(event) => setDisputeReason(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>Barang tidak sesuai</option>
                    <option>Barang rusak</option>
                    <option>Barang belum diterima</option>
                    <option>Barang tidak lengkap</option>
                    <option>Masalah lainnya</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dispute-details"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    id="dispute-details"
                    value={disputeDetails}
                    onChange={(event) =>
                      setDisputeDetails(event.target.value)
                    }
                    required
                    minLength={10}
                    rows={4}
                    placeholder="Jelaskan masalah yang kamu alami (minimal 10 karakter)..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    {disputeDetails.length} karakter
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  Pilih alasan dan jelaskan masalah secara akurat. Dalam
                  aplikasi produksi, laporan perlu dikirim ke backend untuk
                  ditinjau.
                </div>

                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    Submit Dispute
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon,
  color,
  compact = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: IconName;
  color: "indigo" | "sky" | "emerald" | "violet";
  compact?: boolean;
}) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p
            className={`mt-3 font-bold tracking-tight text-slate-900 ${
              compact ? "text-xl sm:text-2xl" : "text-3xl"
            }`}
          >
            {value}
          </p>
        </div>
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colorStyles[color]}`}
        >
          <Icon name={icon} size={22} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </article>
  );
}
