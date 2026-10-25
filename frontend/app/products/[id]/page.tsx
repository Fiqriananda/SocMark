"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { Icon } from "./ProductDetailIcons";
import { createFallbackProduct, products } from "./productData";
import type { Product, ProductInfoTab } from "./productTypes";

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

const sizePriceDelta: Record<string, number> = { L: 8 };
const infoTabs: ProductInfoTab[] = ["Overview", "Specifications", "Reviews", "Shipping"];

function getStock(color: string, size: string) {
  return stockByOption[`${color}-${size}`] ?? 4;
}

function getDefaultVariant(product: Product) {
  const color = product.colors.find((option) =>
    product.sizes.some((size) => getStock(option, size) > 0),
  ) ?? product.colors[0] ?? "";
  const size = product.sizes.find((option) => getStock(color, option) > 0)
    ?? product.sizes[0]
    ?? "";
  return { color, size };
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  return <ProductDetailView key={productId} productId={productId} />;
}

function ProductDetailView({ productId }: { productId: string }) {
  const product = products[productId] ?? createFallbackProduct(productId);
  const defaultVariant = getDefaultVariant(product);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(defaultVariant.color);
  const [selectedSize, setSelectedSize] = useState(defaultVariant.size);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductInfoTab>("Overview");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [toast, setToast] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const selectedPrice =
    product.price +
    (colorPriceDelta[selectedColor] ?? 0) +
    (sizePriceDelta[selectedSize] ?? 0);
  const stock = getStock(selectedColor, selectedSize);
  const discount = Math.round((1 - selectedPrice / product.oldPrice) * 100);

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
                  onClick={() =>
                    setActiveImage((current) =>
                      (current - 1 + product.images.length) % product.images.length,
                    )
                  }
                  aria-label="Previous product image"
                >
                  <Icon name="chevron" size={19} />
                </button>
                <button
                  type="button"
                  className="detail-gallery-arrow next"
                  onClick={() =>
                    setActiveImage((current) => (current + 1) % product.images.length)
                  }
                  aria-label="Next product image"
                >
                  <Icon name="chevron" size={19} />
                </button>
                <span className="detail-image-counter">
                  {String(activeImage + 1).padStart(2, "0")}{" "}
                  <span>/ {String(product.images.length).padStart(2, "0")}</span>
                </span>
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
                        const unavailable = getStock(color, selectedSize) === 0;
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
                        <button
                          type="button"
                          className="detail-size-guide"
                          onClick={() => setToast("Size guide: relaxed, true-to-size fit.")}
                        >
                          Size guide
                        </button>
                      </div>
                      <div className="detail-size-options">
                        {product.sizes.map((size) => {
                          const unavailable = getStock(selectedColor, size) === 0;
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
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={quantity <= 1 || stock === 0}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.min(stock, current + 1))}
                      disabled={quantity >= stock || stock === 0}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="product-cta-group">
                <button
                  type="button"
                  className="detail-add-cart"
                  disabled={stock === 0}
                  onClick={() =>
                    setToast(`${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`)
                  }
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
                <button
                  type="button"
                  className="detail-make-offer"
                  onClick={() => setOfferOpen(true)}
                >
                  <Icon name="tag" size={17} /> Make an offer
                </button>
              </div>

              <aside className="merchant-trust-card">
                <div className="detail-seller-avatar">{product.sellerInitials}</div>
                <div className="detail-seller-info">
                  <div className="detail-seller-name">{product.seller}<Icon name="verified" size={15} /></div>
                  <div className="detail-seller-meta">
                    <span><Icon name="star" size={11} filled /> 4.9</span>
                    <span>·</span>
                    {product.sellerLocation}
                  </div>
                  <span className="detail-seller-online"><span /> Usually responds within an hour</span>
                </div>
                <button
                  type="button"
                  className="detail-visit-shop"
                  onClick={() => setToast(`${product.seller}'s shop is coming soon.`)}
                >
                  Visit shop <span>↗</span>
                </button>
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
                        onClick={() =>
                          setLikedVideos((current) =>
                            liked
                              ? current.filter((item) => item !== index)
                              : [...current, index],
                          )
                        }
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
              {infoTabs.map((tab) => (
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
            <article
              className="detail-tab-content"
              id="detail-tab-panel"
              role="tabpanel"
              aria-labelledby={`detail-tab-${activeTab.toLowerCase()}`}
            >
              {activeTab === "Overview" && (
                <div className="detail-overview-copy">
                  <div>
                    <span className="detail-tab-eyebrow">A little more about it</span>
                    <h2>Made to be part of your story.</h2>
                    <p>{product.description}</p>
                  </div>
                  <ul>
                    <li><Icon name="check" size={16} /> Thoughtfully selected by our creator community</li>
                    <li><Icon name="check" size={16} /> Quality checked before it reaches you</li>
                    <li><Icon name="check" size={16} /> Secure checkout with buyer protection</li>
                  </ul>
                </div>
              )}
              {activeTab === "Specifications" && (
                <div className="detail-spec-list">
                  <div><span>Brand</span><strong>{product.brand}</strong></div>
                  <div><span>Condition</span><strong>{product.condition}</strong></div>
                  <div><span>Category</span><strong>{product.category}</strong></div>
                  <div><span>Available colors</span><strong>{product.colors.join(", ")}</strong></div>
                  {product.sizes.length > 1 && (
                    <div><span>Sizes</span><strong>{product.sizes.join(", ")}</strong></div>
                  )}
                  <div><span>Ships from</span><strong>{product.sellerLocation}</strong></div>
                </div>
              )}
              {activeTab === "Reviews" && (
                <div className="detail-reviews-summary" id="reviews">
                  <div className="detail-review-score">
                    {product.rating}
                    <span>{[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={12} filled />)}</span>
                    <small>Based on {product.reviews} reviews</small>
                  </div>
                  <div className="detail-review-quote">
                    <div>
                      <strong>Looks even better in person</strong>
                      <span>{[0, 1, 2, 3, 4].map((star) => <Icon key={star} name="star" size={11} filled />)} · Recently purchased</span>
                    </div>
                    <p>“Such a lovely find. The details are beautiful and it arrived carefully packed. Would absolutely recommend!”</p>
                    <small>— Alya R. · Bandung</small>
                  </div>
                </div>
              )}
              {activeTab === "Shipping" && (
                <div className="detail-shipping-copy">
                  <span className="detail-shipping-icon"><Icon name="truck" size={22} /></span>
                  <div>
                    <h2>On its way to you, with care.</h2>
                    <p>
                      This item ships from {product.sellerLocation}. Your exact delivery options and
                      cost will be shown at checkout. Every order is covered by SocMark buyer protection.
                    </p>
                    <span>Usually dispatched within 1–2 business days</span>
                  </div>
                </div>
              )}
            </article>
          </section>
        </div>
      </main>

      {offerOpen && (
        <div
          className="detail-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOfferOpen(false);
          }}
        >
          <section className="detail-offer-modal" role="dialog" aria-modal="true" aria-labelledby="offer-title">
            <button
              className="detail-modal-close"
              type="button"
              aria-label="Close offer dialog"
              onClick={() => setOfferOpen(false)}
            >
              <Icon name="close" size={18} />
            </button>
            <span className="detail-offer-icon"><Icon name="tag" size={21} /></span>
            <span className="detail-section-eyebrow">A little room to negotiate</span>
            <h2 id="offer-title">Make an offer</h2>
            <p>Send {product.seller} an offer for <strong>{product.name}</strong>. They’ll get back to you soon.</p>
            <form onSubmit={handleOfferSubmit}>
              <label htmlFor="offer-amount">Your offer</label>
              <div className="detail-offer-input">
                <span>$</span>
                <input
                  id="offer-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max={(selectedPrice - 0.01).toFixed(2)}
                  step="0.01"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(event) => {
                    setOfferAmount(event.target.value);
                    setOfferError("");
                  }}
                  autoFocus
                  required
                />
                <span>USD</span>
              </div>
              {offerError && <p className="detail-offer-error" role="alert">{offerError}</p>}
              <div className="detail-offer-reference">
                Listed price <strong>{formatPrice(selectedPrice)}</strong>
              </div>
              <button type="submit" className="detail-add-cart">Send offer</button>
              <button type="button" className="detail-cancel-offer" onClick={() => setOfferOpen(false)}>
                Maybe later
              </button>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="detail-toast" role="status">
          <span><Icon name="check" size={16} /></span>
          {toast}
        </div>
      )}
      <Footer />
    </div>
  );
}
