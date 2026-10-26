import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway.internal") ? false : { rejectUnauthorized: false },
});

export const q = (text, params) => pool.query(text, params);

export async function initDb() {
  await q(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      lang TEXT,
      balance NUMERIC(14,2) NOT NULL DEFAULT 0,
      blocked BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS topups (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      amount NUMERIC(14,2) NOT NULL,
      file_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      arc_id TEXT,
      game TEXT,
      offer_id TEXT,
      offer_name TEXT,
      fields JSONB,
      cost_usd NUMERIC(14,2),
      price NUMERIC(14,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      refunded BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  const defaults = {
    markup: "10",
    usd_rate: "12800",
    card_number: process.env.CARD_NUMBER || "8600 0000 0000 0000",
    card_owner: process.env.CARD_OWNER || "-",
  };
  for (const [k, v] of Object.entries(defaults)) {
    await q("INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT DO NOTHING", [k, v]);
  }
}

export async function getSetting(key) {
  const r = await q("SELECT value FROM settings WHERE key=$1", [key]);
  return r.rows[0]?.value;
}
export async function setSetting(key, value) {
  await q("INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2", [key, String(value)]);
}

export async function upsertUser(from) {
  const r = await q(
    `INSERT INTO users(id,username,first_name) VALUES($1,$2,$3)
     ON CONFLICT(id) DO UPDATE SET username=$2, first_name=$3 RETURNING *`,
    [from.id, from.username || null, from.first_name || null]
  );
  return r.rows[0];
}
export async function getUser(id) {
  return (await q("SELECT * FROM users WHERE id=$1", [id])).rows[0];
}
export async function addBalance(id, amount) {
  const r = await q("UPDATE users SET balance=balance+$1 WHERE id=$2 RETURNING balance", [amount, id]);
  return r.rows[0]?.balance;
}
/** Pul yetarli bo'lsagina yechadi (atomar). null = yetmaydi */
export async function takeBalance(id, amount) {
  const r = await q("UPDATE users SET balance=balance-$1 WHERE id=$2 AND balance>=$1 RETURNING balance", [amount, id]);
  return r.rows[0]?.balance ?? null;
}
