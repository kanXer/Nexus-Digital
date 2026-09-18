"use client";
import { useState, useEffect } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ThemeChoice = "light" | "dark" | "system";

export function ThemeToggle({
  size = "md",
  variant = "segmented",
}: {
  size?: "sm" | "md";
  variant?: "segmented" | "button" | "dropdown";
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeChoice>("light");
  const [resolvedDark, setResolvedDark] = useState(false);

  // Apply theme to document
  const applyTheme = (theme: ThemeChoice) => {
    setActiveTheme(theme);
    try {
      localStorage.setItem("theme_preference", theme);
    } catch {
      /* noop */
    }

    let isDark = false;
    if (theme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = theme === "dark";
    }

    setResolvedDark(isDark);
    const resolvedVal = isDark ? "dark" : "light";
    try {
      localStorage.setItem("theme", resolvedVal);
    } catch {
      /* noop */
    }
    document.documentElement.setAttribute("data-theme", resolvedVal);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(
      new CustomEvent("nexus-theme-change", {
        detail: { preference: theme, resolved: resolvedVal },
      })
    );
  };

  useEffect(() => {
    setMounted(true);
    try {
      const savedPref = (localStorage.getItem("theme_preference") ||
        localStorage.getItem("theme")) as ThemeChoice | null;
      if (savedPref === "dark" || savedPref === "system" || savedPref === "light") {
        applyTheme(savedPref);
      } else {
        applyTheme("light");
      }
    } catch {
      applyTheme("light");
    }

    // Listen for system theme changes if on "system" mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      const currentPref = localStorage.getItem("theme_preference");
      if (currentPref === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handleSystemChange);

    const handleExternalTheme = (e: Event) => {
      const customEvent = e as CustomEvent<{ preference: ThemeChoice }>;
      if (customEvent.detail?.preference && customEvent.detail.preference !== activeTheme) {
        setActiveTheme(customEvent.detail.preference);
        setResolvedDark(
          document.documentElement.getAttribute("data-theme") === "dark"
        );
      }
    };
    window.addEventListener("nexus-theme-change", handleExternalTheme);

    return () => {
      mq.removeEventListener("change", handleSystemChange);
      window.removeEventListener("nexus-theme-change", handleExternalTheme);
    };
  }, []);

  const handleQuickToggle = () => {
    const next = resolvedDark ? "light" : "dark";
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <div
        className={`${
          size === "md" ? "h-9 w-20" : "h-8 w-16"
        } rounded-xl bg-white/10 dark:bg-white/5 border border-[var(--border-default)] flex items-center justify-center`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500 opacity-60" />
      </div>
    );
  }

  // Compact icon-only button variant (for AdminSidebar or minimal headers)
  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleQuickToggle}
        aria-label={resolvedDark ? "Switch to light mode" : "Switch to dark mode"}
        title={resolvedDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`${
          size === "md" ? "w-9 h-9" : "w-8 h-8"
        } rounded-xl relative group flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden border border-[var(--border-default)] shadow-sm hover:shadow-glow-sm hover:border-brand/40 active:scale-95`}
        style={{
          background: resolvedDark
            ? "linear-gradient(135deg, rgba(220,38,38,0.18) 0%, rgba(15,23,42,0.8) 100%)"
            : "linear-gradient(135deg, rgba(254,242,242,0.95) 0%, rgba(255,255,255,0.98) 100%)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {resolvedDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -60, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 60, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-4 h-4 text-brand-blue-light drop-shadow" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 60, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -60, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-4 h-4 text-amber-500 drop-shadow" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  // Bespoke In-Theme Segmented Pill (Primary Website Theme Switcher)
  return (
    <div
      className="relative flex items-center p-0.5 sm:p-1 rounded-xl glass-card border border-[var(--border-default)] shadow-sm select-none backdrop-blur-xl transition-all duration-300 hover:border-brand/30"
      style={{
        background: resolvedDark
          ? "linear-gradient(135deg, rgba(17,20,30,0.85) 0%, rgba(26,11,20,0.85) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,242,242,0.9) 100%)",
      }}
      role="group"
      aria-label="Website Theme Controls"
    >
      {/* Light Option Button */}
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-pressed={activeTheme === "light"}
        title="Solar Dawn (Light Mode)"
        className={`relative flex items-center justify-center gap-1.5 ${
          size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5"
        } rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 z-10`}
      >
        {activeTheme === "light" && (
          <motion.div
            layoutId="website-theme-pill"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="absolute inset-0 rounded-lg shadow-sm border border-amber-500/40 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 50%, #FEE2E2 100%)",
            }}
          />
        )}
        <Sun
          className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 ${
            activeTheme === "light"
              ? "text-amber-500 scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
              : "text-[var(--text-tertiary)] hover:text-amber-500"
          }`}
        />
        <span
          className={`hidden md:inline text-[11px] relative z-10 ${
            activeTheme === "light"
              ? "text-slate-900 font-extrabold"
              : "text-[var(--text-secondary)] font-medium"
          }`}
        >
          Light
        </span>
      </button>

      {/* Dark Option Button */}
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-pressed={activeTheme === "dark"}
        title="Deep Midnight & Crimson (Dark Mode)"
        className={`relative flex items-center justify-center gap-1.5 ${
          size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5"
        } rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 z-10`}
      >
        {activeTheme === "dark" && (
          <motion.div
            layoutId="website-theme-pill"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="absolute inset-0 rounded-lg shadow-sm border border-brand/50 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(220,38,38,0.3) 0%, rgba(185,28,28,0.45) 100%)",
            }}
          />
        )}
        <Moon
          className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 ${
            activeTheme === "dark"
              ? "text-rose-400 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
              : "text-[var(--text-tertiary)] hover:text-rose-400"
          }`}
        />
        <span
          className={`hidden md:inline text-[11px] relative z-10 ${
            activeTheme === "dark"
              ? "text-white font-extrabold"
              : "text-[var(--text-secondary)] font-medium"
          }`}
        >
          Dark
        </span>
      </button>
    </div>
  );
}
