"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  UserCog,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Zap,
  PackageCheck,
  Tag,
  Inbox,
  Users2,
  Sparkles,
  Loader2,
  CreditCard,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { config } from "@/lib/config";
import { auth, signOut } from "@/lib/firebase";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads & CRM", icon: Users2, badge: "Pipeline" },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/payments", label: "Cashfree Payments", icon: CreditCard, badge: "Live" },
  { href: "/admin/orders", label: "Orders & Sales", icon: PackageCheck },
  { href: "/admin/coupons", label: "Coupons & Offers", icon: Tag },
  { href: "/admin/newsletter", label: "Newsletter", icon: Send },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // 1. Invalidate server session & cookie
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API error:", err);
    }

    try {
      // 2. Sign out of Firebase client auth state
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error:", err);
    }

    // 3. Clear browser storage caches
    try {
      localStorage.removeItem("admin_auth");
      sessionStorage.clear();
    } catch {}

    // 4. Force browser navigation to login with explicit loggedOut signal
    window.location.href = "/admin?loggedOut=true";
  };

  const close = () => setOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0 text-[var(--text-primary)] select-none overflow-hidden">
      {/* Brand Header */}
      <div className="relative shrink-0 px-4 pt-5 pb-4 border-b border-[var(--border-default)]">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />
        <Link
          href="/admin/dashboard"
          onClick={close}
          className="relative flex items-center gap-3 p-2 rounded-2xl transition-all group hover:bg-[var(--bg-card)]"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center shadow-[0_8px_24px_rgba(220,38,38,0.45)] shrink-0 group-hover:scale-105 group-hover:shadow-[0_10px_32px_rgba(220,38,38,0.6)] transition-all">
            <Zap className="w-5 h-5 text-white" fill="white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-black text-[var(--text-primary)] tracking-tight truncate">
                Admin Portal
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.18em] truncate">
              {config.shortName || "Nexus Digital"}
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col px-3 pt-4 pb-4 overflow-y-auto space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Marketing Operations
        </p>
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "text-[var(--text-primary)] bg-gradient-to-r from-red-600/18 via-rose-600/10 to-transparent border border-red-500/30 shadow-[0_4px_20px_rgba(220,38,38,0.15)] backdrop-blur-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-default)]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-6 rounded-r-full bg-gradient-to-b from-rose-400 via-red-500 to-red-700 shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
              )}
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  active
                    ? "bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] group-hover:text-red-500 group-hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span className="truncate flex-1">{link.label}</span>
              {link.badge && (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-all ${
                    active
                      ? "bg-red-500/20 text-rose-400 border border-red-500/30"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-default)] group-hover:border-red-500/30 group-hover:text-rose-400"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Quick Navigation
          </p>
          <Link
            href="/"
            onClick={close}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-default)] transition-all"
          >
            <span className="w-8 h-8 rounded-lg bg-[var(--bg-card)] group-hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-rose-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </span>
            <span>View Public Website</span>
          </Link>
        </div>
      </nav>

      {/* Footer / Account & Theme */}
      <div className="px-3 pb-4 pt-3 shrink-0 border-t border-[var(--border-default)] space-y-2 bg-[var(--bg-secondary)]/50 backdrop-blur-md">
        {/* Theme Toggle Tile */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
          <span className="flex items-center gap-2.5 text-xs font-semibold text-[var(--text-secondary)]">
            <span className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <span>Theme Mode</span>
          </span>
          <ThemeToggle size="sm" variant="button" />
        </div>

        {/* Admin Account Settings */}
        <Link
          href="/admin/account"
          onClick={close}
          className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            pathname.startsWith("/admin/account")
              ? "bg-gradient-to-r from-red-600/18 to-transparent border-red-500/30 text-[var(--text-primary)] shadow-[0_2px_12px_rgba(220,38,38,0.15)]"
              : "bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-red-500/30 hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
              pathname.startsWith("/admin/account")
                ? "bg-red-600 text-white shadow-glow-sm"
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
          >
            <UserCog className="w-4 h-4" />
          </span>
          <span className="min-w-0 flex-1 text-xs truncate">Admin Security</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider shrink-0">
            Auth
          </span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <span className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400">
            {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <LogOut className="w-3.5 h-3.5" />}
          </span>
          <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Glass Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-15 px-3.5 sm:px-4 bg-[var(--bg-primary)]/85 backdrop-blur-2xl border-b border-[var(--border-default)] shadow-sm">
        <Link href="/admin/dashboard" onClick={close} className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 flex items-center justify-center shadow-[0_4px_16px_rgba(220,38,38,0.4)] shrink-0">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="min-w-0 truncate">
            <span className="text-sm font-black text-[var(--text-primary)] tracking-tight block truncate">Admin Portal</span>
            <span className="block text-[9px] text-[var(--text-muted)] font-bold tracking-widest uppercase truncate">CRM &amp; Control</span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle size="sm" variant="button" />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            {loggingOut ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <LogOut className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-red-500/30 transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas Glass Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" onClick={close} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] h-full max-h-[100dvh] bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border-r border-[var(--border-default)] flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 border-b border-[var(--border-default)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Navigation Menu</span>
              <button
                onClick={close}
                className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-red-500/30 transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Frosted Glass Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40 h-full max-h-[100dvh] bg-[var(--bg-secondary)]/85 backdrop-blur-2xl border-r border-[var(--border-default)] shadow-[0_0_30px_rgba(0,0,0,0.15)] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-600/5 via-transparent to-transparent" />
        {sidebarContent}
      </aside>
    </>
  );
}
