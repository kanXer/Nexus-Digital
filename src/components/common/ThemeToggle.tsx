"use client";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        const isDark = saved === "dark";
        setDark(isDark);
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const val = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", val);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("data-theme", val);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && !dark ? "Switch to dark mode" : "Switch to light mode"}
      className={`${size === "md" ? "w-11 h-11" : "w-9 h-9"} rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200 cursor-pointer`}
    >
      {!mounted ? (
        <Sun className="w-4 h-4" />
      ) : dark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
