-- =========================================================
-- DATA SIMULASI KATALOG TOKO KELONTONG (5 Kategori x 10 Produk = 50 Barang)
-- Salin dan jalankan seluruh skrip ini di menu SQL Editor Supabase!
-- =========================================================

INSERT INTO public.produk (nama, kategori, harga, satuan, status, foto_url) VALUES
-- 1. SEMBAKO (10 Barang)
('Beras Ramos Premium 5 kg', 'Sembako', 74000, 'karung', 'Ready', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'),
('Minyak Goreng Bimoli 2 Liter', 'Sembako', 36500, 'pouch', 'Ready', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'),
('Minyak Goreng Tropical Botol 1 Liter', 'Sembako', 19000, 'botol', 'Ready', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'),
('Gula Pasir Gulaku Tebu 1 kg', 'Sembako', 17500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=500&auto=format&fit=crop&q=80'),
('Telur Ayam Negeri Segar 1 kg', 'Sembako', 28000, 'kg', 'Ready', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80'),
('Tepung Terigu Segitiga Biru 1 kg', 'Sembako', 12500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'),
('Indomie Goreng Spesial 85g', 'Sembako', 3500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80'),
('Mie Sedaap Soto Madura 75g', 'Sembako', 3200, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80'),
('Santan Kelapa Siap Pakai Kara 65 ml', 'Sembako', 3500, 'kotak', 'Ready', 'https://images.unsplash.com/photo-1584947920745-f09d4370a6c0?w=500&auto=format&fit=crop&q=80'),
('Garam Beryodium Dolpin 250g', 'Sembako', 3000, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1518110903415-467f53cf8998?w=500&auto=format&fit=crop&q=80'),

-- 2. MINUMAN (10 Barang)
('Air Mineral Aqua Botol 600 ml', 'Minuman', 3500, 'botol', 'Ready', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80'),
('Air Mineral Le Minerale 600 ml', 'Minuman', 3500, 'botol', 'Ready', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80'),
('Teh Pucuk Harum Melati 350 ml', 'Minuman', 4000, 'botol', 'Ready', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80'),
('Kopi Good Day Cappuccino 25g', 'Minuman', 2500, 'sachet', 'Ready', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80'),
('Susu Ultra Milk UHT Cokelat 250 ml', 'Minuman', 6500, 'kotak', 'Ready', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80'),
('Teh Botol Sosro Kotak 250 ml', 'Minuman', 4000, 'kotak', 'Ready', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80'),
('Floridina Orange Juice 350 ml', 'Minuman', 3500, 'botol', 'Ready', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80'),
('Pocari Sweat Ion Water 500 ml', 'Minuman', 8000, 'botol', 'Ready', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80'),
('Larutan Cap Kaki Tiga Jambu 320 ml', 'Minuman', 7500, 'kaleng', 'Ready', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80'),
('Coca-Cola Rasa Original 390 ml', 'Minuman', 5500, 'botol', 'Ready', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80'),

-- 3. MAKANAN & SNACK (10 Barang)
('Biskuit Roma Kelapa 300g', 'Makanan & Snack', 11500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80'),
('Wafer Nabati Richeese Keju 132g', 'Makanan & Snack', 8500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80'),
('Biskuit Oreo Vanilla Roll 119g', 'Makanan & Snack', 9000, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80'),
('Wafer Cokelat Beng-Beng 25g', 'Makanan & Snack', 2500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80'),
('Keripik Kentang Chitato Sapi Panggang 68g', 'Makanan & Snack', 11500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80'),
('Snack Taro Net Seaweed 65g', 'Makanan & Snack', 6500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80'),
('Wafer Tango Cokelat 110g', 'Makanan & Snack', 7500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80'),
('Cokelat Batang SilverQueen Cashew 58g', 'Makanan & Snack', 15000, 'batang', 'Ready', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80'),
('Permen Kopi Kopiko Bag 150g', 'Makanan & Snack', 8000, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80'),
('Biskuit Khong Guan Classic Mini 300g', 'Makanan & Snack', 24000, 'kaleng', 'Habis', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80'),

-- 4. SABUN & KEBERSIHAN (10 Barang)
('Sabun Mandi Batang Lifebuoy 85g', 'Sabun & Kebersihan', 4500, 'batang', 'Ready', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&auto=format&fit=crop&q=80'),
('Sabun Mandi Cair Biore Pure Mild 450 ml', 'Sabun & Kebersihan', 23500, 'pouch', 'Ready', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&auto=format&fit=crop&q=80'),
('Shampo Sunsilk Black Shine 160 ml', 'Sabun & Kebersihan', 21000, 'botol', 'Ready', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80'),
('Pasta Gigi Pepsodent Pencegah Gigi Berlubang 190g', 'Sabun & Kebersihan', 13500, 'tube', 'Ready', 'https://images.unsplash.com/photo-1559591937-e10c5980753d?w=500&auto=format&fit=crop&q=80'),
('Deterjen Bubuk Rinso Molto Anti Noda 770g', 'Sabun & Kebersihan', 21500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80'),
('Deterjen Daia Bunga Semerbak 850g', 'Sabun & Kebersihan', 18000, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80'),
('Sabun Cuci Piring Sunlight Jeruk Nipis 650 ml', 'Sabun & Kebersihan', 12500, 'pouch', 'Ready', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=80'),
('Pembersih Lantai Karbol Wipol Wangi 750 ml', 'Sabun & Kebersihan', 16500, 'pouch', 'Ready', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80'),
('Downy Pelembut Pakaian Mystique 650 ml', 'Sabun & Kebersihan', 22000, 'pouch', 'Ready', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80'),
('Sikat Gigi Formula Sensitive Care isi 3', 'Sabun & Kebersihan', 12000, 'pack', 'Ready', 'https://images.unsplash.com/photo-1559591937-e10c5980753d?w=500&auto=format&fit=crop&q=80'),

-- 5. KEBUTUHAN RUMAH & DAPUR (10 Barang)
('Gas Elpiji 3 kg (Melon) Isi Ulang', 'Kebutuhan Rumah', 22000, 'tabung', 'Ready', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'),
('Galon Air Aqua 19 Liter Refill Asli', 'Kebutuhan Rumah', 21000, 'galon', 'Ready', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80'),
('Minyak Telon Lang Plus 60 ml', 'Kebutuhan Rumah', 23000, 'botol', 'Ready', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&auto=format&fit=crop&q=80'),
('Pembasmi Nyamuk Baygon Aerosol 600 ml', 'Kebutuhan Rumah', 38000, 'kaleng', 'Ready', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80'),
('Tisu Wajah Paseo Smart Facial 250 sheets', 'Kebutuhan Rumah', 14500, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'),
('Baterai ABC Alkaline AA isi 2', 'Kebutuhan Rumah', 13000, 'pack', 'Ready', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'),
('Korek Api Tokai Gas Original', 'Kebutuhan Rumah', 4000, 'pcs', 'Ready', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'),
('Lilin Putih Jumbo Penerang isi 6', 'Kebutuhan Rumah', 8000, 'bungkus', 'Ready', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'),
('Kantong Plastik Sampah Hitam Roll', 'Kebutuhan Rumah', 12000, 'roll', 'Ready', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'),
('Kapur Barus Swallow Toilet Ball isi 5', 'Kebutuhan Rumah', 15000, 'pack', 'Habis', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80');
