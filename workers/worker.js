class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const { pathname } = url;
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    try {
      /* =====================
         1. PRODUCTS (GET)
      ===================== */
      if (method === "GET" && pathname === "/products") {
        const { results } = await env.DB
          .prepare("SELECT * FROM products ORDER BY price ASC")
          .all();
        return json(results);
      }

      if (method === "GET" && pathname.startsWith("/products/")) {
        const slug = pathname.split("/")[2];
        const item = await env.DB
          .prepare("SELECT * FROM products WHERE slug = ?")
          .bind(slug)
          .first();
        return json(item ?? null);
      }

      /* =====================
         1.5 NEWS (GET/POST)
      ===================== */
      if (method === "GET" && pathname === "/news") {
        const hasUuidColumn = await newsHasUuidColumn(env);
        const query = hasUuidColumn
          ? "SELECT id, uuid, date, title, body FROM news ORDER BY date DESC, id DESC"
          : "SELECT id, CAST(id AS TEXT) AS uuid, date, title, body FROM news ORDER BY date DESC, id DESC";

        const { results } = await env.DB.prepare(query).all();
        return json(results);
      }

      if (method === "GET" && pathname.startsWith("/news/")) {
        const key = decodeURIComponent(pathname.split("/")[2] || "");
        const hasUuidColumn = await newsHasUuidColumn(env);

        const query = hasUuidColumn
          ? "SELECT id, uuid, date, title, body FROM news WHERE uuid = ? OR CAST(id AS TEXT) = ?"
          : "SELECT id, CAST(id AS TEXT) AS uuid, date, title, body FROM news WHERE CAST(id AS TEXT) = ?";

        const stmt = hasUuidColumn ? env.DB.prepare(query).bind(key, key) : env.DB.prepare(query).bind(key);
        const item = await stmt.first();

        if (!item) {
          throw new HttpError("not found", 404);
        }

        return json(item);
      }

      if (method === "POST" && pathname === "/news") {
        authRender(req, env);
        const { date, title, body } = await req.json();

        if (!date || !title || !body) {
          throw new HttpError("date, title and body required", 400);
        }

        const hasUuidColumn = await newsHasUuidColumn(env);
        if (hasUuidColumn) {
          const newsUuid = crypto.randomUUID();
          await env.DB.prepare(
            "INSERT INTO news (uuid, date, title, body) VALUES (?, ?, ?, ?)"
          ).bind(newsUuid, date, title, body).run();
          return json({ ok: true, uuid: newsUuid }, 201);
        }

        const result = await env.DB.prepare(
          "INSERT INTO news (date, title, body) VALUES (?, ?, ?)"
        ).bind(date, title, body).run();

        const id = result.meta?.last_row_id ?? null;
        return json({ ok: true, uuid: id ? String(id) : null }, 201);
      }

      /* =====================
         2. MAIL / OTP (POST & GET)
      ===================== */
      if (method === "POST" && pathname === "/mail/otp") {
        const body = await req.json();
        const email = body.email;
        if (!email) throw new HttpError("email required", 400);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await env.DB.prepare(
          "INSERT OR REPLACE INTO otp_codes (email, otp, expires) VALUES (?, ?, datetime('now','+5 minutes'))"
        ).bind(email, otp).run();

        return json({ ok: true, otp });
      }

      if (method === "POST" && pathname === "/mail/verify") {
        const { email, otp } = await req.json();
        if (!email || !otp) throw new HttpError("email and otp required", 400);

        const row = await env.DB.prepare(
          "SELECT * FROM otp_codes WHERE email=? AND otp=? AND datetime(expires) > datetime('now')"
        ).bind(email, otp).first();

        if (!row) {
          await notifyMainServer(email, "error", env);
          throw new HttpError("invalid or expired otp", 401);
        }

        const result = await env.DB.prepare(
          "INSERT OR IGNORE INTO subscribers (email) VALUES (?)"
        ).bind(email).run();

        await env.DB.prepare("DELETE FROM otp_codes WHERE email=?").bind(email).run();

        const status = result.meta.changes > 0 ? "done" : "dup";
        await notifyMainServer(email, status, env);

        return json({ ok: true, status });
      }

      if (method === "GET" && pathname === "/mail") {
        authRender(req, env);
        const { results } = await env.DB
          .prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC")
          .all();
        return json(results);
      }

      /* =====================
         3. PRODUCTS ADMIN (POST/PUT/PATCH/DELETE)
      ===================== */
      if (method === "POST" && pathname === "/products") {
        authRender(req, env);
        const { slug, name, amount, price, image } = await req.json();
        if (!slug) throw new HttpError("slug required", 400);

        await env.DB.prepare(
          "INSERT INTO products (slug, name, amount, price, image) VALUES (?, ?, ?, ?, ?)"
        ).bind(slug, name, amount, price, image).run();
        return json({ ok: true });
      }

      if ((method === "PUT" || method === "PATCH") && pathname === "/products") {
        authRender(req, env);
        const body = await req.json();
        const { slug, ...fields } = body;
        if (!slug) throw new HttpError("slug required", 400);

        const keys = Object.keys(fields);
        if (keys.length === 0) throw new HttpError("no fields to update", 400);

        const setClause = keys.map(k => `${k}=?`).join(",");
        const values = keys.map(k => fields[k]);

        await env.DB.prepare(
          `UPDATE products SET ${setClause} WHERE slug=?`
        ).bind(...values, slug).run();
        return json({ ok: true });
      }

      if (method === "DELETE" && pathname === "/products") {
        authRender(req, env);
        const { slug } = await req.json();
        if (!slug) throw new HttpError("slug required", 400);

        await env.DB.prepare("DELETE FROM products WHERE slug=?").bind(slug).run();
        return json({ ok: true });
      }

      throw new HttpError("not found", 404);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const message = e instanceof Error ? e.message : "internal error";
      return error(message, status);
    }
  }
};


async function newsHasUuidColumn(env) {
  const { results } = await env.DB.prepare("PRAGMA table_info(news)").all();
  return results.some((column) => column.name === "uuid");
}

async function notifyMainServer(email, status, env) {
  const mainServerUrl = env.MAIN_SERVER_URL || "https://hatoage.wata777.f5.si/mail/done";

  try {
    await fetch(mainServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.RENDER_TOKEN}`
      },
      body: JSON.stringify({ email, status })
    });
  } catch (e) {
    console.error("Failed to notify main server:", e instanceof Error ? e.message : e);
  }
}

function authRender(req, env) {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${env.RENDER_TOKEN}`) {
    throw new HttpError("unauthorized", 401);
  }
}

function corsHeaders() {
  return {
    "Content-Type": "application/json; charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

function error(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg, message: msg }), {
    status,
    headers: corsHeaders()
  });
}
