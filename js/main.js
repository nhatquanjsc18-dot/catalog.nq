(function () {
  "use strict";

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  navToggle.addEventListener("click", () => {
    const open = mobileNav.hasAttribute("hidden");
    if (open) { mobileNav.removeAttribute("hidden"); } else { mobileNav.setAttribute("hidden", ""); }
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mobileNav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { mobileNav.setAttribute("hidden", ""); navToggle.setAttribute("aria-expanded", "false"); }
  });

  document.getElementById("footerYear").textContent = new Date().getFullYear();

  // ---------- Data loading ----------
  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  Promise.all([
    loadJSON("data/brands.json"),
    loadJSON("data/featured.json"),
    loadJSON("data/customers.json"),
    loadJSON("data/products.json"),
  ]).then(([brands, featured, customers, products]) => {
    renderHeroStats(brands, products);
    renderCollections(brands);
    renderAboutChips(brands);
    renderFeatured(featured);
    renderLogos(customers);
    renderFooterCollections(brands);
    renderContactInfo();
  }).catch((err) => {
    console.error(err);
  });

  function renderHeroStats(brands, products) {
    document.getElementById("statProducts").textContent = products.length + "+";
    document.getElementById("statBrands").textContent = brands.length;
  }

  function renderCollections(brands) {
    const grid = document.getElementById("collectionsGrid");
    if (!brands.length) { grid.innerHTML = '<p class="empty-state">Chưa có dữ liệu bộ sưu tập.</p>'; return; }
    grid.innerHTML = brands.map((b) => `
      <a class="collection-card" href="catalog/catalog.html?brand=${encodeURIComponent(b.id)}" style="--c:${b.color}; --c-on:${b.on}">
        <span class="cc-count">${b.count} sản phẩm</span>
        <span class="cc-name">${escapeHtml(b.name)}</span>
        <span class="cc-meta">${escapeHtml(b.country)} · ${escapeHtml(b.category)}</span>
      </a>
    `).join("");
  }

  function renderAboutChips(brands) {
    const el = document.getElementById("aboutBrandChips");
    el.innerHTML = brands.map((b) => `<span class="chip" style="--c:${b.color}">${escapeHtml(b.name)}</span>`).join("");
  }

  function renderFeatured(featured) {
    const grid = document.getElementById("featuredGrid");
    if (!featured.length) { grid.innerHTML = '<p class="empty-state">Chưa có sản phẩm nổi bật.</p>'; return; }
    const brandColorMap = {
      mirka: ["#FDC100", "#141414"], devilbiss: ["#C4300E", "#FFFFFF"], anestiwata: ["#007C9C", "#FFFFFF"],
      dynabrade: ["#FF4712", "#FFFFFF"], binks: ["#0E3EA0", "#FFFFFF"], compact: ["#2D55AA", "#FFFFFF"],
      oem: ["#4A5568", "#FFFFFF"], prona: ["#0170C1", "#FFFFFF"], wagner: ["#FFCB00", "#141414"], tonghop: ["#2F7A4D", "#FFFFFF"],
    };
    grid.innerHTML = featured.map((p) => {
      const [c, cOn] = brandColorMap[p.brandId] || ["#005F92", "#FFFFFF"];
      const specEntries = Object.entries(p.specs || {}).slice(0, 2);
      return `
      <article class="product-card">
        <div class="product-card-thumb">
          ${p.img ? `<img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" loading="lazy">` : ""}
        </div>
        <div class="product-card-body">
          <span class="product-card-brand" style="--c:${c}; --c-on:${cOn}">${escapeHtml(p.brandId)}</span>
          <p class="product-card-name">${escapeHtml(p.name)}</p>
          ${specEntries.map(([k, v]) => `<p class="product-card-spec">${escapeHtml(k)}: <strong>${escapeHtml(v)}</strong></p>`).join("")}
        </div>
      </article>`;
    }).join("");
  }

  function renderLogos(customers) {
    const grid = document.getElementById("logosGrid");
    grid.innerHTML = customers.map((c) => `
      <div class="logo-item">
        <img src="img/logos/${encodeURIComponent(c.file)}" alt="${escapeHtml(c.name)}" loading="lazy">
      </div>
    `).join("");
  }

  function renderFooterCollections(brands) {
    const ul = document.getElementById("footerCollections");
    ul.innerHTML = brands.slice(0, 6).map((b) =>
      `<li><a href="catalog/catalog.html?brand=${encodeURIComponent(b.id)}">${escapeHtml(b.name)}</a></li>`
    ).join("");
  }

  function renderContactInfo() {
    const ul = document.getElementById("contactInfoList");
    ul.innerHTML = `
      <li><strong>Địa chỉ:</strong> 52-54 Đường số 8, Cư xá Chu Văn An, P. Bình Thạnh, TP.HCM</li>
      <li><strong>Văn phòng giao dịch:</strong> 10 Đường 18A, Khu phố 5, P. Bình Trưng, TP. Hồ Chí Minh</li>
      <li><strong>Hotline:</strong> <a href="tel:0908050415">0908.050.415</a> · <a href="tel:0907811767">0907.811.767</a></li>
      <li><strong>Email:</strong> <a href="mailto:info@nhatquan.vn">info@nhatquan.vn</a></li>
    `;
  }

  // ---------- Contact form (client-side validation only) ----------
  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  function setError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (message) {
      field.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
    } else {
      field.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById("cf-name").value.trim();
    if (!name) { setError("cf-name", "err-name", "Vui lòng nhập họ tên."); valid = false; }
    else { setError("cf-name", "err-name", ""); }

    const phone = document.getElementById("cf-phone").value.trim();
    if (!phone) { setError("cf-phone", "err-phone", "Vui lòng nhập số điện thoại."); valid = false; }
    else if (!/^[0-9+()\-.\s]{8,15}$/.test(phone)) { setError("cf-phone", "err-phone", "Số điện thoại không hợp lệ."); valid = false; }
    else { setError("cf-phone", "err-phone", ""); }

    const email = document.getElementById("cf-email").value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("cf-email", "err-email", "Email không hợp lệ."); valid = false; }
    else { setError("cf-email", "err-email", ""); }

    if (!valid) {
      formNote.textContent = "Vui lòng kiểm tra lại thông tin bên trên.";
      formNote.className = "form-note";
      return;
    }

    // NOTE: this form currently only validates client-side. Wire it to a real
    // backend/email service (see README) before relying on it to receive leads.
    formNote.textContent = "Cảm ơn bạn! Yêu cầu đã được ghi nhận (demo — chưa kết nối máy chủ gửi email thật).";
    formNote.className = "form-note success";
    form.reset();
  });
})();
