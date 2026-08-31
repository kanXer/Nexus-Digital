"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { config } from "@/lib/config";
import { trackEvent, WHATSAPP_DEFAULT } from "@/lib/analytics";

const WHATSAPP_NUMBER = config.whatsapp;
const WHATSAPP_MESSAGE = WHATSAPP_DEFAULT;

// Vertical positions (px from bottom) for the floating button stack.
// BackToTop sits at 24px (bottom-most) on all screens.
// Not scrolled: WhatsApp folds into BackToTop's spot (24) — no dead gap.
// Scrolled: WhatsApp rises above BackToTop at 104px (24 + 56 + 24 gap).
const UNFOLDED = 104, FOLDED = 24;

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  const [bottom, setBottom] = useState(FOLDED);

  useEffect(() => {
    const compute = () => setBottom(window.scrollY > 150 ? UNFOLDED : FOLDED);
    compute();
    const onScroll = () => compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="flex fixed right-6 z-40 w-14 h-14 rounded-full items-center justify-center text-white shadow-[0_4px_20px_rgba(37,211,102,0.5)] will-change-transform transition-all duration-300 ease-out hover:shadow-[0_8px_30px_rgba(37,211,102,0.7)]"
      style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", bottom }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <MessageCircle className="w-7 h-7 relative z-10" />
    </motion.a>
  );
}
