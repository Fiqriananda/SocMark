"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Navbar from "../components/Navbar";

type OfferStatus = "pending" | "accepted" | "declined" | "countered";

type OfferData = {
  id: string;
  offeredPrice: number;
  originalPrice: number;
  savings: number;
  savingsPercent: number;
  status: OfferStatus;
  submittedBy: "buyer" | "seller";
  counterPrice?: number;
};

type MessageType = "text" | "offer" | "image";

type ChatMessage = {
  id: string;
  sender: "buyer" | "seller";
  text?: string;
  imageUrl?: string;
  imageCaption?: string;
  time: string;
  type: MessageType;
  offer?: OfferData;
};

type ProductContext = {
  id: string;
  title: string;
  slug: string;
  condition: string;
  listPrice: number;
  thumbnail: string;
  stock: number;
};

type ConversationThread = {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  partnerInitials: string;
  isOnline: boolean;
  statusText: string;
  isVerified: boolean;
  lastTime: string;
  lastSnippet: string;
  unreadCount: number;
  offerBadge?: {
    status: OfferStatus;
    label: string;
  };
  product: ProductContext;
  messages: ChatMessage[];
};

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: "thread-urban",
    partnerName: "Urban Streetwear Official",
    partnerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    partnerInitials: "US",
    isOnline: true,
    statusText: "Online • Typically replies in 5m",
    isVerified: true,
    lastTime: "12:45 PM",
    lastSnippet: "Penawaran harga $32.00 telah diterima!",
    unreadCount: 1,
    offerBadge: {
      status: "accepted",
      label: "Offer Accepted",
    },
    product: {
      id: "prod-tee-01",
      title: "Oversized Heavyweight Tee",
      slug: "cloud-knit",
      condition: "Brand New with Tags",
      listPrice: 38.0,
      thumbnail:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
      stock: 3,
    },
    messages: [
      {
        id: "m-1",
        sender: "buyer",
        text: "Halo kak, apakah produk ini ready untuk ukuran XL warna hitam?",
        time: "12:30 PM",
        type: "text",
      },
      {
        id: "m-2",
        sender: "seller",
        text: "Halo! Ready kak, stok tinggal 3 pcs lagi ya untuk varian Black / XL.",
        time: "12:32 PM",
        type: "text",
      },
      {
        id: "m-3",
        sender: "buyer",
        text: "Bahan cotton combed 24s atau heavy cotton 16s ya kak? Bisa lihat detail tag kerahnya?",
        time: "12:35 PM",
        type: "text",
      },
      {
        id: "m-4",
        sender: "seller",
        imageUrl:
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80",
        imageCaption: "Detail jahitan rantai leher & woven tag resmi",
        text: "Ini real picture detail tag & bahan heavyweight 16s 240gsm ya kak. Jahitan leher sudah double stitch sangat kokoh.",
        time: "12:38 PM",
        type: "image",
      },
      {
        id: "m-5",
        sender: "buyer",
        time: "12:42 PM",
        type: "offer",
        offer: {
          id: "off-001",
          offeredPrice: 32.0,
          originalPrice: 38.0,
          savings: 6.0,
          savingsPercent: 15.8,
          status: "accepted",
          submittedBy: "buyer",
        },
      },
      {
        id: "m-6",
        sender: "seller",
        text: "Deal kak! Tawaran kami terima. Silakan langsung lanjutkan proses checkout agar produk segera kami packing hari ini ya kak 🙏",
        time: "12:45 PM",
        type: "text",
      },
    ],
  },
  {
    id: "thread-aster",
    partnerName: "Aster Camera Supply",
    partnerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    partnerInitials: "AC",
    isOnline: true,
    statusText: "Online • Fast response",
    isVerified: true,
    lastTime: "11:20 AM",
    lastSnippet: "Tawaran $130.00 sedang menunggu review penjual.",
    unreadCount: 0,
    offerBadge: {
      status: "pending",
      label: "Offer Pending",
    },
    product: {
      id: "prod-camera-02",
      title: "Aster Mini Instant Camera",
      slug: "aurora-camera",
      condition: "Brand New",
      listPrice: 149.0,
      thumbnail:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80",
      stock: 5,
    },
    messages: [
      {
        id: "m-aster-1",
        sender: "buyer",
        text: "Halo Aster Supply, apakah bonus starter film pack masih termasuk?",
        time: "11:10 AM",
        type: "text",
      },
      {
        id: "m-aster-2",
        sender: "seller",
        text: "Halo kak! Betul sekali, setiap pembelian unit kamera sudah include 1 pack film 10 sheets dan hand strap official.",
        time: "11:14 AM",
        type: "text",
      },
      {
        id: "m-aster-3",
        sender: "buyer",
        time: "11:20 AM",
        type: "offer",
        offer: {
          id: "off-002",
          offeredPrice: 130.0,
          originalPrice: 149.0,
          savings: 19.0,
          savingsPercent: 12.8,
          status: "pending",
          submittedBy: "buyer",
        },
      },
    ],
  },
  {
    id: "thread-forme",
    partnerName: "Forme Vintage Studio",
    partnerAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    partnerInitials: "FV",
    isOnline: false,
    statusText: "Offline • Last seen 1h ago",
    isVerified: false,
    lastTime: "Yesterday",
    lastSnippet: "Penjual menawarkan harga tandingan: $75.00",
    unreadCount: 2,
    offerBadge: {
      status: "countered",
      label: "Counter: $75.00",
    },
    product: {
      id: "prod-knit-03",
      title: "Cloud Knit Everyday Cardigan",
      slug: "cloud-knit",
      condition: "Like New (Pre-loved)",
      listPrice: 86.0,
      thumbnail:
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&q=80",
      stock: 1,
    },
    messages: [
      {
        id: "m-forme-1",
        sender: "buyer",
        time: "Yesterday 04:15 PM",
        type: "offer",
        offer: {
          id: "off-003",
          offeredPrice: 65.0,
          originalPrice: 86.0,
          savings: 21.0,
          savingsPercent: 24.4,
          status: "countered",
          counterPrice: 75.0,
          submittedBy: "buyer",
        },
      },
      {
        id: "m-forme-2",
        sender: "seller",
        text: "Halo kak, kalau $65 mohon maaf belum bisa karena barang masih 98% mulus tanpa defect. Kami counter di $75.00 ya kak jika berkenan.",
        time: "Yesterday 05:00 PM",
        type: "text",
      },
    ],
  },
  {
    id: "thread-sneakers",
    partnerName: "Kicks & Threads Hub",
    partnerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    partnerInitials: "KT",
    isOnline: true,
    statusText: "Online",
    isVerified: true,
    lastTime: "23 Oct",
    lastSnippet: "Barang sudah dikirim kurir express dengan nomor resi tertera.",
    unreadCount: 0,
    product: {
      id: "prod-kicks-04",
      title: "Retro High-Top Vintage Sneakers",
      slug: "retro-sneakers",
      condition: "Brand New with Box",
      listPrice: 110.0,
      thumbnail:
        "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80",
      stock: 2,
    },
    messages: [
      {
        id: "m-kicks-1",
        sender: "seller",
        text: "Pesanan #SOC-2026-9081 sudah kami drop ke drop point J&T ya kak. Terima kasih sudah berbelanja di store kami!",
        time: "23 Oct 03:10 PM",
        type: "text",
      },
      {
        id: "m-kicks-2",
        sender: "buyer",
        text: "Terima kasih banyak kak, sangat cepat pelayanannya!",
        time: "23 Oct 03:12 PM",
        type: "text",
      },
    ],
  },
];

export default function ChatPage() {
  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>("thread-urban");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerInputPrice, setOfferInputPrice] = useState("32.00");
  const [offerError, setOfferError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, activeThreadId]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const filteredThreads = threads.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.partnerName.toLowerCase().includes(q) ||
      t.product.title.toLowerCase().includes(q) ||
      t.lastSnippet.toLowerCase().includes(q)
    );
  });

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setIsMobileChatOpen(true);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "buyer",
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          lastTime: newMessage.time,
          lastSnippet: trimmed,
          messages: [...t.messages, newMessage],
        };
      })
    );
    setInputText("");

    // Simulate auto-reply from merchant after 1.2 seconds
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: "seller",
        text: `Terima kasih pesannya kak! Kami siap bantu untuk pesanan "${activeThread.product.title}". Silakan ajukan penawaran jika ingin negosiasi ya kak.`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text",
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeThreadId) return t;
          return {
            ...t,
            lastTime: autoReply.time,
            lastSnippet: autoReply.text ?? "",
            messages: [...t.messages, autoReply],
          };
        })
      );
    }, 1200);
  };

  const handleAttachMockPhoto = () => {
    const photoMessage: ChatMessage = {
      id: `photo-${Date.now()}`,
      sender: "buyer",
      imageUrl:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=80",
      imageCaption: "Foto referensi ukuran & perbandingan warna",
      text: "Kak, apakah detail warna produk sama persis seperti contoh foto referensi ini?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "image",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          lastTime: photoMessage.time,
          lastSnippet: "[Gambar] Foto referensi ukuran & perbandingan warna",
          messages: [...t.messages, photoMessage],
        };
      })
    );
    setToastMessage("Foto berhasil dilampirkan ke percakapan");
  };

  const handleOpenOfferModal = () => {
    const suggestedPrice = (activeThread.product.listPrice * 0.85).toFixed(2);
    setOfferInputPrice(suggestedPrice);
    setOfferError("");
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = (e: FormEvent) => {
    e.preventDefault();
    const offered = parseFloat(offerInputPrice);
    const original = activeThread.product.listPrice;

    if (isNaN(offered) || offered <= 0) {
      setOfferError("Masukkan nominal penawaran harga yang valid.");
      return;
    }
    if (offered >= original) {
      setOfferError(
        `Harga tawaran harus lebih rendah dari harga toko ($${original.toFixed(2)}).`
      );
      return;
    }
    if (offered < original * 0.4) {
      setOfferError(
        `Harga tawaran terlalu rendah (maksimal diskon 60% dari harga asli).`
      );
      return;
    }

    const savings = original - offered;
    const savingsPercent = Math.round((savings / original) * 1000) / 10;

    const newOfferMessage: ChatMessage = {
      id: `offer-${Date.now()}`,
      sender: "buyer",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "offer",
      offer: {
        id: `off-${Date.now()}`,
        offeredPrice: offered,
        originalPrice: original,
        savings: savings,
        savingsPercent: savingsPercent,
        status: "pending",
        submittedBy: "buyer",
      },
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        return {
          ...t,
          lastTime: newOfferMessage.time,
          lastSnippet: `Tawaran harga $${offered.toFixed(2)} diajukan.`,
          offerBadge: {
            status: "pending",
            label: "Offer Pending",
          },
          messages: [...t.messages, newOfferMessage],
        };
      })
    );

    setOfferModalOpen(false);
    setToastMessage(
      `Tawaran $${offered.toFixed(2)} berhasil diajukan ke penjual!`
    );

    // Simulate merchant acceptance after 2.5s
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== activeThreadId) return t;
          const updatedMessages = t.messages.map((m) => {
            if (m.type === "offer" && m.offer && m.offer.status === "pending") {
              return {
                ...m,
                offer: {
                  ...m.offer,
                  status: "accepted" as OfferStatus,
                },
              };
            }
            return m;
          });

          const acceptanceMessage: ChatMessage = {
            id: `accept-note-${Date.now()}`,
            sender: "seller",
            text: `Tawaran $${offered.toFixed(2)} Anda kami setujui! Silakan langsung klik tombol checkout di bawah penawaran ya kak.`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "text",
          };

          return {
            ...t,
            offerBadge: {
              status: "accepted",
              label: "Offer Accepted",
            },
            lastTime: acceptanceMessage.time,
            lastSnippet: `Penawaran $${offered.toFixed(2)} disetujui penjual!`,
            messages: [...updatedMessages, acceptanceMessage],
          };
        })
      );
      setToastMessage(
        `Kabar baik! Penjual telah MENERIMA tawaran $${offered.toFixed(2)} Anda.`
      );
    }, 2500);
  };

  const handleAcceptCounterOffer = (messageId: string, counterPrice: number) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== activeThreadId) return t;
        const updated = t.messages.map((m) => {
          if (m.id === messageId && m.offer) {
            return {
              ...m,
              offer: {
                ...m.offer,
                offeredPrice: counterPrice,
                status: "accepted" as OfferStatus,
              },
            };
          }
          return m;
        });
        return {
          ...t,
          offerBadge: {
            status: "accepted",
            label: "Offer Accepted",
          },
          messages: updated,
        };
      })
    );
    setToastMessage(
      `Anda menyetujui tawaran tandingan $${counterPrice.toFixed(2)}.`
    );
  };

  const handleSimulatedCheckout = (price: number) => {
    setToastMessage(
      `Mengarahkan ke checkout dengan harga khusus penawaran: $${price.toFixed(2)} (Escrow Aktif)`
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased">
      <Navbar />

      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg transition-all animate-bounce">
          <svg
            className="h-5 w-5 text-emerald-600 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="chat-page mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
        {/* Main Messenger Container */}
        <div className="chat-messenger-container flex h-[calc(100vh-8.5rem)] min-h-[600px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* ======================================================== */}
          {/* PANEL KIRI: DAFTAR PERCAKAPAN (INBOX SIDEBAR)           */}
          {/* ======================================================== */}
          <aside
            className={`chat-sidebar flex w-full flex-col border-r border-slate-200 bg-slate-50/50 md:w-80 lg:w-96 shrink-0 ${
              isMobileChatOpen ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Sidebar Header */}
            <header className="sidebar-header border-b border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Messages
                  </h2>
                  <span className="flex h-5 items-center justify-center rounded-full bg-indigo-100 px-2 text-xs font-semibold text-indigo-700">
                    {threads.reduce((acc, t) => acc + t.unreadCount, 0)} new
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Escrow Safe</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="search-chat-wrapper relative mt-3">
                <svg
                  className="search-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </header>

            {/* Conversation Thread List */}
            <ul className="conversation-thread-list flex-1 divide-y divide-slate-100 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <li className="p-8 text-center text-xs text-slate-400">
                  Tidak ada percakapan yang cocok dengan pencarian.
                </li>
              ) : (
                filteredThreads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  return (
                    <li
                      key={thread.id}
                      onClick={() => handleSelectThread(thread.id)}
                      className={`conversation-item cursor-pointer p-3.5 transition hover:bg-slate-100/80 ${
                        isActive
                          ? "active bg-indigo-50/70 border-l-4 border-indigo-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar with Online Pulse */}
                        <div
                          className={`user-avatar-wrap relative shrink-0 ${
                            thread.isOnline ? "online" : ""
                          }`}
                        >
                          <img
                            src={thread.partnerAvatar}
                            alt={thread.partnerName}
                            className="avatar-img h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          {thread.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                          )}
                        </div>

                        {/* Thread Meta & Last Snippet */}
                        <div className="convo-meta min-w-0 flex-1">
                          <div className="convo-top-row flex items-center justify-between gap-1">
                            <h4 className="convo-name truncate text-sm font-semibold text-slate-900">
                              {thread.partnerName}
                            </h4>
                            <time className="convo-time shrink-0 text-[11px] text-slate-400">
                              {thread.lastTime}
                            </time>
                          </div>

                          <p className="convo-snippet mt-1 truncate text-xs text-slate-500">
                            {thread.lastSnippet}
                          </p>

                          {/* Offer status badge & product reference */}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] text-indigo-600 font-medium">
                              🏷️ {thread.product.title}
                            </span>
                            {thread.offerBadge && (
                              <span
                                className={`badge-offer-status shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                                  thread.offerBadge.status === "accepted"
                                    ? "accepted bg-emerald-100 text-emerald-800"
                                    : thread.offerBadge.status === "pending"
                                    ? "pending bg-amber-100 text-amber-800"
                                    : thread.offerBadge.status === "countered"
                                    ? "countered bg-indigo-100 text-indigo-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {thread.offerBadge.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>

          {/* ======================================================== */}
          {/* PANEL KANAN: JENDELA OBROLAN AKTIF (ACTIVE CHAT VIEWPORT) */}
          {/* ======================================================== */}
          <section
            className={`chat-viewport flex flex-1 flex-col bg-white overflow-hidden ${
              !isMobileChatOpen ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header Ruang Chat & Info Produk yang Ditanyakan */}
            <header className="chat-room-header border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="recipient-profile flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="mr-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
                    title="Back to inbox"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>

                  <div className="relative">
                    <img
                      src={activeThread.partnerAvatar}
                      alt={activeThread.partnerName}
                      className="avatar-small h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    {activeThread.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                        {activeThread.partnerName}
                      </h3>
                      {activeThread.isVerified && (
                        <svg
                          className="h-4 w-4 text-sky-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                    </div>
                    <span className="online-indicator block text-xs text-slate-500">
                      {activeThread.statusText}
                    </span>
                  </div>
                </div>

                {/* Escrow badge & product link */}
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    <svg
                      className="h-3.5 w-3.5 text-emerald-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Escrow Guaranteed</span>
                  </div>

                  <Link
                    href={`/products/${activeThread.product.slug}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    title="Lihat Halaman Produk"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Sticky Product Context Bar */}
              <div className="chat-product-banner flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-6">
                <div className="flex items-center gap-3">
                  <img
                    src={activeThread.product.thumbnail}
                    alt={activeThread.product.title}
                    className="banner-product-thumb h-12 w-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="banner-product-info">
                    <span className="prod-title block text-xs sm:text-sm font-semibold text-slate-900">
                      {activeThread.product.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="prod-price text-xs text-slate-600">
                        List Price:{" "}
                        <strong className="text-slate-900">
                          ${activeThread.product.listPrice.toFixed(2)}
                        </strong>
                      </span>
                      <span className="text-[10px] rounded bg-slate-200 px-1.5 py-0.2 font-medium text-slate-700">
                        {activeThread.product.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Make Offer CTA Action */}
                <button
                  type="button"
                  onClick={handleOpenOfferModal}
                  className="btn-make-offer-action inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                >
                  <svg
                    className="tag-discount-icon h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span>Make Offer</span>
                </button>
              </div>
            </header>

            {/* Area Scroll Pesan */}
            <div className="chat-messages-scroll-area flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
              {/* Date Divider */}
              <div className="date-divider flex items-center justify-center">
                <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-medium text-slate-600">
                  Today, 25 October
                </span>
              </div>

              {/* Escrow System Security Banner */}
              <div className="mx-auto max-w-lg rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-center text-xs leading-5 text-indigo-900">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-indigo-700">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>SocMark Escrow Guarantee</span>
                </div>
                <p className="mt-0.5 text-slate-600">
                  Semua kesepakatan harga negosiasi dilindungi rekening escrow.
                  Dana diteruskan ke penjual hanya setelah barang kamu terima
                  dengan baik.
                </p>
              </div>

              {/* Messages Render */}
              {activeThread.messages.map((msg) => {
                const isSentByMe = msg.sender === "buyer";

                return (
                  <div
                    key={msg.id}
                    className={`message-row flex ${
                      isSentByMe ? "sent justify-end" : "received justify-start"
                    }`}
                  >
                    {/* TYPE 1: REGULAR TEXT BUBBLE */}
                    {msg.type === "text" && (
                      <div
                        className={`bubble text-bubble max-w-sm sm:max-w-md rounded-2xl px-4 py-3 text-sm shadow-xs ${
                          isSentByMe
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line">
                          {msg.text}
                        </p>
                        <div
                          className={`msg-time mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                            isSentByMe ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          <time>{msg.time}</time>
                          {isSentByMe && (
                            <svg
                              className="double-check-svg h-3.5 w-3.5 text-indigo-200"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6L7 17l-5-5" />
                              <path d="M22 10l-7.5 7.5L13 16" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE 2: IMAGE ATTACHMENT BUBBLE */}
                    {msg.type === "image" && (
                      <div
                        className={`bubble image-bubble max-w-xs sm:max-w-sm rounded-2xl p-2.5 shadow-xs ${
                          isSentByMe
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                        }`}
                      >
                        {msg.imageUrl && (
                          <div className="overflow-hidden rounded-xl bg-slate-100">
                            <img
                              src={msg.imageUrl}
                              alt={msg.imageCaption ?? "Attached Photo"}
                              className="h-48 w-full object-cover transition hover:scale-105"
                            />
                          </div>
                        )}
                        {msg.imageCaption && (
                          <p className="mt-2 text-xs font-medium px-1">
                            {msg.imageCaption}
                          </p>
                        )}
                        {msg.text && (
                          <p className="mt-1 text-xs leading-relaxed px-1 opacity-90">
                            {msg.text}
                          </p>
                        )}
                        <div
                          className={`msg-time mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                            isSentByMe ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          <time>{msg.time}</time>
                          {isSentByMe && (
                            <svg
                              className="double-check-svg h-3.5 w-3.5 text-indigo-200"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 6L7 17l-5-5" />
                              <path d="M22 10l-7.5 7.5L13 16" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE 3: INTERACTIVE OFFER CARD BUBBLE (SOCMARK SPECIAL FEATURE) */}
                    {msg.type === "offer" && msg.offer && (
                      <div className="bubble offer-bubble w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-md">
                        {/* Offer Card Header */}
                        <div className="offer-header flex items-center justify-between border-b border-indigo-100 bg-indigo-50/70 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <svg
                              className="handshake-icon h-4 w-4 text-indigo-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
                              <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L15 14" />
                              <path d="m2 16 6 6" />
                              <path d="m14 2 8 8" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                              {msg.offer.status === "countered"
                                ? "Counter Offer Received"
                                : "Offer Submitted"}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">
                            {msg.time}
                          </span>
                        </div>

                        {/* Offer Card Body */}
                        <div className="offer-body p-4">
                          <p className="offer-label text-xs font-medium text-slate-500">
                            {msg.offer.submittedBy === "buyer"
                              ? "Tawaran Harga Anda:"
                              : "Tawaran dari Penjual:"}
                          </p>

                          <div className="mt-1 flex items-baseline gap-2.5">
                            <h3 className="offered-price text-2xl font-black text-slate-900">
                              ${msg.offer.offeredPrice.toFixed(2)}
                            </h3>
                            <span className="original-striked text-sm font-semibold text-slate-400 line-through">
                              ${msg.offer.originalPrice.toFixed(2)}
                            </span>
                          </div>

                          <p className="offer-savings mt-1 text-xs font-semibold text-emerald-600">
                            Hemat ${msg.offer.savings.toFixed(2)} (Diskon{" "}
                            {msg.offer.savingsPercent}%)
                          </p>

                          {/* Product Reference preview in card */}
                          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-xs text-slate-700">
                            <img
                              src={activeThread.product.thumbnail}
                              alt=""
                              className="h-8 w-8 rounded object-cover"
                            />
                            <span className="truncate font-medium">
                              {activeThread.product.title}
                            </span>
                          </div>
                        </div>

                        {/* Offer Footer: State ACCEPTED */}
                        {msg.offer.status === "accepted" && (
                          <div className="offer-footer status-accepted border-t border-emerald-100 bg-emerald-50/80 p-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                              <svg
                                className="check-circle-icon h-4 w-4 text-emerald-600 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                              <span>Penjual MENERIMA penawaran ini!</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleSimulatedCheckout(
                                  msg.offer?.offeredPrice ?? 0
                                )
                              }
                              className="btn-checkout-offer mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-98"
                            >
                              <span>
                                Checkout dengan Harga $
                                {msg.offer.offeredPrice.toFixed(2)}
                              </span>
                              <svg
                                className="arrow-right-icon h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Offer Footer: State COUNTERED */}
                        {msg.offer.status === "countered" && (
                          <div className="offer-footer status-countered border-t border-indigo-100 bg-indigo-50/80 p-4">
                            <div className="text-xs font-bold text-indigo-900">
                              Penjual memberikan penawaran tandingan: $
                              {msg.offer.counterPrice?.toFixed(2)}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAcceptCounterOffer(
                                    msg.id,
                                    msg.offer?.counterPrice ?? 75
                                  )
                                }
                                className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                              >
                                Terima ${msg.offer.counterPrice?.toFixed(2)}
                              </button>
                              <button
                                type="button"
                                onClick={handleOpenOfferModal}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Nego Lagi
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Offer Footer: State PENDING */}
                        {msg.offer.status === "pending" && (
                          <div className="offer-footer status-pending flex items-center justify-between border-t border-amber-100 bg-amber-50/80 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                              </span>
                              <span>Menunggu respon penjual...</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setToastMessage("Tawaran harga dibatalkan.");
                                setThreads((prev) =>
                                  prev.map((t) =>
                                    t.id === activeThreadId
                                      ? {
                                          ...t,
                                          messages: t.messages.filter(
                                            (m) => m.id !== msg.id
                                          ),
                                        }
                                      : t
                                  )
                                );
                              }}
                              className="text-xs font-semibold text-rose-600 hover:underline"
                            >
                              Batalkan
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Discussion Pills */}
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-4 py-2 text-xs">
              <span className="shrink-0 text-slate-400 py-1">Quick asks:</span>
              {[
                "Apakah ready stock?",
                "Bisa kirim hari ini?",
                "Boleh tawar lagi kak?",
                "Barang original 100%?",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setInputText(chip);
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Footer Form Input Pesan & Negosiasi */}
            <footer className="chat-input-bar border-t border-slate-200 bg-white p-3 sm:p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                {/* Kirim Foto Media */}
                <button
                  type="button"
                  onClick={handleAttachMockPhoto}
                  className="btn-attach-media rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                  title="Kirim Foto Produk"
                >
                  <svg
                    className="paperclip-icon h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                {/* Tombol Buat Tawaran Baru */}
                <button
                  type="button"
                  onClick={handleOpenOfferModal}
                  className="btn-trigger-offer-sheet flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  title="Buat Tawaran Baru"
                >
                  <svg
                    className="tag-plus-icon h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                    <line x1="12" y1="11" x2="16" y2="11" />
                    <line x1="14" y1="9" x2="14" y2="13" />
                  </svg>
                  <span className="hidden sm:inline">Nego</span>
                </button>

                {/* Input Text */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message or discuss item condition..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="chat-text-input flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn-send-message inline-flex items-center justify-center rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Kirim Pesan"
                >
                  <svg
                    className="send-plane-icon h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </footer>
          </section>
        </div>

        {/* ======================================================== */}
        {/* POP-UP MODAL: INPUT FORM MAKE AN OFFER                  */}
        {/* ======================================================== */}
        {offerModalOpen && (
          <div
            className="offer-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="offer-modal-box w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <header className="modal-header flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Make an Offer
                  </h3>
                </div>
                <button
                  onClick={() => setOfferModalOpen(false)}
                  className="btn-close-modal rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg
                    className="close-x-icon h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </header>

              <form onSubmit={handleSubmitOffer}>
                <div className="modal-body py-4 space-y-4">
                  {/* Info Ringkas Produk */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={activeThread.product.thumbnail}
                      alt={activeThread.product.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {activeThread.product.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Harga Toko:{" "}
                        <strong>
                          ${activeThread.product.listPrice.toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Preset Diskon Cepat */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Rekomendasi Penawaran:
                    </label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {[10, 15, 20, 25].map((pct) => {
                        const price = (
                          activeThread.product.listPrice *
                          (1 - pct / 100)
                        ).toFixed(2);
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setOfferInputPrice(price);
                              setOfferError("");
                            }}
                            className={`rounded-xl border py-2 text-center text-xs font-semibold transition ${
                              offerInputPrice === price
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block text-[10px] text-slate-400">
                              -{pct}%
                            </span>
                            ${price}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Input Angka Tawaran */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Nominal Tawaran Anda:
                    </label>
                    <div className="price-input-wrapper relative mt-1.5 flex items-center">
                      <span className="currency-prefix absolute left-4 text-base font-bold text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="32.00"
                        value={offerInputPrice}
                        onChange={(e) => {
                          setOfferInputPrice(e.target.value);
                          setOfferError("");
                        }}
                        className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-4 text-lg font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    {offerError && (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">
                        {offerError}
                      </p>
                    )}
                  </div>

                  {/* Negotiation Tip */}
                  <p className="negotiation-tip rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 border border-amber-100">
                    Penjual lebih cenderung menerima tawaran dalam rentang 10% -
                    20% dari harga awal.
                  </p>
                </div>

                <footer className="modal-footer flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setOfferModalOpen(false)}
                    className="btn-cancel rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-submit-offer rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                  >
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
