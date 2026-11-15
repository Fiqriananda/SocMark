"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Footer from "../components/Footer";
import { products } from "./[id]/productData";

type SortOrder = "featured" | "price-low" | "price-high" | "rating";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const productEntries = Object.entries(products);
const categories = ["All", ...new Set(productEntries.map(([, product]) => product.category))];

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const sortContainerRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  const activeSortOption = SORT_OPTIONS.find((option) => option.value === sortOrder) ?? SORT_OPTIONS[0];
  const activeSortIndex = SORT_OPTIONS.findIndex((option) => option.value === sortOrder);

  useEffect(() => {
    if (!isSortOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (sortContainerRef.current && !sortContainerRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isSortOpen]);

  function openSortMenu(initialIndex = activeSortIndex >= 0 ? activeSortIndex : 0) {
    setHighlightedIndex(initialIndex);
    setIsSortOpen(true);
  }

  function selectSortOption(value: SortOrder) {
    setSortOrder(value);
    setIsSortOpen(false);
    sortButtonRef.current?.focus();
  }

  function handleSortKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isSortOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSortMenu();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsSortOpen(false);
      sortButtonRef.current?.focus();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % SORT_OPTIONS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(SORT_OPTIONS.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSortOption(SORT_OPTIONS[highlightedIndex].value);
    } else if (event.key === "Tab") {
      setIsSortOpen(false);
    }
  }
  const normalizedSearch = search.trim().toLowerCase();
  const visibleProducts = productEntries
    .filter(([, product]) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const searchableText = `${product.name} ${product.brand} ${product.seller} ${product.category}`;
      return matchesCategory && searchableText.toLowerCase().includes(normalizedSearch);
    })
    .sort(([, first], [, second]) => {
      if (sortOrder === "price-low") return first.price - second.price;
      if (sortOrder === "price-high") return second.price - first.price;
      if (sortOrder === "rating") return second.rating - first.rating;
      return 0;
    });

  return (
    <div className="feed-page-body min-h-screen flex flex-col">
      <main className="all-products-page">
        <header className="all-products-heading">
          <div>
            <span className="all-products-eyebrow">The SocMark edit</span>
            <h1>Shop all products</h1>
            <p>Discover pieces selected by creators and independent shops.</p>
          </div>
          <span className="all-products-count" aria-live="polite">
            {visibleProducts.length} {visibleProducts.length === 1 ? "item" : "items"}
          </span>
        </header>

        <div className="all-products-controls">
          <input
            className="all-products-search"
            type="search"
            placeholder="Search products, brands, or shops"
            aria-label="Search products, brands, or shops"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div
            ref={sortContainerRef}
            className={`all-products-sort-dropdown ${isSortOpen ? "is-open" : ""}`}
            onKeyDown={handleSortKeyDown}
          >
            <button
              ref={sortButtonRef}
              id="all-products-sort"
              type="button"
              className="all-products-sort-trigger"
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              aria-controls="all-products-sort-listbox"
              aria-label={`Sort by: ${activeSortOption.label}`}
              onClick={() => (isSortOpen ? setIsSortOpen(false) : openSortMenu())}
            >
              <span className="all-products-sort-label">Sort by</span>
              <span className="all-products-sort-value">{activeSortOption.label}</span>
              <svg
                className="all-products-sort-chevron"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isSortOpen && (
              <ul
                id="all-products-sort-listbox"
                role="listbox"
                aria-label="Sort products"
                className="all-products-sort-menu"
              >
                {SORT_OPTIONS.map((option, index) => {
                  const isSelected = option.value === sortOrder;
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      className={`all-products-sort-option ${isSelected ? "is-selected" : ""} ${
                        isHighlighted ? "is-highlighted" : ""
                      }`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectSortOption(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg
                          className="all-products-sort-check"
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <nav className="all-products-categories" aria-label="Filter by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`all-products-category ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </nav>

        <section className="all-products-grid" aria-label="All products">
          {visibleProducts.length > 0 ? (
            visibleProducts.map(([id, product]) => (
              <Link className="all-products-card" href={`/products/${id}`} key={id}>
                <Image
                  className="all-products-card-image"
                  src={product.images[0]}
                  alt={product.name}
                  width={800}
                  height={600}
                />
                <div className="all-products-card-copy">
                  <span className="all-products-card-category">{product.category}</span>
                  <h2>{product.name}</h2>
                  <p className="all-products-seller">By {product.seller}</p>
                  <div className="all-products-card-price">
                    <strong>{formatPrice(product.price)}</strong>
                    <del>{formatPrice(product.oldPrice)}</del>
                  </div>
                  <p className="all-products-rating">
                    <span aria-hidden="true">★</span> {product.rating} · {product.reviews} reviews
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="all-products-empty">No products match your search.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}