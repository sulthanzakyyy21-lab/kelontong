# Katalog Digital Toko Kelontong (Serverless + Supabase)

Aplikasi web katalog harga toko kelontong berbasis frontend statis modular (HTML5, Tailwind CSS CDN, Vanilla JS) dan Supabase PostgreSQL.

## Struktur File
- `index.html` — Halaman katalog pelanggan (responsif mobile-first, live search, filter kategori, bottom sheet custom pesan WhatsApp).
- `admin.html` — Halaman login & dashboard kelola barang khusus pemilik toko (tambah/edit/hapus & one-tap toggle Ready/Habis).
- `css/style.css` — Animasi mikro taktil dan transisi bottom sheet.
- `js/config.js` — Konfigurasi nama toko, nomor WhatsApp, dan koneksi Supabase.
- `js/utils.js` — Format Rupiah, auto-converter link Google Drive, dan notifikasi toast.
- `js/katalog.js` — Logika halaman pelanggan.
- `js/admin.js` — Logika halaman admin & autentikasi Supabase.
- `database.sql` — Skrip SQL pembuatan tabel `public.produk` + Row Level Security (RLS).

## Cara Pakai Cepat
1. Buka `database.sql`, salin isinya, lalu jalankan di **SQL Editor** Supabase.
2. Buat akun admin (email & password) di menu **Authentication > Users** Supabase.
3. Edit `js/config.js` pada bagian `namaToko`, `deskripsi`, dan `nomorWA` (URL & Publishable Key Supabase sudah terisi otomatis).
4. Push folder ini ke repository GitHub, lalu aktifkan **GitHub Pages** atau deploy ke **Vercel**.
