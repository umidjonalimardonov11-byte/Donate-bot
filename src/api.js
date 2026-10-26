const BASE = "https://arcadezy.com/api/v1";

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

async function call(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "X-API-Key": process.env.ARCADEZY_API_KEY,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok || data.ok === false) {
    const code = data.code || data.error?.code || (res.status === 404 ? "NOT_FOUND" : "ERROR");
    const msg = data.message || data.error?.message || text.slice(0, 200);
    console.error(`Arcadezy ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
    throw new ApiError(res.status, code, msg);
  }
  return data;
}

export const api = {
  balance: () => call("/balance"),
  categories: (page = 1) => call(`/categories?type=topup&page=${page}`),
  offers: (slug) => call(`/categories/${encodeURIComponent(slug)}/offers`),
  validateId: (slug, fields) => call(`/categories/${encodeURIComponent(slug)}/validate-id`, { method: "POST", body: { fields } }),
  createOrder: (offer_id, fields, idemKey, qty) =>
    call("/orders", { method: "POST", body: { offer_id, fields, ...(qty ? { qty } : {}) }, headers: { "Idempotency-Key": idemKey } }),
  order: (id) => call(`/orders/${encodeURIComponent(id)}`),
  setWebhook: (url) => call("/webhook", { method: "PUT", body: { url } }),
};

/** Javobdan buyurtma id va holatini ajratib oladi (format har xil bo'lishi mumkin) */
export function parseOrder(data) {
  const o = data.order || data.data || data;
  return { id: o.order_id || o.id, status: String(o.status || "pending").toLowerCase() };
}

export const DONE = ["completed", "complete", "success", "delivered", "done", "fulfilled"];
export const FAILED = ["failed", "canceled", "cancelled", "refunded", "rejected", "error"];
