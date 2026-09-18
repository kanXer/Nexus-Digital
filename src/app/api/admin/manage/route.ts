import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSessionEmail,
  isTopAdmin,
  getAllAdmins,
  addAdmin,
  deleteAdmin,
  SESSION_COOKIE,
} from "@/lib/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

async function requireSuper() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const adminEmail = await getSessionEmail(token || "");
  if (!adminEmail) {
    return { error: "Not authenticated", status: 401, email: null as string | null };
  }
  if (!isTopAdmin(adminEmail)) {
    return { error: "Only the super admin can manage admins", status: 403, email: null as string | null };
  }
  return { error: null, status: 0, email: adminEmail };
}

export async function GET() {
  const auth = await requireSuper();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const admins = await getAllAdmins();
    return NextResponse.json({ admins });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load admins";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireSuper();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const ip = getClientIp(req);
  if (isRateLimited(`add-admin:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }
    await addAdmin(cleanEmail, auth.email || "superadmin");
    return NextResponse.json({ success: true, message: `Admin access granted to ${cleanEmail}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add admin";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireSuper();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await deleteAdmin(email);
    return NextResponse.json({ success: true, message: `Admin ${email} removed` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete admin";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
