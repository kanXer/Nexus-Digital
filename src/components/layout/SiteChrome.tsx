"use client";
import { useEffect } from "react";
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

  // Scroll to top on every page navigation — ensures new pages always start at top
  // Uses instant scroll (no smooth) so the user sees the top of the new page immediately
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

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
