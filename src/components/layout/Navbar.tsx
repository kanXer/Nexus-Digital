"use client";
import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ChevronDown, ArrowRight, UserCog } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { config } from "@/lib/config";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Portfolio" },
  {
    label: "Company",
    children: [
      { href: "/about", label: "About Us" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/testimonials", label: "Testimonials" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false);
      setDropdownOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-2xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-[0_4px_15px_rgba(220,38,38,0.3)] group-hover:shadow-[0_8px_25px_rgba(220,38,38,0.5)] transition-all duration-300">
                <Zap className="w-5 h-5 text-white" fill="white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {config.shortName}<span className="text-brand-blue-light">{config.name.replace(config.shortName, "")}</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        dropdownOpen ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 left-0 w-48 rounded-xl p-1.5 nav-dropdown"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                pathname === child.href ? "text-brand-blue-light bg-brand-blue/10" : "text-white/60 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? "text-white bg-white/8"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/admin"
                title="Admin Login"
                aria-label="Admin Login"
                className="w-9 h-9 rounded-lg glass-card border border-white/8 flex items-center justify-center text-white/50 hover:text-brand-blue-light hover:border-brand-blue/40 hover:bg-brand-blue/10 transition-all duration-300"
              >
                <UserCog className="w-4 h-4" />
              </Link>
              <Link href="/enquiry#enquiry-form" className="btn-primary text-sm px-5 py-2.5 group">
                Enquiry
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 z-50 bg-[#050505] border-l border-white/8 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/8">
                <span className="font-bold text-white text-lg">{config.shortName}<span className="text-brand-blue-light">{config.name.replace(config.shortName, "")}</span></span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.label}>
                      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/25 mt-4 mb-1">{link.label}</p>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            pathname === child.href ? "text-brand-blue-light bg-brand-blue/10" : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href!}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        pathname === link.href ? "text-white bg-white/8" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              <div className="p-6 border-t border-white/8">
                <div className="flex items-center gap-2">
                  <ThemeToggle size="md" />
                  <Link
                    href="/admin"
                    title="Admin Login"
                    aria-label="Admin Login"
                    className="w-11 h-11 rounded-lg glass-card border border-white/8 flex items-center justify-center text-white/50 hover:text-brand-blue-light hover:border-brand-blue/40 hover:bg-brand-blue/10 transition-all duration-300"
                  >
                    <UserCog className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
