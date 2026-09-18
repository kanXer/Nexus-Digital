import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSessionEmail,
  isAllowedAdminEmail,
  isTopAdmin,
  createAdminSession,
  SESSION_COOKIE,
} from "@/lib/admin";

interface AuthResult {
  success: boolean;
  verified: boolean;
  authed: boolean;
  isAdmin: boolean;
  isSuper: boolean;
  email?: string;
  newToken?: string;
  error?: string;
}

/**
 * Unified Admin Authorization & Session Verification Route
 */
async function verifyAndAuthorize(targetEmail?: string | null): Promise<AuthResult> {
  const normalizedTarget = targetEmail?.toLowerCase().trim();

  // 1. Agar specific targetEmail pass hua hai, toh pehle use authorize karke naya session banayein
  if (normalizedTarget) {
    const isAllowed = await isAllowedAdminEmail(normalizedTarget);

    if (isAllowed) {
      try {
        const newToken = await createAdminSession(normalizedTarget);
        return {
          success: true,
          verified: true,
          authed: true,
          isAdmin: true,
          isSuper: isTopAdmin(normalizedTarget),
          email: normalizedTarget,
          newToken,
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

  // 2. Agar koi email provide nahi kiya, toh existing cookie session verify karein
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

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

  return {
    success: false,
    verified: false,
    authed: false,
    isAdmin: false,
    isSuper: false,
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const queryEmail = searchParams.get("email");
  const result = await verifyAndAuthorize(queryEmail);

  const status = result.authed || result.verified ? 200 : 401;
  const res = NextResponse.json(result, { status });

  if (result.newToken) {
    res.cookies.set(SESSION_COOKIE, result.newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      priority: "high",
    });
  }

  return res;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await verifyAndAuthorize(body?.email);

    const status = result.success ? 200 : 403;
    const res = NextResponse.json(result, { status });

    if (result.newToken) {
      res.cookies.set(SESSION_COOKIE, result.newToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        priority: "high",
      });
    }

    return res;
  } catch {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        authed: false,
        isAdmin: false,
        isSuper: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
