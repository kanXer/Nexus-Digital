/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  capturePayPalOrder,
  getPayPalOrder,
  getPayPalSubscription,
} from "@/lib/paypal";
import { getProduct } from "@/lib/products";
import {
  convertFromInr,
  convertToInr,
  PAYPAL_CURRENCY,
} from "@/lib/paypalConfig";
import { generateInvoicePdf } from "@/lib/pdf";
import { config } from "@/lib/config";
import { sendInvoiceEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = String(body?.productId || body?.planId || "");
    const paypalOrderId = String(body?.paypalOrderId || "");
    const subscriptionId = String(body?.subscriptionId || "");

    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }
    if (!paypalOrderId && !subscriptionId) {
      return NextResponse.json({ error: "Missing PayPal reference" }, { status: 400 });
    }

    const db = await getDb();

    // Idempotency: never charge or record the same PayPal object twice.
    const idemQuery: any = {};
    if (subscriptionId) idemQuery.subscriptionId = subscriptionId;
    if (paypalOrderId) idemQuery.paypalOrderId = paypalOrderId;
    const existing = await db.collection("payments").findOne(idemQuery);
    if (existing) {
      return NextResponse.json({
        ok: true,
        billNumber: existing.billNumber,
        payerName: existing.payerName,
        payerEmail: existing.payerEmail,
        alreadyRecorded: true,
      });
    }

    let payerName = "Customer";
    let payerEmail = "";
    let paypalRef = "";
    let captureOrSubId = "";
    let paidAmount = 0;
    let paidCurrency = PAYPAL_CURRENCY;
    let amountInr = 0;

    if (subscriptionId) {
      // ── Recurring / autopay subscription ──
      let sub: any;
      try {
        sub = await getPayPalSubscription(subscriptionId);
      } catch (e: any) {
        console.error("PayPal subscription fetch error:", e);
        return NextResponse.json(
          { error: "Subscription could not be verified", detail: e?.message },
          { status: 402 }
        );
      }

      const subStatus = sub?.status;
      const lastPayment = sub?.billing_info?.last_payment?.amount;
      const subAmount = lastPayment
        ? Number(lastPayment.value)
        : convertFromInr(product.priceInr);
      const subCurrency = lastPayment?.currency_code || PAYPAL_CURRENCY;

      // Accept whatever was actually paid — only require an active subscription.
      if (subStatus !== "ACTIVE" && subStatus !== "APPROVED") {
        console.error("Subscription not active:", subStatus);
        return NextResponse.json(
          { error: "Subscription verification failed" },
          { status: 400 }
        );
      }

      paidAmount = subAmount;
      paidCurrency = subCurrency;
      amountInr = convertToInr(paidAmount, paidCurrency);

      const subName = sub?.subscriber?.name;
      payerName =
        `${subName?.given_name || ""} ${subName?.surname || ""}`.trim() ||
        "Customer";
      payerEmail = sub?.subscriber?.email_address || "";
      paypalRef = subscriptionId;
      captureOrSubId = subscriptionId;
    } else {
      // ── One-time payment ──
      let order: any;
      try {
        order = await getPayPalOrder(paypalOrderId);
      } catch (e: any) {
        console.error("PayPal order fetch error:", e);
        return NextResponse.json(
          { error: "Payment could not be verified", detail: e?.message },
          { status: 402 }
        );
      }

      const orderAmount = Number(order?.purchase_units?.[0]?.amount?.value);
      const orderCurrency = order?.purchase_units?.[0]?.amount?.currency_code;

      // Accept the actual captured amount — no strict amount/currency match.
      paidAmount = orderAmount;
      paidCurrency = orderCurrency || PAYPAL_CURRENCY;
      amountInr = convertToInr(paidAmount, paidCurrency);

      let capture: any;
      try {
        capture = await capturePayPalOrder(paypalOrderId);
      } catch (e: any) {
        console.error("PayPal capture error:", e);
        return NextResponse.json(
          { error: "Payment could not be captured", detail: e?.message },
          { status: 402 }
        );
      }

      if (capture?.status !== "COMPLETED") {
        console.error("Payment not completed:", capture?.status);
        return NextResponse.json(
          { error: "Payment verification failed" },
          { status: 400 }
        );
      }

      const payer = capture?.payer || {};
      payerName =
        `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim() ||
        "Customer";
      payerEmail = payer.email_address || "";
      paypalRef = paypalOrderId;
      captureOrSubId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    }

    const billNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const invoiceData = {
      billNumber,
      date: new Date().toLocaleString("en-IN"),
      agencyName: config.name,
      agencyEmail: config.email,
      agencyAddress: config.address,
      clientName: payerName,
      clientEmail: payerEmail,
      planName: product.name,
      amount: amountInr,
      currency: "INR",
      paypalOrderId: paypalRef,
    };

    const pdfBlob = generateInvoicePdf(invoiceData);
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    const doc = {
      billNumber,
      productId: product.id,
      productName: product.name,
      paidCurrency,
      paidAmount,
      amount: amountInr,
      currency: "INR",
      cycle: product.cycle,
      recurring: !!subscriptionId,
      paypalOrderId: paypalOrderId || undefined,
      subscriptionId: subscriptionId || undefined,
      paypalCaptureId: captureOrSubId || undefined,
      payerName,
      payerEmail,
      status: "paid",
      createdAt: new Date(),
    };

    try {
      await db.collection("payments").insertOne(doc);
    } catch (e: any) {
      if (e?.code === 11000) {
        const dup = await db
          .collection("payments")
          .findOne(idemQuery);
        if (dup) {
          return NextResponse.json({
            ok: true,
            billNumber: dup.billNumber,
            payerName: dup.payerName,
            payerEmail: dup.payerEmail,
            alreadyRecorded: true,
          });
        }
      }
      throw e;
    }

    const html = `<p>Hi ${payerName},</p>
<p>Thank you for your payment. Your invoice is attached.</p>
    <p>Invoice: <b>${billNumber}</b><br/>Service: ${product.name}${
      subscriptionId ? " (Recurring / Autopay)" : ""
    }<br/>Amount: Rs. ${amountInr.toLocaleString("en-IN")}</p>
<p>Regards,<br/>${config.name}</p>`;

    if (payerEmail) {
      await sendInvoiceEmail({
        to: payerEmail,
        subject: `Your Invoice ${billNumber} — ${config.name}`,
        html,
        attachment: {
          filename: `${billNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      });
    }
    await sendInvoiceEmail({
      to: config.email,
      subject: `Payment received ${billNumber} — ${product.name}`,
      html,
      attachment: {
        filename: `${billNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    });

    return NextResponse.json({ ok: true, billNumber, payerName, payerEmail });
  } catch (err) {
    console.error("Order processing error:", err);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
