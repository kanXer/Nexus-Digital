/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import {
  notifyAdminPurchase,
  sendPurchaseReceipt,
  type PurchaseReceiptData,
} from "@/lib/mail";
import { getProduct } from "@/lib/products";
import { generateInvoicePdfBuffer } from "@/lib/pdf";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

// Sends the "Payment Successful" email with an itemized bill to the buyer
// (and a sales notification to the agency) after every completed purchase.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerEmail = String(body?.customerEmail || "").trim();
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ error: "Valid customerEmail required" }, { status: 400 });
    }

    const planId = body?.planId ? String(body.planId) : undefined;
    const product = planId ? getProduct(planId) : null;

    // Server-side product lookup keeps name & amount authoritative.
    const data: PurchaseReceiptData = {
      customerName: String(body?.customerName || "Customer"),
      customerEmail,
      customerPhone: body?.customerPhone ? String(body.customerPhone) : undefined,
      orderId: String(body?.orderId || `NX${Date.now()}`),
      planId,
      planName: product?.name || String(body?.planName || "Marketing Plan"),
      amountInr:
        typeof product?.priceInr === "number"
          ? product.priceInr
          : typeof body?.amountInr === "number"
          ? body.amountInr
          : undefined,
      amountDisplay:
        typeof product?.priceInr === "number"
          ? `\u20B9${product.priceInr.toLocaleString("en-IN")}${(product.cycle ?? "monthly") === "monthly" ? "/mo" : ""}`
          : String(body?.amountDisplay || ""),
      isSubscription: Boolean(body?.isSubscription ?? true),
      purchaseDate: String(body?.purchaseDate || new Date().toLocaleDateString("en-IN")),
      purchaseTime: String(body?.purchaseTime || ""),
      expiryDate: body?.expiryDate ? String(body.expiryDate) : undefined,
    };

    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = generateInvoicePdfBuffer({
        billNumber: `INV-${data.orderId}`,
        date: data.purchaseDate,
        time: data.purchaseTime,
        agencyName: config.name,
        agencyEmail: config.email,
        agencyAddress: config.address,
        agencyWebsite: config.website,
        clientName: data.customerName || "Customer",
        clientEmail: data.customerEmail,
        planName: data.planName,
        amount: data.amountInr || 0,
        currency: "INR",
        paymentRef: data.orderId,
      });
    } catch (pdfErr) {
      console.error("Failed to generate PDF buffer for email:", pdfErr);
    }

    data.invoicePdfBuffer = pdfBuffer;

    await sendPurchaseReceipt(data);
    await notifyAdminPurchase(data).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("purchase-receipt error:", e);
    return NextResponse.json(
      { error: e?.message || "Could not send receipt" },
      { status: 500 }
    );
  }
}
