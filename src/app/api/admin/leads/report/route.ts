/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";

const LEAD_TYPES = ["contact", "booking", "enquiry"];

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const email = await getSessionEmail(token || "");
  return email;
}

function startOf(unit: "week" | "month"): Date {
  const d = new Date();
  if (unit === "week") {
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function monthKeys(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export async function GET() {
  const email = await requireAuth();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();
    const col = db.collection("submissions");

    const [total, contact, booking, enquiry, pending, closed, thisWeek, thisMonth, byServiceAgg, trendAgg, recent, magnetTotal, magnetTop] =
      await Promise.all([
        col.countDocuments({ type: { $in: LEAD_TYPES } }),
        col.countDocuments({ type: "contact" }),
        col.countDocuments({ type: "booking" }),
        col.countDocuments({ type: "enquiry" }),
        col.countDocuments({ type: { $in: LEAD_TYPES }, status: "pending" }),
        col.countDocuments({ type: { $in: LEAD_TYPES }, status: { $in: ["resolved", "confirmed", "rejected"] } }),
        col.countDocuments({ type: { $in: LEAD_TYPES }, createdAt: { $gte: startOf("week") } }),
        col.countDocuments({ type: { $in: LEAD_TYPES }, createdAt: { $gte: startOf("month") } }),
        col
          .aggregate([
            { $match: { type: { $in: LEAD_TYPES } } },
            { $group: { _id: "$data.service", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
          ])
          .toArray(),
        col
          .aggregate([
            { $match: { type: { $in: LEAD_TYPES } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),
        col
          .find({ type: { $in: LEAD_TYPES } })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray(),
        col.countDocuments({ type: "leadmagnet" }),
        col
          .aggregate([
            { $match: { type: "leadmagnet" } },
            { $group: { _id: "$data.resourceTitle", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
          ])
          .toArray(),
      ]);

    const keys = monthKeys(6);
    const trend = keys.map((k) => ({
      month: k,
      count: (trendAgg.find((t: any) => t._id === k)?.count || 0) as number,
    }));

    const byService = byServiceAgg
      .map((s: any) => ({
        service: s._id || "General / Unspecified",
        count: s.count,
      }))
      .filter((s: any) => s.service);

    const recentLeads = recent.map((r: any) => ({
      id: r._id.toString(),
      type: r.type,
      name: String(r.data?.name || "—"),
      service: String(r.data?.service || r.data?.business || "—"),
      status: r.status || "pending",
      createdAt: r.createdAt,
    }));

    const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    const magnetTopList = magnetTop
      .map((s: any) => ({ title: s._id || "Unknown resource", count: s.count }))
      .filter((s: any) => s.title);

    return NextResponse.json({
      success: true,
      totals: {
        total,
        contact,
        booking,
        enquiry,
        pending,
        closed,
        thisWeek,
        thisMonth,
        conversionRate,
      },
      byService,
      trend,
      recentLeads,
      leadMagnets: { total: magnetTotal, top: magnetTopList },
    });
  } catch (err) {
    console.error("Lead report error:", err);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
