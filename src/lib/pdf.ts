// Minimal, dependency-free PDF invoice generator (PDF 1.4, ASCII content).
// Produces a valid single-page PDF invoice and returns it as a Blob.

export interface InvoiceData {
  billNumber: string;
  date: string;
  agencyName: string;
  agencyEmail: string;
  agencyAddress: string;
  clientName: string;
  clientEmail: string;
  planName: string;
  amount: number;
  currency: string;
  paypalOrderId: string;
}

function toAscii(s: string): string {
  // PDF base fonts (Helvetica) only support ASCII. Replace unsupported glyphs.
  return String(s)
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

// All emitted PDF content is ASCII (see toAscii/escapePdf), so the Latin1 byte
// length equals the JS string length — safe to compute in the browser.
function byteLength(s: string): number {
  return s.length;
}

function escapePdf(s: string): string {
  return toAscii(s)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generateInvoicePdf(d: InvoiceData): Blob {
  const W = 595.28;
  const H = 841.89;
  const lines: string[] = [];
  let y = 800;

  const add = (text: string, size: number, bold: boolean, x = 50) => {
    const font = bold ? "/F2" : "/F1";
    lines.push(
      `BT\n${font} ${size} Tf\n1 0 0 1 ${x} ${y} Tm\n(${escapePdf(text)}) Tj\nET`
    );
    y -= size + 6;
  };

  const rule = () => {
    lines.push(`0.8 0.8 0.8 RG\n0.5 w\n50 ${y + 2} ${W - 100} ${y + 2} re\nS`);
    y -= 10;
  };

  add(d.agencyName, 20, true);
  add(`Email: ${d.agencyEmail}`, 10, false);
  add(d.agencyAddress, 10, false);
  rule();

  add("TAX INVOICE", 16, true);
  add(`Invoice No : ${d.billNumber}`, 11, false);
  add(`Date       : ${d.date}`, 11, false);
  add(`PayPal Ref : ${d.paypalOrderId || "N/A"}`, 11, false);
  rule();

  add("Billed To", 12, true);
  add(d.clientName || "Customer", 11, false);
  if (d.clientEmail) add(d.clientEmail, 11, false);
  rule();

  add("Description", 12, true);
  add(`${d.planName} - Digital Marketing Services`, 11, false);
  rule();

  const formatted =
    d.currency === "INR"
      ? `Rs. ${Number(d.amount).toLocaleString("en-IN")}`
      : `${d.currency} ${Number(d.amount).toLocaleString("en-IN")}`;

  add(`Amount Paid: ${formatted}`, 14, true);
  y -= 30;
  add("Thank you for your business!", 11, false);
  add("This is a computer-generated invoice and does not require a signature.", 9, false);

  const content = lines.join("\n");
  const contentLen = byteLength(content);

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
      `/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  objects.push(`<< /Length ${contentLen} >>\nstream\n${content}\nendstream`);

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

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
