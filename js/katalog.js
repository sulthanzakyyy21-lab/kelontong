// =========================================================
// LOGIKA HALAMAN KATALOG PELANGGAN MODERN (index.html)
// E-Commerce Style: Smart Shopping List + Multiple WA Order
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.APP_CONFIG;
  const db = window.supabaseClient;
  const { FALLBACK_IMAGE, formatRupiah, parseImageUrl, escapeHtml, showToast } = window.AppUtils;

  // ---------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------
  let allProducts = [];
  let activeCategory = "Semua";
  let searchQuery = "";
  let sortOption = "default";
  let onlyReadyFilter = false;

  // Keranjang Belanjaan (Saved in LocalStorage)
  let cart = loadCartFromStorage();

  // Detail Modal State (Single Product Sheet)
  let selectedProduct = null;
  let singleQty = 1;

  // Order Details (Customer Info)
  let deliveryMethod = "antar"; // 'antar' | 'ambil'
  let paymentMethod = "Tunai / COD";

  // ---------------------------------------------------------
  // DOM REFERENCES
  // ---------------------------------------------------------
  // Header & Info
  const elStoreName = document.getElementById("store-name");
  const elStoreDesc = document.getElementById("store-desc");
  const elStoreBadge = document.getElementById("store-status-badge");
  const elStoreHoursQuick = document.getElementById("store-hours-quick");
  const elBtnStoreStatus = document.getElementById("btn-store-status");
  const elBtnInfoToko = document.getElementById("btn-info-toko");
  const elBtnFooterInfo = document.getElementById("btn-footer-info");
  const elFooterStore = document.getElementById("footer-store-name");
  const elBtnShare = document.getElementById("btn-share");

  // Info Modal
  const elInfoModal = document.getElementById("info-modal");
  const elBtnCloseInfo = document.getElementById("btn-close-info");
  const elModalInfoTitle = document.getElementById("modal-info-title");
  const elModalInfoDesc = document.getElementById("modal-info-desc");
  const elModalInfoHours = document.getElementById("modal-info-hours");
  const elModalInfoDelivery = document.getElementById("modal-info-delivery");
  const elBtnModalWAChat = document.getElementById("btn-modal-wa-chat");

  // Banner Carousel
  const elCarouselTrack = document.getElementById("carousel-track");
  const elCarouselDots = document.querySelectorAll(".carousel-dot");
  let currentSlide = 0;
  let carouselTimer = null;

  // Search & Filters
  const elSearchInput = document.getElementById("search-input");
  const elClearSearch = document.getElementById("btn-clear-search");
  const elCategoryBar = document.getElementById("category-pills");
  const elResultCount = document.getElementById("result-count");
  const elSortSelect = document.getElementById("sort-select");
  const elBtnFilterReady = document.getElementById("btn-filter-ready");

  // Product Grid
  const elProductGrid = document.getElementById("product-grid");
  const elEmptyState = document.getElementById("empty-state");
  const elErrorState = document.getElementById("error-state");
  const elErrorText = document.getElementById("error-text");
  const elBtnRetry = document.getElementById("btn-retry");
  const elBtnResetFilter = document.getElementById("btn-reset-filter");

  // Floating Cart Bar
  const elCartFloatingBar = document.getElementById("cart-floating-bar");
  const elCartBadgeCount = document.getElementById("cart-badge-count");
  const elCartBarLabel = document.getElementById("cart-bar-label");
  const elCartBarTotal = document.getElementById("cart-bar-total");
  const elBtnOpenCart = document.getElementById("btn-open-cart");

  // Cart Modal
  const elCartModal = document.getElementById("cart-modal");
  const elBtnCloseCart = document.getElementById("btn-close-cart");
  const elBtnClearCart = document.getElementById("btn-clear-cart");
  const elCartItemSummary = document.getElementById("cart-item-summary");
  const elCartItemsContainer = document.getElementById("cart-items-container");
  const elCartBuyerName = document.getElementById("cart-buyer-name");
  const elBtnDeliveryAntar = document.getElementById("btn-delivery-antar");
  const elBtnDeliveryAmbil = document.getElementById("btn-delivery-ambil");
  const elWrapperAlamat = document.getElementById("wrapper-alamat");
  const elCartBuyerAddress = document.getElementById("cart-buyer-address");
  const elPayChips = document.querySelectorAll(".pay-chip");
  const elCartOrderNote = document.getElementById("cart-order-note");
  const elCartModalGrandTotal = document.getElementById("cart-modal-grandtotal");
  const elBtnSubmitCartWA = document.getElementById("btn-submit-cart-wa");

  // Single Product Quick View Sheet
  const elSheetBackdrop = document.getElementById("order-sheet");
  const elSheetImg = document.getElementById("sheet-img");
  const elSheetCat = document.getElementById("sheet-category");
  const elSheetName = document.getElementById("sheet-name");
  const elSheetPrice = document.getElementById("sheet-price");
  const elSheetUnit = document.getElementById("sheet-unit");
  const elQtyMinus = document.getElementById("qty-minus");
  const elQtyValue = document.getElementById("qty-value");
  const elQtyPlus = document.getElementById("qty-plus");
  const elSheetSubtotal = document.getElementById("sheet-subtotal");
  const elBtnSheetAddCart = document.getElementById("btn-sheet-add-cart");
  const elBtnSendWA = document.getElementById("btn-send-wa");
  const elBtnCloseSheet = document.getElementById("btn-close-sheet");

  // Scroll to top
  const elBtnScrollTop = document.getElementById("btn-scroll-top");

  // ---------------------------------------------------------
  // 1. INISIALISASI IDENTITAS TOKO
  // ---------------------------------------------------------
  function initStore() {
    document.title = `${cfg.namaToko} — Katalog Belanja Mudah`;
    if (elStoreName) elStoreName.textContent = cfg.namaToko;
    if (elFooterStore) elFooterStore.textContent = cfg.namaToko;
    if (elStoreDesc) elStoreDesc.textContent = cfg.deskripsi;
    if (elStoreBadge) elStoreBadge.textContent = cfg.statusBuka || "Buka Hari Ini";
    if (elStoreHoursQuick) elStoreHoursQuick.textContent = cfg.jamBuka || "07.00 - 21.00 WIB";

    // Setup Info Modal text
    if (elModalInfoTitle) elModalInfoTitle.textContent = cfg.namaToko;
    if (elModalInfoDesc) elModalInfoDesc.textContent = cfg.deskripsi;
    if (elModalInfoHours) elModalInfoHours.textContent = cfg.jamBuka || "07.00 - 21.00 WIB";
    if (elModalInfoDelivery) elModalInfoDelivery.textContent = cfg.alamatSingkat || "Siap antar sekitar toko";

    const generalMsg = encodeURIComponent(`Halo ${cfg.namaToko}, saya mau tanya ketersediaan barang di toko.`);
    if (elBtnModalWAChat) {
      elBtnModalWAChat.href = `https://wa.me/${cfg.nomorWA}?text=${generalMsg}`;
    }

    // Load saved customer info
    loadSavedCustomerInfo();
    setupCarousel();
    updateCartUI();
  }

  // ---------------------------------------------------------
  // 2. PROMO BANNER CAROUSEL
  // ---------------------------------------------------------
  function setupCarousel() {
    if (!elCarouselTrack || elCarouselDots.length === 0) return;

    function goToSlide(idx) {
      currentSlide = idx;
      elCarouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      elCarouselDots.forEach((dot, dIdx) => {
        if (dIdx === currentSlide) {
          dot.className = "carousel-dot active w-5 h-1.5 rounded-full bg-white shadow-sm";
        } else {
          dot.className = "carousel-dot w-1.5 h-1.5 rounded-full bg-white/50";
        }
      });
    }

    elCarouselDots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        goToSlide(idx);
        restartCarouselTimer();
      });
    });

    function nextSlide() {
      const next = (currentSlide + 1) % elCarouselDots.length;
      goToSlide(next);
    }

    function restartCarouselTimer() {
      clearInterval(carouselTimer);
      carouselTimer = setInterval(nextSlide, 5000);
    }

    restartCarouselTimer();
  }

  // ---------------------------------------------------------
  // 3. AMBIL PRODUK ASLI DARI SUPABASE DATABASE
  // ---------------------------------------------------------
  async function loadProducts() {
    renderSkeletons(8);

    try {
      const { data, error } = await db
        .from(cfg.tableName)
        .select("*")
        .order("status", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      allProducts = Array.isArray(data) ? data : [];
      renderCategoryPills();
      renderProducts();
    } catch (err) {
      console.error("Gagal memuat produk dari Supabase:", err);
      if (elProductGrid) {
        elProductGrid.innerHTML = "";
        elProductGrid.classList.add("hidden");
      }
      if (elErrorState) elErrorState.classList.remove("hidden");
      if (elErrorText) {
        elErrorText.textContent = err.message || "Pastikan tabel 'produk' dan koneksi internet aktif.";
      }
      if (elResultCount) elResultCount.textContent = "Gagal memuat data";
    }
  }

  function renderSkeletons(count = 8) {
    if (elEmptyState) elEmptyState.classList.add("hidden");
    if (elErrorState) elErrorState.classList.add("hidden");
    if (elProductGrid) {
      elProductGrid.classList.remove("hidden");
      let html = "";
      for (let i = 0; i < count; i++) {
        html += `
          <div class="bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-200/70 shadow-xs">
            <div class="skeleton aspect-square w-full rounded-xl mb-2.5"></div>
            <div class="skeleton h-3 w-2/5 rounded mb-1.5"></div>
            <div class="skeleton h-4 w-4/5 rounded mb-2"></div>
            <div class="skeleton h-5 w-3/5 rounded mb-3"></div>
            <div class="skeleton h-8 w-full rounded-xl"></div>
          </div>
        `;
      }
      elProductGrid.innerHTML = html;
    }
  }

  // ---------------------------------------------------------
  // 4. GENERATE KATEGORI PILLS
  // ---------------------------------------------------------
  const categoryIcons = {
    semua: "📦",
    sembako: "🌾",
    minuman: "🥤",
    makanan: "🍪",
    snack: "🍿",
    bumbu: "🧂",
    dapur: "🍳",
    sabun: "🧼",
    kebersihan: "🧹",
    rokok: "🚬",
    obat: "💊",
    gas: "🔥",
    galon: "💧"
  };

  function getCatIcon(catName) {
    const key = (catName || "").toLowerCase().trim();
    for (const [k, icon] of Object.entries(categoryIcons)) {
      if (key.includes(k)) return icon;
    }
    return "🏷️";
  }

  function renderCategoryPills() {
    if (!elCategoryBar) return;

    const uniqueCats = [
      "Semua",
      ...Array.from(
        new Set(
          allProducts
            .map((p) => (p.kategori || "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, "id"))
    ];

    if (!uniqueCats.includes(activeCategory)) {
      activeCategory = "Semua";
    }

    elCategoryBar.innerHTML = uniqueCats
      .map((cat) => {
        const isActive = cat === activeCategory;
        const icon = cat === "Semua" ? "🛍️" : getCatIcon(cat);
        return `
          <button
            type="button"
            data-cat="${escapeHtml(cat)}"
            class="cat-pill tactile shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isActive
                ? "active"
                : "bg-white text-stone-700 border-stone-200 hover:border-emerald-600/40"
            }"
          >
            <span>${icon}</span>
            <span>${escapeHtml(cat)}</span>
          </button>
        `;
      })
      .join("");

    elCategoryBar.querySelectorAll("button[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-cat");
        renderCategoryPills();
        renderProducts();
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
    });
  }

  // ---------------------------------------------------------
  // 5. FILTER & RENDER PRODUK
  // ---------------------------------------------------------
  function renderProducts() {
    const q = searchQuery.trim().toLowerCase();

    // Filter
    let filtered = allProducts.filter((item) => {
      const matchCat =
        activeCategory === "Semua" ||
        (item.kategori || "").trim().toLowerCase() === activeCategory.toLowerCase();

      const matchQuery =
        !q ||
        (item.nama || "").toLowerCase().includes(q) ||
        (item.kategori || "").toLowerCase().includes(q) ||
        (item.satuan || "").toLowerCase().includes(q);

      const isReady = (item.status || "Ready").toLowerCase() === "ready";
      const matchReady = !onlyReadyFilter || isReady;

      return matchCat && matchQuery && matchReady;
    });

    // Sort
    if (sortOption === "price-asc") {
      filtered.sort((a, b) => Number(a.harga) - Number(b.harga));
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => Number(b.harga) - Number(a.harga));
    } else if (sortOption === "name-asc") {
      filtered.sort((a, b) => (a.nama || "").localeCompare(b.nama || "", "id"));
    } else {
      // default: Ready first, then newest
      filtered.sort((a, b) => {
        const aReady = (a.status || "Ready").toLowerCase() === "ready" ? 1 : 0;
        const bReady = (b.status || "Ready").toLowerCase() === "ready" ? 1 : 0;
        if (aReady !== bReady) return bReady - aReady;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
    }

    if (elResultCount) {
      elResultCount.textContent = `${filtered.length} barang ditemukan`;
    }

    if (filtered.length === 0) {
      if (elProductGrid) {
        elProductGrid.innerHTML = "";
        elProductGrid.classList.add("hidden");
      }
      if (elEmptyState) elEmptyState.classList.remove("hidden");
      return;
    }

    if (elEmptyState) elEmptyState.classList.add("hidden");
    if (elProductGrid) {
      elProductGrid.classList.remove("hidden");
      elProductGrid.innerHTML = filtered
        .map((item, idx) => {
          const isReady = (item.status || "Ready").toLowerCase() === "ready";
          const imgUrl = parseImageUrl(item.foto_url);
          const cartItem = cart[item.id];
          const inCartQty = cartItem ? cartItem.qty : 0;
          const delay = Math.min(idx * 30, 240);

          return `
            <article
              data-id="${item.id}"
              style="animation-delay: ${delay}ms"
              class="ecom-card product-card tactile group bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-200/80 shadow-xs flex flex-col justify-between ${
                isReady ? "" : "opacity-75"
              }"
            >
              <!-- Card Header & Image -->
              <div class="cursor-pointer js-view-detail" data-id="${item.id}">
                <div class="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-2">
                  <img
                    src="${escapeHtml(imgUrl)}"
                    alt="${escapeHtml(item.nama)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                    class="w-full h-full object-cover transition-transform duration-300 ${
                      isReady ? "group-hover:scale-105" : "grayscale-[60%]"
                    }"
                  />
                  
                  <!-- Badge Ready/Habis -->
                  <span class="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-xs ${
                    isReady
                      ? "bg-emerald-600/95 text-white"
                      : "bg-stone-800/90 text-stone-200"
                  }">
                    <span class="w-1.5 h-1.5 rounded-full ${
                      isReady ? "bg-emerald-200" : "bg-red-400"
                    }"></span>
                    ${isReady ? "Ready" : "Habis"}
                  </span>
                </div>

                <!-- Kategori & Nama -->
                <p class="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-0.5 truncate">
                  ${escapeHtml(item.kategori || "Umum")}
                </p>
                <h3 class="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 min-h-[2.25rem]">
                  ${escapeHtml(item.nama)}
                </h3>
              </div>

              <!-- Price & Interactive Action Button -->
              <div class="mt-2 pt-2 border-t border-stone-100">
                <div class="flex items-baseline flex-wrap gap-x-1 mb-2">
                  <span class="text-sm sm:text-base font-black text-[#143628]">
                    ${formatRupiah(item.harga)}
                  </span>
                  <span class="text-[10px] font-semibold text-stone-400">
                    / ${escapeHtml(item.satuan || "pcs")}
                  </span>
                </div>

                <!-- Tombol Aksi Keranjang / Stepper -->
                <div>
                  ${
                    !isReady
                      ? `<button
                          type="button"
                          disabled
                          class="w-full py-1.5 sm:py-2 px-2 rounded-xl bg-stone-100 text-stone-400 text-xs font-bold cursor-not-allowed text-center"
                        >Stok Habis</button>`
                      : inCartQty > 0
                      ? `<div class="flex items-center justify-between bg-emerald-50 border border-emerald-600/40 rounded-xl p-0.5">
                          <button
                            type="button"
                            data-action="card-minus"
                            data-id="${item.id}"
                            class="tactile w-7 h-7 rounded-lg bg-white text-emerald-900 font-black text-sm shadow-xs flex items-center justify-center hover:bg-emerald-100"
                            title="Kurangi"
                          >−</button>
                          <span class="text-xs font-black text-emerald-950 px-2">${inCartQty}</span>
                          <button
                            type="button"
                            data-action="card-plus"
                            data-id="${item.id}"
                            class="tactile w-7 h-7 rounded-lg bg-[#143628] text-white font-black text-sm shadow-xs flex items-center justify-center hover:bg-emerald-900"
                            title="Tambah"
                          >+</button>
                        </div>`
                      : `<button
                          type="button"
                          data-action="card-add"
                          data-id="${item.id}"
                          class="tactile w-full py-1.5 sm:py-2 px-2.5 rounded-xl bg-[#143628] hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>+ Tambah</span>
                        </button>`
                  }
                </div>
              </div>
            </article>
          `;
        })
        .join("");
    }

    bindProductGridEvents();
  }

  // ---------------------------------------------------------
  // 6. EVENT BINDING PRODUK GRID
  // ---------------------------------------------------------
  function bindProductGridEvents() {
    if (!elProductGrid) return;

    // Klik detail produk (buka quick view sheet)
    elProductGrid.querySelectorAll(".js-view-detail").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const prod = allProducts.find((p) => String(p.id) === String(id));
        if (prod) openQuickSheet(prod);
      });
    });

    // Tombol "+ Tambah" langsung di card
    elProductGrid.querySelectorAll('button[data-action="card-add"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const prod = allProducts.find((p) => String(p.id) === String(id));
        if (!prod) return;
        addToCart(prod, 1);
        renderProducts();
        triggerCartBarBump();
      });
    });

    // Tombol Stepper Minus di card
    elProductGrid.querySelectorAll('button[data-action="card-minus"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        changeCartQty(id, -1);
        renderProducts();
      });
    });

    // Tombol Stepper Plus di card
    elProductGrid.querySelectorAll('button[data-action="card-plus"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        changeCartQty(id, 1);
        renderProducts();
        triggerCartBarBump();
      });
    });
  }

  // ---------------------------------------------------------
  // 7. SISTEM KERANJANG BELANJA (CART)
  // ---------------------------------------------------------
  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem("kelontong_cart_v2");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem("kelontong_cart_v2", JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }

  function addToCart(product, qty = 1) {
    const id = product.id;
    if (cart[id]) {
      cart[id].qty += qty;
    } else {
      cart[id] = {
        product: {
          id: product.id,
          nama: product.nama,
          harga: product.harga,
          satuan: product.satuan || "pcs",
          kategori: product.kategori || "Umum",
          foto_url: product.foto_url
        },
        qty: qty
      };
    }
    saveCartToStorage();
    updateCartUI();
    showToast(`Ditambahkan: ${product.nama}`, "success");
  }

  function changeCartQty(productId, delta) {
    if (!cart[productId]) return;
    cart[productId].qty += delta;
    if (cart[productId].qty <= 0) {
      delete cart[productId];
    }
    saveCartToStorage();
    updateCartUI();
  }

  function removeCartItem(productId) {
    if (cart[productId]) {
      const name = cart[productId].product.nama;
      delete cart[productId];
      saveCartToStorage();
      updateCartUI();
      renderProducts();
      renderCartModalItems();
      showToast(`${name} dihapus dari daftar`, "info");
    }
  }

  function clearCart() {
    cart = {};
    saveCartToStorage();
    updateCartUI();
    renderProducts();
    renderCartModalItems();
    closeCartModal();
    showToast("Daftar belanjaan dikosongkan", "info");
  }

  function getCartStats() {
    const items = Object.values(cart);
    let totalItems = 0;
    let totalPrice = 0;
    items.forEach((item) => {
      totalItems += item.qty;
      totalPrice += (Number(item.product.harga) || 0) * item.qty;
    });
    return { count: items.length, totalQty: totalItems, totalPrice };
  }

  function updateCartUI() {
    const { count, totalQty, totalPrice } = getCartStats();

    if (totalQty > 0) {
      if (elCartFloatingBar) elCartFloatingBar.classList.add("is-visible");
      if (elCartBadgeCount) elCartBadgeCount.textContent = totalQty;
      if (elCartBarLabel) elCartBarLabel.textContent = `${count} Jenis Barang (${totalQty} pcs)`;
      if (elCartBarTotal) elCartBarTotal.textContent = formatRupiah(totalPrice);
    } else {
      if (elCartFloatingBar) elCartFloatingBar.classList.remove("is-visible");
    }
  }

  function triggerCartBarBump() {
    if (elCartFloatingBar) {
      elCartFloatingBar.classList.remove("cart-bump");
      void elCartFloatingBar.offsetWidth;
      elCartFloatingBar.classList.add("cart-bump");
    }
  }

  // ---------------------------------------------------------
  // 8. CART MODAL (DAFTAR BELANJAAN)
  // ---------------------------------------------------------
  function openCartModal() {
    renderCartModalItems();
    if (elCartModal) {
      elCartModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeCartModal() {
    if (elCartModal) {
      elCartModal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }

  function renderCartModalItems() {
    if (!elCartItemsContainer) return;
    const items = Object.values(cart);
    const { totalQty, totalPrice } = getCartStats();

    if (elCartItemSummary) {
      elCartItemSummary.textContent = `${items.length} macam barang &bull; Total ${totalQty} pcs`;
    }
    if (elCartModalGrandTotal) {
      elCartModalGrandTotal.textContent = formatRupiah(totalPrice);
    }

    if (items.length === 0) {
      elCartItemsContainer.innerHTML = `
        <div class="text-center py-8 text-stone-400">
          <span class="text-4xl block mb-2">🛒</span>
          <p class="text-xs font-bold text-stone-700">Keranjang Belanjaan Masih Kosong</p>
          <p class="text-[11px] text-stone-400 mt-1">Ketuk tombol "+ Tambah" pada barang yang ingin kamu beli.</p>
        </div>
      `;
      return;
    }

    elCartItemsContainer.innerHTML = items
      .map(({ product, qty }) => {
        const itemTotal = (Number(product.harga) || 0) * qty;
        const imgUrl = parseImageUrl(product.foto_url);

        return `
          <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <img
              src="${escapeHtml(imgUrl)}"
              alt="${escapeHtml(product.nama)}"
              class="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-stone-200"
              onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
            />
            <div class="min-w-0 flex-1">
              <h4 class="text-xs font-bold text-stone-900 truncate">${escapeHtml(product.nama)}</h4>
              <p class="text-[11px] text-stone-500">
                ${formatRupiah(product.harga)} / ${escapeHtml(product.satuan || "pcs")}
              </p>
              <p class="text-xs font-black text-[#143628] mt-0.5">
                Subtotal: ${formatRupiah(itemTotal)}
              </p>
            </div>

            <!-- Stepper & Hapus -->
            <div class="flex items-center gap-1.5 shrink-0">
              <div class="inline-flex items-center bg-white border border-stone-200 rounded-xl p-0.5">
                <button
                  type="button"
                  data-cart-minus="${product.id}"
                  class="tactile w-6 h-6 rounded-lg text-stone-700 font-bold text-xs flex items-center justify-center hover:bg-stone-100"
                >−</button>
                <span class="w-7 text-center text-xs font-black text-stone-900">${qty}</span>
                <button
                  type="button"
                  data-cart-plus="${product.id}"
                  class="tactile w-6 h-6 rounded-lg bg-[#143628] text-white font-bold text-xs flex items-center justify-center hover:bg-emerald-900"
                >+</button>
              </div>

              <button
                type="button"
                data-cart-remove="${product.id}"
                class="tactile p-1 text-stone-400 hover:text-red-600 rounded-lg"
                title="Hapus barang ini"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    // Bind item modal steppers
    elCartItemsContainer.querySelectorAll("button[data-cart-minus]").forEach((b) => {
      b.addEventListener("click", () => {
        changeCartQty(b.getAttribute("data-cart-minus"), -1);
        renderCartModalItems();
        renderProducts();
      });
    });

    elCartItemsContainer.querySelectorAll("button[data-cart-plus]").forEach((b) => {
      b.addEventListener("click", () => {
        changeCartQty(b.getAttribute("data-cart-plus"), 1);
        renderCartModalItems();
        renderProducts();
      });
    });

    elCartItemsContainer.querySelectorAll("button[data-cart-remove]").forEach((b) => {
      b.addEventListener("click", () => {
        removeCartItem(b.getAttribute("data-cart-remove"));
      });
    });
  }

  // Customer info storage
  function loadSavedCustomerInfo() {
    try {
      const savedName = localStorage.getItem("kelontong_buyer_name");
      const savedAddress = localStorage.getItem("kelontong_buyer_address");
      if (savedName && elCartBuyerName) elCartBuyerName.value = savedName;
      if (savedAddress && elCartBuyerAddress) elCartBuyerAddress.value = savedAddress;
    } catch {}
  }

  function saveCustomerInfo() {
    try {
      if (elCartBuyerName) localStorage.setItem("kelontong_buyer_name", elCartBuyerName.value.trim());
      if (elCartBuyerAddress) localStorage.setItem("kelontong_buyer_address", elCartBuyerAddress.value.trim());
    } catch {}
  }

  // Delivery toggle
  if (elBtnDeliveryAntar && elBtnDeliveryAmbil) {
    elBtnDeliveryAntar.addEventListener("click", () => {
      deliveryMethod = "antar";
      elBtnDeliveryAntar.className = "delivery-opt tactile p-2.5 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5";
      elBtnDeliveryAmbil.className = "delivery-opt tactile p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 font-bold text-xs flex items-center justify-center gap-1.5";
      if (elWrapperAlamat) elWrapperAlamat.classList.remove("hidden");
    });

    elBtnDeliveryAmbil.addEventListener("click", () => {
      deliveryMethod = "ambil";
      elBtnDeliveryAmbil.className = "delivery-opt tactile p-2.5 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5";
      elBtnDeliveryAntar.className = "delivery-opt tactile p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 font-bold text-xs flex items-center justify-center gap-1.5";
      if (elWrapperAlamat) elWrapperAlamat.classList.add("hidden");
    });
  }

  // Payment chips
  elPayChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      paymentMethod = chip.getAttribute("data-pay") || "Tunai / COD";
      elPayChips.forEach((c) => {
        c.className = "pay-chip tactile px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200";
      });
      chip.className = "pay-chip tactile px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-800 text-white";
    });
  });

  // KIRIM PESANAN KE WHATSAPP (MULTI-ITEMS)
  if (elBtnSubmitCartWA) {
    elBtnSubmitCartWA.addEventListener("click", () => {
      const items = Object.values(cart);
      if (items.length === 0) {
        showToast("Pilih minimal 1 barang belanjaan", "error");
        return;
      }

      const buyerName = elCartBuyerName ? elCartBuyerName.value.trim() : "";
      if (!buyerName) {
        showToast("Mohon isi nama kamu terlebih dahulu", "error");
        if (elCartBuyerName) elCartBuyerName.focus();
        return;
      }

      saveCustomerInfo();

      const buyerAddress = elCartBuyerAddress ? elCartBuyerAddress.value.trim() : "";
      const orderNote = elCartOrderNote ? elCartOrderNote.value.trim() : "";
      const { totalPrice, totalQty } = getCartStats();

      // Format WhatsApp Pesan Rapi
      let lines = [
        `Halo *${cfg.namaToko}*, saya mau pesan belanjaan:`,
        ``,
        `📋 *DAFTAR PESANAN:*`
      ];

      items.forEach(({ product, qty }, i) => {
        const itemTotal = (Number(product.harga) || 0) * qty;
        lines.push(`${i + 1}. ${product.nama} (${qty}x) = ${formatRupiah(itemTotal)}`);
      });

      lines.push(
        `-----------------------------`,
        `💰 *Total Estimasi (${totalQty} barang):* *${formatRupiah(totalPrice)}*`,
        ``,
        `👤 *DATA PEMESAN:*`,
        `• Nama: ${buyerName}`,
        `• Pengiriman: ${deliveryMethod === "antar" ? "🛵 Diantar ke Rumah" : "🏪 Ambil Sendiri di Toko"}`
      );

      if (deliveryMethod === "antar" && buyerAddress) {
        lines.push(`• Alamat / Patokan: ${buyerAddress}`);
      }

      lines.push(`• Pembayaran: ${paymentMethod}`);

      if (orderNote) {
        lines.push(`• Catatan: ${orderNote}`);
      }

      lines.push(``, `Mohon dicek apakah semua barang ready ya, terima kasih! 🙏`);

      const waUrl = `https://wa.me/${cfg.nomorWA}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  }

  // ---------------------------------------------------------
  // 9. DETAIL PRODUK CEPAT (QUICK VIEW SHEET)
  // ---------------------------------------------------------
  function openQuickSheet(product) {
    selectedProduct = product;
    singleQty = 1;

    if (elSheetImg) {
      elSheetImg.src = parseImageUrl(product.foto_url);
      elSheetImg.onerror = () => {
        elSheetImg.src = FALLBACK_IMAGE;
      };
    }
    if (elSheetCat) elSheetCat.textContent = product.kategori || "Umum";
    if (elSheetName) elSheetName.textContent = product.nama;
    if (elSheetPrice) elSheetPrice.textContent = formatRupiah(product.harga);
    if (elSheetUnit) elSheetUnit.textContent = `/ ${product.satuan || "pcs"}`;
    updateQuickSheetTotal();

    if (elSheetBackdrop) {
      elSheetBackdrop.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeQuickSheet() {
    if (elSheetBackdrop) {
      elSheetBackdrop.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    selectedProduct = null;
  }

  function updateQuickSheetTotal() {
    if (!selectedProduct) return;
    if (elQtyValue) elQtyValue.textContent = singleQty;
    if (elQtyMinus) elQtyMinus.disabled = singleQty <= 1;
    const total = (Number(selectedProduct.harga) || 0) * singleQty;
    if (elSheetSubtotal) elSheetSubtotal.textContent = formatRupiah(total);
  }

  if (elQtyMinus) {
    elQtyMinus.addEventListener("click", () => {
      if (singleQty > 1) {
        singleQty--;
        updateQuickSheetTotal();
      }
    });
  }

  if (elQtyPlus) {
    elQtyPlus.addEventListener("click", () => {
      if (singleQty < 99) {
        singleQty++;
        updateQuickSheetTotal();
      }
    });
  }

  // Tambah ke keranjang dari Quick Sheet
  if (elBtnSheetAddCart) {
    elBtnSheetAddCart.addEventListener("click", () => {
      if (!selectedProduct) return;
      addToCart(selectedProduct, singleQty);
      closeQuickSheet();
      renderProducts();
      triggerCartBarBump();
    });
  }

  // Tanya via WA produk tunggal langsung
  if (elBtnSendWA) {
    elBtnSendWA.addEventListener("click", () => {
      if (!selectedProduct) return;
      const total = (Number(selectedProduct.harga) || 0) * singleQty;
      const unit = selectedProduct.satuan || "pcs";
      const lines = [
        `Halo *${cfg.namaToko}*, saya mau tanya barang ini:`,
        `• Produk: ${selectedProduct.nama}`,
        `• Harga: ${formatRupiah(selectedProduct.harga)} / ${unit}`,
        `• Jumlah: ${singleQty} ${unit}`,
        `• Estimasi: ${formatRupiah(total)}`,
        ``,
        `Apakah stoknya masih ready hari ini?`
      ];
      const waUrl = `https://wa.me/${cfg.nomorWA}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  }

  // ---------------------------------------------------------
  // 10. MODAL INFORMASI & JAM BUKA TOKO
  // ---------------------------------------------------------
  function openInfoModal() {
    if (elInfoModal) {
      elInfoModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeInfoModal() {
    if (elInfoModal) {
      elInfoModal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }

  // ---------------------------------------------------------
  // 11. EVENT LISTENERS GLOBAL
  // ---------------------------------------------------------
  // Buttons Info Toko
  if (elBtnStoreStatus) elBtnStoreStatus.addEventListener("click", openInfoModal);
  if (elBtnInfoToko) elBtnInfoToko.addEventListener("click", openInfoModal);
  if (elBtnFooterInfo) elBtnFooterInfo.addEventListener("click", openInfoModal);
  if (elBtnCloseInfo) elBtnCloseInfo.addEventListener("click", closeInfoModal);
  if (elInfoModal) {
    elInfoModal.addEventListener("click", (e) => {
      if (e.target === elInfoModal) closeInfoModal();
    });
  }

  // Cart Modal Triggers
  if (elBtnOpenCart) elBtnOpenCart.addEventListener("click", openCartModal);
  if (elBtnCloseCart) elBtnCloseCart.addEventListener("click", closeCartModal);
  if (elBtnClearCart) elBtnClearCart.addEventListener("click", clearCart);
  if (elCartModal) {
    elCartModal.addEventListener("click", (e) => {
      if (e.target === elCartModal) closeCartModal();
    });
  }

  // Quick Sheet triggers
  if (elBtnCloseSheet) elBtnCloseSheet.addEventListener("click", closeQuickSheet);
  if (elSheetBackdrop) {
    elSheetBackdrop.addEventListener("click", (e) => {
      if (e.target === elSheetBackdrop) closeQuickSheet();
    });
  }

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartModal();
      closeQuickSheet();
      closeInfoModal();
    }
  });

  // Search Input
  if (elSearchInput) {
    elSearchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (elClearSearch) elClearSearch.classList.toggle("hidden", !searchQuery);
      renderProducts();
    });
  }

  if (elClearSearch) {
    elClearSearch.addEventListener("click", () => {
      searchQuery = "";
      elSearchInput.value = "";
      elClearSearch.classList.add("hidden");
      elSearchInput.focus();
      renderProducts();
    });
  }

  // Sort Select
  if (elSortSelect) {
    elSortSelect.addEventListener("change", (e) => {
      sortOption = e.target.value;
      renderProducts();
    });
  }

  // Toggle Hanya Ready
  if (elBtnFilterReady) {
    elBtnFilterReady.addEventListener("click", () => {
      onlyReadyFilter = !onlyReadyFilter;
      if (onlyReadyFilter) {
        elBtnFilterReady.className =
          "tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-700 border border-emerald-800 text-white text-xs font-semibold shadow-xs";
      } else {
        elBtnFilterReady.className =
          "tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:border-emerald-600";
      }
      renderProducts();
    });
  }

  // Reset filter button
  if (elBtnResetFilter) {
    elBtnResetFilter.addEventListener("click", () => {
      searchQuery = "";
      activeCategory = "Semua";
      sortOption = "default";
      onlyReadyFilter = false;
      if (elSearchInput) elSearchInput.value = "";
      if (elClearSearch) elClearSearch.classList.add("hidden");
      if (elSortSelect) elSortSelect.value = "default";
      if (elBtnFilterReady) {
        elBtnFilterReady.className =
          "tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:border-emerald-600";
      }
      renderCategoryPills();
      renderProducts();
    });
  }

  if (elBtnRetry) elBtnRetry.addEventListener("click", loadProducts);

  // Share button
  if (elBtnShare) {
    elBtnShare.addEventListener("click", async () => {
      const shareData = {
        title: `Katalog Belanja ${cfg.namaToko}`,
        text: `Lihat daftar harga sembako & kebutuhan harian terbaru di ${cfg.namaToko}:`,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Link katalog berhasil disalin!", "success");
        }
      } catch (err) {
        if (err && err.name !== "AbortError") {
          showToast("Gagal membagikan link katalog", "error");
        }
      }
    });
  }

  // Scroll to Top
  window.addEventListener(
    "scroll",
    () => {
      if (elBtnScrollTop) {
        if (window.scrollY > 300) {
          elBtnScrollTop.classList.remove("hidden-btn");
        } else {
          elBtnScrollTop.classList.add("hidden-btn");
        }
      }
    },
    { passive: true }
  );

  if (elBtnScrollTop) {
    elBtnScrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------------------------------------------------------
  // RUN APPLICATION
  // ---------------------------------------------------------
  initStore();
  loadProducts();
});
