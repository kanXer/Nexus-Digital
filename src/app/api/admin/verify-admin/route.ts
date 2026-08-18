import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, isAllowedAdminEmail, SESSION_COOKIE } from "@/lib/admin";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ verified: false, error: "Not authenticated" }, { status: 401 });
  }

  const adminEmail = await getSessionEmail(token);
  if (!adminEmail || !isAllowedAdminEmail(adminEmail)) {
    return NextResponse.json({ verified: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ verified: true, email: adminEmail });
}
