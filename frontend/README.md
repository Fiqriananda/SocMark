# SocMark - Frontend (Next.js App Router)

This is the Next.js frontend for **SocMark** (Social Marketplace for Creators and Curators).

## Routes

- **`/` or `/feed`**: Community feed with dynamic category filters, product masonry cards from DummyJSON, modal view, like/save persistence, and interactive comments.
- **`/discover`**: Curated trend lookbooks, stories search by title/tag, topics filter, sorting options, like/dislike reactions, bookmarks, and shoppable feed items.
- **`/profile`**: Creator showcase profile for Johnathan Clein with cover banner, statistics, tabs (Posts, Goals, Community, Courses), and interactive feed cards.
- **`/login`**: Sign-in page with email/password, password visibility toggle, remember-me checkbox, and interactive SVG network diagram panel.
- **`/register`**: Sign-up page with role selection (Buyer, Seller, Creator), bio, avatar upload, and matching network showcase panel.
- **`/admin`**: Administrator user management panel to search, filter by role/status, add, edit, and delete users, copy and regenerate API keys, and review summary statistics.

## Assets

Static images and vector assets are placed in `public/`:
- `public/images/`: `cover.jpg`, `avatar.jpg`, `post-1.jpg`, `post-2.jpg`, `post-3.jpg`, `post-4.jpg`
- `public/avatar.svg` & `public/banner.svg`

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
