/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planId = String(body?.planId || "");
    const priceInr = Number(body?.priceInr || 0);
    const userId = String(body?.userId || "guest");
    const customerEmail = String(body?.customerEmail || "").trim() || "customer@thenexusdigital.in";
    
    // Sanitize phone number to standard 10 digits for Cashfree
    let customerPhone = String(body?.customerPhone || "").replace(/[^\d]/g, "").trim();
    if (!customerPhone || customerPhone.length < 10) {
      customerPhone = "9696262007"; // agency contact default
    } else if (customerPhone.length > 10) {
      customerPhone = customerPhone.slice(-10);
    }

    const orderId = `NXN${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;

    // No Cashfree credentials configured → run in demo mode (no real charge).
    if (!isCashfreeConfigured()) {
      return NextResponse.json({ demo: true, orderId });
    }

    const product = getProduct(planId);
    const amount = priceInr || product?.priceInr || 0;
    if (!amount) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Determine absolute base URL for return_url
    const originHeader = req.headers.get("origin");
    const hostHeader = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";

    let redirectBase = String(body?.redirectBase || "").trim();
    if (!redirectBase && originHeader) {
      redirectBase = originHeader;
    } else if (!redirectBase && hostHeader) {
      redirectBase = `${proto}://${hostHeader}`;
    } else if (!redirectBase) {
      redirectBase = process.env.NEXT_PUBLIC_AGENCY_WEBSITE || "https://thenexusdigital.in";
    }
    redirectBase = redirectBase.replace(/\/+$/, "");

    // {order_id} & {order_status} placeholders are substituted by Cashfree
    // before the browser is redirected back to our success page.
    const returnUrl = `${redirectBase}/payment-success?cf_order={order_id}&plan=${encodeURIComponent(planId)}&status={order_status}`;

    const safeCustomerId = (userId || customerEmail || "guest")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 45);

    const order = await createCashfreeOrder({
      orderId,
      amountInr: amount,
      customerId: safeCustomerId,
      customerEmail,
      customerPhone,
      returnUrl,
    });

    const isProd =
      (process.env.CASHFREE_ENV || "sandbox").toLowerCase() === "production" ||
      process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ||
      process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true";

    const paymentUrl = isProd
      ? "https://api.cashfree.com/pg/view/sessions/checkout"
      : "https://sandbox.cashfree.com/pg/view/sessions/checkout";

    return NextResponse.json({
      demo: false,
      orderId: order.orderId,
      paymentSessionId: order.paymentSessionId,
      paymentUrl,
    });
  } catch (e: any) {
    console.error("Cashfree initiate error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to initiate Cashfree payment" },
      { status: 500 }
    );
  }
}
