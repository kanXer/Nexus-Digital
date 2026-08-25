/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value || "";
  return getSessionEmail(token);
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
    const subs = db.collection("submissions");

    const [counts, leadByService, leadMagnets, leadTrend] = await Promise.all([
      subs.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]).toArray(),
      subs.aggregate([
        { $match: { type: { $in: ["contact", "booking", "enquiry"] } } },
        { $group: { _id: "$data.service", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]).toArray(),
      subs.aggregate([
        { $match: { type: "leadmagnet" } },
        { $group: { _id: "$data.resourceTitle", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]).toArray(),
      subs.aggregate([
        { $match: { type: { $in: ["contact", "booking", "enquiry"] } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
    ]);

    const byType: Record<string, number> = {};
    counts.forEach((c: any) => { byType[c._id] = c.count; });

    const leadStatus = await subs
      .aggregate([
        { $match: { type: { $in: ["contact", "booking", "enquiry"] } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();
    const statusCount: Record<string, number> = {};
    leadStatus.forEach((s: any) => { statusCount[s._id] = s.count; });
    const resolved = statusCount.resolved || 0;
    const rejected = statusCount.rejected || 0;
    const pending = statusCount.pending || 0;
    const leadTotal = (byType.contact || 0) + (byType.booking || 0) + (byType.enquiry || 0);
    const closed = resolved + rejected;
    const conversionRate = leadTotal > 0 ? Math.round((closed / leadTotal) * 100) : 0;

    const keys = monthKeys(6);
    const trend = keys.map((k) => {
      const m = leadTrend.find((t: any) => t._id === k);
      const [y, mo] = k.split("-");
      const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-IN", { month: "short" });
      return { label, value: m ? m.count : 0 };
    });

    const byService = leadByService
      .map((s: any) => ({ label: s._id || "General", value: s.count }))
      .filter((s: any) => s.label);

    const magnets = leadMagnets.map((s: any) => ({
      label: s._id || "Unknown resource",
      value: s.count,
    }));

    return NextResponse.json({
      success: true,
      counts: {
        contact: byType.contact || 0,
        booking: byType.booking || 0,
        enquiry: byType.enquiry || 0,
        subscribe: byType.subscribe || 0,
        leadmagnet: byType.leadmagnet || 0,
      },
      leads: {
        total: leadTotal,
        thisWeek: await subs.countDocuments({ type: { $in: ["contact", "booking", "enquiry"] }, createdAt: { $gte: new Date(Date.now() - 7 * 864e5) } }),
        thisMonth: await subs.countDocuments({ type: { $in: ["contact", "booking", "enquiry"] }, createdAt: { $gte: new Date(Date.now() - 30 * 864e5) } }),
        pending,
        closed,
        conversionRate,
      },
      leadTrend: trend,
      leadByService: byService,
      leadMagnets: magnets,
    });
  } catch (err) {
    console.error("Overview error:", err);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}
