// =========================================================
// KONFIGURASI TOKO & SUPABASE
// Edit bagian TOKO_CONFIG sesuai informasi tokomu!
// =========================================================

window.APP_CONFIG = {
  // 1. Identitas Toko (Silakan sesuaikan)
  namaToko: "Toko Kelontong Berkah",
  deskripsi: "Sedia sembako, kebutuhan harian, gas & galon. Melayani belanja langsung & antar ke rumah.",
  alamatSingkat: "Siap antar sekitar area toko",
  alamatLengkap: "Area sekitar toko kelontong (Hubungi WA untuk info jangkauan antar)",
  jamBuka: "Buka Setiap Hari: 07.00 - 21.00 WIB",
  statusBuka: "Buka Hari Ini",

  // 2. Layanan & Pembayaran Toko
  infoLayanan: {
    bisaAntar: true,
    minimalOrder: "Bebas / Tanpa Minimal",
    pembayaran: ["Tunai di Tempat (COD)", "QRIS", "Transfer Bank"]
  },

  // 3. Nomor WhatsApp Toko (Format: 62...)
  nomorWA: "6289671814455",

  // 4. Koneksi Supabase
  supabaseUrl: "https://kfqvatkzcsvwmzhftply.supabase.co",
  supabaseKey: "sb_publishable_B-tLp8LNZH45uwWAZv9yNg_pyaouIC7",

  // 5. Nama Tabel Database
  tableName: "produk"
};

// Inisialisasi klien Supabase global
window.supabaseClient = window.supabase.createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseKey
);
