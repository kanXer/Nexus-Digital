import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Status | Nexus Digital",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
