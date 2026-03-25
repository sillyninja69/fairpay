import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SessionUser } from "@/lib/auth";
import { createSessionToken } from "@/lib/server/session";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SessionUser> & { password?: string };

    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!name || !email || !password || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
    }

    // Demo auth: accepts any non-empty credentials and creates signed session.
    const user: SessionUser = { name, email };
    const token = createSessionToken(user);

    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
