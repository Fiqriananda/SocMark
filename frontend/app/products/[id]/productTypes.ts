export type Product = {
  name: string;
  category: string;
  brand: string;
  condition: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
  description: string;
  colors: string[];
  sizes: string[];
  images: string[];
  seller: string;
  sellerInitials: string;
  sellerLocation: string;
  videos: { creator: string; handle: string; likes: string; image: string }[];
};

export type ProductInfoTab = "Overview" | "Specifications" | "Reviews" | "Shipping";
