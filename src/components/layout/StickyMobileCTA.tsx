"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile after scrolling past hero
    const handleScroll = () => {
      const isMobile = window.innerWidth < 640;
      if (isMobile && window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-black/90 backdrop-blur-md border-t border-brand-red/30 p-3 shadow-[0_-10px_30px_rgba(220,38,38,0.15)]"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex-1">
              <p className="text-white text-xs font-bold leading-tight">Ready to scale?</p>
              <p className="text-brand-blue-light text-[10px] leading-tight">Get a Free Marketing Audit</p>
            </div>
            <Link 
              href="/pricing" 
              className="btn-primary py-2.5 px-4 text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse-slow"
            >
              See Packages
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
