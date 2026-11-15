## Summary of Changes

This Pull Request implements **Epic #2: Shoppable Content Feed (Social Commerce Core)** along with the supporting **Products Module** and **Multi-Merchant Cart Service**. It connects content discovery, in-post product tagging, creator sales attribution, and zero-click cart additions to the platform.

---

### Key Features & Architecture

#### 1. Database Schema & Relational Integrity (Prisma & PostgreSQL)
- **`posts` Table**: Master video reels and feed items linked directly to authors in `users` (`posts.user_id -> users.id`), indexed by `userId`, `createdAt DESC`, and `status`. Includes `playbackMetadata` for HLS resolution and aspect ratio specifications.
- **`post_product_tags` Table**: Connects posts to catalog products with pin coordinates (`coordinate_x`, `coordinate_y`), video playback timestamps (`time_start_sec`, `time_end_sec`), and creator attribution (`creator_id -> users.id`).
- **`post_likes` Table**: Composite key `(user_id, post_id)` for tracking user engagement.
- **`feed_attribution_events` Table**: Telemetry tracking conversion funnel events (`TAG_CLICK`, `QUICK_CART_ADD`, `TAG_IMPRESSION`).
- **`cart_items` Table**: Multi-merchant shopping cart with `source_post_id` for tracking creator-driven sales.

#### 2. Shoppable Content & Feed Endpoints
- **`POST /api/v1/posts`**:
  - Role-protected: Only accessible by `CONTENT_CREATOR` and `MERCHANT` roles via `RbacGuard`. Regular users receive `403 Forbidden`.
  - Enforces active status validation on all tagged products prior to post publication.
- **`GET /api/v1/feed`**:
  - Cursor-based pagination (`cursor`, `limit`, `hasMore`) for seamless infinite scrolling.
  - Supports `for_you` (algorithmic discovery) and `following` (chronological feed from followed creators).
  - Contextual authentication via `OptionalAuthGuard` to resolve `userContext.isLiked` and `userContext.isFollowing`.
  - Automatically filters out product tags if the underlying product is inactive or archived.
- **`GET /api/v1/posts/:postId/products/:productId/quick-view`**:
  - Returns real-time SKU variants, pricing, stock levels, and store metadata for the zero-click bottom-sheet modal.
  - Records `TAG_CLICK` conversion telemetry.
- **`POST /api/v1/posts/:id/like`**:
  - Toggles like state and increments/decrements `likes_count`.

#### 3. Multi-Merchant Cart & Attribution
- **`POST /api/v1/cart/items`**:
  - Zero-Click cart addition directly from video post hotspots.
  - Records `sourcePostId` and triggers `QUICK_CART_ADD` telemetry for analytics.
  - Returns updated cart item badge count.
- **`GET /api/v1/cart/items`**:
  - Fetches cart items and aggregate item count for the current buyer.

#### 4. Products Module
- Full catalog management (`POST`, `GET`, `PUT`, `DELETE` on `/api/v1/products`) with merchant ownership protection.

---

### Automated Testing & Quality Checks

- **Unit Tests**:
  - `posts.service.spec.ts`: Tests validation of active products, post creation with tags, cursor feed pagination, and quick-view telemetry.
  - `cart.service.spec.ts`: Tests zero-click cart addition and attribution tracking.
  - `products.service.spec.ts` & `products.controller.spec.ts`: Tests catalog CRUD.
- **E2E Tests**:
  - `test/feed.e2e-spec.ts`: Verifies feed pagination, role protection (401/403), non-existent product 404 handling, and cart endpoints.
  - `test/products.e2e-spec.ts`: Verifies public catalog listing and pagination.

---

### Verification Checklist

- [x] Database migration applied via `prisma db push`
- [x] Authorship foreign key from `posts.user_id` to `users.id`
- [x] Strict role guard (`CONTENT_CREATOR`, `MERCHANT`) on post creation
- [x] Active product validation on in-post product tags
- [x] Cursor pagination on `GET /api/v1/feed`
- [x] `TAG_CLICK` and `QUICK_CART_ADD` telemetry events recorded
- [x] All unit tests passing (`npm test`)
- [x] All E2E integration tests passing (`npm run test:e2e`)
- [x] Clean compilation (`nest build`)
