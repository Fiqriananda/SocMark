"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
}

const USERS: UserProfile[] = [
  { name: "Rina Maharani", handle: "@rina_m", avatar: "https://i.pravatar.cc/40?img=1" },
  { name: "Bagas Pratama", handle: "@bagas.prtm", avatar: "https://i.pravatar.cc/40?img=3" },
  { name: "Siti Nurhaliza", handle: "@siti_nur", avatar: "https://i.pravatar.cc/40?img=5" },
  { name: "Dika Ramadhan", handle: "@dika.r", avatar: "https://i.pravatar.cc/40?img=7" },
  { name: "Lina Wati", handle: "@linawati", avatar: "https://i.pravatar.cc/40?img=9" },
  { name: "Andi Setiawan", handle: "@andi_s", avatar: "https://i.pravatar.cc/40?img=11" },
  { name: "Mega Puspita", handle: "@megaaa", avatar: "https://i.pravatar.cc/40?img=13" },
  { name: "Yoga Pratama", handle: "@yogap", avatar: "https://i.pravatar.cc/40?img=15" },
];

const SEED_COMMENTS = [
  { name: "Rina Maharani", avatar: "https://i.pravatar.cc/40?img=1", texts: ["Wah bagus banget! 😍", "Boleh minta info lebih?", "Keren sih ini", "Udah lama nyari yang kayak gini!"] },
  { name: "Bagas Pratama", avatar: "https://i.pravatar.cc/40?img=3", texts: ["Masih ada stok nggak?", "Harga terjangkau banget 👍", "Mantaap!"] },
  { name: "Siti Nurhaliza", avatar: "https://i.pravatar.cc/40?img=5", texts: ["Bisa dikirim ke luar kota?", "Materialnya gimana kak?", "Suka banget estetiknya ✨"] },
  { name: "Dika Ramadhan", avatar: "https://i.pravatar.cc/40?img=7", texts: ["Sudah order belum?", "Recommended banget!", "Kalau mau order chat dulu ya"] },
  { name: "Mega Puspita", avatar: "https://i.pravatar.cc/40?img=13", texts: ["Auto kepengen 😭", "Kualitasnya bagus nggak ya?", "Posting lagi dong kak!"] },
];

const SEED_AGOS = ["2 mnt lalu", "5 mnt lalu", "14 mnt lalu", "1 jam lalu", "3 jam lalu", "8 jam lalu"];

function formatCategory(cat: string) {
  return cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function timeAgo(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return "baru saja";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

interface ProductPost {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  _user: UserProfile;
  _likeBase: number;
  _commentSeed: number;
  _postedMs: number;
}

interface CommentItem {
  name: string;
  avatar: string;
  text: string;
  ago: string;
}

export default function FeedView() {
  const [posts, setPosts] = useState<ProductPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<number, CommentItem[]>>({});

  const [modalPost, setModalPost] = useState<ProductPost | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Load persistence
  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem("socmark_liked");
      if (storedLikes) setLikedIds(new Set(JSON.parse(storedLikes)));

      const storedSaved = localStorage.getItem("socmark_saved");
      if (storedSaved) setSavedIds(new Set(JSON.parse(storedSaved)));

      const storedComments = localStorage.getItem("socmark_comments");
      if (storedComments) setCommentsMap(JSON.parse(storedComments));
    } catch {
      // ignore
    }
  }, []);

  const persistData = (
    likes: Set<number>,
    saved: Set<number>,
    comments: Record<number, CommentItem[]>
  ) => {
    try {
      localStorage.setItem("socmark_liked", JSON.stringify(Array.from(likes)));
      localStorage.setItem("socmark_saved", JSON.stringify(Array.from(saved)));
      localStorage.setItem("socmark_comments", JSON.stringify(comments));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("https://dummyjson.com/products?limit=50");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const built: ProductPost[] = (data.products || []).map(
          (p: any, index: number) => {
            const user = USERS[index % USERS.length];
            const likeBase = Math.round(p.rating * 40 + index * 7);
            const commentSeed = Math.round(p.stock / 3 + index * 2);
            const postedMs = Date.now() - (index * 2.7 + 2) * 3600000;
            return {
              ...p,
              _user: user,
              _likeBase: likeBase,
              _commentSeed: commentSeed,
              _postedMs: postedMs,
            };
          }
        );
        setPosts(built);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map((p) => p.category))).sort();
    return ["all", ...cats];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistData(next, savedIds, commentsMap);
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistData(likedIds, next, commentsMap);
      return next;
    });
  };

  const handleOpenModal = (post: ProductPost, focusComment = false) => {
    setModalPost(post);
    setModalImageIndex(0);
    if (focusComment) {
      setTimeout(() => commentInputRef.current?.focus(), 150);
    }
  };

  const handleAddComment = () => {
    if (!modalPost || !newCommentText.trim()) return;
    const newComment: CommentItem = {
      name: "Kamu",
      avatar: "https://i.pravatar.cc/40?img=33",
      text: newCommentText.trim(),
      ago: "baru saja",
    };

    setCommentsMap((prev) => {
      const list = prev[modalPost.id] || [];
      const updated = {
        ...prev,
        [modalPost.id]: [...list, newComment],
      };
      persistData(likedIds, savedIds, updated);
      return updated;
    });

    setNewCommentText("");
  };

  const getSeedComments = (post: ProductPost) => {
    const count = Math.min(post._commentSeed, 6);
    const results: CommentItem[] = [];
    for (let i = 0; i < count; i++) {
      const u = SEED_COMMENTS[i % SEED_COMMENTS.length];
      const text = u.texts[(post.id + i) % u.texts.length];
      results.push({
        name: u.name,
        avatar: u.avatar,
        text,
        ago: SEED_AGOS[i % SEED_AGOS.length],
      });
    }
    return results;
  };

  return (
    <div className="feed-page-body min-h-screen flex flex-col">
      <Navbar />

      <main className="product-page flex-1">
        <div className="product-page-heading">
          <div className="feed-header-badge">
            <span className="feed-badge-pulse" aria-hidden="true" />
            <span>Komunitas &amp; Tren Terkini</span>
          </div>
          <h1>Explore Community Feed</h1>
          <p className="feed-page-subtitle">
            Temukan inspirasi produk pilihan, koleksi kurasi, dan interaksi
            langsung dengan kreator di SocMark.
          </p>
        </div>

        {/* Filter Pill Bar */}
        <div className="feed-filter-bar" role="tablist" aria-label="Filter kategori">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`feed-filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
            >
              {cat === "all" ? "Semua" : formatCategory(cat)}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <section id="product-container" className="product-container" aria-live="polite">
          {loading && <p className="product-state">Memuat posting…</p>}
          {error && (
            <p className="product-state product-error">
              Gagal memuat posting. Periksa koneksi lalu muat ulang.
            </p>
          )}
          {!loading && !error && filteredPosts.length === 0 && (
            <p className="product-state">Tidak ada posting di kategori ini.</p>
          )}

          {!loading &&
            !error &&
            filteredPosts.map((post) => {
              const isLiked = likedIds.has(post.id);
              const isSaved = savedIds.has(post.id);
              const likesCount = post._likeBase + (isLiked ? 1 : 0);
              const commentsCount =
                (commentsMap[post.id] || []).length + post._commentSeed;
              const imageSrc = post.images?.[0] || post.thumbnail || "";
              const ago = timeAgo(Date.now() - post._postedMs);

              return (
                <article
                  key={post.id}
                  className="product-card"
                  tabIndex={0}
                  role="button"
                  onClick={() => handleOpenModal(post)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenModal(post);
                    }
                  }}
                >
                  <div className="product-visual">
                    <img
                      className="product-image"
                      src={imageSrc}
                      alt={post.title}
                      loading="lazy"
                    />

                    {/* Category pill top-left */}
                    <span className="product-category-pill">
                      {formatCategory(post.category)}
                    </span>

                    {/* Save button top-right */}
                    <button
                      type="button"
                      className={`product-save-btn ${isSaved ? "saved" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(post.id);
                      }}
                      aria-label={isSaved ? "Hapus simpanan" : "Simpan posting"}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card footer: poster info + actions */}
                  <div className="post-card-footer">
                    <div className="post-poster-row">
                      <img
                        className="post-avatar"
                        src={post._user.avatar}
                        alt={post._user.name}
                        loading="lazy"
                      />
                      <div className="post-poster-info">
                        <span className="post-poster-name">
                          {post._user.name}
                        </span>
                        <span className="post-poster-meta">
                          {post._user.handle} · {ago}
                        </span>
                      </div>
                    </div>
                    <p className="post-card-title">{post.title}</p>
                    <div className="post-card-actions">
                      <button
                        type="button"
                        className={`post-action-btn like-btn ${isLiked ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post.id);
                        }}
                        aria-label="Suka"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="like-count">{likesCount}</span>
                      </button>
                      <button
                        type="button"
                        className="post-action-btn comment-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(post, true);
                        }}
                        aria-label="Komentar"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>{commentsCount}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
        </section>
      </main>

      {/* Post Detail Modal */}
      {modalPost && (
        <div
          className="product-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Detail posting"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalPost(null);
          }}
        >
          <div className="product-modal-card">
            <button
              type="button"
              className="product-modal-close"
              onClick={() => setModalPost(null)}
              aria-label="Tutup detail posting"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="product-modal-inner">
              {/* Gallery Side */}
              <div className="modal-gallery">
                <img
                  className="modal-main-img"
                  src={modalPost.images?.[modalImageIndex] || modalPost.thumbnail}
                  alt={modalPost.title}
                />
                {modalPost.images && modalPost.images.length > 1 && (
                  <div className="modal-thumbs">
                    {modalPost.images.slice(0, 5).map((img, i) => (
                      <img
                        key={i}
                        className={`modal-thumb ${i === modalImageIndex ? "active" : ""}`}
                        src={img}
                        alt={`${modalPost.title} ${i + 1}`}
                        onClick={() => setModalImageIndex(i)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setModalImageIndex(i);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info / Comment Side */}
              <div className="modal-info">
                {/* Poster */}
                <div className="modal-poster-row">
                  <img
                    className="modal-poster-avatar"
                    src={modalPost._user.avatar}
                    alt={modalPost._user.name}
                  />
                  <div>
                    <p className="modal-poster-name">{modalPost._user.name}</p>
                    <p className="modal-poster-meta">
                      {modalPost._user.handle} ·{" "}
                      {timeAgo(Date.now() - modalPost._postedMs)}
                    </p>
                  </div>
                  <div className="modal-meta-right">
                    <span className="modal-category-pill">
                      {formatCategory(modalPost.category)}
                    </span>
                    <button
                      type="button"
                      className={`modal-save-btn ${savedIds.has(modalPost.id) ? "saved" : ""}`}
                      onClick={() => toggleSave(modalPost.id)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={savedIds.has(modalPost.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        width="15"
                        height="15"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {savedIds.has(modalPost.id) ? "Tersimpan" : "Simpan"}
                    </button>
                  </div>
                </div>

                <h2 className="modal-title">{modalPost.title}</h2>
                <p className="modal-desc">{modalPost.description}</p>

                {/* Like row */}
                <div className="modal-like-row">
                  <button
                    type="button"
                    className={`modal-like-btn ${likedIds.has(modalPost.id) ? "active" : ""}`}
                    onClick={() => toggleLike(modalPost.id)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill={likedIds.has(modalPost.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="modal-like-count">
                      {modalPost._likeBase + (likedIds.has(modalPost.id) ? 1 : 0)} suka
                    </span>
                  </button>
                  <span className="modal-comment-stat">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {[...getSeedComments(modalPost), ...(commentsMap[modalPost.id] || [])].length} komentar
                  </span>
                </div>

                {/* Comments List */}
                <div className="modal-comments-section">
                  <p className="modal-comments-label">Komentar</p>
                  <div className="modal-comments-list">
                    {[...getSeedComments(modalPost), ...(commentsMap[modalPost.id] || [])].map((c, idx) => (
                      <div className="modal-comment-item" key={idx}>
                        <img className="modal-comment-avatar" src={c.avatar} alt={c.name} />
                        <div className="modal-comment-body">
                          <span className="modal-comment-name">{c.name}</span>
                          <span className="modal-comment-ago">{c.ago}</span>
                          <p className="modal-comment-text">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input comment */}
                  <div className="modal-comment-input-row">
                    <img
                      className="modal-comment-avatar"
                      src="https://i.pravatar.cc/40?img=33"
                      alt="Kamu"
                    />
                    <div className="modal-comment-input-wrap">
                      <input
                        ref={commentInputRef}
                        type="text"
                        className="modal-comment-input"
                        placeholder="Tulis komentar…"
                        maxLength={280}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment();
                        }}
                        aria-label="Tulis komentar"
                      />
                      <button
                        type="button"
                        className="modal-comment-send"
                        onClick={handleAddComment}
                        aria-label="Kirim komentar"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
