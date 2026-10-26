const tg = window.Telegram?.WebApp;
tg?.ready(); tg?.expand();
try { tg?.setHeaderColor("#050505"); tg?.setBackgroundColor("#050505"); } catch {}

const T = {
  uz: { home: "Asosiy", shop: "Do'kon", history: "Tarix", profile: "Profil", balance: "Balans", topup: "To'ldirish", popular: "Eng mashhurlar",
    all: "Barchasi", games: "O'yinlar", search: "O'yin qidirish", topup_h: "Top-up", server: "Server / regionni tanlang", account: "O'yin akkaunti",
    check: "Tekshirish", verified: "Akkaunt tasdiqlandi", change: "O'zgartirish", packs: "Paketni tanlang", buy: "Sotib olish", som: "so'm",
    noorders: "Hali buyurtmalar yo'q", orders: "Buyurtmalar", topups: "To'ldirishlar", support: "Yordam markazi", lang: "Til", seeall: "Hammasi",
    amount: "Summa (so'm)", pay_to: "Shu kartaga o'tkazing:", owner: "Egasi", photo: "📷 Chek rasmini tanlang", send: "Yuborish",
    sent: "Chek yuborildi, admin tasdiqlashini kuting", invalid: "ID noto'g'ri", nomoney: "Balans yetarli emas", ok_order: "Buyurtma qabul qilindi ✅",
    err: "Xatolik, qaytadan urinib ko'ring", oos: "Tugagan", fill: "Avval akkaunt ma'lumotlarini kiriting", copied: "Nusxa olindi", from: "dan",
    done: "Bajarildi", fail: "Qaytarildi", wait: "Kutilmoqda", approved: "Tasdiqlandi", rejected: "Rad etildi", confirm: "Tasdiqlaysizmi?", total: "Jami",
    fast: "1–3 daqiqa", welcome: "Xush kelibsiz", blocked: "Siz bloklangansiz", open_tg: "Ilovani Telegram ichida oching" },
  ru: { home: "Главная", shop: "Магазин", history: "История", profile: "Профиль", balance: "Баланс", topup: "Пополнить", popular: "Популярные",
    all: "Все", games: "Игры", search: "Поиск игры", topup_h: "Пополнение", server: "Выберите сервер / регион", account: "Игровой аккаунт",
    check: "Проверить", verified: "Аккаунт подтверждён", change: "Изменить", packs: "Выберите пакет", buy: "Купить", som: "сум",
    noorders: "Заказов пока нет", orders: "Заказы", topups: "Пополнения", support: "Поддержка", lang: "Язык", seeall: "Все",
    amount: "Сумма (сум)", pay_to: "Переведите на карту:", owner: "Владелец", photo: "📷 Выберите фото чека", send: "Отправить",
    sent: "Чек отправлен, ждите подтверждения", invalid: "Неверный ID", nomoney: "Недостаточно средств", ok_order: "Заказ принят ✅",
    err: "Ошибка, попробуйте снова", oos: "Нет в наличии", fill: "Сначала введите данные аккаунта", copied: "Скопировано", from: "от",
    done: "Выполнен", fail: "Возврат", wait: "Ожидание", approved: "Одобрено", rejected: "Отклонено", confirm: "Подтвердить?", total: "Итого",
    fast: "1–3 минуты", welcome: "Добро пожаловать", blocked: "Вы заблокированы", open_tg: "Откройте приложение в Telegram" },
  en: { home: "Home", shop: "Shop", history: "History", profile: "Profile", balance: "Balance", topup: "Top up", popular: "Most popular",
    all: "All", games: "Games", search: "Search games", topup_h: "Top-up", server: "Choose server / region", account: "Game account",
    check: "Check", verified: "Account verified", change: "Change", packs: "Choose a pack", buy: "Buy", som: "UZS",
    noorders: "No orders yet", orders: "Orders", topups: "Top-ups", support: "Help center", lang: "Language", seeall: "See all",
    amount: "Amount (UZS)", pay_to: "Transfer to this card:", owner: "Owner", photo: "📷 Choose receipt photo", send: "Send",
    sent: "Receipt sent, wait for approval", invalid: "Invalid ID", nomoney: "Not enough balance", ok_order: "Order accepted ✅",
    err: "Error, try again", oos: "Out of stock", fill: "Enter account details first", copied: "Copied", from: "from",
    done: "Done", fail: "Refunded", wait: "Pending", approved: "Approved", rejected: "Rejected", confirm: "Confirm?", total: "Total",
    fast: "1–3 minutes", welcome: "Welcome", blocked: "You are blocked", open_tg: "Open this app inside Telegram" },
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
const icon = (g, cls = "gimg") => g.image
  ? `<img class="${cls}" src="${esc(g.image)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=&quot;${cls}&quot;>${esc((g.name || "?")[0])}</div>'">`
  : `<div class="${cls}">${esc((g.name || "?")[0])}</div>`;

// ---------- Navigation ----------
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
  applyLang(); setTab(tab);
});

async function loadGames() {
  if (!store.games) store.games = (await apiFetch("/api/games")).games;
  return store.games;
}
async function loadMe() { store.me = await apiFetch("/api/me"); return store.me; }

function gameCard(g) {
  return `<button class="game" data-slug="${esc(g.slug)}">
    ${g.top ? '<span class="badge">TOP</span>' : ""}
    ${icon(g)}
    <div class="name">${esc(g.name)}</div>
  </button>`;
}
const KT = { uz: ["🎮 O'yinlar", "✨ Boshqa xizmatlar"], ru: ["🎮 Игры", "✨ Другие услуги"], en: ["🎮 Games", "✨ Other services"] };
const kt = (i) => (KT[store.me?.lang] || KT.uz)[i];
function bindGames() {
  view.querySelectorAll(".game").forEach((b) => b.addEventListener("click", () => { haptic(); openGame(b.dataset.slug); }));
}
const skel = (n = 4) => `<div class="grid">${'<div class="skel"></div>'.repeat(n)}</div>`;

// ---------- Home ----------
async function renderHome() {
  const me = store.me;
  view.innerHTML = `
    <div class="hero">
      <small>${L().welcome}, ${esc(me?.first_name || "")} 👋</small>
      <div class="big">${fmt(me?.balance)} ${L().som}</div>
      <button class="btn" id="hTop">＋ ${L().topup}</button>
    </div>
    <div class="h2">${L().popular}<a id="seeAll">${L().seeall} →</a></div>
    <div id="pop">${skel(4)}</div>`;
  $("#hTop").onclick = openTopup;
  $("#seeAll").onclick = () => setTab("shop");
  try {
    const g = await loadGames();
    if (tab !== "home") return;
    $("#pop").innerHTML = `<div class="grid">${g.filter((x) => x.kind !== "other").slice(0, 6).map(gameCard).join("")}</div>`;
    bindGames();
  } catch { $("#pop").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Shop ----------
async function renderShop() {
  view.innerHTML = `
    <div class="h1">${L().shop}</div>
    <div class="search">🔍<input id="q" placeholder="${L().search}" value="${esc(store.q)}" /></div>
    <div class="pills">
      <button class="pill ${store.cat === "all" ? "on" : ""}" data-c="all">${L().all}</button>
      <button class="pill ${store.cat === "top" ? "on" : ""}" data-c="top">🔥 ${L().popular}</button>
      <button class="pill ${store.cat === "game" ? "on" : ""}" data-c="game">${kt(0)}</button>
      <button class="pill ${store.cat === "other" ? "on" : ""}" data-c="other">${kt(1)}</button>
    </div>
    <div id="list">${skel(6)}</div>`;
  view.querySelectorAll(".pill").forEach((p) => p.addEventListener("click", () => { store.cat = p.dataset.c; renderShop(); }));
  const draw = () => {
    const q = store.q.toLowerCase();
    let g = store.games.filter((x) => x.name.toLowerCase().includes(q));
    if (store.cat === "top") g = g.filter((x) => x.top);
    const games = g.filter((x) => x.kind !== "other"), other = g.filter((x) => x.kind === "other");
    const sec = (t, a) => a.length ? `<div class="h2 sec">${t}<span class="cnt">${a.length}</span></div><div class="grid">${a.map(gameCard).join("")}</div>` : "";
    const html = (store.cat === "other" ? "" : sec(kt(0), games)) + (store.cat === "game" ? "" : sec(kt(1), other));
    $("#list").innerHTML = html || `<div class="empty">—</div>`;
    bindGames();
  };
  $("#q").addEventListener("input", (e) => { store.q = e.target.value; draw(); });
  try { await loadGames(); if (tab === "shop") draw(); } catch { $("#list").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Game page ----------
async function openGame(slug) {
  window.scrollTo(0, 0);
  const g0 = store.games?.find((x) => x.slug === slug) || { name: slug };
  view.innerHTML = `<div class="ghead"><button class="back" id="bk">‹</button>${icon(g0)}<div><h1>${esc(g0.name)}</h1></div></div>${skel(4)}`;
  const goBack = () => { tg?.BackButton?.offClick(goBack); setTab(tab); };
  tg?.BackButton?.show(); tg?.BackButton?.onClick(goBack);
  $("#bk").onclick = goBack;
  let g;
  try { g = await apiFetch("/api/games/" + encodeURIComponent(slug)); } catch { view.innerHTML = `<div class="empty">${L().err}</div>`; return; }

  const st = { values: {}, verified: null, offer: null };
  const optFields = g.fields.filter((f) => f.options.length);
  const txtFields = g.fields.filter((f) => !f.options.length);
  optFields.forEach((f) => (st.values[f.key] = f.options[0]?.value));

  const draw = () => {
    const ok = st.verified;
    view.innerHTML = `
      <div class="ghead"><button class="back" id="bk">‹</button>${icon(g)}
        <div><h1>${esc(g.name)}</h1><span class="tag">⏱ ${L().fast}</span></div></div>
      ${optFields.map((f) => `
        <div class="label">${optFields.length === 1 ? L().server : esc(f.label)}</div>
        <div class="pills">${f.options.map((o) => `<button class="pill ${st.values[f.key] === o.value ? "on" : ""}" data-f="${esc(f.key)}" data-v="${esc(o.value)}">${esc(o.label)}</button>`).join("")}</div>`).join("")}
      ${txtFields.length ? (ok ? `
        <div class="box ok"><div class="ok-ic">✓</div><div style="flex:1"><b>${L().verified}</b><br><small style="color:var(--muted)">${esc(ok.nickname || txtFields.map((f) => st.values[f.key]).join(" • "))}</small></div>
        <button style="color:var(--neon);font-weight:800" id="chg">${L().change}</button></div>` : `
        <div class="box"><b>🎮 ${L().account}</b>
          ${txtFields.map((f) => `<div class="label">${esc(f.label)}</div><input class="inp" data-k="${esc(f.key)}" placeholder="${esc(f.label)}" value="${esc(st.values[f.key] || "")}" maxlength="64" />`).join("")}
          <button class="btn ghost full" id="chk">🔍 ${L().check}</button></div>`) : ""}
      <div class="h2">${L().packs}</div>
      <div class="grid g2">${g.offers.map((o) => `
        <button class="offer ${st.offer?.id === o.id ? "on" : ""} ${o.stock === 0 ? "off" : ""}" data-o="${esc(o.id)}">
          ${o.image ? `<img src="${esc(o.image)}" alt="" loading="lazy">` : '<div class="oic">💎</div>'}
          <div class="oname">${esc(o.name)}</div>
          <div class="oprice">${o.stock === 0 ? L().oos : `${fmt(o.price)} <small>${L().som}</small>`}</div>
        </button>`).join("")}</div>
      ${st.offer ? `<div class="buybar"><div class="t">${esc(st.offer.name)}<b>${fmt(st.offer.price)} ${L().som}</b></div><button class="btn" id="buy">${L().buy}</button></div><div style="height:90px"></div>` : ""}`;
    $("#bk").onclick = goBack;
    view.querySelectorAll(".pill[data-f]").forEach((p) => p.onclick = () => { st.values[p.dataset.f] = p.dataset.v; st.verified = null; haptic(); draw(); });
    view.querySelectorAll(".inp").forEach((i) => i.oninput = () => (st.values[i.dataset.k] = i.value.trim()));
    view.querySelectorAll(".offer").forEach((b) => b.onclick = () => {
      const o = g.offers.find((x) => x.id === b.dataset.o);
      if (!o || o.stock === 0) return;
      st.offer = o; haptic(); const y = window.scrollY; draw(); window.scrollTo(0, y);
    });
    $("#chg") && ($("#chg").onclick = () => { st.verified = null; draw(); });
    $("#chk") && ($("#chk").onclick = check);
    $("#buy") && ($("#buy").onclick = buy);
  };

  async function check() {
    if (txtFields.some((f) => !st.values[f.key])) return toast(L().fill, true);
    const b = $("#chk"); b.disabled = true; b.textContent = "…";
    try {
      const r = await post("/api/validate", { slug, values: st.values });
      if (!r.valid) { toast(L().invalid, true); b.disabled = false; b.textContent = L().check; return; }
      st.verified = r; draw();
    } catch { toast(L().err, true); b.disabled = false; b.textContent = L().check; }
  }
  async function buy() {
    if (txtFields.length && !st.verified) { if (txtFields.some((f) => !st.values[f.key])) return toast(L().fill, true); await check(); if (!st.verified) return; }
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

// ---------- History ----------
async function renderHistory() {
  view.innerHTML = `<div class="h1">${L().history}</div><div id="h">${skel(2)}</div>`;
  try {
    const { orders, topups } = await apiFetch("/api/history");
    const cls = (s, r) => r || ["failed", "canceled", "cancelled", "refunded", "rejected", "error"].includes(s) ? "fail"
      : ["completed", "complete", "success", "delivered", "done", "fulfilled", "approved"].includes(s) ? "done" : "wait";
    const lbl = (c, s) => s === "approved" ? L().approved : s === "rejected" ? L().rejected : L()[c];
    const d = (x) => new Date(x).toLocaleString(lang === "en" ? "en-GB" : "ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    $("#h").innerHTML = (!orders.length && !topups.length) ? `<div class="empty">📦<br>${L().noorders}</div>` : `
      ${orders.length ? `<div class="h2">${L().orders}</div><div class="list">${orders.map((o) => { const c = cls(o.status, o.refunded); return `
        <div class="row"><div class="ri"><b>${esc(o.game)}</b><small>#${o.id} · ${esc(o.offer_name)} · ${d(o.created_at)}</small></div>
        <div style="text-align:right"><b>${fmt(o.price)}</b><br><span class="st ${c}">${lbl(c)}</span></div></div>`; }).join("")}</div>` : ""}
      ${topups.length ? `<div class="h2">${L().topups}</div><div class="list">${topups.map((t) => { const c = cls(t.status); return `
        <div class="row"><div class="ri"><b>＋ ${fmt(t.amount)} ${L().som}</b><small>#${t.id} · ${d(t.created_at)}</small></div>
        <span class="st ${c}">${lbl(c, t.status)}</span></div>`; }).join("")}</div>` : ""}`;
  } catch { $("#h").innerHTML = `<div class="empty">${L().err}</div>`; }
}

// ---------- Profile ----------
async function renderProfile() {
  const me = await loadMe().catch(() => store.me);
  if (!me) return;
  view.innerHTML = `
    <div class="center">
      ${me.photo_url ? `<img class="avatar" src="${esc(me.photo_url)}" alt="">` : `<div class="avatar">${esc((me.first_name || "?")[0])}</div>`}
      <div class="h1" style="margin:0">${esc(me.first_name)}</div>
      ${me.username ? `<div style="color:var(--muted);margin-top:4px">@${esc(me.username)}</div>` : ""}
      <button class="idchip" id="cid">ID: ${esc(me.id)} ⧉</button>
    </div>
    <div class="box bal"><div><div style="color:var(--muted)">${L().balance}</div><div class="v">${fmt(me.balance)} ${L().som}</div></div>
      <button class="btn" id="pTop">＋</button></div>
    <div class="menu">
      <button id="mTop"><span class="ic">💳</span>${L().topup}<span class="ar">›</span></button>
      <button id="mHist"><span class="ic">🕘</span>${L().history} (${me.orders})<span class="ar">›</span></button>
      ${me.support ? `<button id="mSup"><span class="ic">🎧</span>${L().support}<span class="ar">›</span></button>` : ""}
      <button id="mLang"><span class="ic">🌐</span>${L().lang}: ${lang.toUpperCase()}<span class="ar">›</span></button>
    </div>`;
  $("#cid").onclick = () => { navigator.clipboard?.writeText(me.id); toast(L().copied); };
  $("#pTop").onclick = $("#mTop").onclick = openTopup;
  $("#mHist").onclick = () => setTab("history");
  $("#mLang").onclick = () => $("#langBtn").click();
  $("#mSup") && ($("#mSup").onclick = () => tg?.openTelegramLink?.("https://t.me/" + me.support.replace("@", "")));
}

// ---------- Top up sheet ----------
function openTopup() {
  const me = store.me || {};
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = `<div class="sheet">
    <h2>💳 ${L().topup}</h2>
    <div class="label">${L().amount}</div>
    <input class="inp" id="amt" inputmode="numeric" placeholder="50 000" />
    <div class="pills">${[20000, 50000, 100000, 200000].map((a) => `<button class="pill" data-a="${a}">${fmt(a)}</button>`).join("")}</div>
    <div class="label">${L().pay_to}</div>
    <div class="card-num"><span>${esc(me.card_number)}</span><button id="cc" style="color:var(--neon)">⧉</button></div>
    <div style="color:var(--muted);font-size:14px">${L().owner}: ${esc(me.card_owner)}</div>
    <label class="upload" id="up">${L().photo}<input type="file" accept="image/*" id="file" hidden /></label>
    <button class="btn full" id="snd">${L().send}</button>
  </div>`;
  document.body.appendChild(bg);
  bg.addEventListener("click", (e) => { if (e.target === bg) bg.remove(); });
  const amt = bg.querySelector("#amt");
  bg.querySelectorAll(".pill").forEach((p) => p.onclick = () => { amt.value = fmt(p.dataset.a); haptic(); });
  bg.querySelector("#cc").onclick = () => { navigator.clipboard?.writeText(String(me.card_number).replace(/\s/g, "")); toast(L().copied); };
  let file = null;
  bg.querySelector("#file").onchange = (e) => {
    file = e.target.files[0];
    if (file) bg.querySelector("#up").innerHTML = `<img src="${URL.createObjectURL(file)}">`;
  };
  bg.querySelector("#snd").onclick = async () => {
    const a = Number(amt.value.replace(/\D/g, ""));
    if (!(a >= 1000)) return toast(L().amount, true);
    if (!file) return toast(L().photo, true);
    const b = bg.querySelector("#snd"); b.disabled = true; b.textContent = "…";
    try {
      await apiFetch("/api/topup?amount=" + a, { method: "POST", headers: { "Content-Type": file.type || "image/jpeg" }, body: file });
      toast(L().sent); bg.remove(); if (tab === "history") renderHistory();
    } catch { toast(L().err, true); b.disabled = false; b.textContent = L().send; }
  };
}

// ---------- Start ----------
(async () => {
  applyLang();
  if (!tg?.initData) { view.innerHTML = `<div class="empty">📱<br>${T[lang].open_tg}</div>`; return; }
  try {
    const me = await loadMe();
    if (me.lang && T[me.lang]) lang = me.lang;
    $("#brandName").innerHTML = esc(me.bot_name).replace(/^(.{1,4})(.*)$/, "$1<b>$2</b>");
    document.title = me.bot_name;
    applyLang();
    setTab("home");
    loadGames().catch(() => {});
  } catch (e) {
    view.innerHTML = `<div class="empty">⛔<br>${e.code === "blocked" ? L().blocked : L().err}</div>`;
  }
})();
