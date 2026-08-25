import nodemailer from "nodemailer";
import { config } from "@/lib/config";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SENDER_EMAIL = process.env.SMTP_SENDER_EMAIL || SMTP_USER || config.email;
const SENDER_NAME = process.env.SMTP_SENDER_NAME || config.name;

const transporter = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  business?: string;
  service: string;
  budget?: string;
  message?: string;
}

function wrapHtml(title: string, rows: { label: string; value: string }[]) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:28px 40px;background:linear-gradient(135deg,#dc2626,#b91c1c);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">${title}</h1>
      </td></tr>
      <tr><td style="padding:28px 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0">
          ${rows
            .map(
              (r) => `
          <tr>
            <td style="padding:10px 14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#888;width:120px;vertical-align:top">${r.label}</td>
            <td style="padding:10px 14px;font-size:14px;color:#333;white-space:pre-wrap">${r.value}</td>
          </tr>`
            )
            .join("")}
        </table>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.warn("Gmail SMTP not configured — skipping email");
    return;
  }
  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to,
    subject,
    html,
  });
}

export async function notifyAdminContact(data: ContactFormData) {
  const rows = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    ...(data.business ? [{ label: "Business", value: data.business }] : []),
    { label: "Service", value: data.service },
    ...(data.budget ? [{ label: "Budget", value: data.budget }] : []),
    ...(data.message ? [{ label: "Message", value: data.message }] : []),
  ];
  await sendMail(
    SENDER_EMAIL,
    `New Contact Request — ${data.name}`,
    wrapHtml("New Contact Request", rows)
  );
}

export async function notifyAdminEnquiry(data: ContactFormData) {
  const rows = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    ...(data.business ? [{ label: "Business", value: data.business }] : []),
    { label: "Service", value: data.service },
    ...(data.budget ? [{ label: "Budget", value: data.budget }] : []),
    ...(data.message ? [{ label: "Message", value: data.message }] : []),
  ];
  await sendMail(
    SENDER_EMAIL,
    `New Enquiry — ${data.name}`,
    wrapHtml("New Business Enquiry", rows)
  );
}

export async function notifyAdminBooking(data: ContactFormData & { date?: string; time?: string }) {
  const rows = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    ...(data.business ? [{ label: "Business", value: data.business }] : []),
    { label: "Service", value: data.service },
    ...(data.budget ? [{ label: "Budget", value: data.budget }] : []),
    ...(data.date ? [{ label: "Preferred Date", value: data.date }] : []),
    ...(data.time ? [{ label: "Preferred Time", value: data.time }] : []),
    ...(data.message ? [{ label: "Message", value: data.message }] : []),
  ];
  await sendMail(
    SENDER_EMAIL,
    `New Meeting Booking — ${data.name}`,
    wrapHtml("New Meeting Booking", rows)
  );
}

export async function sendAckEmail(email: string, name: string, booking: boolean, enquiry = false) {
  const title = booking ? "Free Consultation Booked!" : enquiry ? "We've received your enquiry" : "We've received your message";
  const body = booking
    ? `Thanks for booking a free consultation! Our team will reach out to confirm your meeting slot within 24 hours.`
    : enquiry
    ? `Thanks for your enquiry! Our team has received your details and will get back to you within 24 hours.`
    : `Thanks for reaching out! Our team has received your details and will get back to you within 24 hours.`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:linear-gradient(135deg,#dc2626,#b91c1c);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">${title}</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="font-size:16px;color:#333">Hey ${name},</p>
        <p style="font-size:15px;color:#555;line-height:1.6">${body}</p>
        <p style="font-size:15px;color:#555;line-height:1.6">Meanwhile, feel free to check out our <a href="${config.website}" style="color:#dc2626">website</a> to learn more about our services.</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${config.website}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:bold">Visit Our Website</a>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#999;text-align:center">${config.name} — ${config.address}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
  await sendMail(email, title, html);
}

export async function sendBookingStatusEmail(customerEmail: string, name: string, booking: ContactFormData & { date?: string; time?: string }, confirmed: boolean) {
  const title = confirmed ? "Your Meeting is Confirmed!" : "Meeting Booking Update";
  const body = confirmed
    ? `Great news ${name}! Your free consultation is confirmed. We're excited to help you grow.`
    : `Hi ${name}, your consultation booking is still under review. We'll get back to you soon.`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:linear-gradient(135deg,#dc2626,#b91c1c);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">${title}</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="font-size:16px;color:#333">Hey ${name},</p>
        <p style="font-size:15px;color:#555;line-height:1.6">${body}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
          <tr><td style="padding:10px 14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#888">Preferred Date</td><td style="padding:10px 14px;font-size:14px;color:#333">${booking.date || "—"}</td></tr>
          <tr><td style="padding:10px 14px;font-size:13px;color:#888">Preferred Time</td><td style="padding:10px 14px;font-size:14px;color:#333">${booking.time || "—"}</td></tr>
        </table>
        <p style="font-size:15px;color:#555;line-height:1.6">If anything changes, we'll keep you updated. Feel free to check out our <a href="${config.website}" style="color:#dc2626">website</a>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#999;text-align:center">${config.name} — ${config.address}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
  await sendMail(customerEmail, title, html);
}

export async function sendBookingRejectedEmail(customerEmail: string, name: string) {
  const title = "Meeting Booking Update";
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:linear-gradient(135deg,#dc2626,#b91c1c);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">${title}</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="font-size:16px;color:#333">Hey ${name},</p>
        <p style="font-size:15px;color:#555;line-height:1.6">Unfortunately, we won't be able to schedule your consultation for the requested slot. Our schedule is currently full, but we'd still love to help you grow.</p>
        <p style="font-size:15px;color:#555;line-height:1.6">Feel free to pick a different time or reach out on WhatsApp — we'll do our best to fit you in.</p>
        <p style="font-size:15px;color:#555;line-height:1.6">Thanks for considering ${config.name}!</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#999;text-align:center">${config.name} — ${config.address}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
  await sendMail(customerEmail, title, html);
}

export async function sendContactResolvedEmail(customerEmail: string, name: string) {
  const title = "Your Query has been Resolved!";
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:linear-gradient(135deg,#dc2626,#b91c1c);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">${title}</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="font-size:16px;color:#333">Hey ${name},</p>
        <p style="font-size:15px;color:#555;line-height:1.6">We're happy to let you know your query has been resolved by our team. If you have any more questions, don't hesitate to reach out.</p>
        <p style="font-size:15px;color:#555;line-height:1.6">Thanks for choosing ${config.name}!</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#999;text-align:center">${config.name} — ${config.address}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
  await sendMail(customerEmail, title, html);
}

export async function sendAdminStatusNote(subject: string, rows: { label: string; value: string }[]) {
  await sendMail(SENDER_EMAIL, subject, wrapHtml("Status Updated", rows));
}

export interface InvoiceAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export async function sendInvoiceEmail(opts: {
  to: string;
  subject: string;
  html: string;
  attachment: InvoiceAttachment;
}) {
  if (!transporter) {
    console.warn("SMTP not configured — skipping invoice email");
    return;
  }
  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: [
      {
        filename: opts.attachment.filename,
        content: opts.attachment.content,
        contentType: opts.attachment.contentType,
      },
    ],
  });
}

export interface PurchaseReceiptData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderId: string;
  planId?: string;
  planName: string;
  amountInr?: number;
  amountDisplay: string;
  isSubscription: boolean;
  purchaseDate: string;
  purchaseTime: string;
  expiryDate?: string;
  invoicePdfBuffer?: Buffer;
}

export async function sendPurchaseReceipt(d: PurchaseReceiptData) {
  const invoiceNo = `INV-${d.orderId}`;
  const base = d.amountInr && d.amountInr > 0 ? d.amountInr : 0;
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Bill reflects the EXACT amount the gateway collected — no phantom GST
  // added on top. Taxes are stated as included, matching the "+GST" pricing
  // shown on the site.
  const billRows = [
    { label: "Invoice No.", value: invoiceNo },
    { label: "Order ID", value: d.orderId },
    { label: "Service / Plan", value: `${d.planName}${d.isSubscription ? " (Monthly)" : " (One-time)"}` },
    ...(base > 0
      ? [
          { label: "Amount Paid", value: `\u20B9${fmt(base)}`, bold: true },
          { label: "Taxes", value: "Inclusive of all applicable taxes" },
        ]
      : [{ label: "Amount Paid", value: d.amountDisplay || "Paid", bold: true }]),
    { label: "Purchase Date", value: `${d.purchaseDate} at ${d.purchaseTime}` },
    ...(d.isSubscription && d.expiryDate ? [{ label: "Next Billing Date", value: d.expiryDate }] : []),
    { label: "Status", value: "PAID ✅" },
  ] as { label: string; value: string; bold?: boolean }[];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:linear-gradient(135deg,#16a34a,#15803d);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:26px">Payment Successful 🎉</h1>
        <p style="color:#dcfce7;margin:8px 0 0;font-size:14px">Thank you for your purchase!</p>
      </td></tr>
      <tr><td style="padding:28px 40px">
        <p style="font-size:16px;color:#333">Hey ${d.customerName || "there"},</p>
        <p style="font-size:15px;color:#555;line-height:1.6">
          Your payment was received successfully and <strong>${d.planName}</strong> is now active.
          Our team will onboard you within 24 hours. Here's your purchase bill:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
          ${billRows.map((r) => `
          <tr>
            <td style="padding:10px 14px;background:#f9f9f9;border-radius:8px;font-size:13px;color:#888;width:150px">${r.label}</td>
            <td style="padding:10px 14px;font-size:${r.bold ? "15px;font-weight:bold;color:#111" : "14px;color:#333"}">${r.value}</td>
          </tr>`).join("")}
        </table>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">
            📌 Next steps: Our team will contact you within 24 hours to kick off onboarding.
            Keep this email as your payment receipt.
          </p>
        </div>
        <p style="font-size:14px;color:#555">
          Questions about billing? Reply to this email or reach us at
          <a href="mailto:${config.email}" style="color:#dc2626">${config.email}</a>.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#999;text-align:center">${config.name} — ${config.address}<br/>${config.website}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  if (d.invoicePdfBuffer) {
    await sendInvoiceEmail({
      to: d.customerEmail,
      subject: `Payment Received — ${d.planName} (${invoiceNo})`,
      html,
      attachment: {
        filename: `${invoiceNo}.pdf`,
        content: d.invoicePdfBuffer,
        contentType: "application/pdf"
      }
    });
  } else {
    await sendMail(d.customerEmail, `Payment Received — ${d.planName} (${invoiceNo})`, html);
  }
}

export async function notifyAdminPurchase(d: PurchaseReceiptData) {
  const rows = [
    { label: "Customer", value: d.customerName || "\u2014" },
    { label: "Email", value: d.customerEmail },
    ...(d.customerPhone ? [{ label: "Phone", value: d.customerPhone }] : []),
    { label: "Plan", value: d.planName },
    { label: "Order ID", value: d.orderId },
    { label: "Amount", value: d.amountDisplay },
    { label: "Date", value: `${d.purchaseDate} ${d.purchaseTime}` },
  ];
  await sendMail(SENDER_EMAIL, `💰 New Sale! ${d.planName} — ${d.amountDisplay}`, wrapHtml("New Purchase Completed", rows));
}

export async function sendNewsletterMail(subscribers: { email: string; name?: string }[], subject: string, content: string) {
  if (!transporter) {
    console.warn("Gmail SMTP not configured — skipping newsletter");
    return;
  }
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:linear-gradient(135deg,#dc2626,#b91c1c);text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">${config.name}</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="font-size:15px;color:#555;line-height:1.7">${content.replace(/\n/g, "<br/>")}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:12px;color:#999;text-align:center">You are receiving this because you subscribed to ${config.name}. <a href="${config.website}" style="color:#dc2626">Visit our website</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: sub.email,
        subject,
        html,
      });
    } catch (err) {
      console.error(`Newsletter send error to ${sub.email}:`, err);
    }
  }
}
