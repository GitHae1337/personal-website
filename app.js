// Shared renderers + state controllers for all site variations.

(function () {
  const S = window.SITE_CONTENT;

  // -------- Persistence --------
  const getLang = () => localStorage.getItem("kk_lang") || "en";
  const getTheme = () => localStorage.getItem("kk_theme") || "light";

  function applyLang(lang) {
    document.documentElement.setAttribute("data-lang", lang);
    localStorage.setItem("kk_lang", lang);
    // re-render all dynamic blocks
    renderAll();
    // update lang toggle
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langBtn === lang);
    });
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kk_theme", theme);
    document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeBtn === theme);
    });
  }
  window.SITE_STATE = { getLang, getTheme, applyLang, applyTheme };

  // -------- HTML helpers --------
  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else if (v != null) el.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }
  function slot(id) { return document.getElementById(id); }
  function setEl(id, node) {
    const el = slot(id);
    if (!el) return;
    el.innerHTML = "";
    if (Array.isArray(node)) node.forEach((n) => el.appendChild(n));
    else if (node) el.appendChild(node);
  }

  // -------- Renderers --------
  function renderHero(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <div class="hero-topline">
        <span><span class="brand-dot" style="display:inline-block;width:8px;height:8px;background:var(--cobalt);margin-right:8px;vertical-align:middle;border-radius:1px"></span>${L === "en" ? "index — personal" : "index — 개인"}</span>
        <span>${S.location[L]}</span>
      </div>
      <div class="hero-grid">
        <div class="hero-portrait">
          <img class="hero-portrait-img" src="${(window.__resources && window.__resources.portrait) || (window.SITE_PAGE && window.SITE_PAGE.multiPage ? "assets/portrait.jpeg" : "assets/portrait.jpeg")}" alt="${L === "en" ? "Portrait of Kitae Kim" : "김기태 초상"}" />
          <div class="hero-portrait-caption"><span>${L === "en" ? "Mt. Daedunsan · winter '25" : "대둔산 · 2025 겨울"}</span><span>4:5</span></div>
        </div>
        <div class="hero-text">
          <div>
            <h1 class="hero-name">${S.firstName[L]}<br><span class="accent-word">${S.lastName[L]}</span></h1>
            <p class="hero-tagline">${S.tagline[L]}</p>
          </div>
          <div class="status-card">
            ${S.status[L].map(s => `<div class="status-row"><span class="label">${s.label}</span><span>${s.value}</span></div>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderAbout(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <div class="section-head">
        <span class="section-num">01</span>
        <h2>${S.ui.pageLabels.about[L]}</h2>
      </div>
      <div class="about-grid">
        <div class="about">${S.about[L].map(p => `<p>${p}</p>`).join("")}</div>
        <div class="interests-card">
          <div class="label">${S.ui.pageLabels.interests[L]}</div>
          ${S.interests[L].map(it => `<div class="item">${it}</div>`).join("")}
        </div>
      </div>
    `;
  }

  function renderNews(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <div class="section-head">
        <span class="section-num">02</span>
        <h2>${S.ui.pageLabels.news[L]}</h2>
      </div>
      <div class="news-grid">
        ${S.news[L].map((n, i) => `
          <div class="news-item${i === 0 ? " hero" : ""}">
            <div class="date">${n.date}${i === 0 ? (L === "en" ? "  ·  latest" : "  ·  최신") : ""}</div>
            <div class="body">${n.body}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderPublications(elId, opts = {}) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    const U = S.ui;
    const baseHref = opts.baseHref || "";
    el.innerHTML = `
      ${opts.skipHead ? "" : `
      <div class="section-head">
        <span class="section-num">03</span>
        <h2>${U.pageLabels.publications[L]}</h2>
      </div>`}
      <ol class="pub-list">
        ${S.publications.map((p, i) => {
          const pdfBtn = p.pdf
            ? `<a class="pub-action pub-action--primary" href="${baseHref}${p.pdf}" target="_blank" rel="noopener">${U.downloadPdf[L]}</a>`
            : `<span class="pub-action pub-action--disabled">${U.noPdf[L]}</span>`;
          return `
          <li class="pub" data-pub-id="${p.id}">
            <div class="num">${String(S.publications.length - i).padStart(2, "0")}</div>
            <div class="pub-main">
              <h3 class="pub-title">${p.title}</h3>
              <div class="pub-authors">${p.authors.map(a => a.me ? `<span class="me">${a.name}</span>` : a.name).join(", ")}</div>
              <button class="pub-toggle" data-toggle="${p.id}" aria-expanded="false" aria-label="${U.readMore[L]}">
                <svg class="pub-toggle-glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <line class="bar-h" x1="1" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
                  <line class="bar-v" x1="8" y1="1" x2="8" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
                </svg>
              </button>
              <div class="pub-abstract" id="abs-${p.id}" hidden>
                <p>${p.abstract[L]}</p>
                ${(window.SITE_PAGE && window.SITE_PAGE.standalone) ? "" : `<div class="pub-actions">
                  <a class="pub-action" href="${baseHref}pub.html?id=${p.id}">${U.viewDetail[L]} →</a>
                </div>`}
              </div>
            </div>
            <div class="pub-meta">
              <span class="pub-venue">${p.venue}</span>
              ${p.venueNote ? `<span class="pub-venue-note">${p.venueNote}</span>` : ""}
            </div>
          </li>
        `;}).join("")}
      </ol>
    `;
    el.querySelectorAll(".pub-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggle;
        const panel = el.querySelector(`#abs-${id}`);
        const opening = panel.hasAttribute("hidden");
        if (opening) {
          panel.removeAttribute("hidden");
          btn.setAttribute("aria-expanded", "true");
          btn.setAttribute("aria-label", U.hideAbstract[getLang()]);
        } else {
          panel.setAttribute("hidden", "");
          btn.setAttribute("aria-expanded", "false");
          btn.setAttribute("aria-label", U.readMore[getLang()]);
        }
      });
    });
  }

  function renderExperience(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <div class="section-head">
        <span class="section-num">04</span>
        <h2>${S.ui.pageLabels.experience[L]}</h2>
      </div>
      <div class="exp-grid">
        ${S.experience[L].map(e => `
          <div class="exp-card">
            <div class="date">${e.date}</div>
            <div class="org">${e.org}</div>
            <div class="role">${e.role}</div>
            <div class="desc">${e.desc}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderContact(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <div class="contact">
        <div class="label">05 — ${S.ui.pageLabels.contact[L]}</div>
        <div class="headline">${S.ui.contactHeadline[L]}</div>
        <div class="contact-grid">
          ${S.links.map(l => {
            const isCopy = l.key === "email";
            const commonAttrs = `data-link-key="${l.key}" ${isCopy ? `data-copy="${l.copy}"` : `href="${l.href}" target="_blank" rel="noopener"`}`;
            const tag = isCopy ? "button" : "a";
            return `<${tag} class="contact-link" ${commonAttrs}>
              <span>${l.label}</span>
              <span>${isCopy ? (L === "en" ? "Copy ⎘" : "복사 ⎘") : "↗"}</span>
            </${tag}>`;
          }).join("")}
        </div>
      </div>
    `;
    el.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const v = btn.dataset.copy;
        try { await navigator.clipboard.writeText(v); } catch {}
        const span = btn.querySelector("span:last-child");
        const orig = span.textContent;
        span.textContent = S.ui.copied[getLang()];
        btn.style.background = "var(--cobalt-ink)";
        btn.style.color = "var(--cobalt)";
        setTimeout(() => {
          span.textContent = orig;
          btn.style.background = "";
          btn.style.color = "";
        }, 1400);
      });
    });
  }

  function renderFooter(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <span>${S.ui.footer[L]}</span>
      <span>${L === "en" ? "Last updated April 2026" : "최근 업데이트 2026.04"}</span>
    `;
  }

  // -------- Nav --------
  function renderNavLinks(elId, opts = {}) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    const current = opts.current || "";
    const isMulti = !!opts.multi;
    const itemsSingle = [
      { id: "about",        href: "#about" },
      { id: "news",         href: "#news" },
      { id: "publications", href: "#publications" },
      { id: "experience",   href: "#experience" },
      { id: "contact",      href: "#contact" },
    ];
    const itemsMulti = [
      { id: "home",         href: "index.html" },
      { id: "about",        href: "about.html" },
      { id: "publications", href: "publications.html" },
      { id: "experience",   href: "experience.html" },
      { id: "contact",      href: "contact.html" },
    ];
    const items = isMulti ? itemsMulti : itemsSingle;
    el.innerHTML = items.map(it => {
      const label = S.ui.sections[it.id][L];
      const active = (isMulti && current === it.id) ? " active" : "";
      return `<a href="${it.href}" class="${active.trim()}" data-nav="${it.id}">${label}</a>`;
    }).join("");
  }

  function renderBrand(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `<span class="brand-dot"></span><span>${S.nameShort[L]}</span>`;
  }

  function renderControls(elId) {
    const el = slot(elId); if (!el) return;
    const L = getLang();
    el.innerHTML = `
      <div class="ctrl-group" role="group" aria-label="language">
        <button class="ctrl-btn" data-lang-btn="en">EN</button>
        <button class="ctrl-btn" data-lang-btn="kr">KR</button>
      </div>
      <div class="ctrl-group" role="group" aria-label="theme">
        <button class="ctrl-btn" data-theme-btn="light">☀︎</button>
        <button class="ctrl-btn" data-theme-btn="dark">☾</button>
      </div>
    `;
    el.querySelectorAll("[data-lang-btn]").forEach(btn => {
      btn.addEventListener("click", () => applyLang(btn.dataset.langBtn));
      btn.classList.toggle("active", btn.dataset.langBtn === getLang());
    });
    el.querySelectorAll("[data-theme-btn]").forEach(btn => {
      btn.addEventListener("click", () => applyTheme(btn.dataset.themeBtn));
      btn.classList.toggle("active", btn.dataset.themeBtn === getTheme());
    });
  }

  // -------- Back to top --------
  function mountBackToTop() {
    if (document.querySelector(".back-to-top")) return;
    const btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = "↑";
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(btn);
    const onScroll = () => {
      btn.classList.toggle("visible", window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // -------- Master render --------
  function renderAll() {
    const cfg = window.SITE_PAGE || {};
    if (cfg.brand) renderBrand(cfg.brand);
    if (cfg.nav) renderNavLinks(cfg.nav, { multi: cfg.multiPage, current: cfg.current });
    if (cfg.controls) renderControls(cfg.controls);
    if (cfg.hero) renderHero(cfg.hero);
    if (cfg.about) renderAbout(cfg.about);
    if (cfg.news) renderNews(cfg.news);
    if (cfg.publications) renderPublications(cfg.publications, cfg.publicationsOpts || {});
    if (cfg.experience) renderExperience(cfg.experience);
    if (cfg.contact) renderContact(cfg.contact);
    if (cfg.footer) renderFooter(cfg.footer);
    if (cfg.onRender) cfg.onRender();
  }

  // -------- Boot --------
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getTheme());
    applyLang(getLang()); // triggers renderAll
    mountBackToTop();
  });

  window.SITE = { renderAll };
})();
