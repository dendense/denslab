# denslab — Status Pengembangan

> Untuk aturan teknis dan arsitektur, lihat [`rules.md`](./rules.md).

**Terakhir diperbarui:** 27 September 2026

## Status

Aplikasi berjalan di produksi. Seluruh fitur inti sudah selesai.

- **Repositori:** https://github.com/dendense/denslab
- **Produksi:** https://denslab.vercel.app

## Fitur yang Sudah Selesai

| Fitur | Keterangan |
|---|---|
| Galeri masonry | 1–4 kolom responsif, animasi masuk bertahap, skeleton loading |
| Pagination | Nomor halaman, 24 post per halaman |
| Pencarian | Empat kolom: judul, deskripsi, kategori, tag |
| Halaman kategori | Halaman pemilih dan halaman daftar per kategori |
| Detail foto | Gambar resolusi penuh, deskripsi, metadata |
| Konten gated | Prompt AI atau pengaturan kamera terkunci untuk pengunjung anonim |
| Login Google | OAuth saja, tanpa password |
| Halaman settings | Mengelola nama tampilan |
| Panel admin | Tambah, ubah, hapus post dengan toggle kategori |
| Bookmark | Simpan post, privat per pengguna |
| Donasi | QRIS Dana dan USDT (TRC20) |
| Dark mode | Tema terang/gelap dengan pilihan yang bertahan |
| Kontrol akses | Empat lapis: halaman, server action, API route, RLS |
| Penanganan gambar | Placeholder bila gambar tidak tersedia, dideteksi di server |

## Yang Belum Ada

| Item | Catatan |
|---|---|
| Subscription | Rencana fitur; butuh penyedia pembayaran |
| Hapus akun | Butuh penanganan khusus di sisi server |
| Rate limiting | Lihat bagian di bawah |

## Yang Tidak Akan Ditambahkan

- **Ganti password.** Identitas sepenuhnya dipegang Google; akun di sini tidak
  menyimpan password.
- **Watermark overlay CSS.** Tidak efektif karena tidak ikut terbawa saat gambar
  diunduh atau diakses langsung dari URL Imgur. Bila ingin perlindungan
  sungguhan, perlu pemrosesan gambar di sisi server.
- **Blokir klik kanan dan inspect element.** Tidak dapat diandalkan — DevTools
  bisa dibuka lewat menu browser, dan gambar sudah ada di cache pengguna begitu
  terkirim.

## Rencana yang Sudah Dirancang

**Rate limiting pada pencarian.** Setiap kata kunci unik membuat entri cache baru,
sehingga pencarian acak berulang bisa memenuhi cache. Rancangan:

1. Sliding window in-memory di `proxy.ts` — batas 20 pencarian per menit per IP.
2. Hasil pencarian kosong tidak di-cache.

Pendekatan ini dipilih karena tidak menambah dependensi maupun biaya. Solusi
berbasis Redis tidak diperlukan pada skala saat ini.

## Catatan Data

- Sebagian post contoh memakai ID Imgur yang tidak lagi tersedia sehingga
  menampilkan placeholder. Ini disengaja agar tata letak tetap dapat dinilai.
- Pencarian belum diuji dengan hasil lebih dari satu halaman (24 post).
