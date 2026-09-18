import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your account, billing details, and view your orders.",
  robots: "noindex,nofollow",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
