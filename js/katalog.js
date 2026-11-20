// =========================================================
// LOGIKA HALAMAN KATALOG PELANGGAN (index.html)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.APP_CONFIG;
  const db = window.supabaseClient;
  const { FALLBACK_IMAGE, formatRupiah, parseImageUrl, escapeHtml, showToast } = window.AppUtils;

  // State aplikasi
  let allProducts = [];
  let activeCategory = "Semua";
  let searchQuery = "";
  let selectedProduct = null;
  let orderQty = 1;
  let selectedQuickNote = "";

  // Referensi elemen DOM
  const elStoreName = document.getElementById("store-name");
  const elStoreDesc = document.getElementById("store-desc");
  const elStoreBadge = document.getElementById("store-status-badge");
  const elSearchInput = document.getElementById("search-input");
  const elClearSearch = document.getElementById("btn-clear-search");
  const elCategoryBar = document.getElementById("category-pills");
  const elProductGrid = document.getElementById("product-grid");
  const elResultCount = document.getElementById("result-count");
  const elEmptyState = document.getElementById("empty-state");
  const elErrorState = document.getElementById("error-state");
  const elErrorText = document.getElementById("error-text");

  // Bottom Sheet elements
  const elSheetBackdrop = document.getElementById("order-sheet");
  const elSheetImg = document.getElementById("sheet-img");
  const elSheetCat = document.getElementById("sheet-category");
  const elSheetName = document.getElementById("sheet-name");
  const elSheetPrice = document.getElementById("sheet-price");
  const elSheetUnit = document.getElementById("sheet-unit");
  const elQtyValue = document.getElementById("qty-value");
  const elQtyMinus = document.getElementById("qty-minus");
  const elQtyPlus = document.getElementById("qty-plus");
  const elSubtotal = document.getElementById("sheet-subtotal");
  const elNoteInput = document.getElementById("order-note");
  const elQuickChips = document.querySelectorAll(".quick-chip");
  const elBtnSendWA = document.getElementById("btn-send-wa");
  const elBtnCloseSheet = document.getElementById("btn-close-sheet");

  // Buttons lain
  const elBtnShare = document.getElementById("btn-share");
  const elBtnFloatWA = document.getElementById("btn-float-wa");
  const elBtnScrollTop = document.getElementById("btn-scroll-top");
  const elBtnResetFilter = document.getElementById("btn-reset-filter");
  const elBtnRetry = document.getElementById("btn-retry");

  // 1. Render Identitas Toko dari config.js
  function initStoreInfo() {
    document.title = `${cfg.namaToko} — Katalog Harga`;
    elStoreName.textContent = cfg.namaToko;
    const elFooterStore = document.getElementById("footer-store-name");
    if (elFooterStore) elFooterStore.textContent = cfg.namaToko;
    elStoreDesc.textContent = cfg.deskripsi;
    if (elStoreBadge) elStoreBadge.textContent = cfg.statusBuka || "Buka";

    const generalMsg = encodeURIComponent(
      `Halo ${cfg.namaToko}, saya mau tanya ketersediaan barang di toko.`
    );
    elBtnFloatWA.href = `https://wa.me/${cfg.nomorWA}?text=${generalMsg}`;
  }

  // 2. Render Skeleton Loading
  function renderSkeletons(count = 6) {
    elEmptyState.classList.add("hidden");
    elErrorState.classList.add("hidden");
    elProductGrid.classList.remove("hidden");

    let html = "";
    for (let i = 0; i < count; i++) {
      html += `
        <div class="bg-white rounded-2xl p-2.5 border border-stone-200/70 shadow-sm">
          <div class="skeleton aspect-square w-full rounded-xl mb-2.5"></div>
          <div class="skeleton h-3.5 w-4/5 rounded-md mb-2"></div>
          <div class="skeleton h-3.5 w-3/5 rounded-md mb-3"></div>
          <div class="skeleton h-5 w-2/3 rounded-md mb-2.5"></div>
          <div class="skeleton h-9 w-full rounded-xl"></div>
        </div>
      `;
    }
    elProductGrid.innerHTML = html;
  }

  // 3. Ambil Data Produk dari Supabase
  async function loadProducts() {
    renderSkeletons(6);

    try {
      const { data, error } = await db
        .from(cfg.tableName)
        .select("*")
        .order("status", { ascending: false }) // 'Ready' tampil lebih dulu dibanding 'Habis'
        .order("created_at", { ascending: false });

      if (error) throw error;

      allProducts = Array.isArray(data) ? data : [];
      renderCategoryPills();
      renderProducts();
    } catch (err) {
      console.error("Gagal memuat katalog:", err);
      elProductGrid.innerHTML = "";
      elProductGrid.classList.add("hidden");
      elErrorState.classList.remove("hidden");
      elErrorText.textContent =
        err.message || "Pastikan tabel 'produk' dan koneksi internet aktif.";
      elResultCount.textContent = "Gagal memuat data";
    }
  }

  // 4. Generate Kategori Otomatis dari Data Produk
  function renderCategoryPills() {
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
        return `
          <button
            type="button"
            data-cat="${escapeHtml(cat)}"
            class="cat-pill tactile shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${
              isActive
                ? "active"
                : "bg-white text-stone-600 border-stone-200 hover:border-emerald-700/40"
            }"
          >
            ${escapeHtml(cat)}
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

  // 5. Filter & Render Kartu Produk
  function renderProducts() {
    const q = searchQuery.trim().toLowerCase();

    const filtered = allProducts.filter((item) => {
      const matchCat =
        activeCategory === "Semua" ||
        (item.kategori || "").trim().toLowerCase() === activeCategory.toLowerCase();
      const matchQuery =
        !q ||
        (item.nama || "").toLowerCase().includes(q) ||
        (item.kategori || "").toLowerCase().includes(q) ||
        (item.satuan || "").toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    elResultCount.textContent = `${filtered.length} barang ditampilkan`;
    elErrorState.classList.add("hidden");

    if (filtered.length === 0) {
      elProductGrid.innerHTML = "";
      elProductGrid.classList.add("hidden");
      elEmptyState.classList.remove("hidden");
      return;
    }

    elEmptyState.classList.add("hidden");
    elProductGrid.classList.remove("hidden");

    elProductGrid.innerHTML = filtered
      .map((item, idx) => {
        const isReady = (item.status || "Ready").toLowerCase() === "ready";
        const imgUrl = parseImageUrl(item.foto_url);
        const delay = Math.min(idx * 35, 280);

        return `
          <article
            data-id="${item.id}"
            style="animation-delay: ${delay}ms"
            class="product-card tactile group bg-white rounded-2xl p-2.5 border border-stone-200/80 shadow-[0_2px_10px_rgba(28,25,23,0.04)] hover:shadow-[0_8px_22px_rgba(20,54,40,0.10)] flex flex-col justify-between ${
              isReady ? "cursor-pointer" : "opacity-75"
            }"
          >
            <div>
              <div class="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-2.5">
                <img
                  src="${escapeHtml(imgUrl)}"
                  alt="${escapeHtml(item.nama)}"
                  loading="lazy"
                  onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                  class="w-full h-full object-cover transition-transform duration-300 ${
                    isReady ? "group-hover:scale-105" : "grayscale-[55%]"
                  }"
                />
                <span class="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm ${
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

              <p class="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-0.5 truncate">
                ${escapeHtml(item.kategori || "Umum")}
              </p>
              <h2 class="text-[13px] sm:text-sm font-bold text-stone-800 leading-snug line-clamp-2 min-h-[2.35rem]">
                ${escapeHtml(item.nama)}
              </h2>
            </div>

            <div class="mt-2.5 pt-2 border-t border-stone-100">
              <div class="flex items-baseline flex-wrap gap-x-1 mb-2">
                <span class="text-[15px] sm:text-base font-extrabold text-[#143628]">
                  ${formatRupiah(item.harga)}
                </span>
                <span class="text-[11px] font-medium text-stone-500">
                  / ${escapeHtml(item.satuan || "pcs")}
                </span>
              </div>

              ${
                isReady
                  ? `<button
                      type="button"
                      class="w-full py-2 px-2.5 rounded-xl bg-[#143628] hover:bg-[#1b4a37] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Pesan / Tanya</span>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>`
                  : `<button
                      type="button"
                      disabled
                      class="w-full py-2 px-2.5 rounded-xl bg-stone-200 text-stone-500 text-xs font-semibold cursor-not-allowed"
                    >
                      Stok Habis
                    </button>`
              }
            </div>
          </article>
        `;
      })
      .join("");

    // Bind klik kartu produk yang Ready
    elProductGrid.querySelectorAll("article[data-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        const prod = allProducts.find((p) => String(p.id) === String(id));
        if (!prod) return;
        if ((prod.status || "Ready").toLowerCase() !== "ready") {
          showToast("Maaf, stok barang ini sedang habis", "info");
          return;
        }
        openOrderSheet(prod);
      });
    });
  }

  // 6. Slide-Up Bottom Sheet Pemesanan WhatsApp
  function openOrderSheet(product) {
    selectedProduct = product;
    orderQty = 1;
    selectedQuickNote = "";

    elSheetImg.src = parseImageUrl(product.foto_url);
    elSheetImg.onerror = () => {
      elSheetImg.src = FALLBACK_IMAGE;
    };
    elSheetCat.textContent = product.kategori || "Umum";
    elSheetName.textContent = product.nama;
    elSheetPrice.textContent = formatRupiah(product.harga);
    elSheetUnit.textContent = `/ ${product.satuan || "pcs"}`;
    elNoteInput.value = "";

    elQuickChips.forEach((chip) => chip.classList.remove("selected"));
    updateSheetTotals();

    elSheetBackdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeOrderSheet() {
    elSheetBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    selectedProduct = null;
  }

  function updateSheetTotals() {
    if (!selectedProduct) return;
    elQtyValue.textContent = orderQty;
    elQtyMinus.disabled = orderQty <= 1;
    const total = (Number(selectedProduct.harga) || 0) * orderQty;
    elSubtotal.textContent = formatRupiah(total);
  }

  elQtyMinus.addEventListener("click", () => {
    if (orderQty > 1) {
      orderQty--;
      updateSheetTotals();
    }
  });

  elQtyPlus.addEventListener("click", () => {
    if (orderQty < 999) {
      orderQty++;
      updateSheetTotals();
    }
  });

  elQuickChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const val = chip.getAttribute("data-note");
      if (selectedQuickNote === val) {
        selectedQuickNote = "";
        chip.classList.remove("selected");
      } else {
        selectedQuickNote = val;
        elQuickChips.forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
      }
    });
  });

  elBtnSendWA.addEventListener("click", () => {
    if (!selectedProduct) return;

    const unit = selectedProduct.satuan || "pcs";
    const total = (Number(selectedProduct.harga) || 0) * orderQty;
    const customNote = elNoteInput.value.trim();

    let combinedNote = "";
    if (selectedQuickNote && customNote) {
      combinedNote = `${selectedQuickNote} — ${customNote}`;
    } else {
      combinedNote = selectedQuickNote || customNote;
    }

    let lines = [
      `Halo *${cfg.namaToko}*, saya mau pesan / tanya barang:`,
      ``,
      `• *Produk:* ${selectedProduct.nama}`,
      `• *Harga:* ${formatRupiah(selectedProduct.harga)} / ${unit}`,
      `• *Jumlah:* ${orderQty} ${unit}`,
      `• *Estimasi Total:* ${formatRupiah(total)}`
    ];

    if (combinedNote) {
      lines.push(`• *Catatan:* ${combinedNote}`);
    }

    lines.push(``, `Apakah barangnya masih ready?`);

    const waUrl = `https://wa.me/${cfg.nomorWA}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  });

  elBtnCloseSheet.addEventListener("click", closeOrderSheet);
  elSheetBackdrop.addEventListener("click", (e) => {
    if (e.target === elSheetBackdrop) closeOrderSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && elSheetBackdrop.classList.contains("is-open")) {
      closeOrderSheet();
    }
  });

  // 7. Live Search
  elSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    elClearSearch.classList.toggle("hidden", !searchQuery);
    renderProducts();
  });

  elClearSearch.addEventListener("click", () => {
    searchQuery = "";
    elSearchInput.value = "";
    elClearSearch.classList.add("hidden");
    elSearchInput.focus();
    renderProducts();
  });

  elBtnResetFilter.addEventListener("click", () => {
    searchQuery = "";
    activeCategory = "Semua";
    elSearchInput.value = "";
    elClearSearch.classList.add("hidden");
    renderCategoryPills();
    renderProducts();
  });

  elBtnRetry.addEventListener("click", loadProducts);

  // 8. Tombol Share Katalog (Web Share API + Fallback Copy Link)
  elBtnShare.addEventListener("click", async () => {
    const shareData = {
      title: `Katalog Harga ${cfg.namaToko}`,
      text: `Cek daftar harga barang terbaru di ${cfg.namaToko} lewat link ini:`,
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
        showToast("Gagal menyalin link katalog", "error");
      }
    }
  });

  // 9. Scroll-to-Top Floating Button
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 320) {
        elBtnScrollTop.classList.remove("hidden-btn");
      } else {
        elBtnScrollTop.classList.add("hidden-btn");
      }
    },
    { passive: true }
  );

  elBtnScrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Mulai aplikasi
  initStoreInfo();
  loadProducts();
});
