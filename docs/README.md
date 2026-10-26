# Dokumentasi denslab

Dokumentasi teknis untuk proyek **denslab** — laboratorium personal untuk gambar
AI-generated dan fotografi konseptual.

## Daftar Isi

| Dokumen | Isi |
|---|---|
| [`rules.md`](./rules.md) | Arsitektur, model data, logika bisnis, konvensi, dan keputusan teknis |
| [`progress.md`](./progress.md) | Status pengembangan, fitur selesai, dan rencana |

## Gambaran Proyek

denslab adalah situs portfolio yang menampilkan dua jenis karya:

- **AI Generated** — gambar yang dihasilkan model AI, lengkap dengan prompt,
  model, platform, dan seed
- **Photoshoot** — foto yang diambil dengan kamera mirrorless, lengkap dengan
  body, lensa, aperture, shutter speed, dan ISO

Metadata di balik setiap karya bersifat **gated**: pengunjung anonim melihat
pratinjau yang diburamkan, sementara pengguna yang login dapat membaca dan
menyalinnya.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Supabase (PostgreSQL +
Auth) · Imgur · Vercel

## Menjalankan Secara Lokal

1. **Clone repositori dan pasang dependensi**
   ```bash
   git clone https://github.com/dendense/denslab.git
   cd denslab
   npm install
   ```

2. **Siapkan environment variables**

   Buat `.env.local` di root proyek:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

3. **Siapkan database**

   Jalankan skrip berikut di Supabase SQL Editor, berurutan:
   ```
   supabase/schema.sql      # tabel posts, profiles, RLS
   supabase/bookmarks.sql   # tabel bookmarks
   supabase/seed.sql        # data contoh (opsional)
   ```

4. **Konfigurasi autentikasi**

   Di Supabase Dashboard → Authentication → URL Configuration, tambahkan:
   ```
   http://localhost:3001/**
   ```

   Aktifkan provider Google dan lengkapi Client ID serta Secret dari Google
   Cloud Console.

5. **Jalankan**
   ```bash
   npm run dev
   ```

   Buka http://localhost:3001

## Perintah

```bash
npm run dev          # server pengembangan
npm run build        # build produksi
npm run start        # jalankan hasil build
npm run lint         # ESLint
npx tsc --noEmit     # pemeriksaan tipe
```

## Struktur Folder

```
app/                 # route App Router
  admin/             # panel admin (khusus role admin)
  api/               # API route
  auth/              # callback OAuth dan sign out
  bookmarks/         # halaman bookmark
  categories/        # halaman kategori
  photo/[id]/        # halaman detail
components/          # komponen UI
  admin/             # komponen panel admin
  settings/          # komponen halaman settings
  ui/                # primitif UI
lib/                 # lapisan data dan utilitas
supabase/            # skrip SQL
docs/                # dokumentasi (folder ini)
public/              # aset statis
```

## Peran Pengguna

| Role | Akses |
|---|---|
| Anonim | Galeri, pencarian, detail dengan metadata gated |
| `user` | Semua di atas, plus metadata lengkap dan bookmark |
| `admin` | Semua di atas, plus panel admin untuk mengelola post |

Role disimpan di tabel `profiles` dan ditegakkan oleh Row Level Security, bukan
hanya oleh tampilan.
