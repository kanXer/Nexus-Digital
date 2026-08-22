"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { BackToTop } from "@/components/common/BackToTop";
import { ChatWidget } from "@/components/common/ChatWidget";
import { MobileActionBar } from "@/components/common/MobileActionBar";
import { SocialProofPopup } from "@/components/common/SocialProofPopup";

export default function SiteChrome() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin";

  // Protected admin pages have their own sidebar/navigation via the admin layout,
  // so the public site chrome (navbar, footer, popups) must not overlap it.
  if (isAdmin && !isAdminLogin) {
    return <BackToTop />;
  }

  // Admin login page keeps the public navbar for branding, but no popups/action bars.
  if (isAdminLogin) {
    return (
      <>
        <Navbar />
        <Footer />
        <BackToTop />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Footer />
      <WhatsAppButton />
      <BackToTop />
      <ChatWidget />
      <SocialProofPopup />
    </>
  );
}
