import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | Nexus Digital",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
