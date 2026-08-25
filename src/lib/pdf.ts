// Dependency-free PDF invoice generator (PDF 1.4, ASCII content).
// Renders a branded A4 tax invoice: colored header band with logo mark,
// Bill-To / Details columns, bordered items table, totals block with a
// green PAID stamp, and a footer. Returns a Blob or Buffer.

export interface InvoiceData {
  billNumber: string;
  date: string;
  time?: string;
  agencyName: string;
  agencyEmail: string;
  agencyAddress: string;
  agencyWebsite?: string;
  clientName: string;
  clientEmail: string;
  planName: string;
  amount: number;
  currency: string;
  paymentRef: string;
}

type RGB = [number, number, number];

// Brand palette (premium, modern look - RED theme)
const BRAND_PRIMARY: RGB = [0.863, 0.149, 0.149]; // #DC2626 (Brand Red)
const BRAND_DARK: RGB = [0.066, 0.066, 0.066]; // #111111 (Deep dark for header)
const TEXT_MAIN: RGB = [0.15, 0.15, 0.15];
const TEXT_MUTED: RGB = [0.45, 0.45, 0.45];
const LIGHT_BG: RGB = [0.97, 0.97, 0.99];
const BORDER: RGB = [0.9, 0.9, 0.92];
const WHITE: RGB = [1, 1, 1];
const GREEN: RGB = [0.13, 0.77, 0.36];
const GREEN_BG: RGB = [0.9, 0.98, 0.93];

function toAscii(s: string): string {
  return String(s)
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function byteLength(s: string): number {
  return Buffer.byteLength(s, 'latin1');
}

function escapePdf(s: string): string {
  return toAscii(s)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function truncate(s: string, max: number): string {
  const t = toAscii(s);
  return t.length > max ? t.slice(0, max - 3) + "..." : t;
}

export function generateInvoicePdfString(d: InvoiceData): string {
  const W = 595.28; // A4 width pt
  const H = 841.89; // A4 height pt
  const M = 50; // margin
  const TW = W - M * 2; // table width
  const ops: string[] = [];

  const estW = (s: string, size: number) => {
    const text = String(s);
    // Use wider multiplier if mostly uppercase
    const isUpper = text === text.toUpperCase();
    return text.length * size * (isUpper ? 0.65 : 0.52);
  };

  const txt = (
    s: string,
    x: number,
    yy: number,
    size: number,
    bold = false,
    c: RGB = TEXT_MAIN,
    align: "l" | "r" | "c" = "l"
  ) => {
    const t = escapePdf(s);
    let px = x;
    if (align === "r") px = x - estW(t, size);
    if (align === "c") px = x - estW(t, size) / 2;
    ops.push(
      `${c[0]} ${c[1]} ${c[2]} rg\nBT\n${bold ? "/F2" : "/F1"} ${size} Tf\n1 0 0 1 ${px.toFixed(2)} ${yy.toFixed(2)} Tm\n(${t}) Tj\nET`
    );
  };

  const box = (x: number, y: number, w: number, h: number, c: RGB) =>
    ops.push(`${c[0]} ${c[1]} ${c[2]} rg\n${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\nf`);

  const frameRect = (x: number, y: number, w: number, h: number, c: RGB, lw = 0.8) =>
    ops.push(`${c[0]} ${c[1]} ${c[2]} RG\n${lw} w\n${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\nS`);

  const hline = (x1: number, x2: number, y: number, c: RGB = BORDER, lw = 1) =>
    ops.push(`${c[0]} ${c[1]} ${c[2]} RG\n${lw} w\n${x1.toFixed(2)} ${y.toFixed(2)} m\n${x2.toFixed(2)} ${y.toFixed(2)} l\nS`);

  const fmtAmt = (n: number) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

  const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || "28");
  const gstAmount = Math.round(d.amount * gstRate / 100);
  const totalAmount = d.amount + gstAmount;

  /* ───── PREMIUM HEADER BAND ───── */
  box(0, H - 140, W, 140, BRAND_DARK); // Dark header
  box(0, H - 144, W, 4, BRAND_PRIMARY); // Vibrant red accent line

  // Logo mark: brand primary tile + white "N"
  box(M, H - 90, 50, 50, BRAND_PRIMARY);
  txt("N", M + 25, H - 74, 32, true, WHITE, "c");

  // Agency identity
  const nameParts = toAscii(d.agencyName).toUpperCase().split(" ");
  const firstName = nameParts[0] || "NEXUS";
  const restName = nameParts.slice(1).join(" ");
  txt(firstName, M + 64, H - 58, 24, true, WHITE);
  if (restName) txt(restName, M + 64 + estW(firstName, 24) + 5, H - 58, 24, true, BRAND_PRIMARY);
  txt("Digital Marketing Agency", M + 64, H - 76, 10, false, [0.8, 0.8, 0.9]);
  txt(truncate(d.agencyEmail, 45), M + 64, H - 92, 9, false, [0.7, 0.7, 0.8]);
  txt(truncate(d.agencyAddress, 50), M + 64, H - 105, 9, false, [0.7, 0.7, 0.8]);

  // Title block (right)
  txt("TAX INVOICE", W - M, H - 56, 20, true, WHITE, "r");
  txt(`#${d.billNumber}`, W - M, H - 76, 12, false, WHITE, "r");
  txt("Original for Recipient", W - M, H - 92, 9, false, BRAND_PRIMARY, "r");

  /* ───── BILL TO / DETAILS ───── */
  const sy = H - 190;

  txt("B I L L E D   T O", M, sy, 9, true, TEXT_MUTED);
  txt(d.clientName || "Customer", M, sy - 22, 14, true, TEXT_MAIN);
  if (d.clientEmail) txt(truncate(d.clientEmail, 45), M, sy - 38, 10, false, TEXT_MUTED);

  // Right-side meta pairs (label & value left-aligned to same edge)
  const pairX = W - M - 100;
  const pair = (yy: number, label: string, value: string) => {
    txt(label.toUpperCase(), pairX, yy + 12, 8, true, TEXT_MUTED);
    txt(value, pairX, yy, 10, true, TEXT_MAIN);
  };
  pair(sy, "Invoice Date:", d.date);
  if (d.time) pair(sy - 30, "Invoice Time:", d.time);

  // Payment Ref above PAID badge
  const refY = d.time ? sy - 60 : sy - 30;
  pair(refY, "Payment Ref:", d.paymentRef || "N/A");

  // Status label (small, top-right)
  const statusY = refY - 30;
  txt("STATUS:", W - M, statusY, 8, true, TEXT_MUTED, "r");
  txt("PAID", W - M, statusY - 12, 10, true, GREEN, "r");

  hline(M, W - M, statusY - 38);

  /* ───── ITEMS TABLE ───── */
  const ty = sy - 130; // table top edge
  const COL_DESC = M + 30; // 80
  const COL_QTY = M + TW - 120; // 425
  const COL_AMT = M + TW - 20; // 525

  // Table header background
  box(M, ty - 32, TW, 32, LIGHT_BG);
  
  txt("#", M + 12, ty - 21, 9, true, TEXT_MUTED);
  txt("DESCRIPTION", COL_DESC, ty - 21, 9, true, TEXT_MUTED);
  txt("QTY", COL_QTY, ty - 21, 9, true, TEXT_MUTED, "c");
  txt("AMOUNT", COL_AMT, ty - 21, 9, true, TEXT_MUTED, "r");

  const descLine = truncate(`${d.planName} - Digital Marketing Services`, 48);
  txt("1", M + 12, ty - 60, 10, false, TEXT_MAIN);
  txt(descLine, COL_DESC, ty - 60, 11, true, TEXT_MAIN);
  txt("1", COL_QTY, ty - 60, 10, false, TEXT_MAIN, "c");
  txt(fmtAmt(d.amount), COL_AMT, ty - 60, 11, true, TEXT_MAIN, "r");

  const rowBottom = ty - 85;
  hline(M, W - M, rowBottom);

  /* ───── TOTALS ───── */
  let tt = rowBottom - 35;
  txt("Subtotal (excl. GST)", W - M - 150, tt, 10, false, TEXT_MUTED, "r");
  txt(fmtAmt(d.amount), W - M - 20, tt, 11, false, TEXT_MAIN, "r");
  tt -= 24;
  txt(`GST (${gstRate}%)`, W - M - 150, tt, 10, false, TEXT_MUTED, "r");
  txt(fmtAmt(gstAmount), W - M - 20, tt, 11, false, TEXT_MAIN, "r");
  tt -= 34;

  // Highlighted total row
  box(W - M - 260, tt - 12, 260, 38, LIGHT_BG);
  frameRect(W - M - 260, tt - 12, 260, 38, BORDER, 1);
  txt("TOTAL PAID (incl. GST)", W - M - 240, tt + 2, 12, true, TEXT_MAIN);
  txt(fmtAmt(totalAmount), W - M - 20, tt + 1, 15, true, BRAND_PRIMARY, "r");

  // Currency / cycle note under totals
  txt(
    d.currency === "INR" ? "Currency: INR (Indian Rupees)" : `Currency: ${d.currency}`,
    W - M - 20,
    tt - 28,
    9,
    false,
    TEXT_MUTED,
    "r"
  );

  /* ───── FOOTER ───── */
  hline(M, W - M, 110);
  
  // Footer accents
  box(M, 85, 4, 20, BRAND_PRIMARY);
  txt("Thank you for your business!", M + 15, 94, 12, true, TEXT_MAIN);
  txt("We're excited to grow your brand. Our team will reach out within 24 hours.", M + 15, 80, 9, false, TEXT_MUTED);
  txt(
    "This is a computer-generated invoice and does not require a signature.",
    M,
    45,
    8,
    false,
    TEXT_MUTED
  );
  
  const footerRight = [
    truncate(d.agencyEmail, 40),
    d.agencyWebsite ? truncate(d.agencyWebsite.replace(/^https?:\/\//, ""), 40) : "",
    truncate(d.agencyAddress, 45),
  ].filter(Boolean);
  footerRight.forEach((line, i) => txt(line, W - M, 94 - i * 14, 9, false, TEXT_MUTED, "r"));

  /* ───── ASSEMBLE PDF ───── */
  const content = ops.join("\n");
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
      `/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  objects.push(`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((off) => {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export function generateInvoicePdf(d: InvoiceData): Blob {
  const pdfStr = generateInvoicePdfString(d);
  // Using Blob requires a browser environment, safe to use client-side.
  const arr = new Uint8Array(pdfStr.length);
  for (let i = 0; i < pdfStr.length; i++) {
    arr[i] = pdfStr.charCodeAt(i);
  }
  return new Blob([arr], { type: "application/pdf" });
}

export function generateInvoicePdfBuffer(d: InvoiceData): Buffer {
  const pdfStr = generateInvoicePdfString(d);
  // Safe to use Node.js Buffer server-side.
  return Buffer.from(pdfStr, "latin1");
}

export function downloadBlob(blob: Blob, filename: string) {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

