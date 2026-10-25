export type OfferStatus = "pending" | "accepted" | "declined" | "countered";

export type ChatMessage = {
  id: string;
  sender: "buyer" | "seller";
  text?: string;
  imageUrl?: string;
  time: string;
  offer?: {
    offeredPrice: number;
    originalPrice: number;
    savings: number;
    savingsPercent: number;
    status: OfferStatus;
    counterPrice?: number;
  };
};

export type Thread = {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  isOnline: boolean;
  statusText: string;
  isVerified: boolean;
  lastSnippet: string;
  lastTime: string;
  offerBadge?: { status: OfferStatus; label: string };
  product: {
    title: string;
    condition: string;
    listPrice: number;
    thumbnail: string;
    slug: string;
  };
  messages: ChatMessage[];
};

export const INITIAL_THREADS: Thread[] = [
  {
    id: "thread-urban",
    partnerName: "Urban Streetwear Official",
    partnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
    statusText: "Online • Typically replies in 5m",
    isVerified: true,
    lastTime: "12:45 PM",
    lastSnippet: "Penawaran harga $32.00 telah diterima!",
    offerBadge: { status: "accepted", label: "Offer Accepted" },
    product: {
      title: "Oversized Heavyweight Tee",
      condition: "Brand New",
      listPrice: 38.0,
      thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
      slug: "cloud-knit",
    },
    messages: [
      { id: "m1", sender: "buyer", text: "Halo kak, apakah produk ini ready untuk ukuran XL warna hitam?", time: "12:30 PM" },
      { id: "m2", sender: "seller", text: "Halo! Ready kak, stok tinggal 3 pcs lagi ya.", time: "12:32 PM" },
      {
        id: "m3",
        sender: "seller",
        imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=500&q=80",
        text: "Detail jahitan & label original 16s cotton.",
        time: "12:38 PM",
      },
      {
        id: "m4",
        sender: "buyer",
        time: "12:42 PM",
        offer: {
          offeredPrice: 32.0,
          originalPrice: 38.0,
          savings: 6.0,
          savingsPercent: 15.8,
          status: "accepted",
        },
      },
      { id: "m5", sender: "seller", text: "Deal kak! Tawaran kami terima. Silakan lanjut ke checkout ya.", time: "12:45 PM" },
    ],
  },
  {
    id: "thread-aster",
    partnerName: "Aster Camera Supply",
    partnerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    isOnline: true,
    statusText: "Online • Fast response",
    isVerified: true,
    lastTime: "11:20 AM",
    lastSnippet: "Tawaran $130.00 sedang menunggu review penjual.",
    offerBadge: { status: "pending", label: "Offer Pending" },
    product: {
      title: "Aster Mini Instant Camera",
      condition: "Brand New",
      listPrice: 149.0,
      thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80",
      slug: "aurora-camera",
    },
    messages: [
      { id: "m6", sender: "buyer", text: "Halo, apakah sudah include film pack 10 sheets?", time: "11:10 AM" },
      { id: "m7", sender: "seller", text: "Halo! Betul kak, unit baru sudah include film pack & strap.", time: "11:15 AM" },
      {
        id: "m8",
        sender: "buyer",
        time: "11:20 AM",
        offer: {
          offeredPrice: 130.0,
          originalPrice: 149.0,
          savings: 19.0,
          savingsPercent: 12.8,
          status: "pending",
        },
      },
    ],
  },
  {
    id: "thread-forme",
    partnerName: "Forme Vintage Studio",
    partnerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    isOnline: false,
    statusText: "Offline • Last seen 1h ago",
    isVerified: false,
    lastTime: "Yesterday",
    lastSnippet: "Penjual menawarkan harga tandingan: $75.00",
    offerBadge: { status: "countered", label: "Counter: $75.00" },
    product: {
      title: "Cloud Knit Everyday Cardigan",
      condition: "Like New",
      listPrice: 86.0,
      thumbnail: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=200&q=80",
      slug: "cloud-knit",
    },
    messages: [
      {
        id: "m9",
        sender: "buyer",
        time: "Yesterday",
        offer: {
          offeredPrice: 65.0,
          originalPrice: 86.0,
          savings: 21.0,
          savingsPercent: 24.4,
          status: "countered",
          counterPrice: 75.0,
        },
      },
      { id: "m10", sender: "seller", text: "Kondisi masih 98% mulus kak, kami counter di $75.00 ya.", time: "Yesterday" },
    ],
  },
];
