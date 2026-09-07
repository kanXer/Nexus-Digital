"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopInfoBar from "@/components/layout/TopInfoBar";
import { BackToTop } from "@/components/common/BackToTop";
import { ChatWidget } from "@/components/common/ChatWidget";
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
        <TopInfoBar />
        <Navbar />
        <Footer />
        <BackToTop />
      </>
    );
  }

  return (
    <>
      <TopInfoBar />
      <Navbar />
      <Footer />
      <BackToTop />
      <ChatWidget />
      <SocialProofPopup />
    </>
  );
}
