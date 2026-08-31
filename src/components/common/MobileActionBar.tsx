"use client";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { config } from "@/lib/config";
import { trackEvent, WHATSAPP_DEFAULT } from "@/lib/analytics";

export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-black/85 backdrop-blur-2xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-stretch gap-2.5">
        <a
          href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(WHATSAPP_DEFAULT)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          onClick={() => trackEvent("whatsapp_click", { location: "mobile_sticky_bar" })}
          className="flex-1 relative flex items-center justify-center gap-2 rounded-[0.85rem] text-sm font-bold text-white overflow-hidden transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 8px 28px rgba(37, 211, 102, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          <MessageCircle className="w-5 h-5" fill="white" />
          WhatsApp
        </a>
        <a
          href={`tel:${config.phone}`}
          aria-label="Call Now"
          onClick={() => trackEvent("phone_click", { location: "mobile_sticky_bar" })}
          className="flex-1 relative flex items-center justify-center gap-2 rounded-[0.85rem] text-sm font-bold text-white overflow-hidden transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)", boxShadow: "0 8px 28px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
      </div>
    </div>
  );
}
