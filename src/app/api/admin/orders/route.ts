import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb, saveOrder } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value || "";
  const email = await getSessionEmail(token);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const items = orders.map((o) => ({
      _id: o._id,
      name: o.name || "",
      email: o.email || "",
      amount: o.amount || 0,
      planName: o.planName || "",
      orderId: o.orderId || "",
      status: o.status || "Completed",
      date: o.date || "",
      time: o.time || "",
      createdAt: o.createdAt,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await saveOrder({
      name: String(body.name || ""),
      email: String(body.email || ""),
      amount: Number(body.amount || 0),
      planName: String(body.planName || ""),
      orderId: String(body.orderId || ""),
      status: String(body.status || "Completed"),
      date: String(body.date || ""),
      time: String(body.time || ""),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Orders save error:", err);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
