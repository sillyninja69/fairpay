import crypto from "crypto";
import { SessionUser } from "@/lib/auth";

const SESSION_SECRET = process.env.SESSION_SECRET || "fairpay-dev-secret-change-me";

type SessionPayload = {
  user: SessionUser;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

export function createSessionToken(user: SessionUser, ttlSeconds = 60 * 60 * 24 * 7) {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (!payload?.user || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.user;
  } catch {
    return null;
  }
}
