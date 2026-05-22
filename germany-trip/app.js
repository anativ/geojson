(function () {
  "use strict";

  // Always cache-bust so a new commit to trip-data.json shows up immediately.
  const DATA_URL = "trip-data.json";
  const STORAGE_KEY = "germany-trip-data-v1";
  const OPEN_DAY_KEY = "germany-trip-open-day";

  const state = {
    data: null,
    activeTab: "overview",
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadData(forceFresh) {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && !forceFresh) {
      try {
        state.data = JSON.parse(cached);
        render();
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    try {
      const url = DATA_URL + "?t=" + Date.now();
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      state.data = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      render();
    } catch (err) {
      console.error("Failed to load trip data", err);
      if (!state.data) {
        renderError(err);
      }
    }
  }

  function renderError(err) {
    $("#brand-sub").textContent = "Offline";
    $("#content").innerHTML = `
      <div class="error-box">
        <h3>Couldn't load trip data</h3>
        <p>${escapeHtml(err.message || "Unknown error")}</p>
        <p style="font-size:13px;opacity:0.8">Connect to the internet and pull to refresh.</p>
      </div>
    `;
  }

  function render() {
    const d = state.data;
    if (!d) return;

    $("#brand-title").textContent = d.trip.title || "Germany Trip";
    $("#brand-sub").textContent = d.trip.dates || "";

    const main = $("#content");
    if (state.activeTab === "overview") main.innerHTML = renderOverview(d);
    else if (state.activeTab === "itinerary") main.innerHTML = renderItinerary(d);
    else if (state.activeTab === "recommendations") main.innerHTML = renderRecs(d);
    else if (state.activeTab === "tips") main.innerHTML = renderTips(d);

    if (state.activeTab === "itinerary") wireDayToggles();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderOverview(d) {
    const t = d.trip;
    const cities = (d.overview || [])
      .map(
        (c) => `
        <div class="city-tile">
          <div class="ico">${escapeHtml(c.icon || "📍")}</div>
          <div class="name">${escapeHtml(c.city)}</div>
          <div class="nights">${c.nights} night${c.nights === 1 ? "" : "s"}</div>
        </div>`
      )
      .join("");

    const totalDays = (d.itinerary || []).length;

    return `
      <div class="hero">
        <h1>${escapeHtml(t.title)}</h1>
        <div class="dates">${escapeHtml(t.dates)}</div>
        <div class="meta">${escapeHtml(t.subtitle || "")}</div>
      </div>

      <div class="section-title">Trip info</div>
      <div class="card">
        <div class="info-row"><span class="k">Travelers</span><span class="v">${escapeHtml(t.travelers || "—")}</span></div>
        <div class="info-row"><span class="k">Total days</span><span class="v">${totalDays}</span></div>
        <div class="info-row"><span class="k">Currency</span><span class="v">${escapeHtml(t.currency || "EUR")}</span></div>
        <div class="info-row"><span class="k">Language</span><span class="v">${escapeHtml(t.language || "German")}</span></div>
        <div class="info-row"><span class="k">Emergency</span><span class="v">${escapeHtml(t.emergency || "112")}</span></div>
        <div class="info-row"><span class="k">Data updated</span><span class="v"><span class="updated-pill">${escapeHtml(t.lastUpdated || "—")}</span></span></div>
      </div>

      <div class="section-title">Route — ${(d.overview || []).length} stops</div>
      <div class="cities-grid">${cities}</div>

      ${renderEssentials(d.essentials)}
    `;
  }

  function renderEssentials(ess) {
    if (!ess) return "";
    const pack = (ess.packing || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("");
    const docs = (ess.documents || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("");
    return `
      <div class="section-title">Packing</div>
      <div class="card"><ul class="bullet-list">${pack}</ul></div>
      <div class="section-title">Documents</div>
      <div class="card"><ul class="bullet-list">${docs}</ul></div>
    `;
  }

  function renderItinerary(d) {
    const openDay = parseInt(localStorage.getItem(OPEN_DAY_KEY) || "1", 10);
    const cards = (d.itinerary || [])
      .map((day) => {
        const isOpen = day.day === openDay;
        const activities = (day.activities || [])
          .map(
            (a) => `
            <div class="activity">
              <div class="activity-time">${escapeHtml(a.time || "")}</div>
              <div class="activity-content">
                <div class="activity-name">${escapeHtml(a.name || "")}</div>
                ${a.map ? `<a class="map-link" href="${escapeHtml(a.map)}" target="_blank" rel="noopener">📍 Open in Google Maps</a>` : ""}
              </div>
            </div>`
          )
          .join("");
        return `
          <div class="day-card${isOpen ? " open" : ""}" data-day="${day.day}">
            <button class="day-header" type="button">
              <div class="day-num">${day.day}</div>
              <div class="day-meta">
                <div class="day-title">${escapeHtml(day.title || "")}</div>
                <div class="day-sub">${escapeHtml(day.date || "")} • <span class="day-city">${escapeHtml(day.city || "")}</span></div>
              </div>
              <div class="chevron">▾</div>
            </button>
            <div class="day-body">
              ${day.summary ? `<div class="day-summary">${escapeHtml(day.summary)}</div>` : ""}
              ${activities}
              ${day.tips ? `<div class="tip-box">${escapeHtml(day.tips)}</div>` : ""}
            </div>
          </div>
        `;
      })
      .join("");
    return `
      <div class="section-title">14-day itinerary</div>
      ${cards}
    `;
  }

  function wireDayToggles() {
    $$(".day-card").forEach((card) => {
      const btn = card.querySelector(".day-header");
      btn.addEventListener("click", () => {
        const wasOpen = card.classList.contains("open");
        $$(".day-card").forEach((c) => c.classList.remove("open"));
        if (!wasOpen) {
          card.classList.add("open");
          localStorage.setItem(OPEN_DAY_KEY, card.dataset.day);
        } else {
          localStorage.setItem(OPEN_DAY_KEY, "0");
        }
      });
    });
  }

  function renderRecs(d) {
    const r = d.recommendations || {};
    const food = (r.food || [])
      .map(
        (f) => `
        <div class="rec-item">
          <div>
            <div class="rec-name">🍴 ${escapeHtml(f.name)}</div>
            <div class="rec-where">${escapeHtml(f.where || "")}</div>
          </div>
          ${f.map ? `<a class="map-link" href="${escapeHtml(f.map)}" target="_blank" rel="noopener">📍</a>` : ""}
        </div>`
      )
      .join("");

    const exp = (r.experiences || [])
      .map(
        (e) => `
        <div class="rec-item">
          <div>
            <div class="rec-name">✨ ${escapeHtml(e.name)}</div>
            <div class="rec-where">${escapeHtml(e.city || "")}</div>
          </div>
          ${e.map ? `<a class="map-link" href="${escapeHtml(e.map)}" target="_blank" rel="noopener">📍</a>` : ""}
        </div>`
      )
      .join("");

    const apps = (r.apps || [])
      .map(
        (a) => `
        <div class="rec-item">
          <div>
            <div class="rec-name">📱 ${escapeHtml(a.name)}</div>
            <div class="rec-where">${escapeHtml(a.purpose || "")}</div>
          </div>
        </div>`
      )
      .join("");

    return `
      <div class="section-title">Must-try food</div>
      <div class="card">${food || "<em>No items yet</em>"}</div>
      <div class="section-title">Top experiences</div>
      <div class="card">${exp || "<em>No items yet</em>"}</div>
      <div class="section-title">Useful apps</div>
      <div class="card">${apps || "<em>No items yet</em>"}</div>
    `;
  }

  function renderTips(d) {
    const tips = (d.tips || [])
      .map(
        (t) => `
        <div class="tip-card">
          <h3>${escapeHtml(t.title)}</h3>
          <p>${escapeHtml(t.body)}</p>
        </div>`
      )
      .join("");
    return `
      <div class="section-title">Practical tips</div>
      ${tips || "<em>No tips yet</em>"}
    `;
  }

  // Tab switching
  function wireTabs() {
    $$(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".tab").forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        state.activeTab = btn.dataset.tab;
        render();
      });
    });
  }

  function wireRefresh() {
    const btn = $("#refresh-btn");
    btn.addEventListener("click", async () => {
      btn.classList.add("spinning");
      await loadData(true);
      setTimeout(() => btn.classList.remove("spinning"), 400);
    });
  }

  // Init
  wireTabs();
  wireRefresh();
  loadData(false);

  // Re-fetch when app regains focus (returns from background)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadData(true);
  });
})();
