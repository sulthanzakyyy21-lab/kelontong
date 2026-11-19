// =========================================================
// UTILITAS GLOBAL: Format Rupiah, Parser Foto Google, Toast
// =========================================================

window.AppUtils = (() => {
  // Placeholder SVG ringan jika foto belum diisi atau link eksternal gagal dimuat
  const FALLBACK_IMAGE =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#efede7"/>
        <g fill="none" stroke="#b5afa3" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
          <rect x="115" y="125" width="170" height="135" rx="18"/>
          <circle cx="165" cy="172" r="14"/>
          <path d="M120 245l48-45 36 34 26-24 50 38"/>
        </g>
        <text x="200" y="302" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="#8f887b">Foto Produk</text>
      </svg>`
    );

  function formatRupiah(angka) {
    const num = Number(angka) || 0;
    return "Rp " + num.toLocaleString("id-ID");
  }

  /**
   * Auto-konversi tautan berbagi Google Drive menjadi URL gambar langsung
   * agar bisa dirender mulus di tag <img> tanpa perlu hosting file.
   */
  function parseImageUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return FALLBACK_IMAGE;
    const url = rawUrl.trim();
    if (!url) return FALLBACK_IMAGE;

    // Format 1: https://drive.google.com/file/d/{FILE_ID}/view?...
    const matchFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchFile && matchFile[1]) {
      return `https://lh3.googleusercontent.com/d/${matchFile[1]}`;
    }

    // Format 2: https://drive.google.com/open?id={FILE_ID} atau uc?id={FILE_ID}
    const matchQuery = url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
    if (matchQuery && matchQuery[1]) {
      return `https://lh3.googleusercontent.com/d/${matchQuery[1]}`;
    }

    // URL gambar langsung dari Google Images atau sumber lain
    return url;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let toastTimer = null;
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const styles = {
      success: "bg-[#143628] text-white border-[#1f543e]",
      error: "bg-red-700 text-white border-red-800",
      info: "bg-stone-900 text-white border-stone-800"
    };

    const icons = {
      success: `<svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
      error: `<svg class="w-4 h-4 text-red-200 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"/></svg>`,
      info: `<svg class="w-4 h-4 text-amber-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>`
    };

    container.innerHTML = `
      <div class="toast-item fixed bottom-6 left-1/2 z-[100] flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-xl text-sm font-medium max-w-[92vw] ${styles[type] || styles.info}">
        ${icons[type] || icons.info}
        <span class="truncate">${escapeHtml(message)}</span>
      </div>
    `;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      container.innerHTML = "";
    }, 2800);
  }

  return {
    FALLBACK_IMAGE,
    formatRupiah,
    parseImageUrl,
    escapeHtml,
    showToast
  };
})();
