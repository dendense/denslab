# denslab — Aturan Teknis & Arsitektur

Dokumentasi teknis proyek **denslab**: laboratorium personal untuk gambar
AI-generated dan fotografi konseptual.

> Untuk status pekerjaan terkini dan riwayat pengembangan, lihat
> [`progress.md`](./progress.md).

## 1. Identitas Proyek

- **Nama:** denslab
- **Konsep:** Portfolio & laboratorium untuk gambar AI-generated dan fotografi
  konseptual, dengan prompt atau pengaturan kamera di balik setiap karya.
- **Bahasa kode:** Inggris (kode, komentar, nama variabel, pesan commit).

## 2. Tech Stack

| Lapisan | Teknologi | Versi |
|---|---|---|
| Framework | Next.js App Router + Turbopack | 16.3.6 |
| UI | React + shadcn/ui (primitif di `components/ui/`) | 19.2.8 |
| Styling | Tailwind CSS | v4 |
| Animasi | Framer Motion + `tailwindcss-animate` | 13.x |
| Ikon | Lucide React | 1.x |
| Database & Auth | Supabase (PostgreSQL + GoTrue) | supabase-js 2.x |
| Hosting gambar | Imgur (`i.imgur.com`) | — |
| Deployment | Vercel | — |

**Catatan versi:** Next 16 menggantikan `middleware` dengan `proxy.ts`, dan
`revalidateTag(tag)` satu argumen sudah deprecated — gunakan
`revalidateTag(tag, "max")`.

## 3. Desain: shadcn/ui + Palet Premium

Gaya visual = **default shadcn/ui mentah** di atas palet premium denslab. Tidak ada
utility desain kustom: seluruh styling memakai kelas Tailwind bawaan dan token
shadcn di `app/globals.css`. Komponen primitif ada di `components/ui/`.

### Token warna

| Token | Light | Dark | Peran |
|---|---|---|---|
| `--background` | `#fafafa` | `#09090b` | Latar halaman |
| `--card` | `#ffffff` | `#18181b` | Surface kartu/panel |
| `--foreground` | `#09090b` | `#fafafa` | Teks utama |
| `--primary` | `#2563eb` | **`#3b82f6`** | Aksi utama — biru merek denslab |
| `--primary-foreground` | `#ffffff` | `#0b1220` | Teks di atas `--primary` |
| `--secondary` | `#f4f4f5` | `#27272a` | Surface sekunder |
| `--muted` | `#f4f4f5` | `#27272a` | Surface redup (placeholder, skeleton) |
| `--muted-foreground` | `#52525b` | `#a1a1aa` | Teks redup |
| `--accent` | `#f4f4f5` | `#27272a` | **Netral abu**, bukan biru — hover/focus surface |
| `--border` | `#e4e4e7` | `#27272a` | Garis border |
| `--input` | `#e4e4e7` | `#27272a` | Border input |
| `--ring` | `#2563eb` | `#3b82f6` | Cincin focus |
| `--destructive` | `#dc2626` | `#ef4444` | Aksi merusak |
| `--radius` | `0.75rem` | `0.75rem` | Radius sudut, sama di dua mode |

`--accent` sengaja **netral**, bukan biru: ia dipakai sebagai surface hover/focus
(`hover:bg-accent`, `focus:bg-accent`), sehingga tidak boleh bersaing dengan
`--primary` yang menandai aksi utama.

Token ditulis dalam **HEX**, bukan OKLCH bawaan shadcn, agar palet premium tetap
jadi satu-satunya sumber kebenaran. `--primary-foreground` dark (`#0b1220`) dan
light (`#ffffff`) juga nilai denslab sendiri, bukan nilai referensi shadcn.

Wrapper Obsidian (`--obsidian-discover-*`) masih ada di `app/globals.css` untuk
kompatibilitas `components/block/discover-button.css`. Jangan dibuang tanpa
memindahkan komponennya.

### Aturan styling

| Kebutuhan | Cara sekarang (bawaan Tailwind/shadcn) |
|---|---|
| Border | **1px** Tailwind default — `border`, `border-b`, `border-t`, `border-l` |
| Radius | `rounded-sm` / `rounded-md` / `rounded-lg` / `rounded-xl` → turunan `--radius` |
| Elevasi | `shadow-sm` / `shadow` / `shadow-md` / `shadow-lg` (blur lembut) |
| Hover/active | `hover:bg-accent/50`, `focus:bg-accent`, `transition-colors` |
| Loading | `animate-pulse bg-muted` |
| Gambar tidak tersedia | `bg-muted` |
| Aksen hover pada border | `hover:border-primary` / `hover:border-accent` |
| Focus | `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` |

Radius turunan didefinisikan di `app/globals.css`:
`--radius-sm: calc(var(--radius) - 4px)`, `--radius-md: calc(var(--radius) - 2px)`,
`--radius-lg: var(--radius)`, `--radius-xl: calc(var(--radius) + 4px)`.

### Tipografi

- Body/display: **stack font sistem** dari Tailwind v4 — `-apple-system`,
  `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, dll. `app/layout.tsx` **tidak**
  memuat `next/font` apa pun.
- Mono: `font-mono` bawaan Tailwind (`ui-monospace, SFMono-Regular, Menlo, ...`).
  Pakai **hanya** untuk teks semantik mono: prompt, metadata, dan `<code>`.
- Heading memakai `font-semibold` + **`tracking-tight`**. Tidak ada `tracking-wide`.
- Tidak ada kelas `font-display` dan tidak ada webfont kustom.

### Tema

- Dikendalikan atribut `data-theme` di `<html>`, bukan `prefers-color-scheme`
- Script anti-flash membaca `localStorage` (`denslab-theme`) sebelum paint
- Pilihan tema bertahan antar kunjungan

## 4. Struktur Proyek

### Route

| Route | Rendering | Akses |
|---|---|---|
| `/` | Dynamic | Publik — galeri + pencarian + pagination |
| `/about` | Static | Publik |
| `/categories` | Static | Publik — pemilih kategori |
| `/categories/[category]` | SSG | Publik — filter kategori + pencarian |
| `/photo/[id]` | Dynamic | Publik — detail, metadata gated |
| `/login` | Dynamic | Publik — login Google |
| `/bookmarks` | Dynamic | Wajib login |
| `/settings` | Dynamic | Wajib login |
| `/admin` | Dynamic | Wajib role admin |
| `/api/admin/post/[id]` | Dynamic | Wajib admin |
| `/auth/callback` | Dynamic | OAuth Google (PKCE) |
| `/auth/signout` | Dynamic | POST saja |

### Lapisan data

| File | Peran |
|---|---|
| `lib/posts.ts` | Tipe, helper URL Imgur, data contoh, slug kategori |
| `lib/posts-repository.ts` | Satu-satunya jalur baca data post |
| `lib/bookmarks.ts` | Baca/tulis bookmark |
| `lib/imgur-check.ts` | Pemeriksaan ketersediaan gambar di server |
| `lib/auth/viewer.ts` | Pembaca role dari tabel `profiles` |
| `lib/supabase/public.ts` | Klien anon tanpa cookie, untuk query ter-cache |
| `lib/supabase/server.ts` | Klien berbasis cookie, untuk baca sesi |
| `lib/supabase/client.ts` | Klien browser |

Operasi tulis admin ada di `app/admin/actions.ts` (Server Actions), dan
pemrosesan form di `app/admin/form-utils.ts`.

## 5. Model Data

### Kategori

Hanya dua: `"AI Generated"` dan `"Photoshoot"`.
Slug: `ai-generated`, `photoshoot`.

Kategori `Photoshoot` adalah foto yang diambil dengan kamera mirrorless, bukan
dihasilkan model AI. Karena itu ia punya bentuk metadata yang berbeda.

### Discriminated union

`Post` adalah union pada field `category`, sehingga TypeScript menolak membaca
`metadata` dari post Photoshoot dan sebaliknya:

```ts
type AiPost    = PostBase & { category: "AI Generated"; metadata: AiMetadata };
type PhotoPost = PostBase & { category: "Photoshoot";   photoMetadata: PhotoMetadata };
```

| `AiMetadata` | `PhotoMetadata` |
|---|---|
| `prompt` | `body` |
| `negativePrompt` | `lens` |
| `model` | `aperture` (string, mis. `f/1.8`) |
| `platform` | `shutterSpeed` (string, mis. `1/250s`) |
| `seed` (number) | `iso` (number) |

`aperture` dan `shutterSpeed` disimpan sebagai **string** karena nilainya dibaca
apa adanya, bukan dihitung.

`orientation` (`landscape` / `portrait` / `square`) **dihitung** dari
`width`/`height`, bukan input manual.

### Skema database

Lihat `supabase/schema.sql`, `supabase/bookmarks.sql`, dan `supabase/seed.sql`.

Poin penting:
- Tabel `posts` punya **CHECK constraint** yang menegakkan aturan union di level
  database: kategori `AI Generated` wajib punya `metadata` dan `photo_metadata`
  kosong, dan sebaliknya.
- Tabel `profiles` menyimpan `role` (`user` / `admin`), dibuat otomatis lewat
  trigger saat pengguna baru mendaftar.
- RLS: siapa pun boleh membaca post; hanya admin boleh insert/update/delete.
- Bookmark memakai composite primary key `(user_id, post_id)`, sehingga duplikat
  mustahil. Kedua foreign key memakai `on delete cascade`.
- `id` post adalah **UUID**, bukan angka berurutan.

## 6. Logika Bisnis

### Konten gated

- **Guest:** blok teknis diburamkan, badge `Locked`, CTA untuk login. Teks CTA
  berbeda per kategori.
- **Pengguna login:** konten terbuka. Tombol `Copy Prompt` hanya muncul untuk
  kategori `AI Generated`.
- Camera metadata (body, lens, aperture, dst.) **juga di-gated**, bukan hanya
  prompt AI.

### Gambar Imgur

| Konteks | Sufiks | Perkiraan ukuran |
|---|---|---|
| Kartu galeri | `h` | ~768×1024 |
| Halaman detail | (tanpa sufiks) | resolusi penuh |

Varian `m` **tidak dipakai**: ukurannya hanya ~240×320, sehingga ketika
`next/image` meminta lebar lebih besar, optimizer memperbesar sumber kecil itu
dan hasilnya buram.

Kartu memakai `quality={85}`. Quality yang diizinkan didaftarkan di
`next.config.ts` — Next 16 menolak quality yang tidak terdaftar dengan HTTP 400.

Dua kartu pertama di setiap grid memakai `loading="eager"` dan
`fetchPriority="high"` untuk memperbaiki LCP. Sisanya `lazy`.

### Pencarian

- Mencari di empat kolom: `title`, `description`, `category`, `tags`
- `tags` bertipe `text[]`, sehingga memakai operator `cs` (contains), bukan
  `ilike`
- Term di-escape agar tidak bisa menjadi injeksi filter PostgREST
- Panjang term dibatasi 80 karakter

### Pagination

- 24 post per halaman, memakai **nomor halaman** berbasis URL (`?page=2`)
- Kata kunci pencarian dipertahankan saat berpindah halaman
- Link biasa, bukan tombol klien — agar bisa di-cache dan berfungsi tanpa
  JavaScript

### Cache

- `unstable_cache` dengan tag `"posts"`
- Server action admin memanggil `revalidateTag("posts", "max")` setelah
  create/update/delete
- Query cache memakai klien **tanpa cookie**, karena `cookies()` tidak boleh
  dipanggil di dalam cache scope

## 7. Autentikasi & Otorisasi

- Login **hanya** lewat Google OAuth. Tidak ada password di sistem ini, sehingga
  halaman settings hanya mengelola nama tampilan.
- Alur: `/login` → Google → Supabase → `/auth/callback` → tukar `code` jadi sesi.

### Penjagaan berlapis

Empat lapis, semuanya wajib dipertahankan:

1. **Halaman** — `/admin` memeriksa role; belum login → redirect, bukan admin →
   pesan "Admins only".
2. **Server action** — memverifikasi ulang role admin di setiap mutasi, tidak
   percaya pada halaman yang memanggilnya.
3. **API route** — `/api/admin/post/[id]` memeriksa admin sendiri.
4. **RLS** — pertahanan terakhir di database.

Role dibaca dari tabel `profiles`, bukan dari user metadata, agar pencabutan
akses langsung berlaku. Tombol Admin di navbar hanyalah kenyamanan navigasi.

## 8. Konfigurasi

- `next.config.ts`:
  - `images.remotePatterns` mendaftarkan `https://i.imgur.com/**`
  - `images.qualities: [75, 85]`
  - `turbopack.root` di-set ke `process.cwd()` agar Turbopack tidak menelusuri
    ke direktori induk dan mengambil lockfile yang tidak relevan
- `proxy.ts` menyegarkan token Supabase setiap request, karena Server Component
  tidak bisa menulis cookie saat render
- Environment variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```

Tidak ada `service_role` key — semua operasi admin lewat RLS.

## 9. Kendala & Keputusan Teknis

### Arsitektur

- **Root layout tidak memanggil `cookies()`.** Request-time API di sana memaksa
  seluruh situs dirender dinamis. Sesi untuk navbar dibaca di klien.
- **Halaman galeri dinamis** karena pagination berbasis `searchParams`. Query
  databasenya tetap di-cache.
- **Cache query memakai klien tanpa cookie**, karena `cookies()` tidak boleh
  dipanggil di dalam scope `unstable_cache`.

### Keamanan

- **Prompt asli ada di DOM** untuk guest, hanya diburamkan CSS. Ini proteksi
  tampilan, bukan proteksi data. Untuk proteksi sungguhan, pindahkan pengiriman
  `metadata` ke server dan tambahkan RLS pada kolom tersebut.
- **Jangan pernah menaruh `service_role` key dengan awalan `NEXT_PUBLIC_`.** Anon
  key aman diekspos karena RLS membatasinya; service role key tidak.

### Gambar

- **Ketersediaan gambar diputuskan di server**, bukan dari elemen yang dirender.
  `lib/imgur-check.ts` melakukan `HEAD` ke Imgur dan menganggap URL akhir
  `removed.png` sebagai tanda gambar hilang.
- **Jangan putuskan ketersediaan dari ukuran gambar di klien.** Ukuran yang
  disajikan bergantung lebar viewport, sehingga gambar asli bisa tampil normal di
  desktop tapi menjadi placeholder di mobile.

### Jebakan yang Pernah Menggigit

1. **`tags` bertipe `text[]`** sehingga butuh operator `cs`, bukan `ilike`.
   Mencampur keduanya membuat Postgres menolak seluruh query, sehingga pencarian
   di semua kolom mati.
2. **`unstable_cache` menyimpan berdasarkan argumen fungsi.** Membungkus fungsi
   tanpa argumen lalu mengambil nilai dari closure membuat semua panggilan
   dianggap identik. Selalu oper argumen secara eksplisit.
3. **Jangan menelan kegagalan query tanpa jejak.** Fallback ke data contoh pernah
   menyembunyikan query pencarian yang rusak total.
4. **File ber-`"use server"` hanya boleh mengekspor async function.**

## 10. Konvensi Pengembangan

1. Baca file terkait sebelum mengubah apa pun.
2. Kerjakan bertahap secara modular: tipe data → lapisan data → UI → verifikasi.
3. Verifikasi wajib setelah setiap perubahan:
   ```
   npm run lint
   npx tsc --noEmit
   npm run build
   ```
4. Buktikan, jangan asumsikan: bandingkan hasil render dengan sumbernya, dan uji
   URL dengan status code.
5. Waspadai fallback yang menutupi kegagalan — log kegagalan dengan `console.error`.
6. Jangan commit kecuali diminta secara eksplisit.
