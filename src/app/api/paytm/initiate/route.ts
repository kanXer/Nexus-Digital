/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { isPaytmConfigured, initiatePaytmPayment } from "@/lib/paytm";
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
    const orderId = `NXN${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;

    // No Paytm credentials configured → run in demo mode (no real charge).
    if (!isPaytmConfigured()) {
      return NextResponse.json({ demo: true, orderId });
    }

    const product = getProduct(planId);
    const amount = priceInr || product?.priceInr || 0;
    if (!amount) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const returnQuery = `po=${orderId}&plan=${encodeURIComponent(planId)}`;
    const callbackUrl = `${redirectBase}/api/paytm/callback?${returnQuery}`;

    const { url } = await initiatePaytmPayment({
      orderId,
      amountInr: amount,
      customerId: userId,
      callbackUrl,
    });

    return NextResponse.json({ demo: false, url, orderId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to initiate Paytm payment" },
      { status: 500 }
    );
  }
}
