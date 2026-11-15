# SocMark — Frontend (Next.js App Router)

Frontend aplikasi **SocMark** (*Social Marketplace for Creators and Curators*) yang dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

---

## 1. Setup Frontend

### Prasyarat
- **Node.js** v20+
- **npm** (atau package manager kompatibel)

### Langkah Instalasi & Menjalankan
1. Masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Siapkan environment variable di file `.env`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```
   > Jika `NEXT_PUBLIC_API_URL` dikosongkan, `HAS_API` di `app/lib/api.ts` akan bernilai `false` dan aplikasi berjalan dalam mode demo.
4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

### Script Lainnya
- `npm run build` — Build aplikasi untuk production.
- `npm run start` — Menjalankan hasil build production.
- `npm run lint` — Menjalankan ESLint.

---

## 2. Hirarki Folder

```text
frontend/
├── .env                          # Konfigurasi environment (NEXT_PUBLIC_API_URL)
├── next.config.ts                # Konfigurasi Next.js (remotePatterns Unsplash, Turbopack, cacheComponents)
├── package.json                  # Dependencies & scripts
├── postcss.config.mjs            # Konfigurasi PostCSS untuk Tailwind CSS v4
├── eslint.config.mjs             # Konfigurasi ESLint
├── tsconfig.json                 # Konfigurasi TypeScript
├── public/                       # Aset statis (SVG & gambar lokal)
│   ├── avatar.svg
│   ├── banner.svg
│   └── images/
│       ├── avatar.jpg
│       ├── cover.jpg
│       └── post-1.jpg .. post-4.jpg
└── app/                          # Next.js App Router
    ├── layout.tsx                # Root layout
    ├── page.tsx                  # Landing / root page (mengarah ke feed)
    ├── globals.css               # Global styles & Tailwind entry
    ├── navbar.css                # Styling navbar
    ├── socmark.css               # Styling tema utama SocMark
    ├── admin/                    # Modul Admin Panel
    │   └── page.tsx
    ├── cart/                     # Modul Keranjang Belanja
    │   └── page.tsx
    ├── chat/                     # Modul Chat / Negosiasi Buyer-Seller
    │   ├── ChatIcons.tsx
    │   ├── mockData.ts
    │   └── page.tsx
    ├── checkout/                 # Modul Checkout & Pembayaran Escrow
    │   ├── checkout.css
    │   └── page.tsx
    ├── discover/                 # Modul Discover & Lookbooks
    │   └── page.tsx
    ├── feed/                     # Modul Community Feed
    │   └── page.tsx
    ├── forgot-password/          # Modul Lupa Password
    │   └── page.tsx
    ├── login/                    # Modul Login
    │   └── page.tsx
    ├── orders/                   # Modul Riwayat Pesanan & Escrow Tracking
    │   ├── orders.css
    │   └── page.tsx
    ├── products/
    │   └── [id]/                 # Modul Detail Produk (Dynamic Route)
    │       ├── ProductDetailIcons.tsx
    │       ├── page.tsx
    │       ├── productData.ts
    │       └── productTypes.ts
    ├── profile/                  # Modul Profil Kreator
    │   └── page.tsx
    ├── register/                 # Modul Registrasi Pengguna
    │   └── page.tsx
    ├── reset-password/           # Modul Reset Password
    │   └── page.tsx
    ├── components/               # Shared UI Components
    │   ├── AlertBanner.tsx
    │   ├── AuthShowcase.tsx
    │   ├── FeedView.tsx
    │   ├── Footer.tsx
    │   ├── Navbar.tsx
    │   └── layout/               # Komponen Shell & Navigasi Global
    │       ├── AppShell.tsx
    │       ├── GlobalNavbar.tsx
    │       ├── GlobalSearchInput.tsx
    │       ├── MobileBottomDock.tsx
    │       ├── MobileTopBar.tsx
    │       ├── NavActionBadges.tsx
    │       └── RoleSwitcherDropdown.tsx
    ├── context/                  # React Context (Global State)
    │   ├── AuthContext.tsx
    │   ├── CartContext.tsx
    │   ├── NotificationContext.tsx
    │   └── Providers.tsx
    └── lib/                      # Utilities, Session & API Client
        ├── api.ts
        ├── navigation.ts
        ├── roles.ts
        ├── session.ts
        └── useDismiss.ts
```

---

## 3. Modul yang Ada

### A. Halaman / Route (`app/`)
| Route | Deskripsi |
| :--- | :--- |
| `/` & `/feed` | Community feed dengan filter kategori, masonry card produk, modal detail, like/save, dan komentar interaktif. |
| `/discover` | Kurasi lookbook & story kreator, pencarian judul/tag, filter topik, sorting, reaksi like/dislike, bookmark, serta item shoppable. |
| `/products/[id]` | Halaman detail produk dinamis (galeri foto, varian, info penjual, ulasan, dan tombol tambah ke keranjang/checkout). |
| `/cart` | Halaman keranjang belanja untuk mengatur kuantitas dan item yang akan di-checkout. |
| `/checkout` | Alur checkout pesanan dengan proteksi pembayaran escrow. |
| `/orders` | Pelacakan status pesanan (*Pending Payment*, *In Escrow / Processing*, *Shipped*, *Completed*, *Disputed*), timeline kurir, konfirmasi pelepasan dana escrow, dan pengajuan dispute. |
| `/chat` | Fitur pesan antara pembeli dan penjual lengkap dengan kartu konteks produk. |
| `/profile` | Halaman profil kreator dengan cover banner, statistik, dan tab konten (*Posts*, *Goals*, *Community*, *Courses*). |
| `/login` & `/register` | Halaman autentikasi (login dengan opsi *remember me*, registrasi dengan pilihan role Buyer/Seller/Creator). |
| `/forgot-password` & `/reset-password` | Alur pemulihan dan pengaturan ulang kata sandi. |
| `/admin` | Panel admin untuk manajemen user (cari, filter role/status, tambah/edit/hapus user), pengelolaan API key, dan ringkasan statistik. |

### B. Core Modules (`context/`, `components/layout/`, `lib/`)
- **Global Context (`app/context/`)**:
  - `AuthContext.tsx` — Manajemen status login, user session, dan active role.
  - `CartContext.tsx` — State keranjang belanja dan jumlah item.
  - `NotificationContext.tsx` — State notifikasi badge & pesan.
  - `Providers.tsx` — Wrapper seluruh context provider untuk root aplikasi.
- **Layout Shell (`app/components/layout/`)**:
  - `AppShell.tsx`, `GlobalNavbar.tsx`, `MobileTopBar.tsx`, `MobileBottomDock.tsx`, `GlobalSearchInput.tsx`, `NavActionBadges.tsx`, `RoleSwitcherDropdown.tsx`.
- **API & Session (`app/lib/`)**:
  - `api.ts` — Wrapper `apiFetch` & `apiPost` dengan injeksi otomatis `Authorization: Bearer <jwt>` dan header `X-Active-Role`.
  - `session.ts`, `roles.ts`, `navigation.ts`, `useDismiss.ts`.

---

## 4. Dummy API & Mock Data yang Dipakai

Beberapa modul sudah mengambil data dari public dummy API, sedangkan modul lainnya masih menggunakan in-memory mock data:

| Sumber / Layanan | Link Endpoint / URL | Dipakai di Modul |
| :--- | :--- | :--- |
| **DummyJSON — Products** | https://dummyjson.com/products?limit=50 | `app/components/FeedView.tsx` (daftar produk pada `/feed` & `/`) |
| **DummyJSON — Posts** | https://dummyjson.com/posts?limit=30 | `app/discover/page.tsx` (daftar story/post pada `/discover`) |
| **Pravatar — Avatar Placeholder** | https://i.pravatar.cc/40?img=1 (variasi parameter `img`) | `app/components/FeedView.tsx` (avatar kreator & komentar) |
| **Unsplash — Gambar Produk & Chat** | https://images.unsplash.com/ | `app/products/[id]/productData.ts`, `app/chat/mockData.ts`, `app/chat/page.tsx` (dikonfigurasi di `next.config.ts`) |
| **In-Memory Mock Data (Lokal)** | — | `app/orders/page.tsx` (`INITIAL_ORDERS`), `app/chat/mockData.ts`, `app/products/[id]/productData.ts` |
