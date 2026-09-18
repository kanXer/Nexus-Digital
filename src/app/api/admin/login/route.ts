import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSession, isAllowedAdminEmail, isTopAdmin, SESSION_COOKIE } from "@/lib/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const normalized = email.toLowerCase().trim();
    const isAllowed = await isAllowedAdminEmail(normalized);
    if (!isAllowed) {
      if (isRateLimited(`login:${ip}`, 10)) {
        return NextResponse.json({ error: "Too many unauthorized attempts. Please try again later." }, { status: 429 });
      }
      return NextResponse.json(
        { error: "Access Denied: You are not authorized as an administrator. Only authorized emails can access the admin dashboard." },
        { status: 403 }
      );
    }

    const token = await createAdminSession(normalized);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      priority: "high",
    });

    return NextResponse.json({
      success: true,
      email: normalized,
      isSuper: isTopAdmin(normalized),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
