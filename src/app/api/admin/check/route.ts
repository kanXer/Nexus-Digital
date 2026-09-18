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
 * Unified Admin Authorization & Session Verification Route
 * Handles admin identity verification, cookie provisioning, and superadmin checks
 * based entirely on Firebase Google Identity + .env / MongoDB authorization.
 */
async function verifyAndAuthorize(targetEmail?: string | null) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  // 1. Verify existing session cookie if present
  if (token) {
    const sessionEmail = await getSessionEmail(token);
    if (sessionEmail && (await isAllowedAdminEmail(sessionEmail))) {
      return {
        success: true,
        verified: true,
        authed: true,
        isAdmin: true,
        isSuper: isTopAdmin(sessionEmail),
        email: sessionEmail,
      };
    }
  }

  // 2. If targetEmail is provided (from authenticated Firebase user)
  if (targetEmail) {
    const normalized = targetEmail.toLowerCase().trim();
    const isAllowed = await isAllowedAdminEmail(normalized);

    if (isAllowed) {
      try {
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
          success: true,
          verified: true,
          authed: true,
          isAdmin: true,
          isSuper: isTopAdmin(normalized),
          email: normalized,
        };
      } catch (err) {
        console.error("Failed to establish admin session:", err);
      }
    }

    return {
      success: false,
      verified: false,
      authed: false,
      isAdmin: false,
      isSuper: false,
      error: "Access Denied: Your account is not authorized for Admin Access.",
    };
  }

  return {
    success: false,
    verified: false,
    authed: false,
    isAdmin: false,
    isSuper: false,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryEmail = searchParams.get("email");
  const result = await verifyAndAuthorize(queryEmail);
  return NextResponse.json(result, { status: result.authed || result.verified ? 200 : 401 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await verifyAndAuthorize(body?.email);
    return NextResponse.json(result, { status: result.success ? 200 : 403 });
  } catch {
    return NextResponse.json(
      { success: false, verified: false, authed: false, isAdmin: false, isSuper: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
