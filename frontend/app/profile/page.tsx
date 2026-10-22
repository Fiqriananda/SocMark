"use client";

import { useState } from "react";
import Footer from "../components/Footer";

interface ProfilePost {
  id: number;
  title: string;
  timestamp: string;
  excerpt: string;
  image: string;
  alt: string;
  isLocked?: boolean;
  isPremium?: boolean;
  likes: number;
  saved: number;
}

const INITIAL_POSTS: ProfilePost[] = [
  {
    id: 1,
    title: "My new project",
    timestamp: "12:09 PM",
    excerpt: "Soo.. I glad to introduce my new project. The customer is a very famous brand and it's very i...",
    image: "/images/post-1.jpg",
    alt: "Field of bright yellow wild flowers with blurred soft bokeh",
    isLocked: true,
    likes: 23,
    saved: 12,
  },
  {
    id: 2,
    title: "My first photoshoot",
    timestamp: "1 day ago",
    excerpt: "I will always remember the day I created my first photo shoot. I was walking home from college...",
    image: "/images/post-2.jpg",
    alt: "Editorial photoshoot with models in stylish streetwear hoodies",
    isPremium: true,
    likes: 12,
    saved: 4,
  },
  {
    id: 3,
    title: "Editorial for Urban Vibe",
    timestamp: "3 days ago",
    excerpt: "Behind the scenes styling and color grading for our autumn editorial lookbook series...",
    image: "/images/post-3.jpg",
    alt: "Fashion portrait of female model in green outfit and olive jacket",
    isPremium: true,
    likes: 48,
    saved: 19,
  },
  {
    id: 4,
    title: "Rooftop Sunset Session",
    timestamp: "5 days ago",
    excerpt: "Capturing the golden hour reflection on city skyscrapers with high-contrast street style looks...",
    image: "/images/post-4.jpg",
    alt: "Two models posing on sunlit modern rooftop terrace in downtown",
    likes: 64,
    saved: 31,
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [sortBy, setSortBy] = useState("popular");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortedPosts = [...INITIAL_POSTS].sort((a, b) => {
    if (sortBy === "popular" || sortBy === "liked") {
      const aLikes = a.likes + (likedPosts.has(a.id) ? 1 : 0);
      const bLikes = b.likes + (likedPosts.has(b.id) ? 1 : 0);
      return bLikes - aLikes;
    }
    // recent
    return a.id - b.id;
  });

  return (
    <div className="profile-page-body flex-1 flex flex-col">
      <main className="creator-profile-container flex-1">
        {/* Profile Banner & Header Card */}
        <section className="creator-header-section" aria-label="Creator Profile Information">
          {/* Cover Banner */}
          <div className="cover-wrapper">
            <img
              src="/images/cover.jpg"
              alt="Panoramic coastal rock arch over crystal blue sea"
              className="creator-cover-image"
            />
            {/* Creator Avatar overlapping banner */}
            <div className="creator-avatar-container">
              <img
                src="/images/avatar.jpg"
                alt="Portrait of Johnathan Clein"
                className="creator-avatar-img"
              />
            </div>
          </div>

          {/* Creator Details and Metrics Row */}
          <div className="creator-details-row">
            {/* Identity info */}
            <div className="creator-identity">
              <div className="creator-name-row">
                <span className="flame-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#f97316"
                    stroke="#ea580c"
                    strokeWidth="1.2"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                  </svg>
                </span>
                <h1 className="creator-name">Johnathan Clein</h1>
              </div>
              <div className="creator-meta-info">
                <span className="creator-role">Commercial photographer</span>
                <span className="creator-location">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>California, USA</span>
                </span>
              </div>
            </div>

            {/* Stats Card */}
            <aside className="creator-stats-card" aria-label="Creator Statistics">
              <div className="stat-box">
                <div className="stat-icon-wrap" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">3487</span>
                  <span className="stat-label">subscribers</span>
                </div>
              </div>

              <div className="stat-divider" aria-hidden="true" />

              <div className="stat-box">
                <div className="stat-icon-wrap" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">28</span>
                  <span className="stat-label">posts</span>
                </div>
              </div>

              <div className="stat-divider" aria-hidden="true" />

              <div className="stat-box">
                <div className="stat-icon-wrap" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-number">1593</span>
                  <span className="stat-label">likes</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Navigation Tabs & Sort Filter Bar */}
        <nav className="feed-control-bar" aria-label="Profile navigation and filters">
          <div className="tab-pill-group" role="tablist">
            <button
              type="button"
              className={`tab-item ${activeTab === "posts" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "posts"}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              type="button"
              className={`tab-item ${activeTab === "goals" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "goals"}
              onClick={() => setActiveTab("goals")}
            >
              Goals
            </button>
            <div className="tab-vertical-divider" aria-hidden="true" />
            <button
              type="button"
              className={`tab-item with-badge ${activeTab === "community" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "community"}
              onClick={() => setActiveTab("community")}
            >
              <span>Community</span>
              <span className="tab-counter-badge">3</span>
            </button>
            <div className="tab-vertical-divider" aria-hidden="true" />
            <button
              type="button"
              className={`tab-item ${activeTab === "courses" ? "active" : ""}`}
              role="tab"
              aria-selected={activeTab === "courses"}
              onClick={() => setActiveTab("courses")}
            >
              Courses
            </button>
          </div>

          <div className="sort-dropdown-container">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <div className="sort-select-wrapper">
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort posts by"
              >
                <option value="popular">Most popular</option>
                <option value="recent">Most recent</option>
                <option value="liked">Most liked</option>
              </select>
              <span className="sort-dropdown-chevron" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>
        </nav>

        {/* Post Feed Grid */}
        <section className="feed-grid-section" aria-label="Creator posts">
          {sortedPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isSaved = savedPosts.has(post.id);
            const currentLikes = post.likes + (isLiked ? 1 : 0);
            const currentSaved = post.saved + (isSaved ? 1 : 0);

            return (
              <article className="feed-card" id={`post-card-${post.id}`} key={post.id}>
                <div className="card-media-wrapper">
                  <img
                    src={post.image}
                    alt={post.alt}
                    className={`card-image ${post.isLocked ? "blur-locked" : ""}`}
                  />
                  {post.isLocked && (
                    <div className="card-overlay-locked">
                      <button
                        type="button"
                        className="btn-locked-overlay"
                        aria-label="Unlock this post"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Locked</span>
                      </button>
                    </div>
                  )}
                  {post.isPremium && <span className="badge-premium">Premium</span>}
                </div>

                <div className="card-content">
                  <div className="card-header-row">
                    <h2 className="card-title">{post.title}</h2>
                    <time className="card-timestamp">{post.timestamp}</time>
                  </div>
                  <p className="card-excerpt">{post.excerpt}</p>
                  <div className="card-footer-metrics">
                    <button
                      type="button"
                      className={`card-metric-btn like-btn ${isLiked ? "active" : ""}`}
                      onClick={() => toggleLike(post.id)}
                      aria-label={`Like post. Currently ${currentLikes} likes.`}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      <span className="count">{currentLikes}</span>
                      <span className="metric-text">likes</span>
                    </button>
                    <button
                      type="button"
                      className={`card-metric-btn save-btn ${isSaved ? "active" : ""}`}
                      onClick={() => toggleSave(post.id)}
                      aria-label={`Save post. Currently ${currentSaved} saved.`}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                      <span className="count">{currentSaved}</span>
                      <span className="metric-text">saved</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}
