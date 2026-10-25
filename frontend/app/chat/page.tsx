"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import { Icon } from "./ChatIcons";
import { INITIAL_THREADS, type ChatMessage, type OfferStatus, type Thread } from "./mockData";

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeId, setActiveId] = useState("thread-urban");
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [offerModal, setOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("32.00");
  const [offerError, setOfferError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeThread = threads.find((t) => t.id === activeId) ?? threads[0];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread.messages]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = threads.filter(
    (t) =>
      t.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      t.product.title.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: "buyer",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, lastTime: newMsg.time, lastSnippet: text, messages: [...t.messages, newMsg] }
          : t
      )
    );
    setInput("");

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `r_${Date.now()}`,
        sender: "seller",
        text: `Terima kasih! Kami siap bantu produk "${activeThread.product.title}".`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? { ...t, lastTime: reply.time, lastSnippet: reply.text ?? "", messages: [...t.messages, reply] }
            : t
        )
      );
    }, 1000);
  };

  const submitOffer = (e: FormEvent) => {
    e.preventDefault();
    const val = parseFloat(offerPrice);
    const orig = activeThread.product.listPrice;

    if (isNaN(val) || val <= 0 || val >= orig) {
      setOfferError(`Masukkan harga valid di bawah $${orig.toFixed(2)}.`);
      return;
    }

    const newOfferMsg: ChatMessage = {
      id: `off_${Date.now()}`,
      sender: "buyer",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      offer: {
        offeredPrice: val,
        originalPrice: orig,
        savings: orig - val,
        savingsPercent: Math.round(((orig - val) / orig) * 1000) / 10,
        status: "pending",
      },
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? {
              ...t,
              lastTime: newOfferMsg.time,
              lastSnippet: `Tawaran $${val.toFixed(2)} diajukan.`,
              offerBadge: { status: "pending", label: "Offer Pending" },
              messages: [...t.messages, newOfferMsg],
            }
          : t
      )
    );
    setOfferModal(false);
    setToast(`Tawaran $${val.toFixed(2)} berhasil diajukan!`);

    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeId) return t;
          return {
            ...t,
            offerBadge: { status: "accepted", label: "Offer Accepted" },
            messages: t.messages.map((m) =>
              m.offer?.status === "pending"
                ? { ...m, offer: { ...m.offer, status: "accepted" as OfferStatus } }
                : m
            ),
          };
        })
      );
      setToast(`Penjual telah MENERIMA tawaran $${val.toFixed(2)}!`);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 shadow-md">
          <Icon name="check-circle" className="h-4 w-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <main className="chat-page mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-4 sm:px-6">
        <div className="chat-messenger-container flex h-[calc(100vh-8.5rem)] min-h-[580px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* ================= INBOX SIDEBAR ================= */}
          <aside
            className={`chat-sidebar flex w-full flex-col border-r border-slate-200 bg-slate-50/50 md:w-80 lg:w-96 shrink-0 ${
              isMobileOpen ? "hidden md:flex" : "flex"
            }`}
          >
            <header className="sidebar-header border-b border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Messages</h2>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <Icon name="shield" className="h-3 w-3 text-emerald-600" />
                  <span>Escrow Safe</span>
                </div>
              </div>
              <div className="search-chat-wrapper relative mt-3">
                <Icon name="search" className="search-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </header>

            <ul className="conversation-thread-list flex-1 divide-y divide-slate-100 overflow-y-auto">
              {filtered.map((thread) => {
                const isActive = thread.id === activeId;
                return (
                  <li
                    key={thread.id}
                    onClick={() => {
                      setActiveId(thread.id);
                      setIsMobileOpen(true);
                    }}
                    className={`conversation-item cursor-pointer p-3.5 transition hover:bg-slate-100 ${
                      isActive ? "active bg-indigo-50/70 border-l-4 border-indigo-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`user-avatar-wrap relative shrink-0 ${thread.isOnline ? "online" : ""}`}>
                        <img src={thread.partnerAvatar} alt="" className="avatar-img h-10 w-10 rounded-full object-cover" />
                        {thread.isOnline && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>
                      <div className="convo-meta min-w-0 flex-1">
                        <div className="convo-top-row flex items-center justify-between">
                          <h4 className="convo-name truncate text-xs font-bold text-slate-900">{thread.partnerName}</h4>
                          <time className="convo-time text-[10px] text-slate-400">{thread.lastTime}</time>
                        </div>
                        <p className="convo-snippet mt-1 truncate text-xs text-slate-500">{thread.lastSnippet}</p>
                        <div className="mt-2 flex items-center justify-between gap-1">
                          <span className="truncate text-[10px] text-indigo-600 font-medium">🏷️ {thread.product.title}</span>
                          {thread.offerBadge && (
                            <span className="badge-offer-status shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                              {thread.offerBadge.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* ================= ACTIVE CHAT VIEWPORT ================= */}
          <section
            className={`chat-viewport flex flex-1 flex-col bg-white overflow-hidden ${
              !isMobileOpen ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header Ruang Chat */}
            <header className="chat-room-header border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="recipient-profile flex items-center gap-3">
                  <button onClick={() => setIsMobileOpen(false)} className="rounded-lg p-1 text-slate-500 md:hidden">
                    <Icon name="arrow-left" className="h-5 w-5" />
                  </button>
                  <img src={activeThread.partnerAvatar} alt="" className="avatar-small h-9 w-9 rounded-full object-cover" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activeThread.partnerName}</h3>
                    <span className="online-indicator block text-[11px] text-slate-500">{activeThread.statusText}</span>
                  </div>
                </div>
                <Link
                  href={`/products/${activeThread.product.slug}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Product
                </Link>
              </div>

              {/* Sticky Product Context Bar */}
              <div className="chat-product-banner flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2">
                <div className="flex items-center gap-2.5">
                  <img src={activeThread.product.thumbnail} alt="" className="banner-product-thumb h-10 w-10 rounded-lg object-cover border border-slate-200" />
                  <div className="banner-product-info">
                    <span className="prod-title block text-xs font-bold text-slate-900">{activeThread.product.title}</span>
                    <span className="prod-price text-[11px] text-slate-500">
                      List Price: <strong className="text-slate-900">${activeThread.product.listPrice.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOfferPrice((activeThread.product.listPrice * 0.85).toFixed(2));
                    setOfferError("");
                    setOfferModal(true);
                  }}
                  className="btn-make-offer-action flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  <Icon name="tag" className="tag-discount-icon h-3.5 w-3.5" />
                  <span>Make Offer</span>
                </button>
              </div>
            </header>

            {/* Chat Messages List */}
            <div className="chat-messages-scroll-area flex-1 space-y-3.5 overflow-y-auto p-4 bg-slate-50/40">
              <div className="date-divider flex justify-center">
                <span className="rounded-full bg-slate-200/70 px-3 py-0.5 text-[10px] font-medium text-slate-600">Today, 25 October</span>
              </div>

              {activeThread.messages.map((msg) => {
                const isMe = msg.sender === "buyer";
                return (
                  <div key={msg.id} className={`message-row flex ${isMe ? "sent justify-end" : "received justify-start"}`}>
                    {msg.offer ? (
                      /* Offer Card Bubble */
                      <div className="bubble offer-bubble w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
                        <div className="offer-header flex items-center justify-between border-b border-indigo-100 bg-indigo-50/60 px-3.5 py-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                            <Icon name="handshake" className="handshake-icon h-4 w-4 text-indigo-600" />
                            <span>{msg.offer.status === "countered" ? "Counter Offer" : "Offer Submitted"}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{msg.time}</span>
                        </div>
                        <div className="offer-body p-3.5">
                          <p className="offer-label text-[11px] text-slate-500">Tawaran Harga Anda:</p>
                          <div className="mt-0.5 flex items-baseline gap-2">
                            <h3 className="offered-price text-xl font-black text-slate-900">${msg.offer.offeredPrice.toFixed(2)}</h3>
                            <span className="original-striked text-xs text-slate-400 line-through">${msg.offer.originalPrice.toFixed(2)}</span>
                          </div>
                          <p className="offer-savings mt-1 text-[11px] font-semibold text-emerald-600">
                            Diskon {msg.offer.savingsPercent}% (Hemat ${msg.offer.savings.toFixed(2)})
                          </p>
                        </div>
                        {msg.offer.status === "accepted" && (
                          <div className="offer-footer status-accepted border-t border-emerald-100 bg-emerald-50/80 p-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                              <Icon name="check-circle" className="check-circle-icon h-4 w-4 text-emerald-600" />
                              <span>Penjual MENERIMA penawaran ini!</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setToast(`Menuju checkout dengan harga tawaran: $${msg.offer?.offeredPrice.toFixed(2)}`)}
                              className="btn-checkout-offer mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              <span>Checkout dengan Harga ${msg.offer.offeredPrice.toFixed(2)}</span>
                              <Icon name="arrow-right" className="arrow-right-icon h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {msg.offer.status === "pending" && (
                          <div className="border-t border-amber-100 bg-amber-50/80 px-3.5 py-2 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Menunggu respon penjual...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Text & Media Bubble */
                      <div
                        className={`bubble text-bubble max-w-sm rounded-2xl p-3 text-xs shadow-xs ${
                          isMe ? "bg-indigo-600 text-white rounded-br-xs" : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                        }`}
                      >
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="" className="mb-2 h-40 w-full rounded-lg object-cover" />
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className={`msg-time mt-1 flex items-center justify-end gap-1 text-[10px] ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                          <time>{msg.time}</time>
                          {isMe && <Icon name="check-double" className="double-check-svg h-3 w-3 text-indigo-200" />}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <footer className="chat-input-bar border-t border-slate-200 bg-white p-3">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const photoMsg: ChatMessage = {
                      id: `img_${Date.now()}`,
                      sender: "buyer",
                      imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80",
                      text: "Apakah warna aslinya seperti ini kak?",
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    };
                    setThreads((prev) =>
                      prev.map((t) => (t.id === activeId ? { ...t, messages: [...t.messages, photoMsg] } : t))
                    );
                  }}
                  className="btn-attach-media rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  title="Kirim Foto"
                >
                  <Icon name="paperclip" className="paperclip-icon h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOfferPrice((activeThread.product.listPrice * 0.85).toFixed(2));
                    setOfferError("");
                    setOfferModal(true);
                  }}
                  className="btn-trigger-offer-sheet flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <Icon name="tag" className="tag-plus-icon h-3.5 w-3.5" />
                  <span>Nego</span>
                </button>

                <input
                  type="text"
                  placeholder="Type a message or discuss item condition..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="chat-text-input flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="btn-send-message rounded-xl bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Icon name="send" className="send-plane-icon h-4 w-4" />
                </button>
              </form>
            </footer>
          </section>
        </div>

        {/* ================= MAKE AN OFFER MODAL ================= */}
        {offerModal && (
          <div className="offer-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="offer-modal-box w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <header className="modal-header flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Make an Offer</h3>
                <button onClick={() => setOfferModal(false)} className="btn-close-modal text-slate-400 hover:text-slate-600">
                  <Icon name="close" className="close-x-icon h-5 w-5" />
                </button>
              </header>

              <form onSubmit={submitOffer}>
                <div className="modal-body py-3 space-y-3">
                  <p className="text-xs text-slate-500">
                    Tawar harga untuk <strong>{activeThread.product.title}</strong> (Harga Asli: ${activeThread.product.listPrice.toFixed(2)})
                  </p>

                  <div className="price-input-wrapper relative flex items-center">
                    <span className="currency-prefix absolute left-3 font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={offerPrice}
                      onChange={(e) => {
                        setOfferPrice(e.target.value);
                        setOfferError("");
                      }}
                      className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-base font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                  {offerError && <p className="text-xs text-rose-600">{offerError}</p>}

                  <p className="negotiation-tip rounded-xl bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">
                    Penjual lebih cenderung menerima tawaran dalam rentang 10% - 20% dari harga awal.
                  </p>
                </div>

                <footer className="modal-footer flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => setOfferModal(false)} className="btn-cancel rounded-xl border px-3.5 py-1.5 text-xs font-semibold text-slate-600">
                    Batal
                  </button>
                  <button type="submit" className="btn-submit-offer rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">
                    Kirim Tawaran
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
