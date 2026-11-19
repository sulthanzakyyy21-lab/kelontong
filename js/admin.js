// =========================================================
// LOGIKA HALAMAN ADMIN TOKO (admin.html)
// Login Supabase Auth + CRUD Produk + One-Tap Toggle Ready/Habis
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.APP_CONFIG;
  const db = window.supabaseClient;
  const { FALLBACK_IMAGE, formatRupiah, parseImageUrl, escapeHtml, showToast } = window.AppUtils;

  // State
  let adminProducts = [];
  let adminSearch = "";
  let adminStatusFilter = "Semua";
  let editingId = null;
  let deletingId = null;

  // Views
  const viewLogin = document.getElementById("login-view");
  const viewDashboard = document.getElementById("dashboard-view");

  // Login elements
  const formLogin = document.getElementById("login-form");
  const inputEmail = document.getElementById("login-email");
  const inputPassword = document.getElementById("login-password");
  const btnTogglePass = document.getElementById("btn-toggle-pass");
  const btnLoginSubmit = document.getElementById("btn-login-submit");
  const elLoginError = document.getElementById("login-error");

  // Dashboard elements
  const elAdminStoreTitle = document.getElementById("admin-store-title");
  const elAdminEmail = document.getElementById("admin-user-email");
  const elStatTotal = document.getElementById("stat-total");
  const elStatReady = document.getElementById("stat-ready");
  const elStatHabis = document.getElementById("stat-habis");
  const elAdminSearch = document.getElementById("admin-search");
  const elAdminList = document.getElementById("admin-product-list");
  const elAdminEmpty = document.getElementById("admin-empty");
  const elFilterBtns = document.querySelectorAll(".admin-status-filter");

  // Buttons
  const btnLogout = document.getElementById("btn-logout");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnAddProduct = document.getElementById("btn-add-product");

  // Product Form Modal elements
  const modalProduct = document.getElementById("product-modal");
  const elModalTitle = document.getElementById("modal-title");
  const formProduct = document.getElementById("product-form");
  const fNama = document.getElementById("field-nama");
  const fKategori = document.getElementById("field-kategori");
  const fKategoriList = document.getElementById("kategori-suggestions");
  const fHarga = document.getElementById("field-harga");
  const fSatuan = document.getElementById("field-satuan");
  const fStatus = document.getElementById("field-status");
  const fFoto = document.getElementById("field-foto");
  const fPreviewImg = document.getElementById("foto-preview");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnSaveProduct = document.getElementById("btn-save-product");

  // Delete Confirmation Modal
  const modalDelete = document.getElementById("delete-modal");
  const elDeleteName = document.getElementById("delete-product-name");
  const btnCancelDelete = document.getElementById("btn-cancel-delete");
  const btnConfirmDelete = document.getElementById("btn-confirm-delete");

  if (elAdminStoreTitle) {
    elAdminStoreTitle.textContent = `Admin — ${cfg.namaToko}`;
  }

  // 1. Cek Sesi Login Supabase
  async function checkSession() {
    const { data } = await db.auth.getSession();
    handleAuthUI(data.session);

    db.auth.onAuthStateChange((_event, session) => {
      handleAuthUI(session);
    });
  }

  function handleAuthUI(session) {
    if (session && session.user) {
      viewLogin.classList.add("hidden");
      viewDashboard.classList.remove("hidden");
      elAdminEmail.textContent = session.user.email || "Admin";
      fetchAdminProducts();
    } else {
      viewDashboard.classList.add("hidden");
      viewLogin.classList.remove("hidden");
    }
  }

  // Toggle lihat password
  btnTogglePass.addEventListener("click", () => {
    const isPass = inputPassword.type === "password";
    inputPassword.type = isPass ? "text" : "password";
  });

  // Submit Login
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    elLoginError.classList.add("hidden");
    btnLoginSubmit.disabled = true;
    btnLoginSubmit.textContent = "Memeriksa akun...";

    try {
      const { error } = await db.auth.signInWithPassword({
        email: inputEmail.value.trim(),
        password: inputPassword.value
      });

      if (error) throw error;
      showToast("Berhasil masuk ke panel admin", "success");
      formLogin.reset();
    } catch (err) {
      elLoginError.textContent = "Email atau password salah. Pastikan akun sudah dibuat di Supabase Auth.";
      elLoginError.classList.remove("hidden");
    } finally {
      btnLoginSubmit.disabled = false;
      btnLoginSubmit.textContent = "Masuk Dashboard";
    }
  });

  // Logout
  btnLogout.addEventListener("click", async () => {
    await db.auth.signOut();
    showToast("Kamu sudah keluar dari akun admin", "info");
  });

  // 2. Fetch Data Produk untuk Admin
  async function fetchAdminProducts() {
    elAdminList.innerHTML = `
      <div class="space-y-3">
        <div class="skeleton h-20 w-full rounded-2xl"></div>
        <div class="skeleton h-20 w-full rounded-2xl"></div>
        <div class="skeleton h-20 w-full rounded-2xl"></div>
      </div>
    `;

    try {
      const { data, error } = await db
        .from(cfg.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      adminProducts = Array.isArray(data) ? data : [];
      updateStatsAndSuggestions();
      renderAdminList();
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat daftar produk", "error");
      elAdminList.innerHTML = "";
    }
  }

  function updateStatsAndSuggestions() {
    const total = adminProducts.length;
    const ready = adminProducts.filter((p) => (p.status || "Ready").toLowerCase() === "ready").length;
    const habis = total - ready;

    elStatTotal.textContent = total;
    elStatReady.textContent = ready;
    elStatHabis.textContent = habis;

    // Update datalist saran kategori
    const defaultCats = ["Sembako", "Minuman", "Makanan & Snack", "Kebersihan", "Gas & Galon", "Rokok", "Lainnya"];
    const dbCats = adminProducts.map((p) => (p.kategori || "").trim()).filter(Boolean);
    const mergedCats = Array.from(new Set([...defaultCats, ...dbCats]));
    fKategoriList.innerHTML = mergedCats
      .map((c) => `<option value="${escapeHtml(c)}"></option>`)
      .join("");
  }

  // 3. Render Daftar Produk Admin (Mobile-First)
  function renderAdminList() {
    const q = adminSearch.trim().toLowerCase();
    const filtered = adminProducts.filter((item) => {
      const isReady = (item.status || "Ready").toLowerCase() === "ready";
      const matchStatus =
        adminStatusFilter === "Semua" ||
        (adminStatusFilter === "Ready" && isReady) ||
        (adminStatusFilter === "Habis" && !isReady);

      const matchQuery =
        !q ||
        (item.nama || "").toLowerCase().includes(q) ||
        (item.kategori || "").toLowerCase().includes(q);

      return matchStatus && matchQuery;
    });

    if (filtered.length === 0) {
      elAdminList.innerHTML = "";
      elAdminEmpty.classList.remove("hidden");
      return;
    }

    elAdminEmpty.classList.add("hidden");

    elAdminList.innerHTML = filtered
      .map((item) => {
        const isReady = (item.status || "Ready").toLowerCase() === "ready";
        const imgUrl = parseImageUrl(item.foto_url);

        return `
          <div class="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-sm flex items-center gap-3">
            <img
              src="${escapeHtml(imgUrl)}"
              alt="${escapeHtml(item.nama)}"
              loading="lazy"
              onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
              class="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 ${
                isReady ? "" : "opacity-60 grayscale"
              }"
            />

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 truncate max-w-[120px]">
                  ${escapeHtml(item.kategori || "Umum")}
                </span>
              </div>
              <h3 class="text-sm font-bold text-stone-800 truncate">
                ${escapeHtml(item.nama)}
              </h3>
              <p class="text-sm font-extrabold text-[#143628]">
                ${formatRupiah(item.harga)}
                <span class="text-xs font-medium text-stone-500">/ ${escapeHtml(item.satuan || "pcs")}</span>
              </p>
            </div>

            <div class="flex flex-col items-end gap-2 shrink-0">
              <!-- One-Tap Toggle Ready/Habis -->
              <button
                type="button"
                data-toggle-id="${item.id}"
                title="Klik untuk ubah status Ready / Habis"
                class="tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  isReady
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-stone-100 text-stone-600 border-stone-300"
                }"
              >
                <span class="w-2 h-2 rounded-full ${isReady ? "bg-emerald-500" : "bg-red-400"}"></span>
                ${isReady ? "Ready" : "Habis"}
              </button>

              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  data-edit-id="${item.id}"
                  class="tactile p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
                  aria-label="Edit barang"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button
                  type="button"
                  data-delete-id="${item.id}"
                  class="tactile p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                  aria-label="Hapus barang"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // Bind aksi tombol
    elAdminList.querySelectorAll("[data-toggle-id]").forEach((btn) => {
      btn.addEventListener("click", () => toggleProductStatus(btn.getAttribute("data-toggle-id")));
    });

    elAdminList.querySelectorAll("[data-edit-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prod = adminProducts.find((p) => String(p.id) === btn.getAttribute("data-edit-id"));
        if (prod) openProductModal(prod);
      });
    });

    elAdminList.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prod = adminProducts.find((p) => String(p.id) === btn.getAttribute("data-delete-id"));
        if (prod) openDeleteModal(prod);
      });
    });
  }

  // 4. One-Tap Toggle Ready <-> Habis
  async function toggleProductStatus(id) {
    const prod = adminProducts.find((p) => String(p.id) === String(id));
    if (!prod) return;

    const currentReady = (prod.status || "Ready").toLowerCase() === "ready";
    const nextStatus = currentReady ? "Habis" : "Ready";

    // Optimistic update
    prod.status = nextStatus;
    updateStatsAndSuggestions();
    renderAdminList();

    try {
      const { error } = await db
        .from(cfg.tableName)
        .update({ status: nextStatus })
        .eq("id", prod.id);

      if (error) throw error;
      showToast(`${prod.nama} diubah jadi ${nextStatus}`, "success");
    } catch (err) {
      // Rollback jika gagal
      prod.status = currentReady ? "Ready" : "Habis";
      updateStatsAndSuggestions();
      renderAdminList();
      showToast("Gagal memperbarui status barang", "error");
    }
  }

  // 5. Modal Tambah & Edit Produk
  function openProductModal(product = null) {
    editingId = product ? product.id : null;
    elModalTitle.textContent = product ? "Edit Barang" : "Tambah Barang Baru";

    fNama.value = product ? product.nama || "" : "";
    fKategori.value = product ? product.kategori || "" : "";
    fHarga.value = product ? product.harga || "" : "";
    fSatuan.value = product ? product.satuan || "pcs" : "pcs";
    fStatus.value = product ? product.status || "Ready" : "Ready";
    fFoto.value = product ? product.foto_url || "" : "";

    updatePhotoPreview();
    modalProduct.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    modalProduct.classList.remove("is-open");
    document.body.style.overflow = "";
    editingId = null;
  }

  function updatePhotoPreview() {
    const parsed = parseImageUrl(fFoto.value);
    fPreviewImg.src = parsed;
    fPreviewImg.onerror = () => {
      fPreviewImg.src = FALLBACK_IMAGE;
    };
  }

  fFoto.addEventListener("input", updatePhotoPreview);

  // Quick fill satuan chips
  document.querySelectorAll(".satuan-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      fSatuan.value = chip.textContent.trim();
    });
  });

  formProduct.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      nama: fNama.value.trim(),
      kategori: fKategori.value.trim() || "Umum",
      harga: parseInt(fHarga.value, 10) || 0,
      satuan: fSatuan.value.trim() || "pcs",
      status: fStatus.value || "Ready",
      foto_url: fFoto.value.trim() || null
    };

    if (!payload.nama || payload.harga < 0) {
      showToast("Nama barang dan harga wajib diisi", "error");
      return;
    }

    btnSaveProduct.disabled = true;
    btnSaveProduct.textContent = "Menyimpan...";

    try {
      if (editingId) {
        const { error } = await db
          .from(cfg.tableName)
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        showToast("Data barang berhasil diperbarui!", "success");
      } else {
        const { error } = await db.from(cfg.tableName).insert([payload]);
        if (error) throw error;
        showToast("Barang baru berhasil ditambahkan!", "success");
      }

      closeProductModal();
      await fetchAdminProducts();
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan: " + (err.message || "cek izin RLS"), "error");
    } finally {
      btnSaveProduct.disabled = false;
      btnSaveProduct.textContent = "Simpan Barang";
    }
  });

  btnAddProduct.addEventListener("click", () => openProductModal(null));
  btnCloseModal.addEventListener("click", closeProductModal);
  modalProduct.addEventListener("click", (e) => {
    if (e.target === modalProduct) closeProductModal();
  });

  // 6. Modal Konfirmasi Hapus
  function openDeleteModal(product) {
    deletingId = product.id;
    elDeleteName.textContent = product.nama;
    modalDelete.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeDeleteModal() {
    modalDelete.classList.remove("is-open");
    document.body.style.overflow = "";
    deletingId = null;
  }

  btnCancelDelete.addEventListener("click", closeDeleteModal);
  modalDelete.addEventListener("click", (e) => {
    if (e.target === modalDelete) closeDeleteModal();
  });

  btnConfirmDelete.addEventListener("click", async () => {
    if (!deletingId) return;
    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = "Menghapus...";

    try {
      const { error } = await db.from(cfg.tableName).delete().eq("id", deletingId);
      if (error) throw error;

      showToast("Barang berhasil dihapus", "success");
      closeDeleteModal();
      await fetchAdminProducts();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus barang", "error");
    } finally {
      btnConfirmDelete.disabled = false;
      btnConfirmDelete.textContent = "Ya, Hapus";
    }
  });

  // 7. Filter & Search Admin
  elAdminSearch.addEventListener("input", (e) => {
    adminSearch = e.target.value;
    renderAdminList();
  });

  elFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      adminStatusFilter = btn.getAttribute("data-status");
      elFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderAdminList();
    });
  });

  btnRefresh.addEventListener("click", () => {
    fetchAdminProducts();
    showToast("Data disegarkan", "info");
  });

  checkSession();
});
