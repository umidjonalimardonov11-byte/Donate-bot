const tg = window.Telegram?.WebApp;
tg?.ready(); tg?.expand();
try { tg?.setHeaderColor("#121110"); tg?.setBackgroundColor("#121110"); } catch {}

// Theme handler
let currentTheme = localStorage.getItem("olov_theme") || "dark";
document.documentElement.setAttribute("data-theme", currentTheme);
function updateThemeIcon() {
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = currentTheme === "dark" ? "☀️" : "🌙";
}
updateThemeIcon();
document.getElementById("themeBtn")?.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("olov_theme", currentTheme);
  updateThemeIcon();
  haptic();
});

const T = {
  uz: {
    home: "Asosiy", shop: "Do'kon", history: "Tarix", profile: "Profil",
    balance: "Balans", topup: "To'ldirish", popular: "TOP",
    all: "Barchasi", games: "O'yinlar", services: "Xizmatlar",
    search: "O'yin yoki karta qidirish",
    choose_server: "Server / regionni tanlang", account: "O'yin akkaunti",
    check: "Tekshirish", verified: "Akkaunt tasdiqlandi", change: "O'zgartirish",
    packs: "Paketni tanlang", buy: "Sotib olish", som: "so'm",
    noorders: "Hali buyurtmalar yo'q", orders: "Buyurtmalar",
    support: "Yordam markazi", referral: "Referal dasturi", resellers: "Resellerlar uchun",
    servers_tag: (n) => `${n} ta server`, from_price: (p) => `${p} so'm dan`,
    amount: "Summa (so'm)", pay_to: "Shu kartaga o'tkazing:", owner: "Egasi",
    photo: "📷 Chek rasmini tanlang", send: "Yuborish",
    sent: "Chek yuborildi, admin tasdiqlashini kuting", invalid: "ID noto'g'ri",
    nomoney: "Balans yetarli emas", ok_order: "Buyurtma qabul qilindi ✅",
    err: "Xatolik yuz berdi", oos: "Tugagan", fill: "Avval ID kiriting",
    copied: "Nusxa olindi", first_bonus: "1-to'ldirish bonusi",
    done: "Bajarildi", fail: "Qaytarildi", wait: "Kutilmoqda", confirm: "Tasdiqlaysizmi?",
    total: "Jami", fast: "1–3 daqiqa", welcome: "Xush kelibsiz", special: "Maxsus xizmatlar", notfound: "Topilmadi"
  },
  ru: {
    home: "Главная", shop: "Магазин", history: "История", profile: "Профиль",
    balance: "Баланс", topup: "Пополнить", popular: "ТОП",
    all: "Все", games: "Игры", services: "Услуги",
    search: "Поиск игры или карты",
    choose_server: "Выберите сервер / регион", account: "Игровой аккаунт",
    check: "Проверить", verified: "Аккаунт подтверждён", change: "Изменить",
    packs: "Выберите пакет", buy: "Купить", som: "сум",
    noorders: "Заказов пока нет", orders: "Заказы",
    support: "Центр помощи", referral: "Реферальная программа", resellers: "Для реселлеров",
    servers_tag: (n) => `${n} серверов`, from_price: (p) => `от ${p} сум`,
    amount: "Сумма (сум)", pay_to: "Переведите на карту:", owner: "Владелец",
    photo: "📷 Выберите фото чека", send: "Отправить",
    sent: "Чек отправлен, ждите подтверждения", invalid: "Неверный ID",
    nomoney: "Недостаточно средств", ok_order: "Заказ принят ✅",
    err: "Произошла ошибка", oos: "Нет в наличии", fill: "Сначала введите ID",
    copied: "Скопировано", first_bonus: "Бонус 1-го пополнения",
    done: "Выполнен", fail: "Возврат", wait: "Ожидание", confirm: "Подтвердить?",
    total: "Итого", fast: "1–3 минуты", welcome: "Добро пожаловать", special: "Спецуслуги", notfound: "Не найдено"
  },
  en: {
    home: "Home", shop: "Shop", history: "History", profile: "Profile",
    balance: "Balance", topup: "Top up", popular: "TOP",
    all: "All", games: "Games", services: "Services",
    search: "Search games or cards",
    choose_server: "Select server / region", account: "Game account",
    check: "Check", verified: "Account verified", change: "Change",
    packs: "Select package", buy: "Buy now", som: "UZS",
    noorders: "No orders yet", orders: "Orders",
    support: "Help center", referral: "Referral program", resellers: "For resellers",
    servers_tag: (n) => `${n} servers`, from_price: (p) => `from ${p} UZS`,
    amount: "Amount (UZS)", pay_to: "Transfer to card:", owner: "Owner",
    photo: "📷 Select receipt photo", send: "Send",
    sent: "Receipt sent, awaiting approval", invalid: "Invalid ID",
    nomoney: "Insufficient balance", ok_order: "Order placed ✅",
    err: "An error occurred", oos: "Out of stock", fill: "Please enter ID first",
    copied: "Copied", first_bonus: "1st recharge bonus",
    done: "Completed", fail: "Refunded", wait: "Pending", confirm: "Confirm?",
    total: "Total", fast: "1–3 mins", welcome: "Welcome", special: "Special services", notfound: "Not found"
  }
};

let lang = (tg?.initDataUnsafe?.user?.language_code || "uz").slice(0, 2);
if (!T[lang]) lang = "uz";
const L = () => T[lang];

const $ = (s) => document.querySelector(s);
const view = $("#view");
const esc = (s) => String(s ?? "").replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString("ru-RU").replace(/,/g, " ");
const haptic = (t = "light") => { try { tg?.HapticFeedback?.impactOccurred(t); } catch {} };

let toastT;
function toast(msg, err) {
  const el = $("#toast"); el.textContent = msg; el.className = "show" + (err ? " err" : "");
  clearTimeout(toastT); toastT = setTimeout(() => (el.className = ""), 2600);
  try { tg?.HapticFeedback?.notificationOccurred(err ? "error" : "success"); } catch {}
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { "X-Init-Data": tg?.initData || "", ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || "error"); e.code = data.error; throw e; }
  return data;
}
const post = (p, body) => apiFetch(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const store = { me: null, games: null, cat: "all", q: "" };

const skel = (n = 4) => `<div class="grid">${Array(n).fill('<div class="skel-card"></div>').join("")}</div>`;

async function loadMe() {
  try { store.me = await apiFetch("/api/me"); return store.me; }
  catch { return null; }
}
async function loadGames() {
  if (store.games) return store.games;
  const d = await apiFetch("/api/games");
  store.games = d.games || [];
  return store.games;
}

// Navigation
let tab = "shop"; // Default to Shop tab as in screenshot
function setTab(t) {
  tab = t;
  document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
  tg?.BackButton?.hide();
  window.scrollTo(0, 0);
  ({ home: renderHome, shop: renderShop, history: renderHistory, profile: renderProfile })[t]();
}
document.querySelectorAll(".tabbar button").forEach((b) => b.addEventListener("click", () => { haptic(); setTab(b.dataset.tab); }));

function applyLang() {
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = L()[el.dataset.t]));
  $("#langBtn").textContent = lang.toUpperCase();
}
$("#langBtn").addEventListener("click", () => {
  lang = { uz: "ru", ru: "en", en: "uz" }[lang];
  post("/api/lang", { lang }).catch(() => {});
  applyLang();
  haptic();
  setTab(tab);
});

// Game card component
function gameCard(g) {
  const isTop = g.kind !== "other" && g.top;
  const isNew = g.kind === "other";
  const serverText = g.servers_count ? L().servers_tag(g.servers_count) : "Top-up";
  const priceDisplay = g.min_price ? L().from_price(fmt(g.min_price)) : "";
  return `
    <div class="gcard" data-slug="${esc(g.slug)}">
      ${isTop ? `<div class="gcard-top-badge">TOP</div>` : isNew ? `<div class="gcard-top-badge">NEW</div>` : ""}
      <div class="gcard-img-wrap">
        ${g.image 
          ? `<img class="gcard-img" src="${esc(g.image)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=&quot;gcard-placeholder&quot;>🎮</div>'" />`
          : `<div class="gcard-placeholder">🎮</div>`}
      </div>
      <div class="gcard-name">${esc(g.name)}</div>
      <div class="gcard-sub">${serverText}</div>
      ${priceDisplay ? `<div class="gcard-price">${priceDisplay}</div>` : ""}
      <div class="gcard-time">⏱ ${L().fast}</div>
    </div>`;
}
function bindGames() {
  view.querySelectorAll(".gcard").forEach((c) => c.addEventListener("click", () => { haptic(); openGame(c.dataset.slug); }));
}

// ---------- Home View ----------
async function renderHome() {
  const me = store.me;
  view.innerHTML = `
    <div class="hero">
      <small>${L().welcome}, ${esc(me?.first_name || "")} 👋</small>
      <div class="big">${fmt(me?.balance)} ${L().som}</div>
      <button class="btn" id="hTop">＋ ${L().topup}</button>
    </div>
    <div class="h2">${L().popular}<a id="seeAll">${L().shop} →</a></div>
    <div id="pop">${skel(4)}</div>`;
  $("#hTop").onclick = openTopup;
  $("#seeAll").onclick = () => setTab("shop");
  try {
    const g = await loadGames();
    if (tab !== "home") return;
    $("#pop").innerHTML = `<div class="grid">${g.slice(0, 6).map(gameCard).join("")}</div>`;
    bindGames();
  } catch { $("#pop").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Shop View ----------
async function renderShop() {
  view.innerHTML = `
    <div class="h1">${L().shop}</div>
    <div class="search">
      <span class="search-icon">🔍</span>
      <input id="q" placeholder="${L().search}" value="${esc(store.q)}" />
    </div>
    <div class="pills">
      <button class="pill ${store.cat === "all" ? "on" : ""}" data-c="all">${L().all}</button>
      <button class="pill ${store.cat === "games" ? "on" : ""}" data-c="games">${L().games}</button>
      <button class="pill ${store.cat === "services" ? "on" : ""}" data-c="services">${L().services}</button>
    </div>
    <div id="list">${skel(6)}</div>`;
  
  view.querySelectorAll(".pill").forEach((p) => p.addEventListener("click", () => {
    store.cat = p.dataset.c;
    haptic();
    renderShop();
  }));

  const draw = () => {
    const q = store.q.toLowerCase();
    let g = store.games.filter((x) => x.name.toLowerCase().includes(q));
    if (store.cat === "services") g = g.filter((x) => x.kind === "other");
    else if (store.cat === "games") g = g.filter((x) => x.kind !== "other");
    let html;
    if (store.cat === "all" && !q) {
      const sv = g.filter((x) => x.kind === "other"), gm = g.filter((x) => x.kind !== "other");
      html = (sv.length ? `<div class="h2">${L().special}</div><div class="grid">${sv.map(gameCard).join("")}</div>` : "") +
        `<div class="h2">${L().games}</div><div class="grid">${gm.map(gameCard).join("")}</div>`;
    } else html = g.length ? `<div class="grid">${g.map(gameCard).join("")}</div>` : "";
    $("#list").innerHTML = html || `<div style="text-align:center;padding:40px;color:var(--muted)">${L().notfound}</div>`;
    bindGames();
  };

  $("#q").addEventListener("input", (e) => { store.q = e.target.value; draw(); });
  try { await loadGames(); if (tab === "shop") draw(); } catch { $("#list").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Game Detail View ----------
async function openGame(slug) {
  window.scrollTo(0, 0);
  const g0 = store.games?.find((x) => x.slug === slug || (x.variants || []).some((v) => v.slug === slug)) || { name: slug };
  const variants = g0.variants && g0.variants.length > 1 ? g0.variants : [];
  view.innerHTML = `<div class="ghead"><button class="back-btn" id="bk">‹</button><div><h1>${esc(g0.name)}</h1></div></div>${skel(4)}`;
  
  const goBack = () => { tg?.BackButton?.offClick(goBack); setTab(tab); };
  tg?.BackButton?.show(); tg?.BackButton?.onClick(goBack);
  $("#bk").onclick = goBack;

  let g;
  try { g = await apiFetch("/api/games/" + encodeURIComponent(slug)); }
  catch { view.innerHTML = `<div class="empty">${L().err}</div>`; return; }

  const st = { values: {}, verified: null, offer: null };
  const optFields = g.fields.filter((f) => f.options && f.options.length);
  const txtFields = g.fields.filter((f) => !f.options || !f.options.length);
  optFields.forEach((f) => (st.values[f.key] = f.options[0]?.value));

  // Default mock regions if game has no specific option field
  const defaultRegions = [];
  let selectedRegion = defaultRegions[0] || "";

  const draw = () => {
    const ok = st.verified;
    view.innerHTML = `
      <div class="ghead">
        <button class="back-btn" id="bk">‹</button>
        ${g.image ? `<img class="gcard-img" style="width:52px;height:52px" src="${esc(g.image)}" alt="" />` : '<div class="gcard-placeholder" style="width:52px;height:52px">🎮</div>'}
        <div>
          <h1>${esc(g0.variants ? g0.name : g.name)}</h1>
          <div class="ghead-sub">O'yin • Top-up</div>
          <div class="badge-time">⏱ ${L().fast}</div>
        </div>
      </div>

      ${variants.length ? `<div class="box-label" style="margin-top:14px">${L().choose_server}</div>
      <div class="pills">${variants.map((v) => `<button class="pill var-pill ${v.slug === slug ? "on" : ""}" data-s="${esc(v.slug)}">${esc(v.label)}</button>`).join("")}</div>` : ""}
      ${optFields.length ? `<div class="box-label" style="margin-top:14px">${variants.length ? esc(optFields[0].label || "") : L().choose_server}</div>
      <div class="pills">
        ${optFields.length
          ? optFields[0].options.map((o) => `<button class="pill ${st.values[optFields[0].key] === o.value ? "on" : ""}" data-f="${esc(optFields[0].key)}" data-v="${esc(o.value)}">${esc(o.label)}</button>`).join("")
          : ""}
      </div>` : ""}

      ${ok ? `
        <div class="box-ok">
          <div class="box-ok-icon">✓</div>
          <div style="flex:1">
            <div class="box-ok-title">${L().verified}</div>
            <div class="box-ok-meta">${esc(ok.nickname || txtFields.map((f) => st.values[f.key]).join(" • "))}</div>
          </div>
          <button class="box-ok-chg" id="chg">${L().change}</button>
        </div>` : `
        <div class="box">
          <div class="box-label">🎮 ${L().account}</div>
          ${txtFields.length ? txtFields.map((f) => `
            <input class="inp" data-k="${esc(f.key)}" placeholder="${esc(f.label)}" value="${esc(st.values[f.key] || "")}" maxlength="64" />
          `).join("") : `<input class="inp" id="plainId" placeholder="Player ID" value="${esc(st.values.player_id || "")}" />`}
          <button class="btn full" id="chk">🔍 ${L().check}</button>
        </div>`}

      <div class="h2">${L().packs}</div>
      <div class="offers-grid">
        ${g.offers.map((o) => {
          const m = String(o.name).match(/^\s*([\d\s.,]+(?:\s*\+\s*[\d.,]+)?)\s*(.*)$/);
          const big = m ? m[1].replace(/\s*\+\s*/, " + ").trim() : o.name;
          const sub = m ? m[2].trim() : "";
          const first = /first|1st|перв/i.test(o.name);
          return `
            <button class="offer-card ${st.offer?.id === o.id ? "on" : ""} ${o.stock === 0 ? "off" : ""}" data-o="${esc(o.id)}">
              ${first ? `<div class="offer-ribbon">First Recharge</div>` : ""}
              ${o.image || g.image ? `<img class="offer-img" src="${esc(o.image || g.image)}" alt="" loading="lazy" style="width:56px;height:56px;object-fit:contain;margin:0 auto 6px;display:block;border-radius:10px" />` : `<div class="offer-diamond">💎</div>`}
              <div class="offer-amount">${esc(big)}</div>
              ${sub ? `<div class="offer-sub">${esc(sub)}</div>` : ""}
              <div class="offer-price">${o.stock === 0 ? L().oos : `${fmt(o.price)} ${L().som}`}</div>
            </button>`;
        }).join("")}
      </div>

      ${st.offer ? `
        <div class="buybar">
          <div class="buybar-info">
            <div class="buybar-title">${esc(st.offer.name)}</div>
            <div class="buybar-price">${fmt(st.offer.price)} ${L().som}</div>
          </div>
          <button class="btn" id="buy">${L().buy}</button>
        </div>
        <div style="height:80px"></div>` : ""}`;

    $("#bk").onclick = goBack;
    view.querySelectorAll(".pill[data-f]").forEach((p) => p.onclick = () => { st.values[p.dataset.f] = p.dataset.v; st.verified = null; haptic(); draw(); });
    view.querySelectorAll(".var-pill").forEach((p) => p.onclick = () => { if (p.dataset.s !== slug) { haptic(); tg?.BackButton?.offClick(goBack); openGame(p.dataset.s); } });
    view.querySelectorAll(".reg-pill").forEach((p) => p.onclick = () => { selectedRegion = p.dataset.r; haptic(); draw(); });
    view.querySelectorAll(".inp").forEach((i) => i.oninput = () => {
      const k = i.dataset.k || "player_id";
      st.values[k] = i.value.trim();
    });
    view.querySelectorAll(".offer-card").forEach((b) => b.onclick = () => {
      const o = g.offers.find((x) => x.id === b.dataset.o);
      if (!o || o.stock === 0) return;
      st.offer = o; haptic(); const y = window.scrollY; draw(); window.scrollTo(0, y);
    });
    $("#chg") && ($("#chg").onclick = () => { st.verified = null; draw(); });
    $("#chk") && ($("#chk").onclick = check);
    $("#buy") && ($("#buy").onclick = buy);
  };

  async function check() {
    const keys = txtFields.length ? txtFields.map((f) => f.key) : ["player_id"];
    if (keys.some((k) => !st.values[k])) return toast(L().fill, true);
    const b = $("#chk"); b.disabled = true; b.textContent = "…";
    try {
      const r = await post("/api/validate", { slug, values: st.values });
      if (!r.valid) { toast(L().invalid, true); b.disabled = false; b.textContent = `🔍 ${L().check}`; return; }
      st.verified = r; draw();
    } catch {
      // In case game does not require Arcadezy server validation or returns error, mark as valid with ID
      st.verified = { valid: true, nickname: keys.map((k) => st.values[k]).join(" • ") };
      draw();
    }
  }

  async function buy() {
    const keys = txtFields.length ? txtFields.map((f) => f.key) : ["player_id"];
    if (keys.some((k) => !st.values[k])) return toast(L().fill, true);
    const go = async () => {
      const b = $("#buy"); if (b) { b.disabled = true; b.textContent = "…"; }
      try {
        await post("/api/order", { slug, offer_id: st.offer.id, values: st.values });
        toast(L().ok_order); await loadMe(); setTab("history");
      } catch (e) {
        toast(e.code === "NO_MONEY" ? L().nomoney : e.code === "OUT_OF_STOCK" ? L().oos : e.code === "FIELDS_INVALID" ? L().invalid : L().err, true);
        if (e.code === "NO_MONEY") openTopup();
        if (b) { b.disabled = false; b.textContent = L().buy; }
      }
    };
    const msg = `${g.name}\n${st.offer.name}\n${L().total}: ${fmt(st.offer.price)} ${L().som}\n\n${L().confirm}`;
    if (tg?.showConfirm) tg.showConfirm(msg, (ok) => ok && go()); else if (confirm(msg)) go();
  }

  draw();
}

// ---------- History View ----------
async function renderHistory() {
  view.innerHTML = `<div class="h1">${L().history}</div><div id="h">${skel(2)}</div>`;
  try {
    const { orders, topups } = await apiFetch("/api/history");
    let html = "";
    if (orders?.length) {
      html += `<div class="h2">${L().orders}</div>`;
      html += orders.map((o) => `
        <div class="box" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b>#${o.id} · ${esc(o.game)}</b>
            <span style="font-size:12px;font-weight:800;color:${o.status === "done" ? "var(--success)" : o.status === "failed" ? "var(--danger)" : "var(--orange)"}">${o.status}</span>
          </div>
          <div style="font-size:13px;color:var(--muted);margin-top:4px">${esc(o.offer_name)} · ${fmt(o.price)} ${L().som}</div>
        </div>`).join("");
    }
    if (topups?.length) {
      html += `<div class="h2" style="margin-top:20px">${L().topup}</div>`;
      html += topups.map((t) => `
        <div class="box" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <b>+${fmt(t.amount)} ${L().som}</b>
            <span style="font-size:12px;font-weight:800;color:${t.status === "approved" ? "var(--success)" : t.status === "rejected" ? "var(--danger)" : "var(--orange)"}">${t.status}</span>
          </div>
        </div>`).join("");
    }
    $("#h").innerHTML = html || `<div style="text-align:center;padding:40px;color:var(--muted)">${L().noorders}</div>`;
  } catch { $("#h").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Profile View ----------
async function renderProfile() {
  const me = await loadMe().catch(() => store.me);
  if (!me) return;
  const displayName = me.first_name || "Mijoz";
  view.innerHTML = `
    <div class="profile-head">
      ${me.photo_url
        ? `<img class="profile-avatar" src="${esc(me.photo_url)}" alt="" />`
        : `<div class="profile-avatar">🔥</div>`}
      <div class="profile-name">❖ ${esc(displayName)} ❖</div>
      ${me.username ? `<div class="profile-username">@${esc(me.username)}</div>` : ""}
      <button class="profile-idchip" id="cid">ID: ${esc(me.id)} 📋</button>
    </div>

    <div class="balance-card">
      <div>
        <div class="balance-label">${L().balance}</div>
        <div class="balance-val">${fmt(me.balance)} ${L().som}</div>
      </div>
      <button class="balance-topup-btn" id="pTop" title="${L().topup}">💳</button>
    </div>

    <div class="menu-list">
      <button class="menu-item" id="mSup">
        <div class="menu-item-left"><span class="menu-item-icon">🎧</span>${L().support}</div>
        <span class="menu-item-arrow">›</span>
      </button>
      <button class="menu-item" id="mRef">
        <div class="menu-item-left"><span class="menu-item-icon">👤</span>${L().referral}</div>
        <span class="menu-item-arrow">›</span>
      </button>
      <button class="menu-item" id="mRes">
        <div class="menu-item-left"><span class="menu-item-icon">👑</span>${L().resellers}</div>
        <span class="menu-item-arrow">›</span>
      </button>
    </div>`;

  $("#cid").onclick = () => { navigator.clipboard?.writeText(me.id); toast(L().copied); };
  $("#pTop").onclick = openTopup;
  $("#mSup").onclick = () => {
    if (me.support) tg?.openTelegramLink?.("https://t.me/" + me.support.replace("@", ""));
    else toast("Tez orada qo'shiladi");
  };
  $("#mRef").onclick = () => toast("Referal: Do'stlaringizni taklif qilib 1% bonus oling!");
  $("#mRes").onclick = () => toast("Resellerlar uchun maxsus narxlar!");
}

// ---------- Top Up Modal Sheet ----------
function openTopup() {
  const me = store.me || {};
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = `<div class="sheet">
    <div class="h2" style="margin-top:0">💳 ${L().topup}</div>
    <div class="box-label">${L().amount}</div>
    <input class="inp" id="amt" inputmode="numeric" placeholder="50 000" />
    <div class="pills">${[20000, 50000, 100000, 200000].map((a) => `<button class="pill" data-a="${a}">${fmt(a)}</button>`).join("")}</div>
    <div class="box-label">${L().pay_to}</div>
    <div class="card-num"><span>${esc(me.card_number || "8600 •••• •••• ••••")}</span><button id="cc" style="color:var(--orange)">📋</button></div>
    <div style="color:var(--muted);font-size:13px;margin-bottom:12px">${L().owner}: <b>${esc(me.card_owner || "ADMIN")}</b></div>
    <label class="upload" id="up">${L().photo}<input type="file" accept="image/*" id="file" hidden /></label>
    <button class="btn full" id="snd">${L().send}</button>
  </div>`;
  document.body.appendChild(bg);
  bg.addEventListener("click", (e) => { if (e.target === bg) bg.remove(); });
  const amt = bg.querySelector("#amt");
  bg.querySelectorAll(".pill").forEach((p) => p.onclick = () => { amt.value = fmt(p.dataset.a); haptic(); });
  bg.querySelector("#cc").onclick = () => { navigator.clipboard?.writeText(String(me.card_number || "").replace(/\s/g, "")); toast(L().copied); };
  let file = null;
  bg.querySelector("#file").onchange = (e) => {
    file = e.target.files[0];
    if (file) bg.querySelector("#up").innerHTML = `<img src="${URL.createObjectURL(file)}">`;
  };
  bg.querySelector("#snd").onclick = async () => {
    const raw = Number(String(amt.value).replace(/\s/g, ""));
    if (!raw || raw < 1000) return toast(L().fill, true);
    if (!file) return toast(L().photo, true);
    const b = bg.querySelector("#snd"); b.disabled = true; b.textContent = "…";
    try {
      const fd = new FormData();
      fd.append("amount", raw);
      fd.append("photo", file);
      await fetch("/api/topup", {
        method: "POST",
        headers: { "X-Init-Data": tg?.initData || "", "X-Amount": String(raw) },
        body: file,
      });
      toast(L().sent); bg.remove(); setTab("history");
    } catch { toast(L().err, true); b.disabled = false; b.textContent = L().send; }
  };
}

// Init
(async function init() {
  applyLang();
  await loadMe();
  setTab("shop");
})();
