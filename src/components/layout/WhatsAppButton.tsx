"use client";
import { MessageCircle } from "lucide-react";
import { config } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show after scrolling down a bit
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format WhatsApp number
  const waNumber = config.phone.replace(/[^0-9]/g, "");
  // Default message based on page
  const pageContext = pathname === "/" ? "your home page" : `the ${pathname} page`;
  const message = encodeURIComponent(`Hi Nexus Digital! I'm on ${pageContext} and I'd like to discuss how you can help grow my business.`);
  const waLink = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-5 sm:bottom-6 sm:right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] flex items-center justify-center overflow-hidden group"
          aria-label="Chat on WhatsApp"
        >
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-75" />
          <MessageCircle className="w-7 h-7 text-white relative z-10 group-hover:rotate-12 transition-transform" />
          
          {/* Tooltip on hover (desktop only) */}
          <div className="absolute right-16 px-3 py-1.5 bg-white text-black text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
            Chat with an Expert
          </div>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
