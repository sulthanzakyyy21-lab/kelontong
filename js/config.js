// =========================================================
// KONFIGURASI TOKO & SUPABASE
// Edit bagian TOKO_CONFIG sesuai informasi tokomu!
// =========================================================

window.APP_CONFIG = {
  // 1. Identitas Toko (Silakan sesuaikan)
  namaToko: "Toko Kelontong Berkah",
  deskripsi: "Sedia sembako, kebutuhan harian, gas & galon. Buka setiap hari 07.00 - 21.00 WIB",
  alamatSingkat: "Siap antar sekitar area toko",
  statusBuka: "Buka Hari Ini",

  // 2. Nomor WhatsApp Toko (Wajib diawali 62, tanpa tanda + atau spasi)
  // Format internasional Indonesia: 6289671814455
  nomorWA: "6289671814455",

  // 3. Koneksi Supabase (Sudah diisi sesuai proyek 'kelontong' milikmu)
  supabaseUrl: "https://kfqvatkzcsvwmzhftply.supabase.co",
  supabaseKey: "sb_publishable_B-tLp8LNZH45uwWAZv9yNg_pyaouIC7",

  // 4. Nama Tabel Database
  tableName: "produk"
};

// Inisialisasi klien Supabase global
window.supabaseClient = window.supabase.createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseKey
);
