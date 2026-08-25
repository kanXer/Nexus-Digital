import { generateInvoicePdfBuffer } from "./src/lib/pdf";
import * as fs from "fs";

try {
  const buffer = generateInvoicePdfBuffer({
    billNumber: "INV-12345",
    date: "2026-08-25 at 15:00",
    agencyName: "Nexus Digital",
    agencyEmail: "hello@nexusdigital.shop",
    agencyAddress: "Gorakhpur, UP",
    agencyWebsite: "nexusdigital.shop",
    clientName: "Sahil",
    clientEmail: "sahil@example.com",
    planName: "Pro Plan",
    amount: 14999,
    currency: "INR",
    paymentRef: "PAY-987654321",
  });

  fs.writeFileSync("test-invoice.pdf", buffer);
  console.log("PDF successfully generated and saved to test-invoice.pdf");
} catch (e) {
  console.error("Failed to generate PDF:", e);
}
