/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getDb } from "@/lib/db";
import {
  getCashfreeOrderStatus,
  getCashfreePayments,
  isCashfreeConfigured,
} from "@/lib/cashfree";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value || "";
  return getSessionEmail(token);
}

export async function GET(req: Request) {
  const adminEmail = await requireAuth();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const filterStatus = url.searchParams.get("status") || "all";
    const searchQuery = (url.searchParams.get("q") || "").toLowerCase().trim();

    const db = await getDb();
    const ordersCol = db.collection("orders");

    // Retrieve all orders
    const rawOrders = await ordersCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    // Map and normalize orders for Cashfree tracking
    const items = rawOrders.map((o) => {
      const isSuccess =
        o.paymentStatus === "SUCCESS" ||
        o.status === "Completed" ||
        o.status === "PAID";
      const isFailed =
        o.paymentStatus === "FAILED" ||
        o.status === "Failed" ||
        o.status === "CANCELLED";

      const normalizedStatus = isSuccess
        ? "SUCCESS"
        : isFailed
        ? "FAILED"
        : "PENDING";

      return {
        _id: o._id.toString(),
        orderId: o.orderId || `ORD-${o._id.toString().slice(-6)}`,
        cfPaymentId: o.cfPaymentId || o.paymentId || "",
        amount: Number(o.amount || o.order_amount || 0),
        currency: o.currency || "INR",
        planName: o.planName || o.title || "Growth Package",
        customerName: o.name || o.customerName || "Nexus Client",
        customerEmail: o.email || o.customerEmail || "",
        customerPhone: o.phone || o.customerPhone || "",
        paymentStatus: normalizedStatus,
        rawStatus: o.status || "Completed",
        paymentMethod: o.paymentMethod || o.method || "Cashfree PG",
        date: o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : ""),
        time: o.time || (o.createdAt ? new Date(o.createdAt).toLocaleTimeString("en-IN") : ""),
        createdAt: o.createdAt || new Date(),
        updatedAt: o.updatedAt || o.createdAt || new Date(),
      };
    });

    // Compute KPI metrics across all orders
    const totalTransactions = items.length;
    const successfulOrders = items.filter((o) => o.paymentStatus === "SUCCESS");
    const pendingOrders = items.filter((o) => o.paymentStatus === "PENDING");
    const failedOrders = items.filter((o) => o.paymentStatus === "FAILED");

    const totalCashfreeRevenue = successfulOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const averageOrderValue = successfulOrders.length > 0 ? Math.round(totalCashfreeRevenue / successfulOrders.length) : 0;

    // Apply filtering
    let filtered = items;
    if (filterStatus !== "all") {
      filtered = filtered.filter((o) => o.paymentStatus === filterStatus.toUpperCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.orderId.toLowerCase().includes(searchQuery) ||
          o.cfPaymentId.toLowerCase().includes(searchQuery) ||
          o.customerName.toLowerCase().includes(searchQuery) ||
          o.customerEmail.toLowerCase().includes(searchQuery) ||
          o.customerPhone.toLowerCase().includes(searchQuery) ||
          o.planName.toLowerCase().includes(searchQuery)
      );
    }

    const isLive =
      (process.env.CASHFREE_ENV || "").toLowerCase() === "production" ||
      (process.env.NEXT_PUBLIC_CASHFREE_MODE || "").toLowerCase() === "production" ||
      process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true";

    return NextResponse.json({
      items: filtered,
      totalCount: items.length,
      filteredCount: filtered.length,
      gateway: {
        configured: isCashfreeConfigured(),
        environment: isLive ? "Production (Live)" : "Sandbox (Test)",
        isLive,
      },
      kpis: {
        totalRevenue: totalCashfreeRevenue,
        successfulCount: successfulOrders.length,
        pendingCount: pendingOrders.length,
        failedCount: failedOrders.length,
        totalTransactions,
        averageOrderValue,
      },
    });
  } catch (err: any) {
    console.error("Cashfree payments fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch payments log" }, { status: 500 });
  }
}

// POST endpoint to verify/reconcile an order directly against Cashfree REST API
export async function POST(req: Request) {
  const adminEmail = await requireAuth();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const db = await getDb();
    const ordersCol = db.collection("orders");
    const existingOrder = await ordersCol.findOne({ orderId });

    if (!isCashfreeConfigured()) {
      return NextResponse.json({
        demo: true,
        message: "Cashfree API keys are in demo mode. Gateway status simulation active.",
        status: existingOrder?.status || "Completed",
      });
    }

    let cfOrder: any = null;
    let cfPayments: any[] = [];
    let isPaid = false;
    let cfPaymentId = "";
    let paymentMethod = "";

    try {
      cfOrder = await getCashfreeOrderStatus(orderId);
      if (cfOrder?.order_status === "PAID") {
        isPaid = true;
      }
    } catch (e: any) {
      console.warn("Cashfree get order error:", e?.message);
    }

    try {
      const paymentsRes = await getCashfreePayments(orderId);
      if (Array.isArray(paymentsRes) && paymentsRes.length > 0) {
        cfPayments = paymentsRes;
        const successAttempt = paymentsRes.find((p: any) => p?.payment_status === "SUCCESS");
        if (successAttempt) {
          isPaid = true;
          cfPaymentId = successAttempt?.cf_payment_id || "";
          paymentMethod = successAttempt?.payment_group || successAttempt?.payment_method || "Online";
        }
      }
    } catch (e: any) {
      console.warn("Cashfree get payments error:", e?.message);
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (isPaid) {
      updateFields.paymentStatus = "SUCCESS";
      updateFields.status = "Completed";
      if (cfPaymentId) updateFields.cfPaymentId = cfPaymentId;
      if (paymentMethod) updateFields.paymentMethod = paymentMethod;
    } else if (cfOrder?.order_status === "EXPIRED" || cfOrder?.order_status === "CANCELLED") {
      updateFields.paymentStatus = "FAILED";
      updateFields.status = "Failed";
    }

    await ordersCol.updateOne({ orderId }, { $set: updateFields });

    return NextResponse.json({
      success: true,
      orderId,
      isPaid,
      cfPaymentId,
      orderStatus: cfOrder?.order_status || "UNKNOWN",
      cfPayments,
    });
  } catch (err: any) {
    console.error("Cashfree order verification error:", err);
    return NextResponse.json({ error: err?.message || "Failed to verify order" }, { status: 500 });
  }
}
