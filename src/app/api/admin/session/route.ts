import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, isTopAdmin, SESSION_COOKIE } from "@/lib/admin";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  return NextResponse.json({
    authed: !!adminEmail,
    email: adminEmail,
    isSuper: !!adminEmail && isTopAdmin(adminEmail),
  });
}
