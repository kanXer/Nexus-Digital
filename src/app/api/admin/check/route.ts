import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSessionEmail,
  isAllowedAdminEmail,
  isTopAdmin,
  createAdminSession,
  SESSION_COOKIE,
} from "@/lib/admin";

/**
 * Handles admin authorization checking and seamless session initialization
 * for authorized administrators (.env SuperAdmin + DB authorized admins).
 */
async function verifyAndAuthorize(targetEmail?: string | null) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  // 1. If valid session cookie already exists, verify it
  if (token) {
    const sessionEmail = await getSessionEmail(token);
    if (sessionEmail && (await isAllowedAdminEmail(sessionEmail))) {
      return {
        isAdmin: true,
        isSuper: isTopAdmin(sessionEmail),
        email: sessionEmail,
      };
    }
  }

  // 2. If no valid session cookie yet, but an email is provided (from authenticated Firebase user)
  if (targetEmail) {
    const normalized = targetEmail.toLowerCase().trim();
    const isAllowed = await isAllowedAdminEmail(normalized);

    if (isAllowed) {
      try {
        // Auto-provision signed session cookie so user gets immediate dashboard access
        const newToken = await createAdminSession(normalized);
        cookieStore.set(SESSION_COOKIE, newToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
          priority: "high",
        });

        return {
          isAdmin: true,
          isSuper: isTopAdmin(normalized),
          email: normalized,
        };
      } catch (err) {
        console.error("Failed to auto-create admin session in check route:", err);
      }
    }
  }

  return { isAdmin: false, isSuper: false };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryEmail = searchParams.get("email");
  const result = await verifyAndAuthorize(queryEmail);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await verifyAndAuthorize(body?.email);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ isAdmin: false, isSuper: false });
  }
}
