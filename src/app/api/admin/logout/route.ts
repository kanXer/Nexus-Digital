import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logoutSession, SESSION_COOKIE } from "@/lib/admin";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await logoutSession(token);
    } catch (err) {
      console.error("logoutSession failed:", err);
    }
  }
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
