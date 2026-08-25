"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { config } from "@/lib/config";

const WHATSAPP_MESSAGE = "Hi! I'd like to learn more about your digital marketing services.";

export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-black/85 backdrop-blur-2xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-stretch gap-2.5">
        <Link
          href="/enquiry#enquiry-form"
          className="btn-primary flex-1 py-3.5 group relative overflow-hidden animate-pulse-slow shadow-[0_0_15px_rgba(220,38,38,0.2)]"
        >
          <span className="relative z-10 text-[13px] font-bold">Get Free Audit</span>
          <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <a
          href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="relative flex items-center justify-center gap-1.5 px-4 rounded-[0.85rem] text-sm font-semibold text-white overflow-hidden transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 8px 28px rgba(37, 211, 102, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          <MessageCircle className="w-5 h-5" fill="white" />
          <span className="hidden xs:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
