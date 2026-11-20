
const corsHeaders = {
  
  "Access-Control-Allow-Origin": "https://test.arunadhikari.com.np",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
};

// JSON RESPONSE
function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders
  });
}

// BASE64 URL ENCODING
function base64url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// BASE64 URL DECODING
function decodeBase64url(value) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const binary = atob(
    base64 + "=".repeat((4 - base64.length % 4) % 4)
  );

  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

// PASSWORD HASHING
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    key,
    256
  );

  return new Uint8Array(bits);
}

// CREATE PASSWORD HASH
async function createPasswordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);

  return `pbkdf2$100000$${base64url(salt)}$${base64url(hash)}`;
}

// VERIFY PASSWORD
async function verifyPassword(password, stored) {
  try {
    if (typeof stored !== "string") {
      return false;
    }

    const parts = stored.split("$");

    if (
      parts.length !== 4 ||
      parts[0] !== "pbkdf2" ||
      parts[1] !== "100000"
    ) {
      return false;
    }

    const salt = decodeBase64url(parts[2]);
    const expected = decodeBase64url(parts[3]);
    const actual = await hashPassword(password, salt);

    if (actual.length !== expected.length) {
      return false;
    }

    let difference = 0;

    for (let i = 0; i < actual.length; i++) {
      difference |= actual[i] ^ expected[i];
    }

    return difference === 0;

  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

// JWT GENERATION
async function signJWT(payload, secret) {
  const encoder = new TextEncoder();

  const header = base64url(
    encoder.encode(
      JSON.stringify({
        alg: "HS256",
        typ: "JWT"
      })
    )
  );

  const body = base64url(
    encoder.encode(JSON.stringify(payload))
  );

  const message = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  return `${message}.${base64url(new Uint8Array(signature))}`;
}

// JWT VERIFICATION
async function verifyJWT(token, secret) {
  try {
    if (typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(
      new TextDecoder().decode(
        decodeBase64url(parts[0])
      )
    );

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );

    if (!valid) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(
        decodeBase64url(parts[1])
      )
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      !payload.exp ||
      payload.exp <= now ||
      !payload.sub
    ) {
      return null;
    }

    return payload;

  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

// MAIN WORKER
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS PREFLIGHT
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {

      // HOME
      if (path === "/" && method === "GET") {
        return new Response("Epalika API is running!", {
          status: 200,
          headers: corsHeaders
        });
      }

      // DATABASE HEALTH CHECK
      if (path === "/api/health" && method === "GET") {
        if (!env.DB) {
          return json({
            success: false,
            message: "Database binding not configured"
          }, 500);
        }

        const result = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
        ).all();

        return json({
          success: true,
          message: "Database connected successfully!",
          tables: result.results
        });
      }

      // ADMIN LOGIN
      if (path === "/api/auth/login" && method === "POST") {

        if (!env.DB || !env.JWT_SECRET) {
          return json({
            success: false,
            message: "Authentication not configured"
          }, 500);
        }

        let body;

        try {
          body = await request.json();
        } catch {
          return json({
            success: false,
            message: "Invalid JSON request"
          }, 400);
        }

        const username = String(body.username || "").trim();
        const password = String(body.password || "");

        if (!username || !password) {
          return json({
            success: false,
            message: "Username and password required"
          }, 400);
        }

        const admin = await env.DB.prepare(`
          SELECT id, full_name, username, password_hash, role, status
          FROM admin_users
          WHERE username = ?
          LIMIT 1
        `).bind(username).first();

        if (
          !admin ||
          Number(admin.status) !== 1 ||
          !(await verifyPassword(password, admin.password_hash))
        ) {
          return json({
            success: false,
            message: "Invalid username or password"
          }, 401);
        }

        const now = Math.floor(Date.now() / 1000);

        const token = await signJWT({
          sub: admin.id,
          username: admin.username,
          role: admin.role || "admin",
          iat: now,
          exp: now + 28800
        }, env.JWT_SECRET);

        await env.DB.prepare(
          "UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
        ).bind(admin.id).run();

        return json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: admin.id,
            fullName: admin.full_name,
            username: admin.username,
            role: admin.role || "admin"
          }
        });
      }

      // VERIFY LOGIN TOKEN
      if (path === "/api/auth/me" && method === "GET") {

        if (!env.DB || !env.JWT_SECRET) {
          return json({
            success: false,
            message: "Authentication not configured"
          }, 500);
        }

        const auth = request.headers.get("Authorization") || "";

        const token = auth.startsWith("Bearer ")
          ? auth.slice(7)
          : "";

        const payload = await verifyJWT(token, env.JWT_SECRET);

        if (!payload) {
          return json({
            success: false,
            message: "Invalid or expired token"
          }, 401);
        }

        const admin = await env.DB.prepare(`
          SELECT id, full_name, username, role, status
          FROM admin_users
          WHERE id = ?
        `).bind(payload.sub).first();

        if (!admin || Number(admin.status) !== 1) {
          return json({
            success: false,
            message: "Account unavailable"
          }, 401);
        }

        return json({
          success: true,
          user: {
            id: admin.id,
            fullName: admin.full_name,
            username: admin.username,
            role: admin.role || "admin"
          }
        });
      }

      // UNKNOWN ENDPOINT
      return json({
        success: false,
        message: "API endpoint not found"
      }, 404);

    } catch (error) {

      console.error(
        "EPALIKA API ERROR:",
        error?.stack || error?.message || error
      );

      return json({
        success: false,
        message: "Server error"
      }, 500);
    }
  }
};
