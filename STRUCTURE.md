# Struktur rincian untuk `src`

File ini memetakan struktur `src` yang saat ini ada di repo Anda dan menjelaskan per-folder tanggung jawab, file penting, rekomendasi file tambahan, dan tugas/acceptance criteria yang direkomendasikan.

Ringkasan pohon (referensi)

src
├── app
│   ├── api
│   ├── artikel
│   ├── contact
   │   ├── page.tsx (jika ada)
   │   └── route.ts (endpoint terkait contact)
│   ├── custom.css
│   ├── dashboard
│   ├── embla.css
│   ├── globals.css
│   ├── invoices
│   ├── kalkulator
│   ├── layout.tsx
│   ├── leaderboard
│   ├── not-found.tsx
│   ├── order
│   ├── page.tsx
│   ├── price-list
│   ├── privacy-policy
│   ├── signin
│   └── sitemap.xml
├── components
│   ├── Breadcrumbs.tsx
│   ├── home
│   ├── invoice
│   ├── logo
│   ├── LottiePlayerClient.tsx
│   ├── mode-toggle.tsx
│   ├── order
│   ├── panel
│   ├── progress-bar
│   ├── providers
│   ├── sticky-contact.tsx
│   └── ui
├── context
│   ├── logo-context.tsx
│   └── settings-context.tsx
├── data
│   └── lottie
├── hooks
│   ├── use-media-query.ts
│   ├── use-orders.ts
│   ├── use-pusher.ts
│   ├── use-realtime-transactions.ts
│   ├── use-sidebar.ts
│   ├── use-store.ts
│   └── use-user.ts
├── lib
│   ├── api-settings.ts
│   ├── api.ts
│   ├── auth.ts
│   ├── color.ts
│   ├── fetcher.ts
│   ├── menu-list.ts
│   └── utils.ts
└── types
    ├── index.ts
    └── next-auth.d.ts

---

Deskripsi per-folder dan rekomendasi

- `src/app`
  - Fungsi: route-level pages & serverless API (`app router`). Menyimpan layout, global CSS, dan halaman top-level.
  - File penting yang sudah ada: `layout.tsx`, `page.tsx`, `sitemap.xml`, `not-found.tsx`.
  - Rekomendasi struktur per-subfolder:
    - `api/` : tiap route API sebagai `route.ts` (ex: `src/app/api/order/route.ts`, `src/app/api/products/route.ts`). Tambahkan health check: `src/app/api/health/route.ts`.
    - `signin/` : halaman login dan callback; bila pakai NextAuth, tambahkan `route.ts` untuk callback atau gunakan server-side handlers di `lib/auth.ts`.
    - `price-list/` : `page.tsx` untuk daftar, ` [slug]/page.tsx` untuk detail. Gunakan SSG/ISR pattern untuk performa.
    - `order/` & `invoices/` : UI & server endpoints untuk membuat dan menampilkan order/invoice. Tambahkan `src/app/order/cart-client.tsx` (client component) jika memerlukan interaksi client-side.
    - `dashboard/` : admin/admin-lite UI (proteksi role). Jika punya panel admin, buat `src/app/dashboard/(admin)/...` atau `src/app/admin`.

- `src/components`
  - Fungsi: komponen yang bisa dipakai ulang di seluruh aplikasi.
  - Existing: `Breadcrumbs.tsx`, `LottiePlayerClient.tsx`, `mode-toggle.tsx`, `sticky-contact.tsx`.
  - Rekomendasi substruktur dan file yang harus ada:
    - `components/ui/` : atomic/primitive components (Button, Input, Modal, Toggle, Skeleton, Card). Pastikan komponen ini menerima `className` dan `data-testid` untuk test.
    - `components/home/` : hero, slider, promo, kategori card.
    - `components/invoice/` : `InvoiceList`, `InvoiceDetail`, `Countdown` (sudah ada sebagian).
    - `components/panel/` : admin components (Table, Form, Pagination).

- `src/context`
  - Fungsi: React Context untuk global state (logo, settings, user session jika diperlukan).
  - Rekomendasi: tambahkan `UserContext` atau gunakan `next-auth` session via `getServerSession` + provider wrapper. Pastikan `context` ringan dan hanya menangani state UI/global.

- `src/data`
  - Fungsi: static assets / json fixtures (lottie animation assets ada di `lottie`).
  - Rekomendasi: `data/seed/` untuk contoh payload produk selama pengembangan.

- `src/hooks`
  - Fungsi: custom hooks untuk logic yang dipakai berulang (orders, pusher, reactivity, sidebar state).
  - Rekomendasi: dokumentasikan inputs/outputs dan tambahkan tests untuk hooks penting (`use-orders`, `use-user`).

- `src/lib`
  - Fungsi: helper-level logic, fetcher, api-settings, auth helpers.
  - File penting:
    - `fetcher.ts` : standar fetch wrapper (error handling, JSON parsing, auth header). Rekomendasi: gunakan centralized fetcher untuk SWR/React Query.
    - `api.ts` / `api-settings.ts` : base URLs, env-based config
    - `auth.ts` : NextAuth adapter or helpers for session handling
  - Rekomendasi tambahan: `lib/validators.ts` (sanitasi input), `lib/errors.ts` (error types), `lib/logger.ts`.

- `src/types`
  - Fungsi: shared TypeScript types/interfaces (Product, Order, User, Invoice).
  - Rekomendasi: pastikan `types/index.ts` ekspos semua tipe utama, dan `next-auth.d.ts` melengkapi session typings.

Acceptance criteria & tugas yang direkomendasikan per-area (MVP-focused)

- Auth (`src/app/signin`, `src/lib/auth.ts`)
  - Tugas: implement NextAuth (Google/email) atau custom JWT; protect pages like `order`, `invoices`, `dashboard`.
  - AC: user login/logout, `getServerSession`/client session tersedia, protected routes redirect ke `/signin`.

- Price-list & produk (`src/app/price-list`, `src/components/home`)
  - Tugas: list + detail pages, filter sederhana, reuse card component di `components/ui`.
  - AC: daftar produk menampilkan gambar, nama, price; klik membuka detail with add-to-cart button.

- Cart/Order/Invoice (`src/app/order`, `src/app/invoices`, `src/app/api/order/route.ts`)
  - Tugas: client-side cart, server endpoint to create order (mock / real), invoice rendering component.
  - AC: user dapat menambah item ke cart, submit order, melihat invoice halaman.

- API & fetcher (`src/app/api`, `src/lib/fetcher.ts`)
  - Tugas: buat endpoints `order`, `products`, `health` dan central fetcher handling 401, 5xx.
  - AC: API endpoints mengembalikan standar JSON { success: boolean, data, error? } dan fetcher menampilkan error yang dapat dipakai UI.

Checklist file yang direkomendasikan untuk ditambah sekarang

- `/.env.example` (root) — variabel: `NEXTAUTH_URL`, `DATABASE_URL`, `PAYMENT_API_KEY`, `SENTRY_DSN`
- `src/app/api/health/route.ts` — simple GET -> 200 { ok: true }
- `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx` — primitives
- `src/lib/fetcher.ts` (jika belum lengkap) — standar fetch wrapper
- `src/types/index.ts` — pastikan tipe Product/Order/User/Invoice ada

Contoh ringkas `health` route (Next.js app router)
```ts
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true })
}
```

Saran prioritas implementasi (technical backlog)
1. `lib/fetcher.ts` + `src/app/api/health/route.ts` (foundation)
2. Auth (`src/lib/auth.ts` + `src/app/signin`)
3. Price-list (`src/app/price-list`) + UI components (`components/ui`, `components/home`)
4. Cart/order endpoints + invoice rendering
5. Tests & CI

Jika mau, saya bisa langsung:
- generate `STRUCTURE.md` (sudah selesai), lalu:
  - `generate env` — buat `.env.example`
  - `add contributing` — buat `CONTRIBUTING.md` singkat
  - `add ci` — buat `.github/workflows/ci.yml` dasar

Ketik pilihan Anda dan saya lanjutkan.
