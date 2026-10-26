import crypto from "node:crypto";
import express from "express";
import { Telegraf, Markup } from "telegraf";
import { q, initDb, getSetting, setSetting, upsertUser, getUser, addBalance, takeBalance } from "./db.js";
import { api, ApiError, parseOrder, DONE, FAILED } from "./api.js";
import { t, ALL_MENU } from "./i18n.js";
import { setupWebapp } from "./webapp.js";

const WEBAPP_URL = process.env.WEBAPP_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "");

for (const k of ["BOT_TOKEN", "ARCADEZY_API_KEY", "DATABASE_URL", "ADMIN_IDS"]) {
  if (!process.env[k]) { console.error(`${k} o'rnatilmagan!`); process.exit(1); }
}
const ADMINS = process.env.ADMIN_IDS.split(",").map((s) => Number(s.trim())).filter(Boolean);
const isAdmin = (id) => ADMINS.includes(Number(id));
const bot = new Telegraf(process.env.BOT_TOKEN);

// Foydalanuvchi holati (xotirada)
const state = new Map();
const S = (id) => { if (!state.has(id)) state.set(id, {}); return state.get(id); };
const fmt = (n) => Math.round(Number(n)).toLocaleString("ru-RU").replace(/,/g, " ");
const esc = (s) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

/** Sotuv narxi (so'm) = USD narx × kurs × (1 + ustama%) */
export function priceUzs(usd, rate, markup) {
  return Math.ceil((Number(usd) * Number(rate) * (1 + Number(markup) / 100)) / 100) * 100;
}
async function pricing() {
  return { rate: await getSetting("usd_rate"), markup: await getSetting("markup") };
}

// Kategoriya keshi (5 daqiqa)
const cache = new Map();
async function cached(key, fn) {
  const c = cache.get(key);
  if (c && Date.now() - c.t < 5 * 60e3) return c.v;
  const v = await fn();
  cache.set(key, { v, t: Date.now() });
  return v;
}

const mainMenu = (L, admin) => {
  const rows = [[L.menu_buy], [L.menu_balance, L.menu_topup], [L.menu_orders, L.menu_lang], [L.menu_help]];
  if (admin) rows.push(["🛠 Admin"]);
  return Markup.keyboard(rows).resize();
};
const langKb = Markup.inlineKeyboard([[
  Markup.button.callback("🇺🇿 O'zbek", "lang:uz"),
  Markup.button.callback("🇷🇺 Русский", "lang:ru"),
  Markup.button.callback("🇬🇧 English", "lang:en"),
]]);

// ---------- Middleware: ro'yxat + blok ----------
bot.use(async (ctx, next) => {
  if (!ctx.from) return;
  const u = await upsertUser(ctx.from);
  ctx.user = u;
  ctx.L = t(u.lang);
  if (u.blocked && !isAdmin(u.id)) {
    if (ctx.callbackQuery) await ctx.answerCbQuery(ctx.L.blocked).catch(() => {});
    else await ctx.reply(ctx.L.blocked).catch(() => {});
    return;
  }
  return next();
});

const WELCOME = {
  uz: (n) => `⚡ <b>${n}</b>, xush kelibsiz!\n\nBalansingizni to'ldiring — o'yinlarga donatni tez va arzon oling 👇`,
  ru: (n) => `⚡ <b>${n}</b>, добро пожаловать!\n\nПополните баланс — донат в игры быстро и выгодно 👇`,
  en: (n) => `⚡ <b>${n}</b>, welcome!\n\nTop up your balance — fast and cheap game top-ups 👇`,
};
const OPEN = { uz: "⚡ Do'konni ochish", ru: "⚡ Открыть магазин", en: "⚡ Open shop" };
async function sendWelcome(ctx, lang) {
  const l = WELCOME[lang] ? lang : "uz";
  const kb = WEBAPP_URL ? Markup.inlineKeyboard([[Markup.button.webApp(OPEN[l], WEBAPP_URL)]]) : undefined;
  await ctx.reply(WELCOME[l](esc(ctx.from.first_name)), { parse_mode: "HTML", ...(kb || {}) });
  if (isAdmin(ctx.from.id)) await ctx.reply("🛠 Admin panel pastda", Markup.keyboard([["🛠 Admin"]]).resize());
  else await ctx.reply("👆", Markup.removeKeyboard()).then((m) => ctx.deleteMessage(m.message_id)).catch(() => {});
}

bot.start(async (ctx) => {
  state.delete(ctx.from.id);
  if (!ctx.user.lang) return ctx.reply("Tilni tanlang / Выберите язык / Choose language:", langKb);
  await sendWelcome(ctx, ctx.user.lang);
});

bot.action(/^lang:(uz|ru|en)$/, async (ctx) => {
  const lang = ctx.match[1];
  await q("UPDATE users SET lang=$1 WHERE id=$2", [lang, ctx.from.id]);
  await ctx.answerCbQuery(t(lang).lang_set);
  await ctx.deleteMessage().catch(() => {});
  await sendWelcome(ctx, lang);
});

bot.hears(ALL_MENU("menu_lang"), (ctx) => ctx.reply(ctx.L.choose_lang, langKb));
bot.hears(ALL_MENU("menu_help"), (ctx) => ctx.reply(ctx.L.help));
bot.hears(ALL_MENU("menu_balance"), (ctx) => ctx.reply(ctx.L.balance(fmt(ctx.user.balance)), { parse_mode: "HTML" }));

bot.hears(ALL_MENU("menu_orders"), async (ctx) => {
  const r = await q("SELECT * FROM orders WHERE user_id=$1 ORDER BY id DESC LIMIT 10", [ctx.from.id]);
  if (!r.rows.length) return ctx.reply(ctx.L.no_orders);
  const icon = (s) => (DONE.includes(s) ? "✅" : FAILED.includes(s) ? "❌" : "⏳");
  await ctx.reply(r.rows.map((o) => `${icon(o.status)} #${o.id} · ${esc(o.game)} · ${esc(o.offer_name)} · ${fmt(o.price)}`).join("\n"), { parse_mode: "HTML" });
});

// ---------- Donat: o'yinlar ----------
async function showGames(ctx, page = 1, edit = false) {
  const data = await cached(`cats:${page}`, () => api.categories(page));
  const S_ = S(ctx.from.id);
  S_.cats = data.items;
  const btns = data.items.map((c, i) => [Markup.button.callback(c.name, `g:${page}:${i}`)]);
  const nav = [];
  if (page > 1) nav.push(Markup.button.callback("⬅️", `gp:${page - 1}`));
  nav.push(Markup.button.callback(`${page}/${data.pages}`, "noop"));
  if (page < data.pages) nav.push(Markup.button.callback("➡️", `gp:${page + 1}`));
  btns.push(nav);
  const opts = Markup.inlineKeyboard(btns);
  return edit ? ctx.editMessageText(ctx.L.choose_game, opts) : ctx.reply(ctx.L.choose_game, opts);
}
bot.hears(ALL_MENU("menu_buy"), (ctx) => { state.delete(ctx.from.id); return showGames(ctx); });
bot.action(/^gp:(\d+)$/, async (ctx) => { await ctx.answerCbQuery(); await showGames(ctx, Number(ctx.match[1]), true); });
bot.action("noop", (ctx) => ctx.answerCbQuery());

async function showOffers(ctx, slug, page = 0) {
  const data = await cached(`off:${slug}`, () => api.offers(slug));
  const st = S(ctx.from.id);
  Object.assign(st, { slug, game: data.category?.name || slug, fields: data.fields || [], offers: data.offers || [] });
  const { rate, markup } = await pricing();
  const per = 12;
  const list = st.offers.slice(page * per, page * per + per);
  const btns = list.map((o, i) => [
    Markup.button.callback(`${o.name} — ${fmt(priceUzs(o.price_usd, rate, markup))}`, `o:${page * per + i}`),
  ]);
  const nav = [];
  if (page > 0) nav.push(Markup.button.callback("⬅️", `op:${page - 1}`));
  if ((page + 1) * per < st.offers.length) nav.push(Markup.button.callback("➡️", `op:${page + 1}`));
  if (nav.length) btns.push(nav);
  btns.push([Markup.button.callback(ctx.L.back, "gp:1")]);
  await ctx.editMessageText(ctx.L.choose_offer(esc(st.game)), { parse_mode: "HTML", ...Markup.inlineKeyboard(btns) });
}
bot.action(/^g:(\d+):(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  let cat = S(ctx.from.id).cats?.[Number(ctx.match[2])];
  if (!cat) cat = (await cached(`cats:${ctx.match[1]}`, () => api.categories(Number(ctx.match[1])))).items[Number(ctx.match[2])];
  if (!cat) return;
  await showOffers(ctx, cat.slug);
});
bot.action(/^op:(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const st = S(ctx.from.id);
  if (st.slug) await showOffers(ctx, st.slug, Number(ctx.match[1]));
});

bot.action(/^o:(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const st = S(ctx.from.id);
  const offer = st.offers?.[Number(ctx.match[1])];
  if (!offer) return ctx.reply(ctx.L.id_invalid);
  if (offer.stock === 0) return ctx.reply(ctx.L.out_of_stock);
  st.offer = offer;
  st.values = {};
  st.fieldIdx = 0;
  st.step = "field";
  await askField(ctx);
});

async function askField(ctx) {
  const st = S(ctx.from.id);
  const f = st.fields[st.fieldIdx];
  if (!f) return confirmOrder(ctx);
  if (f.options?.length) {
    const btns = f.options.map((o, i) => [Markup.button.callback(String(o.label ?? o), `fo:${i}`)]);
    return ctx.reply(ctx.L.enter_field(esc(f.label)), { parse_mode: "HTML", ...Markup.inlineKeyboard(btns) });
  }
  await ctx.reply(ctx.L.enter_field(esc(f.label)), { parse_mode: "HTML" });
}
bot.action(/^fo:(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const st = S(ctx.from.id);
  const f = st.fields?.[st.fieldIdx];
  const opt = f?.options?.[Number(ctx.match[1])];
  if (!opt) return;
  st.values[f.key] = String(opt.value ?? opt);
  st.fieldIdx++;
  await askField(ctx);
});

async function confirmOrder(ctx) {
  const st = S(ctx.from.id);
  st.step = "confirm";
  let nick = null;
  try {
    const m = await ctx.reply(ctx.L.checking);
    const v = await api.validateId(st.slug, st.values).catch((e) => {
      if (e instanceof ApiError && e.status === 422) return { valid: false };
      return null; // tekshiruv mavjud bo'lmasa — o'tkazib yuboramiz
    });
    await ctx.deleteMessage(m.message_id).catch(() => {});
    if (v && v.valid === false) { state.delete(ctx.from.id); return ctx.reply(ctx.L.id_invalid); }
    nick = v?.nickname || v?.name || v?.player_name || v?.result?.nickname || null;
  } catch {}
  const { rate, markup } = await pricing();
  st.price = priceUzs(st.offer.price_usd, rate, markup);
  const fieldsText = st.fields.map((f) => `${esc(f.label)}: <code>${esc(st.values[f.key])}</code>\n`).join("");
  await ctx.reply(ctx.L.confirm(esc(st.game), esc(st.offer.name), fieldsText, fmt(st.price), nick && esc(nick)), {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([[Markup.button.callback(ctx.L.yes, "buy"), Markup.button.callback(ctx.L.no, "cancel")]]),
  });
}

bot.action("cancel", async (ctx) => {
  state.delete(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.editMessageText(ctx.L.canceled).catch(() => {});
});

bot.action("buy", async (ctx) => {
  await ctx.answerCbQuery();
  const st = S(ctx.from.id);
  if (st.step !== "confirm" || !st.offer) return;
  state.delete(ctx.from.id);
  await ctx.editMessageReplyMarkup(undefined).catch(() => {});
  const L = ctx.L;
  const left = await takeBalance(ctx.from.id, st.price);
  if (left === null) {
    const u = await getUser(ctx.from.id);
    return ctx.reply(L.no_money(fmt(st.price), fmt(u.balance)));
  }
  const ins = await q(
    `INSERT INTO orders(user_id,game,offer_id,offer_name,fields,cost_usd,price) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [ctx.from.id, st.game, st.offer.offer_id, st.offer.name, st.values, st.offer.price_usd, st.price]
  );
  const id = ins.rows[0].id;
  try {
    const res = await api.createOrder(st.offer.offer_id, st.values, `tg-order-${id}`);
    const o = parseOrder(res);
    await q("UPDATE orders SET arc_id=$1, status=$2 WHERE id=$3", [o.id, o.status, id]);
    await ctx.reply(L.order_sent(id));
    notifyAdmins(`🆕 Buyurtma #${id}\n${esc(st.game)} · ${esc(st.offer.name)}\n${fmt(st.price)} so'm · <a href="tg://user?id=${ctx.from.id}">${esc(ctx.from.first_name)}</a> (${ctx.from.id})`);
    await finishIfFinal(id, o.status);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 503 || e.status === 429 || e.status >= 500)) {
      // Yetkazib beruvchi javob bermadi: buyurtma bajarilmagan deb hisoblamaymiz, keyin tekshiramiz
      await q("UPDATE orders SET status='unknown' WHERE id=$1", [id]);
      await ctx.reply(L.order_wait(id));
      notifyAdmins(`⚠️ Buyurtma #${id} — yetkazib beruvchi javob bermadi (${e.code}). Avtomatik qayta tekshiriladi.`);
      return;
    }
    await refund(id);
    if (e.code === "OUT_OF_STOCK") await ctx.reply(L.out_of_stock);
    else if (e.code === "FIELDS_INVALID") await ctx.reply(L.id_invalid);
    else await ctx.reply(L.order_err);
    if (e.code === "INSUFFICIENT_BALANCE") notifyAdmins("🚨 Arcadezy hamyonida pul tugadi! Buyurtma #" + id + " qaytarildi. Hamyonni to'ldiring.");
    else notifyAdmins(`❌ Buyurtma #${id} xatosi: ${e.status} ${e.code} ${esc(e.message)}`);
  }
});

async function refund(orderId) {
  const r = await q("UPDATE orders SET status='failed', refunded=TRUE WHERE id=$1 AND refunded=FALSE RETURNING user_id, price", [orderId]);
  if (r.rows[0]) await addBalance(r.rows[0].user_id, r.rows[0].price);
  return r.rows[0];
}

async function finishIfFinal(orderId, status) {
  const o = (await q("SELECT o.*, u.lang FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=$1", [orderId])).rows[0];
  if (!o) return;
  const L = t(o.lang);
  if (DONE.includes(status)) {
    const r = await q("UPDATE orders SET status=$1 WHERE id=$2 AND status<>$1 RETURNING id", [status, orderId]);
    if (r.rows[0]) await bot.telegram.sendMessage(o.user_id, L.order_done(o.id, o.offer_name)).catch(() => {});
  } else if (FAILED.includes(status)) {
    const r = await refund(orderId);
    if (r) await bot.telegram.sendMessage(o.user_id, L.order_failed(o.id, fmt(o.price))).catch(() => {});
  } else {
    await q("UPDATE orders SET status=$1 WHERE id=$2", [status, orderId]);
  }
}

// Kutilayotgan buyurtmalarni har 2 daqiqada tekshirish
async function pollOrders() {
  const r = await q(`SELECT id, arc_id, offer_id, fields FROM orders
    WHERE refunded=FALSE AND status NOT IN (${DONE.map((s) => `'${s}'`).join(",")},'failed')
    AND created_at > now() - interval '3 days' ORDER BY id LIMIT 50`);
  for (const o of r.rows) {
    try {
      if (o.arc_id) {
        const p = parseOrder(await api.order(o.arc_id));
        await finishIfFinal(o.id, p.status);
      } else {
        // Javob kelmagan buyurtma: o'sha Idempotency-Key bilan qayta yuboramiz (ikki marta yechilmaydi)
        const p = parseOrder(await api.createOrder(o.offer_id, o.fields, `tg-order-${o.id}`));
        await q("UPDATE orders SET arc_id=$1 WHERE id=$2", [p.id, o.id]);
        await finishIfFinal(o.id, p.status);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status < 500 && e.status !== 429 && !o.arc_id) {
        const rr = await refund(o.id);
        if (rr) {
          const u = await getUser(rr.user_id);
          await bot.telegram.sendMessage(rr.user_id, t(u?.lang).order_failed(o.id, fmt(rr.price))).catch(() => {});
        }
      }
    }
  }
}

// ---------- Hisobni to'ldirish (chek orqali) ----------
bot.hears(ALL_MENU("menu_topup"), async (ctx) => {
  S(ctx.from.id).step = "topup_amount";
  await ctx.reply(ctx.L.topup_amount);
});

bot.on("photo", async (ctx) => {
  const st = S(ctx.from.id);
  if (st.step === "broadcast" && isAdmin(ctx.from.id)) return doBroadcast(ctx);
  if (st.step !== "topup_photo") return;
  const fileId = ctx.message.photo.at(-1).file_id;
  const amount = st.amount;
  state.delete(ctx.from.id);
  const r = await q("INSERT INTO topups(user_id,amount,file_id) VALUES($1,$2,$3) RETURNING id", [ctx.from.id, amount, fileId]);
  const id = r.rows[0].id;
  await ctx.reply(ctx.L.topup_sent);
  const caption = `💳 To'ldirish #${id}\n👤 <a href="tg://user?id=${ctx.from.id}">${esc(ctx.from.first_name)}</a> ${ctx.from.username ? "@" + esc(ctx.from.username) : ""} (<code>${ctx.from.id}</code>)\n💰 <b>${fmt(amount)} so'm</b>`;
  for (const a of ADMINS) {
    await bot.telegram.sendPhoto(a, fileId, {
      caption, parse_mode: "HTML",
      ...Markup.inlineKeyboard([[Markup.button.callback("✅ Tasdiqlash", `ta:${id}`), Markup.button.callback("❌ Rad etish", `tr:${id}`)]]),
    }).catch(() => {});
  }
});

bot.action(/^t(a|r):(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery();
  const approve = ctx.match[1] === "a";
  const r = await q("UPDATE topups SET status=$1 WHERE id=$2 AND status='pending' RETURNING *", [approve ? "approved" : "rejected", ctx.match[2]]);
  const tp = r.rows[0];
  if (!tp) return ctx.answerCbQuery("Allaqachon ko'rib chiqilgan");
  const u = await getUser(tp.user_id);
  if (approve) {
    await addBalance(tp.user_id, tp.amount);
    await bot.telegram.sendMessage(tp.user_id, t(u?.lang).topup_ok(fmt(tp.amount))).catch(() => {});
  } else {
    await bot.telegram.sendMessage(tp.user_id, t(u?.lang).topup_no).catch(() => {});
  }
  await ctx.answerCbQuery(approve ? "Tasdiqlandi" : "Rad etildi");
  await ctx.editMessageCaption(`${ctx.callbackQuery.message.caption}\n\n${approve ? "✅ TASDIQLANDI" : "❌ RAD ETILDI"} (${ctx.from.first_name})`).catch(() => {});
});

// ---------- Admin panel ----------
const adminKb = Markup.inlineKeyboard([
  [Markup.button.callback("📊 Statistika", "ad:stats"), Markup.button.callback("💵 Arcadezy balansi", "ad:arc")],
  [Markup.button.callback("📢 Hammaga xabar", "ad:bc")],
  [Markup.button.callback("⛔ Bloklash", "ad:block"), Markup.button.callback("✅ Blokdan chiqarish", "ad:unblock")],
  [Markup.button.callback("➕ Balans qo'shish", "ad:add"), Markup.button.callback("➖ Balans ayirish", "ad:sub")],
  [Markup.button.callback("📈 Ustama %", "ad:markup"), Markup.button.callback("💱 Dollar kursi", "ad:rate")],
  [Markup.button.callback("💳 Karta", "ad:card"), Markup.button.callback("🔎 Foydalanuvchi", "ad:find")],
  [Markup.button.callback("⏳ Kutilayotgan cheklar", "ad:pending")],
]);
async function adminText() {
  const { rate, markup } = await pricing();
  return `🛠 <b>Admin panel</b>\n\nUstama: <b>${markup}%</b>\nDollar kursi: <b>${fmt(rate)} so'm</b>\nKarta: <code>${esc(await getSetting("card_number"))}</code> (${esc(await getSetting("card_owner"))})`;
}
bot.hears("🛠 Admin", async (ctx) => { if (isAdmin(ctx.from.id)) await ctx.reply(await adminText(), { parse_mode: "HTML", ...adminKb }); });
bot.command("admin", async (ctx) => { if (isAdmin(ctx.from.id)) await ctx.reply(await adminText(), { parse_mode: "HTML", ...adminKb }); });

const prompts = {
  bc: "📢 Hammaga yuboriladigan xabarni yozing (matn yoki rasm + izoh). Bekor qilish: /cancel",
  block: "⛔ Bloklanadigan foydalanuvchi ID sini yuboring:",
  unblock: "✅ Blokdan chiqariladigan foydalanuvchi ID sini yuboring:",
  add: "➕ Format: <code>ID SUMMA</code> (masalan: 123456789 50000)",
  sub: "➖ Format: <code>ID SUMMA</code>",
  markup: "📈 Yangi ustama foizini yuboring (masalan: 10):",
  rate: "💱 1 dollar necha so'm? (masalan: 12800):",
  card: "💳 Format: <code>KARTA RAQAMI | EGASI</code>\nmasalan: 8600 1234 5678 9012 | Ali Valiyev",
  find: "🔎 Foydalanuvchi ID sini yuboring:",
};
bot.action(/^ad:(\w+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery();
  await ctx.answerCbQuery();
  const k = ctx.match[1];
  if (k === "stats") {
    const u = (await q("SELECT count(*)::int n, count(*) FILTER (WHERE blocked)::int b, coalesce(sum(balance),0) s FROM users")).rows[0];
    const o = (await q(`SELECT count(*)::int n, coalesce(sum(price),0) p, coalesce(sum(cost_usd),0) c FROM orders WHERE status IN (${DONE.map((s) => `'${s}'`).join(",")})`)).rows[0];
    const today = (await q(`SELECT count(*)::int n, coalesce(sum(price),0) p FROM orders WHERE created_at > date_trunc('day', now()) AND refunded=FALSE`)).rows[0];
    return ctx.reply(`📊 <b>Statistika</b>\n\n👥 Foydalanuvchilar: ${u.n} (bloklangan: ${u.b})\n💰 Foydalanuvchilar balansi: ${fmt(u.s)} so'm\n\n📦 Bajarilgan buyurtmalar: ${o.n}\n💵 Tushum: ${fmt(o.p)} so'm\n🧾 Xarajat: $${Number(o.c).toFixed(2)}\n\n📅 Bugun: ${today.n} ta, ${fmt(today.p)} so'm`, { parse_mode: "HTML" });
  }
  if (k === "arc") {
    try { const b = await api.balance(); return ctx.reply(`💵 Arcadezy balansi: <b>$${b.balance_usd}</b>`, { parse_mode: "HTML" }); }
    catch (e) { return ctx.reply("Xato: " + e.code); }
  }
  if (k === "pending") {
    const r = await q("SELECT * FROM topups WHERE status='pending' ORDER BY id LIMIT 20");
    if (!r.rows.length) return ctx.reply("Kutilayotgan cheklar yo'q.");
    for (const tp of r.rows) {
      await ctx.replyWithPhoto(tp.file_id, {
        caption: `💳 #${tp.id} · ID ${tp.user_id} · ${fmt(tp.amount)} so'm`,
        ...Markup.inlineKeyboard([[Markup.button.callback("✅ Tasdiqlash", `ta:${tp.id}`), Markup.button.callback("❌ Rad etish", `tr:${tp.id}`)]]),
      });
    }
    return;
  }
  S(ctx.from.id).step = k === "bc" ? "broadcast" : "ad_" + k;
  await ctx.reply(prompts[k], { parse_mode: "HTML" });
});
bot.command("cancel", (ctx) => { state.delete(ctx.from.id); return ctx.reply(ctx.L.canceled); });

async function doBroadcast(ctx) {
  state.delete(ctx.from.id);
  const users = (await q("SELECT id FROM users WHERE blocked=FALSE")).rows;
  await ctx.reply(`📢 Yuborilmoqda: ${users.length} ta foydalanuvchiga...`);
  let ok = 0, fail = 0;
  for (const u of users) {
    try { await ctx.telegram.copyMessage(u.id, ctx.chat.id, ctx.message.message_id); ok++; }
    catch { fail++; }
    await new Promise((r) => setTimeout(r, 40)); // Telegram limiti (~25 xabar/sek)
  }
  await ctx.reply(`✅ Yuborildi: ${ok}\n❌ Yetmadi: ${fail}`);
}

async function handleAdminText(ctx, step, text) {
  const parts = text.split(/\s+/);
  const id = Number(parts[0]);
  switch (step) {
    case "ad_block":
    case "ad_unblock": {
      const r = await q("UPDATE users SET blocked=$1 WHERE id=$2 RETURNING id", [step === "ad_block", id]);
      return ctx.reply(r.rows[0] ? (step === "ad_block" ? "⛔ Bloklandi." : "✅ Blokdan chiqarildi.") : "Foydalanuvchi topilmadi.");
    }
    case "ad_add":
    case "ad_sub": {
      const sum = Number(parts[1]);
      if (!id || !(sum > 0)) return ctx.reply("Format noto'g'ri.");
      const b = await addBalance(id, step === "ad_add" ? sum : -sum);
      if (b === undefined) return ctx.reply("Foydalanuvchi topilmadi.");
      if (step === "ad_add") {
        const u = await getUser(id);
        bot.telegram.sendMessage(id, t(u?.lang).topup_ok(fmt(sum))).catch(() => {});
      }
      return ctx.reply(`✅ Yangi balans: ${fmt(b)} so'm`);
    }
    case "ad_markup": {
      const v = Number(text.replace("%", ""));
      if (!(v >= 0 && v <= 500)) return ctx.reply("0 dan 500 gacha son kiriting.");
      await setSetting("markup", v);
      return ctx.reply(`✅ Ustama: ${v}%`);
    }
    case "ad_rate": {
      const v = Number(text.replace(/\s/g, ""));
      if (!(v > 0)) return ctx.reply("Son kiriting.");
      await setSetting("usd_rate", v);
      return ctx.reply(`✅ 1$ = ${fmt(v)} so'm`);
    }
    case "ad_card": {
      const [num, owner] = text.split("|").map((s) => s.trim());
      await setSetting("card_number", num);
      if (owner) await setSetting("card_owner", owner);
      return ctx.reply("✅ Karta saqlandi.");
    }
    case "ad_find": {
      const u = await getUser(id);
      if (!u) return ctx.reply("Topilmadi.");
      const o = (await q("SELECT count(*)::int n, coalesce(sum(price),0) s FROM orders WHERE user_id=$1 AND refunded=FALSE", [id])).rows[0];
      return ctx.reply(`👤 ${esc(u.first_name)} ${u.username ? "@" + esc(u.username) : ""}\nID: <code>${u.id}</code>\nBalans: ${fmt(u.balance)} so'm\nBuyurtmalar: ${o.n} ta (${fmt(o.s)} so'm)\nHolat: ${u.blocked ? "⛔ bloklangan" : "✅ faol"}\nTil: ${u.lang || "-"}`, { parse_mode: "HTML" });
    }
  }
}

// ---------- Matnli xabarlar (holatga qarab) ----------
bot.on("message", async (ctx) => {
  const st = S(ctx.from.id);
  const text = ctx.message.text?.trim();
  if (st.step === "broadcast" && isAdmin(ctx.from.id)) return doBroadcast(ctx);
  if (!text) return;
  if (st.step?.startsWith("ad_") && isAdmin(ctx.from.id)) {
    const step = st.step;
    state.delete(ctx.from.id);
    return handleAdminText(ctx, step, text);
  }
  if (st.step === "topup_amount") {
    const a = Number(text.replace(/[\s,.]/g, ""));
    if (!(a >= 1000 && a <= 100_000_000)) return ctx.reply(ctx.L.bad_amount);
    st.amount = a;
    st.step = "topup_photo";
    return ctx.reply(ctx.L.topup_pay(fmt(a), esc(await getSetting("card_number")), esc(await getSetting("card_owner"))), { parse_mode: "HTML" });
  }
  if (st.step === "topup_photo") return ctx.reply(ctx.L.send_photo);
  if (st.step === "field") {
    const f = st.fields[st.fieldIdx];
    if (text.length > 64) return ctx.reply(ctx.L.enter_field(esc(f.label)), { parse_mode: "HTML" });
    st.values[f.key] = text;
    st.fieldIdx++;
    return askField(ctx);
  }
});

function notifyAdmins(html) {
  for (const a of ADMINS) bot.telegram.sendMessage(a, html, { parse_mode: "HTML" }).catch(() => {});
}

bot.catch((err, ctx) => {
  console.error("Bot xatosi:", err);
  ctx.reply?.("⚠️ Error").catch(() => {});
});

// ---------- Arcadezy webhook (ixtiyoriy) ----------
const app = express();
app.post("/arcadezy-hook", express.raw({ type: "*/*" }), async (req, res) => {
  const secret = process.env.ARCADEZY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send("no secret");
  const ts = req.headers["x-arcadezy-timestamp"] || "";
  const sig = String(req.headers["x-arcadezy-signature"] || "");
  const raw = req.body.toString("utf8");
  const expected = crypto.createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(sig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).send("bad signature");
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 600 && Math.abs(Date.now() - Number(ts)) > 600e3) return res.status(401).send("old");
  res.json({ ok: true });
  try {
    const p = parseOrder(JSON.parse(raw));
    if (!p.id) return;
    const r = await q("SELECT id FROM orders WHERE arc_id=$1", [String(p.id)]);
    if (r.rows[0]) await finishIfFinal(r.rows[0].id, p.status);
  } catch (e) { console.error("Webhook xatosi:", e); }
});

// ---------- Mini App ----------
setupWebapp(app, { bot, refund, finishIfFinal, notifyAdmins, pricing, priceUzs, cached, ADMINS, fmt, esc });

// ---------- Ishga tushirish ----------
await initDb();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("HTTP port", PORT));
setInterval(() => pollOrders().catch(console.error), 2 * 60e3);
await bot.telegram.setMyCommands([{ command: "start", description: "Start" }]);
if (WEBAPP_URL) await bot.telegram.setChatMenuButton({ menuButton: { type: "web_app", text: "Do'kon", web_app: { url: WEBAPP_URL } } }).catch(console.error);
else console.warn("WEBAPP_URL yo'q — Railway'da Generate Domain qiling");
bot.launch({ dropPendingUpdates: true });
console.log("Bot ishga tushdi ✅");
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
