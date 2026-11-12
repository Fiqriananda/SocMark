"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "../components/Footer";
import { products } from "./[id]/productData";

type SortOrder = "featured" | "price-low" | "price-high" | "rating";

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
          <label className="all-products-sort-control" htmlFor="all-products-sort">
            <span>Sort by</span>
            <select
              id="all-products-sort"
              className="all-products-sort"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
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