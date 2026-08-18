import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSessionEmail,
  isTopAdmin,
  getAllAdmins,
  addAdmin,
  deleteAdmin,
  updateAdmin,
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
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    await addAdmin(email, password);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add admin";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireSuper();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { email, newEmail, newPassword } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await updateAdmin(email, { email: newEmail, password: newPassword });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update admin";
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
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete admin";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
