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
    const planName = String(body?.planName || "Marketing Plan");
    const redirectBase = String(body?.redirectBase || "");
    const userId = String(body?.userId || "guest");
    const customerEmail = String(body?.customerEmail || "").trim();
    const customerPhone = String(body?.customerPhone || "").replace(/[^\d+]/g, "");
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
    // Cashfree requires customer email & phone on every order.
    if (!customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Email and phone are required to start the payment." },
        { status: 400 }
      );
    }

    // {order_id} & {order_status} placeholders are substituted by Cashfree
    // before the browser is redirected back to our success page.
    const returnUrl = `${redirectBase}/payment-success?cf_order={order_id}&plan=${encodeURIComponent(planId)}&status={order_status}`;

    const order = await createCashfreeOrder({
      orderId,
      amountInr: amount,
      customerId: userId || customerEmail,
      customerEmail,
      customerPhone,
      returnUrl,
    });

    const checkoutBase =
      process.env.CASHFREE_ENV === "production"
        ? "https://dashboard.cashfree.com"
        : "https://sandbox.cashfree.com";

    return NextResponse.json({
      demo: false,
      ...order,
      checkoutUrl: `${checkoutBase}/pay/${order.paymentSessionId}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to initiate Cashfree payment" },
      { status: 500 }
    );
  }
}
