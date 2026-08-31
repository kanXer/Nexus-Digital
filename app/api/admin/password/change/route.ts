import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, changeOwnPassword, SESSION_COOKIE } from "@/lib/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (isRateLimited(`password-change:${ip}`, 5)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }
    await changeOwnPassword(adminEmail, currentPassword, newPassword);
    cookieStore.delete(SESSION_COOKIE);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Password change failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
