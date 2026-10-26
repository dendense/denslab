# denslab

Situs portfolio personal untuk karya AI-generated dan fotografi konseptual. Setiap karya
menyimpan metadata aslinya — prompt, model, platform, seed untuk gambar AI; body, lensa,
aperture, shutter speed, ISO untuk foto kamera. Metadata itu hanya terbuka untuk pengguna
yang login.

## Status

Aplikasi berjalan: Next.js 16.3.6 (App Router), React 19.2.8, Tailwind CSS v4, Supabase
(PostgreSQL + Auth). Galeri, pencarian, pagination, kategori, bookmark, login Google, dan
panel admin sudah ada di kode. Tidak ada CI di repo ini (tidak ada `.github/`) dan tidak ada
test suite — verifikasi lewat `npm run lint`, `npx tsc --noEmit`, `npm run build`. Ada dua
self-check di luar build (`tsconfig` → `exclude`): `node --experimental-strip-types
lib/format-date.selfcheck.ts` bisa langsung jalan; `lib/categories.selfcheck.ts` butuh `tsx`
yang bukan dependency proyek ini. Arsitektur dan keputusan teknis ada di `docs/rules.md`.

## Cara jalan

Butuh Node.js >= 20.9.0 (`engines` di `node_modules/next/package.json`). Package manager
repo ini **npm** — `package-lock.json` satu-satunya lockfile.

```bash
npm install
# buat .env.local berisi dua baris: lihat tabel Konfigurasi di bawah
npm run dev
```

Buka http://localhost:3001.

Perintah lain yang benar-benar ada di `package.json`:

```bash
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
npx tsc --noEmit # cek tipe
```

## Struktur

| Path | Isi |
|---|---|
| `app/` | Route App Router: `/`, `/about`, `/categories`, `/categories/[category]`, `/photo/[id]`, `/login`, `/bookmarks`, `/settings`, `/admin`, `/api/admin/post/[id]`, `/auth/callback`, `/auth/signout` |
| `components/` | Komponen UI; primitif shadcn/ui di `components/ui/`, panel admin di `components/admin/` |
| `lib/` | Lapisan data dan utilitas: `lib/posts-repository.ts`, `lib/bookmarks.ts`, `lib/auth/viewer.ts`, `lib/imgur-check.ts`, klien Supabase di `lib/supabase/` |
| `supabase/` | Skrip SQL: `supabase/schema.sql`, `supabase/bookmarks.sql`, `supabase/seed.sql` |
| `docs/` | `docs/rules.md` (arsitektur, model data, jebakan), `docs/progress.md` (status), `docs/README.md` (panduan setup) |
| `proxy.ts` | Penyegar token Supabase per request — di Next 16 berkas ini bernama `proxy.ts`, bukan `middleware` |

## Konfigurasi

| Env var | Wajib | Fungsi |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ya, untuk data nyata | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya, untuk data nyata | Anon/publishable key Supabase |

Dibaca di `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/public.ts`, dan
`proxy.ts`. Tanpa keduanya aplikasi tidak crash — klien Supabase jadi `null` dan `proxy.ts`
dilewati — tapi galeri, login, dan bookmark tidak punya data. Tidak ada `service_role` key
di proyek ini; semua operasi admin lewat RLS.

`.env.local` masuk `.gitignore` (`.env*`), jadi isi nilainya manual setelah clone — termasuk
`.env.example` yang juga tidak ikut ter-commit.

## Catatan

- **Port dev 3001, bukan 3000.** Script `dev` adalah `next dev -p 3001`. Kalau port diubah,
  tambahkan juga `http://localhost:3001/**` di Supabase Dashboard → Authentication → URL
  Configuration, kalau tidak callback OAuth gagal.
- **Database disiapkan manual** di Supabase SQL Editor, berurutan: `supabase/schema.sql`
  (tabel `posts`, `profiles`, RLS), lalu `supabase/bookmarks.sql`, lalu `supabase/seed.sql`
  (opsional, data contoh).
- **Login hanya Google OAuth**, tidak ada password. Provider Google harus diaktifkan di
  Supabase Dashboard dengan Client ID/Secret dari Google Cloud Console.
- **Metadata untuk guest hanya disamarkan CSS** (blur), bukan dihapus dari DOM. Itu proteksi
  tampilan, bukan proteksi data.
- Gambar dilayani dari `i.imgur.com`, terdaftar di `images.remotePatterns` (`next.config.ts`),
  dan `images.qualities` dibatasi `[75, 85]` — Next 16 menolak quality lain dengan HTTP 400.
