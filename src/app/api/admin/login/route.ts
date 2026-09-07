import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginAdmin, SESSION_COOKIE } from "@/lib/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`login:${ip}`, 5)) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const token = await loginAdmin(email, password);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      priority: "high",
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
