import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./loadServerEnv";

const ADMIN_COOKIE = "herohuman_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getAuthConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const signingSecret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const allowedAdminValue = process.env.ADMIN_EMAILS || process.env.ADMIN_USERNAME || "";
  const allowedEmails = allowedAdminValue
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!supabaseUrl || !anonKey) {
    throw new Error("缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY");
  }

  if (!signingSecret) {
    throw new Error("缺少 ADMIN_SESSION_SECRET");
  }

  if (allowedEmails.length === 0) {
    throw new Error("尚未設定 ADMIN_EMAILS");
  }

  return { supabaseUrl, anonKey, signingSecret, allowedEmails };
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createSessionToken(user) {
  const { signingSecret } = getAuthConfig();
  const payload = encode(
    JSON.stringify({
      sub: user.id,
      email: user.email.toLowerCase(),
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    })
  );

  return `${payload}.${sign(payload, signingSecret)}`;
}

function readSessionToken(token) {
  if (!token) return null;

  try {
    const { signingSecret, allowedEmails } = getAuthConfig();
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expectedSignature = sign(payload, signingSecret);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return null;
    }

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.email || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (!allowedEmails.includes(session.email.toLowerCase())) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function authenticateAdmin(email, password) {
  const { supabaseUrl, anonKey, allowedEmails } = getAuthConfig();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!allowedEmails.includes(normalizedEmail)) {
    throw new Error("此帳號沒有後台管理權限");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail, password }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.user?.id || !result.user?.email) {
    throw new Error("Email 或密碼不正確");
  }

  return {
    token: createSessionToken(result.user),
    user: {
      id: result.user.id,
      email: result.user.email,
    },
  };
}

export function setAdminSession(response, token) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}

export function clearAdminSession(response) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(request.url).origin;
}
