import { NextResponse } from "next/server";
import { notifyAdminContact, notifyAdminEnquiry, notifyAdminBooking, sendAckEmail, ContactFormData } from "@/lib/mail";
import { saveSubmission } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

type BookingData = ContactFormData & { date?: string; time?: string };

async function sendTelegram(msg: string) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping telegram");
    return;
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: "Markdown" }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Telegram send error:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, business, service, budget, message, date, time, type } = body as BookingData & { type?: string };

    if (!name || !email || !phone || !service) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isBooking = type === "booking";
    const isEnquiry = type === "enquiry";

    const msg = [
      isBooking ? `*New Meeting Booking*` : isEnquiry ? `*New Business Enquiry*` : `*New Contact Form Submission*`,
      ``,
      `*Name:* ${name}`,
      `*Email:* ${email}`,
      `*Phone:* ${phone}`,
      business ? `*Business:* ${business}` : null,
      `*Service:* ${service}`,
      budget ? `*Budget:* ${budget}` : null,
      date ? `*Preferred Date:* ${date}` : null,
      time ? `*Preferred Time:* ${time}` : null,
      message ? `*Message:* ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Telegram
    await sendTelegram(msg);

    // MongoDB — submission save
    await saveSubmission(isBooking ? "booking" : isEnquiry ? "enquiry" : "contact", {
      name, email, phone, business, service, budget, message, date, time,
    });

    // Gmail SMTP
    await Promise.all([
      isBooking
        ? notifyAdminBooking({ name, email, phone, business, service, budget, message, date, time })
        : isEnquiry
        ? notifyAdminEnquiry({ name, email, phone, business, service, budget, message })
        : notifyAdminContact({ name, email, phone, business, service, budget, message }),
      sendAckEmail(email, name, isBooking, isEnquiry),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
