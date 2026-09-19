"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollY / docHeight) * 100)) : 0;
      setScrollProgress(progress);
      setVisible(scrollY > 1);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Listen to chat widget open/close event to prevent any overlap with open chat window
    const handleChatState = (e: Event) => {
      const ce = e as CustomEvent<{ open: boolean }>;
      if (typeof ce.detail?.open === "boolean") {
        setChatOpen(ce.detail.open);
      }
    };
    window.addEventListener("nexus-chat-open", handleChatState);

    // Check for open modals, off-canvas drawers, popups, or mobile sidebar
    const checkOverlayState = () => {
      const hasModalOrDrawer =
        document.querySelector(
          '[role="dialog"], .fixed.inset-0.z-50, [data-modal-open="true"], [data-drawer-open="true"]'
        ) !== null || document.body.style.overflow === "hidden";
      setOverlayOpen(hasModalOrDrawer);
    };

    // Run initial check
    checkOverlayState();

    // Observe DOM changes to automatically catch any newly mounted dialogs, modals or sidebars
    const observer = new MutationObserver(() => {
      checkOverlayState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-modal-open", "data-drawer-open"],
    });

    // Custom overlay event listener
    const handleOverlayState = (e: Event) => {
      const ce = e as CustomEvent<{ open: boolean }>;
      if (typeof ce.detail?.open === "boolean") {
        setOverlayOpen(ce.detail.open);
      }
    };
    window.addEventListener("nexus-overlay-open", handleOverlayState);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("nexus-chat-open", handleChatState);
      window.removeEventListener("nexus-overlay-open", handleOverlayState);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    const startY = window.scrollY || document.documentElement.scrollTop;
    if (startY <= 0) return;

    // Smooth ease-out animation guaranteed to reach top without stopping halfway
    const duration = Math.min(750, Math.max(400, Math.sqrt(startY) * 16));
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeOutCubic(progress);
      
      window.scrollTo(0, Math.max(0, Math.round(startY * (1 - ease))));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, 0);
      }
    };

    requestAnimationFrame(step);
  };

  // Hide when chat widget, mobile sidebar, drawers, or modal popups are open
  const shouldShow = visible && !chatOpen && !overlayOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-40 group select-none"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand via-rose-500 to-amber-500 blur-md opacity-45 group-hover:opacity-85 transition-opacity duration-300 animate-pulse pointer-events-none" />

          {/* Pulsing ring */}
          <div className="absolute -inset-1 rounded-full border border-brand/40 animate-pulse-ring pointer-events-none" />

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white cursor-pointer overflow-hidden shadow-[0_8px_25px_rgba(225,29,72,0.4)] hover:shadow-[0_12px_35px_rgba(225,29,72,0.65)] active:scale-90 transition-all duration-300 border border-white/25 backdrop-blur-md animate-float-slow"
            style={{
              background: "linear-gradient(135deg, #BE123C 0%, #E11D48 50%, #F59E0B 100%)",
            }}
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 animate-shine pointer-events-none" />

            {/* Circular SVG Scroll Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2.5"
              />
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="2.5"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * scrollProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>

            {/* Icon with bounce on hover */}
            <ArrowUp className="w-5 h-5 sm:w-5.5 sm:h-5.5 relative z-10 transition-transform duration-300 group-hover:-translate-y-1 drop-shadow" />
          </button>

          {/* Tooltip — above button on mobile (so it doesn't clip edges), left of button on sm+ */}
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:left-auto sm:-translate-x-0 sm:-translate-y-1/2 sm:right-full sm:mr-3 sm:mb-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-md border border-[var(--border-default)] flex items-center gap-1.5 backdrop-blur-md">
              <span>Back to Top</span>
              <span className="text-[10px] text-brand font-semibold">{scrollProgress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
