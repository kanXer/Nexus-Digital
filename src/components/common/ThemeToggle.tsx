"use client";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
}

export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" }) {
  const [dark, setDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const val = next ? "dark" : "light";
    localStorage.setItem("theme", val);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`${size === "md" ? "w-11 h-11" : "w-9 h-9"} rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all duration-200`}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
