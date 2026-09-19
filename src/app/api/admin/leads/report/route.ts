/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { getServicePricing } from "@/lib/servicePricingUtils";

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

    const [
      total,
      contact,
      booking,
      enquiry,
      pending,
      closed,
      thisWeek,
      thisMonth,
      byServiceAgg,
      trendAgg,
      recent,
      magnetTotal,
      magnetTop,
      byStatusAgg,
      pipelineValueAgg,
      bySourceAgg,
    ] = await Promise.all([
      col.countDocuments({ type: { $in: LEAD_TYPES } }),
      col.countDocuments({ type: "contact" }),
      col.countDocuments({ type: "booking" }),
      col.countDocuments({ type: "enquiry" }),
      col.countDocuments({ type: { $in: LEAD_TYPES }, status: { $in: ["pending", "contacted", "qualified", "proposal"] } }),
      col.countDocuments({ type: { $in: LEAD_TYPES }, status: { $in: ["won", "lost", "resolved", "confirmed", "rejected"] } }),
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
        .limit(100)
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
      col
        .aggregate([
          { $match: { type: { $in: LEAD_TYPES } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray(),
      col
        .aggregate([
          { $match: { type: { $in: LEAD_TYPES } } },
          {
            $group: {
              _id: "$status",
              totalValue: { $sum: { $ifNull: ["$data.dealValue", 0] } },
            },
          },
        ])
        .toArray(),
      col
        .aggregate([
          { $match: { type: { $in: LEAD_TYPES } } },
          { $group: { _id: { $ifNull: ["$data.source", "Direct Website"] }, count: { $sum: 1 } } },
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

    const stagesCount: Record<string, number> = {
      pending: 0,
      contacted: 0,
      qualified: 0,
      proposal: 0,
      won: 0,
      lost: 0,
    };
    byStatusAgg.forEach((s: any) => {
      const k = s._id === "resolved" || s._id === "confirmed" ? "won" : s._id === "rejected" ? "lost" : s._id || "pending";
      stagesCount[k] = (stagesCount[k] || 0) + s.count;
    });

    let totalPipelineValue = 0;
    let wonRevenue = 0;
    pipelineValueAgg.forEach((pv: any) => {
      const st = pv._id || "pending";
      if (st === "won" || st === "resolved" || st === "confirmed") {
        wonRevenue += pv.totalValue || 0;
      } else if (st !== "lost" && st !== "rejected") {
        totalPipelineValue += pv.totalValue || 0;
      }
    });

    const recentLeads = recent.map((r: any) => {
      const service = String(r.data?.service || r.data?.resourceTitle || "Digital Marketing");
      const serviceMeta = getServicePricing(service);
      const dealValue = Number(r.data?.dealValue) > 0 ? Number(r.data.dealValue) : serviceMeta.price;

      return {
        id: r._id.toString(),
        type: r.type,
        name: String(r.data?.name || r.data?.email || "Lead"),
        email: String(r.data?.email || ""),
        phone: String(r.data?.phone || ""),
        service,
        status: r.status || "pending",
        dealValue,
        cycle: serviceMeta.cycle,
        priority: r.data?.priority || "medium",
        source: r.data?.source || (r.type === "leadmagnet" ? "Lead Magnet" : "Website"),
        notes: r.data?.notes || "",
        message: r.data?.message || "",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    const closedDeals = (stagesCount.won || 0) + (stagesCount.lost || 0);
    const winRate = closedDeals > 0 ? Math.round(((stagesCount.won || 0) / closedDeals) * 100) : 0;
    const conversionRate = total > 0 ? Math.round(((stagesCount.won || 0) / total) * 100) : 0;

    const magnetTopList = magnetTop
      .map((s: any) => ({ title: s._id || "Unknown resource", count: s.count }))
      .filter((s: any) => s.title);

    const bySource = bySourceAgg.map((src: any) => ({
      source: src._id || "Direct / Website",
      count: src.count,
    }));

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
        winRate,
        totalPipelineValue,
        wonRevenue,
      },
      stages: stagesCount,
      byService,
      bySource,
      trend,
      recentLeads,
      leadMagnets: { total: magnetTotal, top: magnetTopList },
    });
  } catch (err) {
    console.error("Lead report error:", err);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
