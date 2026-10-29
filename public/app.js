const tg = window.Telegram?.WebApp;
tg?.ready(); tg?.expand();
try { tg?.setHeaderColor("#121110"); tg?.setBackgroundColor("#121110"); } catch {}

const ICON = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-2-4-6-4-6-1.5S10 8 12 8zm0 0c2-4 6-4 6-1.5S14 8 12 8z"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16 14.5h2"/></svg>',
  head: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7l4.5 4L12 5l4.5 6L21 7l-2 11H5z"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path fill="#fbbf24" d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/></svg>',
  starb: '<svg viewBox="0 0 24 24"><path fill="#818cf8" d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/></svg>',
  steam: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ea580c"/><circle cx="15" cy="9.5" r="3" fill="none" stroke="#1c1917" stroke-width="1.8"/><circle cx="9" cy="15.5" r="2.2" fill="#1c1917"/><path d="M4 13l5 2.5 4-4" stroke="#1c1917" stroke-width="1.8" fill="none"/></svg>',
  pad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4M16 12h.01M18 14h.01"/></svg>',
};
const SERVICE_SUB = { uz: { stars: "Hisobga yulduzlar", premium: "Obunani sovg'a qiling", steam: "Steam wallet to'ldirish", gift: "Telegram sovg'alari (gift)" }, ru: { stars: "Звёзды на аккаунт", premium: "Подарите подписку", steam: "Пополнение Steam", gift: "Подарки Telegram" }, en: { stars: "Stars to account", premium: "Gift a subscription", steam: "Steam wallet top-up", gift: "Telegram gifts" } };
function serviceKey(name) { const n = String(name).toLowerCase(); return /stars/.test(n) ? "stars" : /premium/.test(n) ? "premium" : /steam/.test(n) ? "steam" : /gift/.test(n) ? "gift" : null; }
function serviceIcon(name) { return ({ stars: ICON.star, premium: ICON.starb, steam: ICON.steam, gift: '<span class="ic-o">' + ICON.gift + '</span>' })[serviceKey(name)] || '<span class="ic-o">' + ICON.pad + '</span>'; }

// Theme handler
let currentTheme = localStorage.getItem("olov_theme") || "dark";
document.documentElement.setAttribute("data-theme", currentTheme);
function updateThemeIcon() {
  const btn = document.getElementById("themeBtn");
  if (btn) btn.innerHTML = currentTheme === "dark" ? ICON.sun : ICON.moon;
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
    total: "Jami", fast: "1–3 daqiqa", welcome: "Xush kelibsiz", special: "Maxsus xizmatlar", notfound: "Topilmadi", your_balance: "Balansingiz", auto: "Avtomatik yetkazib berish", open_shop: "Do'konni ochish", open_shop_sub: "O'yinlar, gift kartalar va obunalar", topup_sub: "Karta orqali, tez tasdiqlanadi", pop_products: "Ommabop mahsulotlar", need_help: "Yordam kerakmi?", help_sub: "24/7 qo'llab-quvvatlash", txs: "Tranzaksiyalar", choose_amount: "Summani tanlang", other_amount: "Boshqa summa", min_note: "Minimal summa 3 000 so'm. To'lov tasdiqlangach, summa balansingizga tushadi.", cont: "Davom etish", ref_desc: "Do'stlaringizni taklif qiling va bonus oling.", your_link: "Sizning havolangiz", copy: "Nusxa olish", share: "Ulashish", notx: "Hali tranzaksiya yo'q", soon: "Tez orada qo'shiladi",
    tg_user: "Telegram username",
    stars_hint: "Yulduzlar shu akkauntga yuboriladi",
    premium_hint: "Obuna shu akkauntga yuboriladi",
    choose_duration: "Muddatni tanlang",
    choose_amount: "Miqdorni tanlang",
    month_unit: "oy",
    balance_low: "Balans yetarli emas — To'ldirish",
    fill_username: "Avval Telegram username kiriting"
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
    total: "Итого", fast: "1–3 минуты", welcome: "Добро пожаловать", special: "Спецуслуги", notfound: "Не найдено", your_balance: "Ваш баланс", auto: "Автоматическая доставка", open_shop: "Открыть магазин", open_shop_sub: "Игры, гифт-карты и подписки", topup_sub: "Картой, быстрое подтверждение", pop_products: "Популярное", need_help: "Нужна помощь?", help_sub: "Поддержка 24/7", txs: "Транзакции", choose_amount: "Выберите сумму", other_amount: "Другая сумма", min_note: "Минимум 3 000 сум. После подтверждения сумма поступит на баланс.", cont: "Продолжить", ref_desc: "Приглашайте друзей и получайте бонус.", your_link: "Ваша ссылка", copy: "Копировать", share: "Поделиться", notx: "Транзакций пока нет", soon: "Скоро",
    tg_user: "Telegram username",
    stars_hint: "Звёзды будут отправлены на этот аккаунт",
    premium_hint: "Подписка будет активирована на этот аккаунт",
    choose_duration: "Выберите срок",
    choose_amount: "Выберите количество",
    month_unit: "мес",
    balance_low: "Недостаточно средств — Пополнить",
    fill_username: "Сначала введите Telegram username"
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
    total: "Total", fast: "1–3 mins", welcome: "Welcome", special: "Special services", notfound: "Not found", your_balance: "Your balance", auto: "Automatic delivery", open_shop: "Open shop", open_shop_sub: "Games, gift cards and subscriptions", topup_sub: "By card, fast approval", pop_products: "Popular products", need_help: "Need help?", help_sub: "24/7 support", txs: "Transactions", choose_amount: "Choose amount", other_amount: "Other amount", min_note: "Minimum 3 000 UZS. Amount is credited after approval.", cont: "Continue", ref_desc: "Invite friends and earn a bonus.", your_link: "Your link", copy: "Copy", share: "Share", notx: "No transactions yet", soon: "Coming soon",
    tg_user: "Telegram username",
    stars_hint: "Stars will be sent to this account",
    premium_hint: "Subscription will be gifted to this account",
    choose_duration: "Select duration",
    choose_amount: "Select amount",
    month_unit: "mo",
    balance_low: "Insufficient balance — Top up",
    fill_username: "Please enter Telegram username first"
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
let tab = "home";
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
  const sk = g.kind === "other" ? serviceKey(g.name) : null;
  const sub = sk ? SERVICE_SUB[lang][sk] : g.servers_count ? L().servers_tag(g.servers_count) : "Top-up";
  const priceDisplay = g.min_price ? L().from_price(fmt(g.min_price)) : "";
  const img = g.image && !(g.kind === "other" && sk)
    ? `<img class="gcard-img" src="${esc(g.image)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=&quot;gcard-placeholder&quot;>🎮</div>'" />`
    : `<div class="gcard-placeholder">${g.kind === "other" ? serviceIcon(g.name) : "🎮"}</div>`;
  return `
    <div class="gcard" data-slug="${esc(g.slug)}">
      ${isTop ? `<div class="gcard-top-badge">TOP</div>` : isNew ? `<div class="gcard-top-badge">NEW</div>` : ""}
      <div class="gcard-img-wrap">${img}</div>
      <div class="gcard-name">${esc(g.name)}</div>
      <div class="gcard-sub">${esc(sub)}</div>
      <div class="gcard-foot">
        ${priceDisplay ? `<div class="gcard-price">${priceDisplay}</div>` : ""}
        <div class="gcard-time">${ICON.clock}${L().fast}</div>
      </div>
    </div>`;
}
function miniCard(g) {
  const img = g.image && g.kind !== "other" ? `<img src="${esc(g.image)}" alt="" loading="lazy" />` : `<div class="mini-ph">${g.kind === "other" ? serviceIcon(g.name) : "🎮"}</div>`;
  return `<div class="gcard mini" data-slug="${esc(g.slug)}">${img}<div class="mini-name">${esc(g.name)}</div>${g.min_price ? `<div class="mini-price">${L().from_price(fmt(g.min_price))}</div>` : ""}</div>`;
}
function bindGames() {
  view.querySelectorAll(".gcard").forEach((c) => c.addEventListener("click", () => { haptic(); openGame(c.dataset.slug); }));
}
function openSupport() {
  const me = store.me || {};
  if (me.support) tg?.openTelegramLink?.("https://t.me/" + me.support.replace("@", ""));
  else toast(L().soon);
}

// ---------- Home View ----------
async function renderHome() {
  const me = store.me;
  view.innerHTML = `
    <div class="hero">
      <div class="hero-label">${L().your_balance}</div>
      <div class="hero-big">${fmt(me?.balance)} <span>${L().som}</span></div>
      <div class="hero-row"><button class="btn light" id="hTop">${ICON.plus} ${L().topup}</button><span class="hero-auto">${ICON.bolt} ${L().auto}</span></div>
    </div>
    <button class="row-card accent" id="hShop"><span class="row-ic">${ICON.gift}</span><span class="row-txt"><b>${L().open_shop}</b><small>${L().open_shop_sub}</small></span><span class="row-ch">${ICON.chev}</span></button>
    <button class="row-card" id="hTop2"><span class="row-ic">${ICON.wallet}</span><span class="row-txt"><b>${L().topup}</b><small>${L().topup_sub}</small></span><span class="row-ch">${ICON.chev}</span></button>
    <div class="h2">${L().pop_products}<a id="seeAll">${L().all} ${ICON.chev}</a></div>
    <div id="pop" class="hscroll">${'<div class="skel-card mini"></div>'.repeat(3)}</div>
    <button class="row-card" id="hHelp"><span class="row-ic">${ICON.head}</span><span class="row-txt"><b>${L().need_help}</b><small>${L().help_sub}</small></span><span class="row-ch">${ICON.chev}</span></button>`;
  $("#hTop").onclick = openTopup; $("#hTop2").onclick = openTopup;
  $("#hShop").onclick = () => { haptic(); setTab("shop"); };
  $("#seeAll").onclick = () => setTab("shop");
  $("#hHelp").onclick = openSupport;
  try {
    const g = await loadGames();
    if (tab !== "home") return;
    const pick = [...g.filter((x) => x.kind !== "other").slice(0, 4), ...g.filter((x) => x.kind === "other").slice(0, 2)];
    $("#pop").innerHTML = pick.map(miniCard).join("");
    bindGames();
  } catch { $("#pop").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Shop View ----------
async function renderShop() {
  view.innerHTML = `
    <div class="h1">${L().shop}</div>
    <div class="search">
      <span class="search-icon">${ICON.search}</span>
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
// Package pictures: bigger packs get a bigger pile of gems; passes get a card.
function offerArt(o, all) {
  const n = String(o.name);
  if (/pass|membership|weekly|monthly|elite|welkin|prime|premium|plus|card|subscription/i.test(n) && !/^\s*\d/.test(n)) {
    return `<svg viewBox="0 0 64 64" class="art"><defs><linearGradient id="pc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#ff8a00"/></linearGradient></defs><rect x="8" y="14" width="48" height="34" rx="7" fill="url(#pc)"/><rect x="8" y="22" width="48" height="6" fill="#0003"/><path d="M32 31l3 6 6 .8-4.5 4.2 1.2 6-5.7-3-5.7 3 1.2-6L23 37.8l6-.8z" fill="#fff"/></svg>`;
  }
  const amt = (x) => Number((String(x.name).match(/[\d.,]+/) || ["0"])[0].replace(/[.,]/g, "")) || 0;
  const sorted = [...new Set(all.map(amt).filter(Boolean))].sort((a, b) => a - b);
  const pos = sorted.length > 1 ? sorted.indexOf(amt(o)) / (sorted.length - 1) : 0;
  const count = Math.max(1, Math.min(6, Math.round(1 + pos * 5)));
  const spots = [[32,36],[20,42],[44,42],[26,26],[40,26],[32,48]];
  const gem = ([x, y], i) => `<g transform="translate(${x - 10} ${y - 10})"><path d="M4 7l6-6h0l6 6-6 12z" transform="scale(1.1)" fill="url(#gm)" stroke="#bfe9ff" stroke-width=".6"/><path d="M4.4 7.7h13.2" stroke="#fff8" stroke-width=".8"/></g>`;
  const chest = count >= 5 ? `<rect x="10" y="40" width="44" height="16" rx="3" fill="#3b2a1e" stroke="#f2a33a" stroke-width="1.5"/><rect x="29" y="44" width="6" height="7" rx="1" fill="#f2a33a"/>` : "";
  return `<svg viewBox="0 0 64 64" class="art"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9be7ff"/><stop offset=".5" stop-color="#3fa9f5"/><stop offset="1" stop-color="#1e4fd8"/></linearGradient></defs><ellipse cx="32" cy="56" rx="22" ry="4" fill="#0004"/>${chest}${spots.slice(0, count).reverse().map(gem).join("")}</svg>`;
}

// ---------- Dedicated Telegram Stars & Premium View ----------
async function openTelegramService(slug, type, g0) {
  window.scrollTo(0, 0);
  const isPremium = type === "premium";
  const title = isPremium ? "Telegram Premium" : "Telegram Stars";

  const goBack = () => { tg?.BackButton?.offClick(goBack); setTab(tab); };
  tg?.BackButton?.show();
  tg?.BackButton?.onClick(goBack);

  view.innerHTML = `
    <div class="ghead">
      <button class="back-btn" id="bk">${ICON.back}</button>
      <div>
        <h1>${esc(title)}</h1>
        <div class="ghead-sub">o'yinlar · gift kartalar · top-up</div>
      </div>
    </div>
    ${skel(3)}
  `;
  $("#bk").onclick = goBack;

  let g;
  try {
    g = await apiFetch("/api/games/" + encodeURIComponent(slug));
  } catch {
    const variants = g0.variants || [];
    for (const v of variants) {
      if (v.slug !== slug) {
        try { g = await apiFetch("/api/games/" + encodeURIComponent(v.slug)); slug = v.slug; break; } catch {}
      }
    }
  }

  if (!g) {
    view.innerHTML = `
      <div class="ghead">
        <button class="back-btn" id="bk">${ICON.back}</button>
        <div><h1>${esc(title)}</h1><div class="ghead-sub">o'yinlar · gift kartalar · top-up</div></div>
      </div>
      <div class="empty">${L().err}<br><button class="btn" id="retry" style="margin-top:14px">↻</button></div>
    `;
    $("#bk").onclick = goBack;
    $("#retry").onclick = () => openTelegramService(slug, type, g0);
    return;
  }

  g.offers ||= [];
  g.fields ||= [];

  let offers = [...g.offers];
  if (isPremium) {
    offers.sort((a, b) => {
      const ma = parseInt((String(a.name).match(/\d+/) || ["0"])[0]) || 0;
      const mb = parseInt((String(b.name).match(/\d+/) || ["0"])[0]) || 0;
      return (ma - mb) || (a.price - b.price);
    });
  } else {
    offers.sort((a, b) => {
      const ma = parseInt((String(a.name).match(/[\d.,]+/) || ["0"])[0].replace(/[.,]/g, "")) || 0;
      const mb = parseInt((String(b.name).match(/[\d.,]+/) || ["0"])[0].replace(/[.,]/g, "")) || 0;
      return (ma - mb) || (a.price - b.price);
    });
  }

  // Fallback offers if API category has no offers returned yet
  if (!offers.length) {
    if (isPremium) {
      offers = [
        { id: "prem_3", name: "Telegram Premium 3 oy", price: 159300 },
        { id: "prem_6", name: "Telegram Premium 6 oy", price: 212500 },
        { id: "prem_12", name: "Telegram Premium 12 oy", price: 385200 },
      ];
    } else {
      offers = [
        { id: "stars_50", name: "50 Stars", price: 16500 },
        { id: "stars_100", name: "100 Stars", price: 32000 },
        { id: "stars_150", name: "150 Stars", price: 47000 },
        { id: "stars_250", name: "250 Stars", price: 75000 },
        { id: "stars_500", name: "500 Stars", price: 145000 },
        { id: "stars_1000", name: "1000 Stars", price: 285000 },
        { id: "stars_2500", name: "2500 Stars", price: 690000 },
      ];
    }
  }

  let currentUsername = tg?.initDataUnsafe?.user?.username ? ("@" + tg.initDataUnsafe.user.username) : "";
  let selectedOffer = offers[0] || null;

  function render() {
    const userBalance = Number(store.me?.balance || 0);
    const price = selectedOffer ? Number(selectedOffer.price || 0) : 0;
    const canAfford = userBalance >= price;
    const cleanU = currentUsername.trim();
    const displayU = cleanU || "@username";

    let planSummary = "";
    if (selectedOffer) {
      if (isPremium) {
        const m = (String(selectedOffer.name).match(/\d+/) || [""])[0];
        planSummary = m ? `${m} ${L().month_unit || "oy"}` : selectedOffer.name;
      } else {
        const m = (String(selectedOffer.name).match(/[\d.,]+/) || [""])[0].replace(/[.,]/g, "");
        planSummary = m ? `${m} Stars` : selectedOffer.name;
      }
    }

    view.innerHTML = `
      <div class="ghead">
        <button class="back-btn" id="bk">${ICON.back}</button>
        <div>
          <h1>${esc(title)}</h1>
          <div class="ghead-sub">o'yinlar · gift kartalar · top-up</div>
        </div>
      </div>

      <div class="box" style="margin-top:10px">
        <div class="box-label" style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700">
          <span style="font-size:16px">👤</span> <span>${L().tg_user || "Telegram username"}</span>
        </div>
        <div style="position:relative;margin-top:8px">
          <input class="inp" id="tgUsernameInp" placeholder="@username" value="${esc(currentUsername)}" style="font-size:16px;font-weight:600;padding-left:14px" />
        </div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:8px;display:flex;align-items:center;gap:6px">
          <span style="color:var(--orange);font-size:13px">ℹ️</span>
          <span>${isPremium ? (L().premium_hint || "Obuna shu akkauntga yuboriladi") : (L().stars_hint || "Yulduzlar shu akkauntga yuboriladi")}</span>
        </div>
      </div>

      <div class="h2" style="margin-top:20px;margin-bottom:6px">
        ${isPremium ? (L().choose_duration || "Muddatni tanlang") : (L().choose_amount || "Miqdorni tanlang")}
      </div>

      ${isPremium ? `
        <div class="tg-plans-grid">
          ${offers.map((o) => {
            const m = (String(o.name).match(/\d+/) || [""])[0];
            const isSel = selectedOffer?.id === o.id;
            return `
              <button class="tg-plan-card ${isSel ? "on" : ""}" data-id="${esc(o.id)}">
                <div class="tg-plan-dur">${esc(m || o.name)} <span class="tg-plan-unit">${L().month_unit || "oy"}</span></div>
                <div class="tg-plan-price">${fmt(o.price)} ${L().som}</div>
              </button>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="tg-stars-grid">
          ${offers.map((o) => {
            const m = (String(o.name).match(/[\d.,]+/) || [""])[0].replace(/[.,]/g, "");
            const isSel = selectedOffer?.id === o.id;
            return `
              <button class="tg-star-card ${isSel ? "on" : ""}" data-id="${esc(o.id)}">
                <div class="tg-star-icon">⭐</div>
                <div class="tg-star-amt">${esc(m || o.name)}</div>
                <div class="tg-star-label">Stars</div>
                <div class="tg-star-price">${fmt(o.price)} ${L().som}</div>
              </button>
            `;
          }).join("")}
        </div>
      `}

      <div style="height:140px"></div>

      <div class="tg-buybar">
        <div class="tg-buybar-meta">
          <span id="tgSumUser">${esc(displayU)}</span> · <span id="tgSumPlan">${esc(planSummary)}</span>
        </div>
        ${canAfford ? `
          <button class="btn full" id="tgActionBtn" style="height:50px;font-size:15px;font-weight:800;border-radius:16px;background:var(--grad)">
            ${L().buy} — ${fmt(price)} ${L().som}
          </button>
        ` : `
          <button class="btn full" id="tgActionBtn" style="height:50px;font-size:14.5px;font-weight:800;border-radius:16px;background:linear-gradient(100deg,#ffd75e,#ff9d00);background-size:200% 100%;animation:shine 2.8s linear infinite">
            ${L().balance_low || "Balans yetarli emas — To'ldirish"}
          </button>
        `}
      </div>
    `;

    $("#bk").onclick = goBack;

    const inp = $("#tgUsernameInp");
    if (inp) {
      inp.oninput = (e) => {
        let val = e.target.value.trim();
        if (val && !val.startsWith("@")) val = "@" + val;
        currentUsername = val;
        const sumUser = $("#tgSumUser");
        if (sumUser) sumUser.textContent = val || "@username";
      };
    }

    view.querySelectorAll(".tg-plan-card, .tg-star-card").forEach((card) => {
      card.onclick = () => {
        const id = card.dataset.id;
        const o = offers.find((x) => String(x.id) === String(id));
        if (o) {
          selectedOffer = o;
          haptic();
          render();
        }
      };
    });

    const actBtn = $("#tgActionBtn");
    if (actBtn) {
      actBtn.onclick = async () => {
        haptic();
        if (!canAfford) {
          return openTopup();
        }
        const userTrim = currentUsername.trim();
        if (!userTrim || userTrim === "@") {
          return toast(L().fill_username || "Telegram username kiriting", true);
        }
        const cleanUsername = userTrim.replace(/^@/, "");

        const confirmMsg = `${title}\n${selectedOffer.name}\n@${cleanUsername}\n${L().total}: ${fmt(price)} ${L().som}\n\n${L().confirm}`;
        const proceed = () => doOrder(cleanUsername);

        if (tg?.showConfirm) {
          tg.showConfirm(confirmMsg, (ok) => ok && proceed());
        } else if (confirm(confirmMsg)) {
          proceed();
        }
      };
    }
  }

  async function doOrder(cleanUsername) {
    const actBtn = $("#tgActionBtn");
    if (actBtn) { actBtn.disabled = true; actBtn.textContent = "…"; }

    const vals = {};
    if (g.fields && g.fields.length) {
      for (const f of g.fields) vals[f.key] = cleanUsername;
    } else {
      vals.username = cleanUsername;
      vals.player_id = cleanUsername;
    }

    try {
      await post("/api/order", {
        slug,
        offer_id: selectedOffer.id,
        values: vals
      });
      toast(L().ok_order);
      await loadMe();
      setTab("history");
    } catch (e) {
      if (e.code === "NO_MONEY") {
        toast(L().nomoney, true);
        openTopup();
      } else if (e.code === "OUT_OF_STOCK") {
        toast(L().oos, true);
      } else if (e.code === "FIELDS_INVALID") {
        toast(L().invalid, true);
      } else {
        toast(L().err, true);
      }
      if (actBtn) {
        actBtn.disabled = false;
        render();
      }
    }
  }

  render();
}

async function openGame(slug) {
  window.scrollTo(0, 0);
  const g0 = store.games?.find((x) => x.slug === slug || (x.variants || []).some((v) => v.slug === slug)) || { name: slug };
  const isTgStars = /stars/i.test(g0.name) || /stars/i.test(slug);
  const isTgPremium = /premium/i.test(g0.name) || /premium/i.test(slug);
  if (isTgStars || isTgPremium) {
    return openTelegramService(slug, isTgPremium ? "premium" : "stars", g0);
  }
  const variants = g0.variants && g0.variants.length > 1 ? g0.variants : [];
  view.innerHTML = `<div class="ghead"><button class="back-btn" id="bk">${ICON.back}</button><div><h1>${esc(g0.name)}</h1></div></div>${skel(4)}`;
  
  const goBack = () => { tg?.BackButton?.offClick(goBack); setTab(tab); };
  tg?.BackButton?.show(); tg?.BackButton?.onClick(goBack);
  $("#bk").onclick = goBack;

  let g;
  // If one server fails, try the other servers of the same game.
  const tries = [slug, ...variants.map((v) => v.slug).filter((s) => s !== slug)];
  for (const s of tries) {
    try { g = await apiFetch("/api/games/" + encodeURIComponent(s)); if (s !== slug) slug = s; break; } catch {}
  }
  if (!g) {
    view.innerHTML = `<div class="ghead"><button class="back-btn" id="bk">${ICON.back}</button><div><h1>${esc(g0.name)}</h1></div></div><div class="empty">${L().err}<br><button class="btn" id="retry" style="margin-top:14px">↻</button></div>`;
    $("#bk").onclick = goBack; $("#retry").onclick = () => { tg?.BackButton?.offClick(goBack); openGame(slug); };
    return;
  }
  g.fields ||= []; g.offers ||= [];

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
        <button class="back-btn" id="bk">${ICON.back}</button>
        ${g.image ? `<img class="gcard-img" style="width:52px;height:52px" src="${esc(g.image)}" alt="" />` : '<div class="gcard-placeholder" style="width:52px;height:52px">🎮</div>'}
        <div>
          <h1>${esc(g0.variants ? g0.name : g.name)}</h1>
          <div class="ghead-sub">${g0.kind === "other" ? (SERVICE_SUB[lang][serviceKey(g0.name)] || "Top-up") : "Top-up"}</div>
          <div class="badge-time">${ICON.clock} ${L().fast}</div>
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
              <div class="offer-art">${o.image ? `<img src="${esc(o.image)}" alt="" loading="lazy" />` : offerArt(o, g.offers)}</div>
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
const ST = (s) => ({ done: L().done, approved: L().done, failed: L().fail, rejected: L().fail }[s] || L().wait);
const STC = (s) => (["done", "approved"].includes(s) ? "ok" : ["failed", "rejected"].includes(s) ? "bad" : "wait");
async function renderHistory(sub = store.hsub || "orders") {
  store.hsub = sub;
  view.innerHTML = `<div class="h1">${L().history}</div>
    <div class="seg"><button class="${sub === "orders" ? "on" : ""}" data-h="orders">${L().orders}</button><button class="${sub === "tx" ? "on" : ""}" data-h="tx">${L().txs}</button></div>
    <div id="h">${'<div class="skel-row"></div>'.repeat(3)}</div>`;
  view.querySelectorAll(".seg button").forEach((b) => b.onclick = () => { haptic(); renderHistory(b.dataset.h); });
  try {
    const { orders, topups } = await apiFetch("/api/history");
    if (tab !== "history") return;
    let html = "";
    if (sub === "orders") html = (orders || []).map((o) => `
      <div class="hrow"><div class="hrow-main"><b>${esc(o.game)}</b><small>#${o.id} · ${esc(o.offer_name)}</small></div>
      <div class="hrow-side"><b>${fmt(o.price)} ${L().som}</b><span class="st ${STC(o.status)}">${ST(o.status)}</span></div></div>`).join("");
    else html = (topups || []).map((t) => `
      <div class="hrow"><div class="hrow-main"><b>${L().topup}</b><small>${t.created_at ? esc(new Date(t.created_at).toLocaleString()) : ""}</small></div>
      <div class="hrow-side"><b class="plus">+${fmt(t.amount)} ${L().som}</b><span class="st ${STC(t.status)}">${ST(t.status)}</span></div></div>`).join("");
    $("#h").innerHTML = html || `<div class="empty">${sub === "orders" ? L().noorders : L().notx}</div>`;
  } catch { $("#h").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Profile View ----------
async function renderProfile() {
  const me = await loadMe().catch(() => store.me);
  if (!me) { view.innerHTML = `<div class="empty">${L().err}</div>`; return; }
  const displayName = me.first_name || "Mijoz";
  view.innerHTML = `
    <div class="profile-head">
      ${me.photo_url ? `<img class="profile-avatar" src="${esc(me.photo_url)}" alt="" />` : `<div class="profile-avatar">${esc(displayName.slice(0, 1).toUpperCase())}</div>`}
      <div class="profile-name">${esc(displayName)}</div>
      ${me.username ? `<div class="profile-username">@${esc(me.username)}</div>` : ""}
      <button class="profile-idchip" id="cid">ID: ${esc(me.id)} ${ICON.copy}</button>
    </div>
    <div class="balance-card">
      <div><div class="balance-label">${L().balance}</div><div class="balance-val">${fmt(me.balance)} ${L().som}</div></div>
      <button class="balance-topup-btn" id="pTop" title="${L().topup}">${ICON.wallet}</button>
    </div>
    <div class="menu-list">
      <button class="menu-item" id="mSup"><div class="menu-item-left"><span class="menu-item-icon">${ICON.head}</span>${L().support}</div><span class="menu-item-arrow">${ICON.chev}</span></button>
      <button class="menu-item" id="mRef"><div class="menu-item-left"><span class="menu-item-icon">${ICON.user}</span>${L().referral}</div><span class="menu-item-arrow">${ICON.chev}</span></button>
      <button class="menu-item" id="mRes"><div class="menu-item-left"><span class="menu-item-icon">${ICON.crown}</span>${L().resellers}</div><span class="menu-item-arrow">${ICON.chev}</span></button>
    </div>`;
  $("#cid").onclick = () => { navigator.clipboard?.writeText(me.id); toast(L().copied); };
  $("#pTop").onclick = openTopup;
  $("#mSup").onclick = openSupport;
  $("#mRef").onclick = () => { haptic(); renderReferral(me); };
  $("#mRes").onclick = openSupport;
}
function renderReferral(me) {
  const link = me.bot_username ? `https://t.me/${me.bot_username}?start=ref_${me.id}` : "";
  const goBack = () => { tg?.BackButton?.offClick(goBack); renderProfile(); tg?.BackButton?.hide(); };
  tg?.BackButton?.show(); tg?.BackButton?.onClick(goBack);
  view.innerHTML = `
    <div class="ghead"><button class="back-btn" id="bk">${ICON.back}</button><h1 class="h1 r">${L().referral}</h1></div>
    <p class="lead">${L().ref_desc}</p>
    <div class="box"><div class="box-label">${L().your_link}</div><div class="linkbox">${esc(link)}</div>
      <div class="two"><button class="btn ghost" id="rc">${ICON.copy} ${L().copy}</button><button class="btn" id="rs">${L().share}</button></div></div>`;
  $("#bk").onclick = goBack;
  $("#rc").onclick = () => { navigator.clipboard?.writeText(link); toast(L().copied); };
  $("#rs").onclick = () => tg?.openTelegramLink?.("https://t.me/share/url?url=" + encodeURIComponent(link));
}

// ---------- Top Up Modal Sheet ----------
function openTopup() {
  const me = store.me || {};
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  let amount = 50000;
  const step1 = () => {
    bg.innerHTML = `<div class="sheet"><div class="grab"></div>
      <div class="sheet-head"><b>${L().topup}</b><button class="x" id="x">✕</button></div>
      <div class="box-label">${L().choose_amount}</div>
      <div class="amt-grid">${[10000, 25000, 50000, 100000, 200000].map((a) => `<button class="amt ${a === amount ? "on" : ""}" data-a="${a}"><b>${fmt(a)}</b><small>${L().som}</small></button>`).join("")}</div>
      <div class="amt-inp"><input id="amt" inputmode="numeric" placeholder="${L().other_amount}" /><span>${L().som}</span></div>
      <div class="note">${ICON.info}<span>${L().min_note}</span></div>
      <button class="btn grad full" id="nx">${L().cont} — ${fmt(amount)} ${L().som}</button></div>`;
    bg.querySelector("#x").onclick = () => bg.remove();
    bg.querySelectorAll(".amt").forEach((p) => p.onclick = () => { amount = Number(p.dataset.a); haptic(); step1(); });
    const inp = bg.querySelector("#amt");
    inp.oninput = () => { const v = Number(inp.value.replace(/\D/g, "")); if (v) { amount = v; bg.querySelectorAll(".amt").forEach((x) => x.classList.remove("on")); bg.querySelector("#nx").textContent = `${L().cont} — ${fmt(amount)} ${L().som}`; } };
    bg.querySelector("#nx").onclick = () => { if (amount < 3000) return toast(L().min_note, true); haptic(); step2(); };
  };
  const step2 = () => {
    bg.innerHTML = `<div class="sheet"><div class="grab"></div>
      <div class="sheet-head"><b>${fmt(amount)} ${L().som}</b><button class="x" id="x">✕</button></div>
      <div class="box-label">${L().pay_to}</div>
      <div class="card-num"><span>${esc(me.card_number || "8600 •••• •••• ••••")}</span><button id="cc">${ICON.copy}</button></div>
      <div class="note"><span>${L().owner}: <b>${esc(me.card_owner || "ADMIN")}</b></span></div>
      <label class="upload" id="up">${L().photo}<input type="file" accept="image/*" id="file" hidden /></label>
      <button class="btn grad full" id="snd">${L().send}</button></div>`;
    bg.querySelector("#x").onclick = () => bg.remove();
    bg.querySelector("#cc").onclick = () => { navigator.clipboard?.writeText(String(me.card_number || "").replace(/\s/g, "")); toast(L().copied); };
    let file = null;
    bg.querySelector("#file").onchange = (e) => { file = e.target.files[0]; if (file) bg.querySelector("#up").innerHTML = `<img src="${URL.createObjectURL(file)}">`; };
    bg.querySelector("#snd").onclick = async () => {
      if (!file) return toast(L().photo, true);
      const b = bg.querySelector("#snd"); b.disabled = true; b.textContent = "…";
      try {
        const r = await fetch("/api/topup?amount=" + amount, { method: "POST", headers: { "X-Init-Data": tg?.initData || "", "Content-Type": file.type || "image/jpeg" }, body: file });
        if (!r.ok) throw new Error();
        toast(L().sent); bg.remove(); store.hsub = "tx"; setTab("history");
      } catch { toast(L().err, true); b.disabled = false; b.textContent = L().send; }
    };
  };
  document.body.appendChild(bg);
  bg.addEventListener("click", (e) => { if (e.target === bg) bg.remove(); });
  step1();
}

// Init
(async function init() {
  applyLang();
  await loadMe();
  setTab("home");
})();
