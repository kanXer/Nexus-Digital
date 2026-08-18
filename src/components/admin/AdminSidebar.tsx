"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Send, UserCog, LogOut, ArrowLeft, Menu, X, Zap, Moon } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { config } from "@/lib/config";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/newsletter", label: "Newsletter", icon: Send },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  };

  const close = () => setOpen(false);

  const sidebarContent = (
    <div className="always-dark flex flex-col h-full text-[var(--text-primary)]">
      {/* Brand banner */}
      <div className="relative shrink-0 px-4 pt-5 pb-4">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-blue/20 blur-[70px] rounded-full pointer-events-none" />
        <Link href="/admin/dashboard" onClick={close} className="relative flex items-center gap-3 p-2 rounded-xl transition-colors group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center shadow-[0_6px_20px_rgba(220,38,38,0.4)] shrink-0 group-hover:shadow-[0_8px_30px_rgba(220,38,38,0.55)] transition-shadow">
            <Zap className="w-5 h-5 text-white" fill="white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light opacity-0 group-hover:opacity-60 blur-md transition-opacity" />
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-[15px] font-bold text-[var(--text-primary)] truncate">Admin Panel</p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.15em] truncate">{config.shortName}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col px-3 pt-2 pb-4 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Menu</p>
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={`group relative flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "text-[var(--text-primary)] bg-gradient-to-r from-brand-blue/20 via-brand-blue/10 to-transparent border border-brand-blue/25 shadow-glow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-brand-blue-light via-brand-blue to-brand-blue-dark" />
              )}
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  active ? "bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm" : "bg-[var(--bg-card)] group-hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <link.icon className={`w-4 h-4 ${active ? "text-white" : "text-brand-blue-light"}`} />
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}

        <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">General</p>
        <Link
          href="/"
          onClick={close}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all"
        >
          <span className="w-8 h-8 rounded-lg bg-[var(--bg-card)] group-hover:bg-[var(--bg-card-hover)] flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-brand-blue-light" />
          </span>
          <span>Website</span>
        </Link>
      </nav>

      {/* Bottom: Theme + Admin Account + Logout */}
      <div className="px-3 pb-4 shrink-0 border-t border-[var(--border-default)] pt-4 space-y-2">
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
          <span className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)]">
            <span className="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
              <Moon className="w-4 h-4 text-brand-blue-light" />
            </span>
            <span>Theme</span>
          </span>
          <ThemeToggle size="sm" />
        </div>

        <Link
          href="/admin/account"
          onClick={close}
          className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all overflow-hidden border ${
            pathname.startsWith("/admin/account")
              ? "bg-gradient-to-r from-brand-blue/25 to-brand-blue/5 border-brand-blue/30 text-[var(--text-primary)] shadow-glow-sm"
              : "bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-brand-blue/30 hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              pathname.startsWith("/admin/account") ? "bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm" : "bg-brand-blue/15"
            }`}
          >
            <UserCog className="w-4 h-4 text-brand-blue-light" />
          </span>
          <span className="min-w-0 flex-1 truncate">Admin Account</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue-light uppercase tracking-wider shrink-0">
            {pathname.startsWith("/admin/account") ? "Active" : "Settings"}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <span className="w-8 h-8 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar — sticky so content flows below it without overlap */}
      <div className="always-dark lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
        <Link href="/admin/dashboard" onClick={close} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">Admin Panel</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile off-canvas */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] always-dark bg-[var(--bg-secondary)] border-r border-[var(--border-default)] flex flex-col">
            <div className="flex items-center justify-end px-3 pt-3">
              <button onClick={close} className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40 always-dark bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border-r border-[var(--border-default)] overflow-y-auto no-scrollbar">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-transparent to-transparent" />
        {sidebarContent}
      </aside>
    </>
  );
}
