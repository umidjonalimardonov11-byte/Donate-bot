// Telegram Mini App uchun API
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Markup } from "telegraf";
import { q, getSetting, upsertUser, getUser, takeBalance } from "./db.js";
import { api, ApiError, parseOrder } from "./api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Eng mashhur o'yinlar (shu tartibda boshida turadi)
const POPULAR = ["mobile legends", "pubg", "free fire", "honor of kings", "genshin", "call of duty", "clash", "brawl", "roblox", "valorant", "league of legends", "honkai", "steam", "telegram"];
const popRank = (name) => {
  const n = String(name || "").toLowerCase();
  const i = POPULAR.findIndex((p) => n.includes(p));
  return i === -1 ? 999 : i;
};
const imgOf = (o) => o?.image || o?.image_url || o?.icon || o?.icon_url || o?.logo || o?.logo_url || o?.thumbnail || o?.picture || null;

/** Telegram initData imzosini tekshiradi */
function verifyInitData(initData, token) {
  if (!initData) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get("hash");
  if (!hash) return null;
  p.delete("hash");
  const dataCheck = [...p.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const calc = crypto.createHmac("sha256", secret).update(dataCheck).digest("hex");
  const a = Buffer.from(calc), b = Buffer.from(hash);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Date.now() / 1000 - Number(p.get("auth_date") || 0) > 7 * 86400) return null;
  try { return JSON.parse(p.get("user")); } catch { return null; }
}

export function setupWebapp(app, d) {
  const { bot, refund, finishIfFinal, notifyAdmins, pricing, priceUzs, cached, ADMINS, fmt, esc } = d;

  app.use(express.static(path.join(__dirname, "..", "public")));

  // Auth middleware
  const auth = async (req, res, next) => {
    const tgUser = verifyInitData(req.headers["x-init-data"], process.env.BOT_TOKEN);
    if (!tgUser?.id) return res.status(401).json({ error: "unauthorized" });
    const u = await upsertUser(tgUser);
    if (u.blocked) return res.status(403).json({ error: "blocked" });
    req.user = u;
    req.tg = tgUser;
    next();
  };
  const wrap = (fn) => (req, res) => fn(req, res).catch((e) => {
    console.error("API xatosi:", e);
    res.status(500).json({ error: e.code || "error", message: e.message });
  });

  async function allGames() {
    return cached("allgames", async () => {
      const first = await api.categories(1);
      let items = [...(first.items || [])];
      for (let p = 2; p <= (first.pages || 1) && p <= 30; p++) items = items.concat((await api.categories(p)).items || []);
      const counts = (await q("SELECT game, count(*)::int n FROM orders GROUP BY game")).rows;
      const cnt = Object.fromEntries(counts.map((r) => [r.game, r.n]));
      return items
        .map((c) => ({ slug: c.slug, name: c.name, image: imgOf(c), kind: /telegram|stars|premium|steam|gift|card|spotify|netflix|discord|apple|itunes|google play|chatgpt|youtube|xbox|playstation|psn|nitro|wallet|voucher|подар|карт/i.test(c.name) ? "other" : "game", orders: cnt[c.name] || 0, rank: popRank(c.name) }))
        .sort((a, b) => a.rank - b.rank || b.orders - a.orders || a.name.localeCompare(b.name))
        .map((g, i) => ({ ...g, top: g.rank < 999 || g.orders > 0 ? i < 6 : false }));
    });
  }

  app.get("/api/me", auth, wrap(async (req, res) => {
    const u = await getUser(req.user.id);
    const stats = (await q("SELECT count(*)::int n FROM orders WHERE user_id=$1", [u.id])).rows[0];
    res.json({
      id: String(u.id), first_name: u.first_name, username: u.username, lang: u.lang || "uz",
      photo_url: req.tg.photo_url || null,
      balance: Number(u.balance), orders: stats.n,
      card_number: await getSetting("card_number"), card_owner: await getSetting("card_owner"),
      bot_name: bot.botInfo?.first_name || "Donat", bot_username: bot.botInfo?.username || "",
      support: process.env.SUPPORT_USERNAME || "",
      is_admin: ADMINS.includes(Number(u.id)),
    });
  }));

  app.post("/api/lang", auth, express.json(), wrap(async (req, res) => {
    const l = ["uz", "ru", "en"].includes(req.body?.lang) ? req.body.lang : "uz";
    await q("UPDATE users SET lang=$1 WHERE id=$2", [l, req.user.id]);
    res.json({ ok: true });
  }));

  app.get("/api/games", auth, wrap(async (_req, res) => res.json({ games: await allGames() })));

  app.get("/api/games/:slug", auth, wrap(async (req, res) => {
    const slug = req.params.slug;
    const data = await cached(`off:${slug}`, () => api.offers(slug));
    const { rate, markup } = await pricing();
    const games = await allGames().catch(() => []);
    const g = games.find((x) => x.slug === slug);
    res.json({
      slug,
      name: data.category?.name || g?.name || slug,
      image: imgOf(data.category) || g?.image || null,
      fields: (data.fields || []).map((f) => ({
        key: f.key, label: f.label || f.key,
        options: (f.options || []).map((o) => ({ label: String(o.label ?? o.name ?? o), value: String(o.value ?? o.id ?? o) })),
      })),
      offers: (data.offers || []).map((o) => ({
        id: String(o.offer_id), name: o.name, image: imgOf(o), stock: o.stock,
        price: priceUzs(o.price_usd, rate, markup),
      })),
    });
  }));

  app.post("/api/validate", auth, express.json(), wrap(async (req, res) => {
    const { slug, values } = req.body || {};
    try {
      const v = await api.validateId(slug, values || {});
      if (v && v.valid === false) return res.json({ valid: false });
      res.json({ valid: true, nickname: v?.nickname || v?.name || v?.player_name || v?.result?.nickname || null });
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) return res.json({ valid: false });
      res.json({ valid: true, nickname: null, unchecked: true });
    }
  }));

  app.post("/api/order", auth, express.json(), wrap(async (req, res) => {
    const { slug, offer_id, values } = req.body || {};
    const data = await cached(`off:${slug}`, () => api.offers(slug));
    const offer = (data.offers || []).find((o) => String(o.offer_id) === String(offer_id));
    if (!offer) return res.status(400).json({ error: "NOT_FOUND" });
    if (offer.stock === 0) return res.status(400).json({ error: "OUT_OF_STOCK" });
    const vals = {};
    for (const f of data.fields || []) {
      const v = String(values?.[f.key] ?? "").trim();
      if (!v || v.length > 64) return res.status(400).json({ error: "FIELDS_INVALID" });
      vals[f.key] = v;
    }
    const { rate, markup } = await pricing();
    const price = priceUzs(offer.price_usd, rate, markup);
    const game = data.category?.name || slug;
    const uid = req.user.id;
    const left = await takeBalance(uid, price);
    if (left === null) return res.status(400).json({ error: "NO_MONEY", price });
    const ins = await q(
      `INSERT INTO orders(user_id,game,offer_id,offer_name,fields,cost_usd,price) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [uid, game, offer.offer_id, offer.name, vals, offer.price_usd, price]
    );
    const id = ins.rows[0].id;
    try {
      const o = parseOrder(await api.createOrder(offer.offer_id, vals, `tg-order-${id}`));
      await q("UPDATE orders SET arc_id=$1, status=$2 WHERE id=$3", [o.id, o.status, id]);
      notifyAdmins(`🆕 Buyurtma #${id} (ilova)\n${esc(game)} · ${esc(offer.name)}\n${fmt(price)} so'm · <a href="tg://user?id=${uid}">${esc(req.user.first_name)}</a> (${uid})`);
      await finishIfFinal(id, o.status);
      const st = (await q("SELECT status FROM orders WHERE id=$1", [id])).rows[0]?.status;
      return res.json({ ok: true, id, status: st });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 503 || e.status === 429 || e.status >= 500)) {
        await q("UPDATE orders SET status='unknown' WHERE id=$1", [id]);
        notifyAdmins(`⚠️ Buyurtma #${id} — yetkazib beruvchi javob bermadi (${e.code}). Avtomatik qayta tekshiriladi.`);
        return res.json({ ok: true, id, status: "pending" });
      }
      await refund(id);
      if (e.code === "INSUFFICIENT_BALANCE") notifyAdmins("🚨 Arcadezy hamyonida pul tugadi! Buyurtma #" + id + " qaytarildi.");
      else notifyAdmins(`❌ Buyurtma #${id} xatosi: ${e.status} ${e.code} ${esc(e.message)}`);
      return res.status(400).json({ error: ["OUT_OF_STOCK", "FIELDS_INVALID"].includes(e.code) ? e.code : "ORDER_FAILED" });
    }
  }));

  app.get("/api/history", auth, wrap(async (req, res) => {
    const o = (await q("SELECT id, game, offer_name, price, status, refunded, created_at FROM orders WHERE user_id=$1 ORDER BY id DESC LIMIT 50", [req.user.id])).rows;
    const t = (await q("SELECT id, amount, status, created_at FROM topups WHERE user_id=$1 ORDER BY id DESC LIMIT 30", [req.user.id])).rows;
    res.json({ orders: o, topups: t });
  }));

  // Chek rasmi: body = rasm, ?amount=
  app.post("/api/topup", auth, express.raw({ type: "image/*", limit: "10mb" }), wrap(async (req, res) => {
    const amount = Number(req.query.amount);
    if (!(amount >= 1000 && amount <= 100_000_000)) return res.status(400).json({ error: "BAD_AMOUNT" });
    if (!req.body?.length) return res.status(400).json({ error: "NO_PHOTO" });
    const u = req.user;
    const r = await q("INSERT INTO topups(user_id,amount) VALUES($1,$2) RETURNING id", [u.id, amount]);
    const id = r.rows[0].id;
    const caption = `💳 To'ldirish #${id} (ilova)\n👤 <a href="tg://user?id=${u.id}">${esc(u.first_name)}</a> ${u.username ? "@" + esc(u.username) : ""} (<code>${u.id}</code>)\n💰 <b>${fmt(amount)} so'm</b>`;
    let fileId = null;
    for (const a of ADMINS) {
      const m = await bot.telegram.sendPhoto(a, fileId || { source: req.body }, {
        caption, parse_mode: "HTML",
        ...Markup.inlineKeyboard([[Markup.button.callback("✅ Tasdiqlash", `ta:${id}`), Markup.button.callback("❌ Rad etish", `tr:${id}`)]]),
      }).catch((e) => { console.error(e); return null; });
      if (m && !fileId) fileId = m.photo?.at(-1)?.file_id;
    }
    if (fileId) await q("UPDATE topups SET file_id=$1 WHERE id=$2", [fileId, id]);
    res.json({ ok: true, id });
  }));
}
