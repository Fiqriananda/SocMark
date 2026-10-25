import type { Product } from "./productTypes";

export const products: Record<string, Product> = {
  "aurora-camera": {
    name: "Aster Mini Instant Camera",
    category: "Electronics",
    brand: "ASTER",
    condition: "Brand new",
    rating: 4.9,
    reviews: 128,
    price: 149,
    oldPrice: 199,
    description:
      "Capture little moments in an instant. The Aster Mini pairs a pocket-friendly design with soft, nostalgic color and easy-to-use controls. Every camera includes a wrist strap and a starter pack of film.",
    colors: ["Cloud", "Blush", "Sage"],
    sizes: ["Standard"],
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1616088886430-ccd86fef0713?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=1200&q=85",
    ],
    seller: "Sunday Supply",
    sellerInitials: "SS",
    sellerLocation: "Bandung, Indonesia",
    videos: [
      {
        creator: "Nadia Putri",
        handle: "@nadiaframes",
        likes: "12.8k",
        image:
          "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=700&q=85",
      },
      {
        creator: "Kevin Tan",
        handle: "@kevinonfilm",
        likes: "8.4k",
        image:
          "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85",
      },
      {
        creator: "Mira Aulia",
        handle: "@miramakes",
        likes: "6.1k",
        image:
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=85",
      },
    ],
  },
  "cloud-knit": {
    name: "Cloud Knit Everyday Cardigan",
    category: "Fashion",
    brand: "FORME STUDIO",
    condition: "Like new",
    rating: 4.8,
    reviews: 86,
    price: 88,
    oldPrice: 118,
    description:
      "A soft, easy layer made for slow mornings and long walks. This lightweight cotton-blend cardigan has a relaxed silhouette, natural buttons, and a little extra room in all the right places.",
    colors: ["Oat", "Rose", "Forest"],
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85",
    ],
    seller: "Forme Archive",
    sellerInitials: "FA",
    sellerLocation: "Jakarta, Indonesia",
    videos: [
      {
        creator: "Tara Wijaya",
        handle: "@tarasunday",
        likes: "9.2k",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
      },
      {
        creator: "Nadia Putri",
        handle: "@nadiaframes",
        likes: "7.6k",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85",
      },
      {
        creator: "Sasha Lim",
        handle: "@sashaincolour",
        likes: "5.3k",
        image:
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=85",
      },
    ],
  },
  "studio-headphones": {
    name: "Studio One Wireless Headphones",
    category: "Electronics",
    brand: "SOUND OBJECTS",
    condition: "Brand new",
    rating: 4.7,
    reviews: 214,
    price: 129,
    oldPrice: 169,
    description:
      "Thoughtful sound for your everyday. Studio One delivers balanced audio, plush memory-foam ear cushions, and up to thirty hours of listening in a clean, understated silhouette.",
    colors: ["Midnight", "Stone", "Lilac"],
    sizes: ["Standard"],
    images: [
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85",
    ],
    seller: "Soft Sounds",
    sellerInitials: "SO",
    sellerLocation: "Yogyakarta, Indonesia",
    videos: [
      {
        creator: "Kevin Tan",
        handle: "@kevinonfilm",
        likes: "11.1k",
        image:
          "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=85",
      },
      {
        creator: "Ari Pratama",
        handle: "@ari.listens",
        likes: "6.9k",
        image:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=700&q=85",
      },
      {
        creator: "Mira Aulia",
        handle: "@miramakes",
        likes: "4.8k",
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=85",
      },
    ],
  },
};

export function createFallbackProduct(id: string): Product {
  const label = id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    ...products["aurora-camera"],
    name: label || products["aurora-camera"].name,
  };
}
