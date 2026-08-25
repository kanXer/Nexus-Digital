"use client";
import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ChevronDown, ArrowRight, Calculator, ShoppingCart, User, PackageCheck, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { config } from "@/lib/config";
import LeadCalculator from "@/components/home/LeadCalculator";
import { useAuth } from "@/context/AuthContext";

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
  const {
    user,
    userProfile,
    cart,
    openAuthModal,
    openProfileModal,
    openCart,
    openOrders,
    logout,
  } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    document.body.style.overflow = mobileOpen || calcOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, calcOpen]);

  useEffect(() => {
    if (!calcOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalcOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [calcOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 lg:top-9 left-0 right-0 z-50 will-change-transform transition-[border-color,box-shadow] duration-500 ${
          scrolled
            ? "bg-black border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-black"
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
              <button
                onClick={() => setCalcOpen(true)}
                title="Lead Calculator"
                aria-label="Open Lead Calculator"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Calculator className="w-4 h-4 text-brand-blue-light" />
                Calculator
              </button>
              
              {/* Cart Button */}
              <button
                onClick={openCart}
                title="Shopping Cart"
                className="relative w-9 h-9 rounded-lg glass-card border border-white/8 flex items-center justify-center text-white/70 hover:text-brand-blue-light hover:border-brand-blue/40 hover:bg-brand-blue/10 transition-all duration-300 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {user && cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-blue-light text-white text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.8)]">
                    {cart.length}
                  </span>
                )}
              </button>

              <ThemeToggle />

              {/* User Account / Auth Dropdown */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg glass-card border border-white/12 hover:border-white/25 transition-all text-xs font-semibold text-white cursor-pointer"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={userProfile.name || "User"}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-blue/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-bold text-white uppercase">
                        {userProfile.name ? userProfile.name.slice(0, 2) : user.email ? user.email.slice(0, 2) : "U"}
                      </div>
                    )}
                    <span className="max-w-[90px] truncate">{userProfile.name || user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Account"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 w-52 rounded-xl p-1.5 nav-dropdown border border-white/12 shadow-2xl z-50"
                      >
                        <div className="px-3 py-2.5 border-b border-white/8 mb-1 flex items-center gap-2.5">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-blue/30 shrink-0" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">
                              {userProfile.name ? userProfile.name.slice(0, 2) : "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-bold text-xs truncate">{userProfile.name || user.displayName || "Logged In"}</p>
                            <p className="text-white/40 text-[11px] truncate">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setUserMenuOpen(false); openProfileModal(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors text-left"
                        >
                          <User className="w-4 h-4 text-brand-blue-light" /> My Profile
                        </button>
                        <Link
                          href="/cart"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-brand-blue-light" /> My Cart
                          </span>
                          {user && cart.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-blue-light text-white">
                              {cart.length}
                            </span>
                          )}
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); openOrders(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors text-left"
                        >
                          <PackageCheck className="w-4 h-4 text-brand-blue-light" /> Orders & Plans
                        </button>
                        <div className="border-t border-white/8 my-1" />
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg glass-card border border-white/10 hover:border-white/20 text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-brand-blue-light" />
                  Sign In
                </button>
              )}

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
                <button
                  onClick={() => { setCalcOpen(true); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
                >
                  <Calculator className="w-4 h-4 text-brand-blue-light" />
                  Lead Calculator
                </button>
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

              <div className="p-6 border-t border-white/8 space-y-3">
                {user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => { setMobileOpen(false); openProfileModal(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white"
                    >
                      <User className="w-4 h-4 text-brand-blue-light" /> Profile ({userProfile.name || user.email?.split("@")[0]})
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); openCart(); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white"
                    >
                      <span className="flex items-center gap-3">
                        <ShoppingCart className="w-4 h-4 text-brand-blue-light" /> My Cart
                      </span>
                      {user && cart.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-blue-light">{cart.length}</span>}
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); openOrders(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white"
                    >
                      <PackageCheck className="w-4 h-4 text-brand-blue-light" /> Orders & Plans
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); openAuthModal(); }}
                    className="w-full btn-primary py-3 rounded-xl justify-center font-bold text-sm"
                  >
                    <User className="w-4 h-4 mr-1.5" /> Sign In / Register
                  </button>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <ThemeToggle size="md" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ LEAD CALCULATOR MODAL ═══ */}
      <AnimatePresence>
        {calcOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto py-12 px-4"
            onClick={() => setCalcOpen(false)}
          >
            <div className="auth-backdrop fixed inset-0 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setCalcOpen(false)}
                aria-label="Close Lead Calculator"
                className="fixed top-4 right-4 z-[70] w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
              <LeadCalculator />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
