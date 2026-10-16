"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Reaction {
  likes: number;
  dislikes: number;
}

interface PostItem {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: Reaction;
  views: number;
  userId: number;
}

const FALLBACK_POSTS: PostItem[] = [
  {
    id: 1,
    title: "His mother had always taught him",
    body: "His mother had always taught him not to ever think of himself as better than others. He'd tried to live by this motto. He never looked down on those who were less fortunate or who had less money than him. But the stupidity of the group of people he was talking to made him change his mind.",
    tags: ["history", "american", "crime"],
    reactions: { likes: 192, dislikes: 25 },
    views: 305,
    userId: 121,
  },
  {
    id: 2,
    title: "He was an expert but not in a discipline",
    body: "He was an expert but not in a discipline that anyone could honor. He couldn't write code or synthesize compounds. Instead, his brilliance was knowing precisely when someone was lying about why they showed up at midnight.",
    tags: ["crime", "mystery", "fiction"],
    reactions: { likes: 340, dislikes: 12 },
    views: 890,
    userId: 45,
  },
  {
    id: 3,
    title: "The light at the end of the tunnel",
    body: "The light at the end of the tunnel was not daylight; it was an oncoming train of opportunities. Or at least, that is what the motivational poster had promised right before everything went pitch black.",
    tags: ["philosophy", "humor", "classic"],
    reactions: { likes: 215, dislikes: 9 },
    views: 620,
    userId: 18,
  },
  {
    id: 4,
    title: "Traveling across the northern ridges",
    body: "The salt air carried whisperings of winter storms approaching the cliffside. Packed with nothing but three film rolls and a battered leather journal, he documented every lighthousekeeper's forgotten story along the Pacific coast.",
    tags: ["travel", "memoir", "history"],
    reactions: { likes: 450, dislikes: 18 },
    views: 1240,
    userId: 94,
  },
  {
    id: 5,
    title: "Architecture of quiet digital spaces",
    body: "We designed interfaces for speed, but what people truly craved was solace. A minimalist grid, gentle typographic pacing, and zero dark patterns can transform software from a chore into a quiet sanctuary.",
    tags: ["design", "technology", "philosophy"],
    reactions: { likes: 512, dislikes: 7 },
    views: 1450,
    userId: 33,
  },
  {
    id: 6,
    title: "One cup of pour-over at 6 AM",
    body: "Steam curled into the cold kitchen air. The grind size wasn't quite right, slightly coarse for a V60, yet the first sip tasted exactly like an autumn morning should: nutty, grounding, and full of quiet ambition.",
    tags: ["lifestyle", "american", "memoir"],
    reactions: { likes: 188, dislikes: 4 },
    views: 430,
    userId: 87,
  },
];

const FEED_PRODUCTS = [
  {
    id: 1,
    title: "Wildflower Masterclass & Presets",
    creator: "Johnathan Clein",
    price: "$24.00",
    image: "/images/post-1.jpg",
    link: "/profile#post-card-1",
    category: "Presets",
  },
  {
    id: 2,
    title: "Streetwear Essential Hoodie",
    creator: "Urban Vibe Studio",
    price: "$45.00",
    image: "/images/post-2.jpg",
    link: "/profile#post-card-2",
    category: "Apparel",
  },
  {
    id: 3,
    title: "Urban Vibe Lookbook & LUTs",
    creator: "Johnathan Clein",
    price: "$19.00",
    image: "/images/post-3.jpg",
    link: "/profile#post-card-3",
    category: "Color Grade",
  },
  {
    id: 4,
    title: "Rooftop Golden Hour Session",
    creator: "Sunset Archive",
    price: "$35.00",
    image: "/images/post-4.jpg",
    link: "/profile#post-card-4",
    category: "Asset Bundle",
  },
];

const LOOKBOOK_COVERS = [
  "/images/post-2.jpg",
  "/images/post-3.jpg",
  "/images/post-4.jpg",
  "/images/post-1.jpg",
  "/images/cover.jpg",
];

const AVATAR_COLORS = [
  "#111827",
  "#1e3a8a",
  "#047857",
  "#c2410c",
  "#4338ca",
  "#6d28d9",
  "#0f766e",
  "#be123c",
];

export default function DiscoverPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sortBy, setSortBy] = useState("likes-desc");
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  // User actions
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userDislikes, setUserDislikes] = useState<Set<number>>(new Set());
  const [userBookmarks, setUserBookmarks] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "info" | "success" }[]>([]);

  const showToast = (message: string, type: "info" | "success" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://dummyjson.com/posts?limit=30");
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || (data.posts || []).length);
    } catch {
      // Fallback
      setPosts(FALLBACK_POSTS);
      setTotal(FALLBACK_POSTS.length);
      setError(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      const matchesTag = activeTag === "all" || post.tags.includes(activeTag);
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTag && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "likes-desc":
          return b.reactions.likes - a.reactions.likes;
        case "views-desc":
          return b.views - a.views;
        case "id-asc":
          return a.id - b.id;
        case "id-desc":
          return b.id - a.id;
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "dislikes-desc":
          return b.reactions.dislikes - a.reactions.dislikes;
        default:
          return 0;
      }
    });

    return result;
  }, [posts, activeTag, searchQuery, sortBy]);

  const handleLike = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    setUserLikes((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        setUserDislikes((d) => {
          const nd = new Set(d);
          nd.delete(postId);
          return nd;
        });
        showToast("Post added to your liked stories", "success");
      }
      return next;
    });
  };

  const handleDislike = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    setUserDislikes((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        setUserLikes((l) => {
          const nl = new Set(l);
          nl.delete(postId);
          return nl;
        });
      }
      return next;
    });
  };

  const handleBookmark = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    setUserBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        showToast("Post removed from saved collection", "info");
      } else {
        next.add(postId);
        showToast("Saved to your personal collection", "success");
      }
      return next;
    });
  };

  const estimateReadTime = (text: string) => {
    const words = (text || "").trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 45));
    return `${minutes} min read`;
  };

  return (
    <div className="profile-page-body discover-page-body min-h-screen flex flex-col">
      <Navbar />

      <main className="discover-container flex-1">
        {/* Hero Section */}
        <section className="discover-hero-section">
          <div className="discover-hero-badge">
            <span className="hero-flame-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#f97316" stroke="#ea580c" strokeWidth="1.2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </span>
            <span>Curated Collections &amp; Lookbooks</span>
          </div>
          <h1 className="discover-hero-title">Curated Collections &amp; Style Trends</h1>
          <p className="discover-hero-subtitle">
            Explore visual trend stories, creative lookbooks, and editorial styling. Shop the exact presets, assets, and apparel linked directly from our creator feed.
          </p>

          {/* Search Box */}
          <div className="discover-search-box">
            <span className="search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              type="text"
              id="discover-search-input"
              placeholder="Search by story title, content, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              aria-label="Search stories"
            />
            {searchQuery && (
              <button
                type="button"
                id="clear-search-btn"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search input"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Metrics Ribbon */}
          <div className="discover-metrics-ribbon">
            <div className="metric-pill">
              <span className="pill-label">Total in Database:</span>
              <strong className="pill-val">{total || "..."}</strong>
            </div>
            <div className="metric-pill">
              <span className="pill-label">Loaded:</span>
              <strong className="pill-val">{filteredPosts.length}</strong>
            </div>
            <div className="metric-pill">
              <span className="pill-label">Active Filter:</span>
              <strong className="pill-val">{activeTag === "all" ? "All Topics" : `#${activeTag}`}</strong>
            </div>
          </div>
        </section>

        {/* Filter & Sort Controls */}
        <section className="discover-controls-bar">
          <div className="discover-tags-wrapper">
            <span className="tags-prefix-label">Topics:</span>
            <div className="discover-tags-list" role="tablist">
              <button
                type="button"
                className={`tag-pill ${activeTag === "all" ? "active" : ""}`}
                onClick={() => setActiveTag("all")}
              >
                All Topics
              </button>
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`tag-pill ${activeTag === tag ? "active" : ""}`}
                  onClick={() => setActiveTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="discover-sort-row">
            <div className="discover-counter">
              <span>Showing {filteredPosts.length} stories</span>
            </div>

            <div className="discover-sort-group">
              <label htmlFor="discover-sort-select" className="sort-label">
                Sort by:
              </label>
              <div className="sort-select-wrapper">
                <select
                  id="discover-sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort discover posts"
                >
                  <option value="likes-desc">Most Popular (Likes)</option>
                  <option value="views-desc">Most Viewed</option>
                  <option value="id-asc">Post ID (Ascending)</option>
                  <option value="id-desc">Post ID (Descending)</option>
                  <option value="title-asc">Title (A - Z)</option>
                  <option value="dislikes-desc">Controversial (Dislikes)</option>
                </select>
                <span className="sort-dropdown-chevron" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feed Posts Grid */}
        <section className="discover-feed-wrapper" aria-label="Discovered posts feed">
          {loading && (
            <div className="feed-grid-section skeleton-grid">
              {[1, 2, 3, 4].map((i) => (
                <div className="feed-card skeleton-card" key={i}>
                  <div className="skeleton-header" />
                  <div className="skeleton-title" />
                  <div className="skeleton-line line-long" />
                  <div className="skeleton-line line-med" />
                  <div className="skeleton-line line-short" />
                  <div className="skeleton-tags" />
                  <div className="skeleton-footer" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="discover-status-state">
              <div className="status-icon-box">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M8 11h6" />
                </svg>
              </div>
              <h3>No matching stories found</h3>
              <p>Try searching for different keywords or select &quot;All Topics&quot;.</p>
              <button
                type="button"
                className="btn-continue btn-narrow"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTag("all");
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {!loading && !error && filteredPosts.length > 0 && (
            <div className="feed-grid-section">
              {filteredPosts.map((post) => {
                const cover = LOOKBOOK_COVERS[Math.abs(post.id % LOOKBOOK_COVERS.length)];
                const avatarBg = AVATAR_COLORS[Math.abs(post.userId % AVATAR_COLORS.length)];
                const isLiked = userLikes.has(post.id);
                const isDisliked = userDislikes.has(post.id);
                const isBookmarked = userBookmarks.has(post.id);
                const likesCount = post.reactions.likes + (isLiked ? 1 : 0);
                const dislikesCount = post.reactions.dislikes + (isDisliked ? 1 : 0);

                return (
                  <article
                    className="feed-card post-card-hover"
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-media-wrapper">
                      <img src={cover} alt={post.title} className="card-image" loading="lazy" />
                      <span className="badge-premium">Lookbook</span>
                    </div>

                    <div className="card-content">
                      <div className="card-header-row" style={{ alignItems: "center", gap: "8px" }}>
                        <div
                          className="author-avatar-badge"
                          style={{
                            backgroundColor: avatarBg,
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                            flexShrink: 0,
                          }}
                        >
                          {`U${(post.userId % 9) + 1}`}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827", display: "block" }}>
                            Creator #{post.userId}
                          </span>
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>
                            {estimateReadTime(post.body)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={`card-metric-btn save-btn ${isBookmarked ? "active" : ""}`}
                          onClick={(e) => handleBookmark(e, post.id)}
                          aria-label="Save post"
                          style={{ padding: "4px 8px" }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={isBookmarked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                        </button>
                      </div>

                      <h2 className="card-title" style={{ marginTop: "10px" }}>{post.title}</h2>
                      <p className="card-excerpt" style={{ lineClamp: 3 }}>
                        {post.body}
                      </p>

                      <div className="card-tags-row" style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "10px 0" }}>
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              backgroundColor: "#f3f4f6",
                              borderRadius: "12px",
                              color: "#4b5563",
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="card-footer-metrics">
                        <button
                          type="button"
                          className={`card-metric-btn like-btn ${isLiked ? "active" : ""}`}
                          onClick={(e) => handleLike(e, post.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={isLiked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                          </svg>
                          <span className="count">{likesCount}</span>
                        </button>

                        <button
                          type="button"
                          className={`card-metric-btn dislike-btn ${isDisliked ? "active" : ""}`}
                          onClick={(e) => handleDislike(e, post.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={isDisliked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                          </svg>
                          <span className="count">{dislikesCount}</span>
                        </button>

                        <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {post.views}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Story Detail Modal */}
      {selectedPost && (
        <div className="discover-modal show" role="dialog" aria-modal="true" style={{ display: "flex" }}>
          <div className="modal-backdrop" onClick={() => setSelectedPost(null)} />
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-author-info">
                <div
                  className="author-avatar-badge"
                  style={{
                    backgroundColor: AVATAR_COLORS[Math.abs(selectedPost.userId % AVATAR_COLORS.length)],
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {`U${(selectedPost.userId % 9) + 1}`}
                </div>
                <div>
                  <div className="modal-author-name">Creator #{selectedPost.userId}</div>
                  <div className="modal-author-meta">Post #{selectedPost.id} • {estimateReadTime(selectedPost.body)}</div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Close modal"
                onClick={() => setSelectedPost(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-lookbook-banner-wrap">
                <img
                  src={LOOKBOOK_COVERS[Math.abs(selectedPost.id % LOOKBOOK_COVERS.length)]}
                  alt={selectedPost.title}
                  className="modal-cover-img"
                />
                <span className="badge-premium">Curated Trend Lookbook</span>
              </div>

              <div className="modal-tags-row" style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "14px 0" }}>
                {selectedPost.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "12px",
                      padding: "3px 10px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "14px",
                      color: "#374151",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <h2 className="modal-title">{selectedPost.title}</h2>
              <div className="modal-story-subtitle">Curated Style Narrative &amp; Creative Direction</div>
              <div className="modal-content-text">{selectedPost.body}</div>

              {/* Shoppable Items from Feed */}
              <section className="modal-products-section" aria-label="Shoppable items in this collection">
                <div className="modal-section-header">
                  <div className="modal-section-title-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <h3>Shop Featured Items from Feed</h3>
                  </div>
                  <span className="modal-products-hint">Linked directly to creator posts</span>
                </div>
                <div className="modal-products-grid">
                  {[FEED_PRODUCTS[Math.abs(selectedPost.id % FEED_PRODUCTS.length)], FEED_PRODUCTS[(Math.abs(selectedPost.id % FEED_PRODUCTS.length) + 1) % FEED_PRODUCTS.length]].map((item) => (
                    <a
                      href={item.link}
                      key={item.id}
                      className="modal-product-card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        textDecoration: "none",
                        color: "inherit",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>{item.creator} • {item.category}</div>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#059669" }}>{item.price}</span>
                    </a>
                  ))}
                </div>
              </section>

              {/* Metrics Card */}
              <div className="modal-metrics-card">
                <div className="modal-metric-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>{selectedPost.reactions.likes + (userLikes.has(selectedPost.id) ? 1 : 0)}</span>
                  <span className="subtext">Likes</span>
                </div>
                <div className="modal-metric-divider" />
                <div className="modal-metric-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                  </svg>
                  <span>{selectedPost.reactions.dislikes + (userDislikes.has(selectedPost.id) ? 1 : 0)}</span>
                  <span className="subtext">Dislikes</span>
                </div>
                <div className="modal-metric-divider" />
                <div className="modal-metric-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{selectedPost.views}</span>
                  <span className="subtext">Views</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-action-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast("Story link copied to clipboard!", "success");
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                <span>Share Story</span>
              </button>
              <button
                type="button"
                className="btn-continue btn-modal-done"
                onClick={() => setSelectedPost(null)}
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Floating Container */}
      <div id="toast-container" className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type} show`}>
            <span className="toast-icon">
              {toast.type === "success" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </span>
            <span className="toast-text">{toast.message}</span>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
