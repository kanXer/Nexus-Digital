import { notifyAdminEnquiry, sendAckEmail, ContactFormData } from "@/lib/mail";
import { saveSubmission } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

/**
 * Persist an enquiry end-to-end: Telegram notify → MongoDB → admin email → ack email.
 * Shared by the /api/contact route and the AI chatbot's auto-form flow.
 */
export async function submitEnquiry(data: ContactFormData) {
  const rawMsg = [
    `*New Business Enquiry (via AI Chatbot)*`,
    ``,
    `*Name:* ${data.name}`,
    `*Email:* ${data.email}`,
    `*Phone:* ${data.phone}`,
    data.business ? `*Business:* ${data.business}` : null,
    `*Service:* ${data.service}`,
    data.budget ? `*Budget:* ${data.budget}` : null,
    data.message ? `*Message:* ${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegram(rawMsg);
  await saveSubmission("enquiry", { ...data });
  // Auto-add to newsletter list (used by admin "Subscribers" view) only if an email was provided.
  if (data.email) {
    try {
      await saveSubmission("subscribe", { email: data.email, name: data.name, auto: true });
    } catch (subErr) {
      console.error("Auto-subscribe from enquiry failed:", subErr);
    }
  }
  const tasks: Promise<void>[] = [notifyAdminEnquiry(data)];
  if (data.email) {
    tasks.push(sendAckEmail(data.email, data.name, false, true));
  }
  await Promise.all(tasks);
}