"use client";

import Link from "next/link";
import { use, useEffect, useState, type FormEvent } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

type Product = {
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

const products: Record<string, Product> = {
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

const colorSwatches: Record<string, string> = {
  Cloud: "#e9e7df",
  Blush: "#e7c4bd",
  Sage: "#aebaa5",
  Oat: "#d9cdbb",
  Rose: "#d9a8a5",
  Forest: "#687d68",
  Midnight: "#292d3a",
  Stone: "#b4b0a7",
  Lilac: "#c4b8d2",
};

const stockByOption: Record<string, number> = {
  "Cloud-Standard": 8,
  "Blush-Standard": 3,
  "Sage-Standard": 0,
  "Oat-S": 0,
  "Oat-M": 6,
  "Oat-L": 2,
  "Rose-S": 4,
  "Rose-M": 0,
  "Rose-L": 3,
  "Forest-S": 2,
  "Forest-M": 5,
  "Forest-L": 0,
  "Midnight-Standard": 7,
  "Stone-Standard": 2,
  "Lilac-Standard": 0,
};

const colorPriceDelta: Record<string, number> = {
  Blush: 5,
  Forest: 6,
  Lilac: 8,
};

const sizePriceDelta: Record<string, number> = {
  L: 8,
};

function getDefaultVariant(product: Product) {
  const color = product.colors.find((option) =>
    product.sizes.some((size) => (stockByOption[`${option}-${size}`] ?? 4) > 0),
  ) ?? product.colors[0] ?? "";
  const size = product.sizes.find((option) => (stockByOption[`${color}-${option}`] ?? 4) > 0)
    ?? product.sizes[0]
    ?? "";
  return { color, size };
}

function Icon({
  name,
  size = 20,
  filled = false,
}: {
  name: "home" | "chevron" | "star" | "cart" | "heart" | "verified" | "video" | "tag" | "play" | "truck" | "check" | "close";
  size?: number;
  filled?: boolean;
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
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></svg>;
    case "chevron":
      return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
    case "star":
      return <svg {...common} fill={filled ? "currentColor" : "none"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "cart":
      return <svg {...common}><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
    case "heart":
      return <svg {...common} fill={filled ? "currentColor" : "none"}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
    case "verified":
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "video":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="m10 8 6 4-6 4V8Z" /></svg>;
    case "tag":
      return <svg {...common}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6l6.4 6.4a3.1 3.1 0 0 1 0 4.4Z" /><circle cx="7.5" cy="7.5" r="1" /></svg>;
    case "play":
      return <svg {...common} fill="currentColor" stroke="none"><path d="M8 5.8a1 1 0 0 1 1.5-.9l9.2 5.3a2 2 0 0 1 0 3.5l-9.2 5.3a1 1 0 0 1-1.5-.9V5.8Z" /></svg>;
    case "truck":
      return <svg {...common}><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7.5" cy="19" r="1.5" /><circle cx="17.5" cy="19" r="1.5" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "close":
      return <svg {...common}><path d="m18 6-12 12M6 6l12 12" /></svg>;
  }
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function createFallbackProduct(id: string): Product {
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  return <ProductDetailView key={productId} productId={productId} />;
}

function ProductDetailView({ productId }: { productId: string }) {
  const product = products[productId] ?? createFallbackProduct(productId);
  const defaultVariant = getDefaultVariant(product);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(defaultVariant.color);
  const [selectedSize, setSelectedSize] = useState(defaultVariant.size);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Overview");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [toast, setToast] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!offerOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOfferOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [offerOpen]);

  const selectedVariantKey = `${selectedColor}-${selectedSize}`;
  const stock = stockByOption[selectedVariantKey] ?? 4;
  const selectedPrice = product.price + (colorPriceDelta[selectedColor] ?? 0) + (sizePriceDelta[selectedSize] ?? 0);
  const discount = Math.round((1 - selectedPrice / product.oldPrice) * 100);

  function updateVariant(kind: "color" | "size", value: string) {
    if (kind === "color") setSelectedColor(value);
    else setSelectedSize(value);
    setQuantity(1);
  }

  function handleOfferSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setOfferError("Enter a valid offer amount greater than zero.");
      return;
    }
    if (amount >= selectedPrice) {
      setOfferError("Your offer should be lower than the listed price.");
      return;
    }
    setOfferOpen(false);
    setOfferAmount("");
    setOfferError("");
    setToast(`Your ${formatPrice(amount)} offer was sent to ${product.seller}.`);
  }

  const tabs = ["Overview", "Specifications", "Reviews", "Shipping"];

  return (
    <div className="detail-page-shell feed-page-body min-h-screen flex flex-col">
      <Navbar />
      <main className="product-detail-page">
        <div className="product-detail-container">
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" aria-label="Home"><Icon name="home" size={15} /></Link>
            <Icon name="chevron" size={14} />
            <Link href="/discover">{product.category}</Link>
            <Icon name="chevron" size={14} />
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="product-main-grid">
            <section className="product-gallery-section" aria-label="Product images">
              <div
                className="detail-main-image"
                role="img"
                aria-label={`${product.name}, image ${activeImage + 1}`}
                style={{ backgroundImage: `url("${product.images[activeImage]}")` }}
              >
                <button
                  type="button"
                  className="detail-gallery-arrow previous"
                  onClick={() => setActiveImage((current) => (current - 1 + product.images.length) % product.images.length)}
                  aria-label="Previous product image"
                >
                  <Icon name="chevron" size={19} />
                </button>
                <button
                  type="button"
                  className="detail-gallery-arrow next"
                  onClick={() => setActiveImage((current) => (current + 1) % product.images.length)}
                  aria-label="Next product image"
                >
                  <Icon name="chevron" size={19} />
                </button>
                <span className="detail-image-counter">{String(activeImage + 1).padStart(2, "0")} <span>/ {String(product.images.length).padStart(2, "0")}</span></span>
                <span className="detail-image-brand">{product.brand}</span>
              </div>
              <div className="detail-gallery-bottom">
                <div className="detail-thumbnail-strip" role="group" aria-label="Choose product image">
                  {product.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      className={`detail-thumbnail ${activeImage === index ? "active" : ""}`}
                      style={{ backgroundImage: `url("${image}")` }}
                      onClick={() => setActiveImage(index)}
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={activeImage === index}
                    />
                  ))}
                </div>
                <span className="detail-gallery-hint">Tap to explore</span>
              </div>
            </section>

            <section className="product-summary-section" aria-labelledby="product-title">
              <div className="detail-product-kicker">{product.brand} <span>•</span> {product.category}</div>
              <div className="product-title-row">
                <div>
                  <span className="detail-condition-badge"><span />{product.condition}</span>
                  <h1 id="product-title" className="product-title">{product.name}</h1>
                </div>
                <button
                  type="button"
                  className={`detail-wishlist-button ${isWishlisted ? "active" : ""}`}
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    setToast(isWishlisted ? "Removed from your saved items." : "Saved to your wishlist.");
                  }}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={isWishlisted}
                >
                  <Icon name="heart" size={20} filled={isWishlisted} />
                </button>
              </div>
              <div className="product-rating-meta">
                <span className="detail-rating-stars" aria-label={`${product.rating} out of 5 stars`}>
                  {[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={15} filled />)}
                </span>
                <strong>{product.rating}</strong>
                <span className="detail-rating-separator">·</span>
                <a href="#reviews">{product.reviews} reviews</a>
                <span className="detail-rating-separator">·</span>
                <span>42 sold</span>
              </div>

              <div className="product-price-box">
                <div className="detail-price-line">
                  <span className="current-price">{formatPrice(selectedPrice)}</span>
                  <span className="strike-price">{formatPrice(product.oldPrice)}</span>
                  <span className="discount-tag">{discount}% OFF</span>
                </div>
                <p>Taxes included. Shipping calculated at checkout.</p>
              </div>

              <div className="detail-selection-area">
                <div className="product-variants-wrapper">
                  <div className="variant-group">
                    <div className="detail-variant-heading">
                      <span>Color</span>
                      <span className="detail-variant-selected">{selectedColor || "Choose a color"}</span>
                    </div>
                    <div className="detail-color-options">
                      {product.colors.map((color) => {
                        const unavailable = (stockByOption[`${color}-${selectedSize}`] ?? 4) === 0;
                        return (
                          <button
                            type="button"
                            key={color}
                            className={`detail-color-option ${selectedColor === color ? "active" : ""} ${unavailable ? "unavailable" : ""}`}
                            onClick={() => updateVariant("color", color)}
                            aria-label={`${color}${unavailable ? ", out of stock" : ""}`}
                            aria-pressed={selectedColor === color}
                          >
                            <span style={{ backgroundColor: colorSwatches[color] ?? "#ddd" }} />
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {product.sizes.length > 1 && (
                    <div className="variant-group">
                      <div className="detail-variant-heading">
                        <span>Size</span>
                        <button type="button" className="detail-size-guide" onClick={() => setToast("Size guide: relaxed, true-to-size fit.")}>Size guide</button>
                      </div>
                      <div className="detail-size-options">
                        {product.sizes.map((size) => {
                          const unavailable = (stockByOption[`${selectedColor}-${size}`] ?? 4) === 0;
                          return (
                            <button
                              type="button"
                              key={size}
                              className={`detail-size-option ${selectedSize === size ? "active" : ""} ${unavailable ? "unavailable" : ""}`}
                              onClick={() => updateVariant("size", size)}
                              aria-pressed={selectedSize === size}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`detail-stock-status ${stock === 0 ? "out-of-stock" : ""}`} aria-live="polite">
                  <span />
                  {stock === 0 ? "Currently out of stock" : `${stock} pieces available`}
                </div>

                <div className="detail-quantity-row">
                  <span>Quantity</span>
                  <div className="detail-quantity-stepper">
                    <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1 || stock === 0} aria-label="Decrease quantity">−</button>
                    <span aria-live="polite">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((current) => Math.min(stock, current + 1))} disabled={quantity >= stock || stock === 0} aria-label="Increase quantity">+</button>
                  </div>
                </div>
              </div>

              <div className="product-cta-group">
                <button
                  type="button"
                  className="detail-add-cart"
                  disabled={stock === 0}
                  onClick={() => setToast(`${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`)}
                >
                  <Icon name="cart" size={19} /> Add to cart
                </button>
                <button
                  type="button"
                  className="detail-buy-now"
                  disabled={stock === 0}
                  onClick={() => setToast("Your item is ready for a quick checkout.")}
                >
                  Instant buy <span>↗</span>
                </button>
                <button type="button" className="detail-make-offer" onClick={() => setOfferOpen(true)}>
                  <Icon name="tag" size={17} /> Make an offer
                </button>
              </div>

              <aside className="merchant-trust-card">
                <div className="detail-seller-avatar">{product.sellerInitials}</div>
                <div className="detail-seller-info">
                  <div className="detail-seller-name">{product.seller}<Icon name="verified" size={15} /></div>
                  <div className="detail-seller-meta"><span><Icon name="star" size={11} filled /> 4.9</span><span>·</span>{product.sellerLocation}</div>
                  <span className="detail-seller-online"><span /> Usually responds within an hour</span>
                </div>
                <button type="button" className="detail-visit-shop" onClick={() => setToast(`${product.seller}'s shop is coming soon.`)}>Visit shop <span>↗</span></button>
              </aside>

              <div className="detail-promise-row">
                <span><Icon name="truck" size={17} /> Careful delivery</span>
                <span><Icon name="check" size={17} /> Buyer protection</span>
              </div>
            </section>
          </div>

          <section className="creator-tagged-videos-section" aria-labelledby="creator-videos-title">
            <div className="detail-section-heading">
              <div>
                <span className="detail-section-eyebrow">Loved by the community</span>
                <h2 id="creator-videos-title"><Icon name="video" size={22} /> Featured in creator feeds</h2>
                <p>See how creators style, use, and recommend this piece in their videos.</p>
              </div>
              <Link href="/feed" className="detail-see-all">Explore the feed <span>↗</span></Link>
            </div>
            <div className="tagged-videos-grid">
              {product.videos.map((video, index) => {
                const liked = likedVideos.includes(index);
                return (
                  <article className="detail-video-card" key={`${video.handle}-${index}`}>
                    <div className="detail-video-poster" style={{ backgroundImage: `url("${video.image}")` }}>
                      <span className="detail-video-tag">Tagged product</span>
                      <span className="detail-video-duration">0:24</span>
                      <span className="detail-video-play" aria-hidden="true"><Icon name="play" size={19} /></span>
                    </div>
                    <div className="detail-video-meta">
                      <span className="detail-creator-avatar">{video.creator.charAt(0)}</span>
                      <div className="detail-creator-copy"><strong>{video.creator}</strong><span>{video.handle}</span></div>
                      <button
                        type="button"
                        className={`detail-video-like ${liked ? "active" : ""}`}
                        onClick={() => setLikedVideos((current) => liked ? current.filter((item) => item !== index) : [...current, index])}
                        aria-label={liked ? `Unlike ${video.creator}'s video` : `Like ${video.creator}'s video`}
                        aria-pressed={liked}
                      >
                        <Icon name="heart" size={16} filled={liked} /><span>{video.likes}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="product-description-tabs" aria-label="Product information">
            <nav className="detail-tab-headers" role="tablist" aria-label="Product details">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`detail-tab-${tab.toLowerCase()}`}
                  aria-selected={activeTab === tab}
                  aria-controls="detail-tab-panel"
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}{tab === "Reviews" && <span>{product.reviews}</span>}
                </button>
              ))}
            </nav>
            <article className="detail-tab-content" id="detail-tab-panel" role="tabpanel" aria-labelledby={`detail-tab-${activeTab.toLowerCase()}`}>
              {activeTab === "Overview" && (
                <div className="detail-overview-copy">
                  <div><span className="detail-tab-eyebrow">A little more about it</span><h2>Made to be part of your story.</h2><p>{product.description}</p></div>
                  <ul><li><Icon name="check" size={16} /> Thoughtfully selected by our creator community</li><li><Icon name="check" size={16} /> Quality checked before it reaches you</li><li><Icon name="check" size={16} /> Secure checkout with buyer protection</li></ul>
                </div>
              )}
              {activeTab === "Specifications" && (
                <div className="detail-spec-list">
                  <div><span>Brand</span><strong>{product.brand}</strong></div>
                  <div><span>Condition</span><strong>{product.condition}</strong></div>
                  <div><span>Category</span><strong>{product.category}</strong></div>
                  <div><span>Available colors</span><strong>{product.colors.join(", ")}</strong></div>
                  {product.sizes.length > 1 && <div><span>Sizes</span><strong>{product.sizes.join(", ")}</strong></div>}
                  <div><span>Ships from</span><strong>{product.sellerLocation}</strong></div>
                </div>
              )}
              {activeTab === "Reviews" && (
                <div className="detail-reviews-summary" id="reviews">
                  <div className="detail-review-score">{product.rating}<span>{[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={12} filled />)}</span><small>Based on {product.reviews} reviews</small></div>
                  <div className="detail-review-quote"><div><strong>Looks even better in person</strong><span>{[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={11} filled />)} · Recently purchased</span></div><p>“Such a lovely find. The details are beautiful and it arrived carefully packed. Would absolutely recommend!”</p><small>— Alya R. · Bandung</small></div>
                </div>
              )}
              {activeTab === "Shipping" && (
                <div className="detail-shipping-copy"><span className="detail-shipping-icon"><Icon name="truck" size={22} /></span><div><h2>On its way to you, with care.</h2><p>This item ships from {product.sellerLocation}. Your exact delivery options and cost will be shown at checkout. Every order is covered by SocMark buyer protection.</p><span>Usually dispatched within 1–2 business days</span></div></div>
              )}
            </article>
          </section>
        </div>
      </main>

      {offerOpen && (
        <div className="detail-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOfferOpen(false); }}>
          <section className="detail-offer-modal" role="dialog" aria-modal="true" aria-labelledby="offer-title">
            <button className="detail-modal-close" type="button" aria-label="Close offer dialog" onClick={() => setOfferOpen(false)}><Icon name="close" size={18} /></button>
            <span className="detail-offer-icon"><Icon name="tag" size={21} /></span>
            <span className="detail-section-eyebrow">A little room to negotiate</span>
            <h2 id="offer-title">Make an offer</h2>
            <p>Send {product.seller} an offer for <strong>{product.name}</strong>. They’ll get back to you soon.</p>
            <form onSubmit={handleOfferSubmit}>
              <label htmlFor="offer-amount">Your offer</label>
              <div className="detail-offer-input"><span>$</span><input id="offer-amount" type="number" inputMode="decimal" min="0.01" max={(selectedPrice - 0.01).toFixed(2)} step="0.01" placeholder="0.00" value={offerAmount} onChange={(event) => { setOfferAmount(event.target.value); setOfferError(""); }} autoFocus required /><span>USD</span></div>
              {offerError && <p className="detail-offer-error" role="alert">{offerError}</p>}
              <div className="detail-offer-reference">Listed price <strong>{formatPrice(selectedPrice)}</strong></div>
              <button type="submit" className="detail-add-cart">Send offer</button>
              <button type="button" className="detail-cancel-offer" onClick={() => setOfferOpen(false)}>Maybe later</button>
            </form>
          </section>
        </div>
      )}

      {toast && <div className="detail-toast" role="status"><span><Icon name="check" size={16} /></span>{toast}</div>}
      <Footer />
    </div>
  );
}
