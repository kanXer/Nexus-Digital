"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  User, Mail, Phone, Building2, MapPin, CreditCard,
  Save, CheckCircle, ShieldCheck, PackageCheck,
  ShoppingCart, LogOut, Star, Clock, Zap, ArrowRight,
  Edit3, Sparkles, Copy, Check, ExternalLink, MessageCircle,
  HelpCircle, ChevronRight, ShieldAlert, Cpu, Award
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { config } from "@/lib/config";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ProfilePage() {
  const {
    user, loading, userProfile, updateProfile,
    orders, cart,
    openOrders, openCart,
    logout, isAdmin, isSuperAdmin,
  } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState(userProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  // Redirect to home if unauthenticated once auth resolves
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success("Profile & billing matrix updated!", {
        icon: "⚡",
        duration: 3000,
        style: {
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
        },
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setEditMode(false);
      }, 1200);
    } catch {
      toast.error("Failed to update profile. Please verify your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const copyClientId = () => {
    const rawId = user?.uid ? `NX-${user.uid.slice(0, 8).toUpperCase()}` : "NX-CLIENT";
    navigator.clipboard.writeText(rawId);
    setCopiedId(true);
    toast.success("Client UID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-brand-blue/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-blue-light" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-rose-500 animate-pulse" />
        </motion.div>
        <p className="text-xs font-mono tracking-widest text-[var(--text-muted)] uppercase">
          Initializing Nexus Identity Console…
        </p>
      </div>
    );
  }

  const clientId = user.uid ? `NX-${user.uid.slice(0, 8).toUpperCase()}` : "NX-CLIENT";
  const initials = (userProfile.name || user.displayName || user.email || "N")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeOrders = orders.filter((o) => o.status === "Completed" || o.status === "Processing");

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300 relative overflow-hidden pb-24">
      {/* ═══ AMBIENT CYBER LIGHTING ═══ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-brand-blue/15 via-purple-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-40 w-[450px] h-[450px] bg-brand-red/10 blur-[130px] rounded-full" />
        <div className="absolute top-[65%] -left-40 w-[450px] h-[450px] bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 grid-dots opacity-15 pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* ═══ 1. COMMAND HEADER / PROFILE AVATAR HERO ═══ */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-[var(--bg-card)]/80 border border-[var(--border-default)] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            {/* Top decorative micro-hud bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-rose-500 to-amber-500 opacity-80" />
            <div className="absolute -right-12 -top-12 w-36 h-36 bg-brand-blue/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
              {/* Left Column: Avatar & Core Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Holographic Avatar Frame */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-brand-blue via-purple-500 to-rose-500 opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-xl flex items-center justify-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={userProfile.name || "Client"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-brand-blue to-purple-800 flex items-center justify-center text-white text-3xl font-black tracking-wider">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Online Status Beacon */}
                  <div className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[var(--bg-primary)]" />
                    </span>
                  </div>
                </div>

                {/* Name & Credentials */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                      {userProfile.name || user.displayName || "Nexus Client"}
                    </h1>

                    {/* Dynamic Privilege Badge */}
                    {isSuperAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        SUPER ADMIN (.ENV)
                      </span>
                    ) : isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        AUTHORIZED ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue/15 text-brand-blue-light border border-brand-blue/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        CLIENT ACCOUNT
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {user.email}
                  </p>

                  {/* High-tech Metadata Tags */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    {/* Copyable UID Badge */}
                    <button
                      type="button"
                      onClick={copyClientId}
                      className="group/id inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-black/5 dark:bg-white/5 border border-[var(--border-default)] hover:border-brand-blue/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                      title="Click to copy unique client ID"
                    >
                      <Cpu className="w-3 h-3 text-brand-blue-light" />
                      <span>{clientId}</span>
                      {copiedId ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60 group-hover/id:opacity-100 transition-opacity" />
                      )}
                    </button>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      OAuth 2.0 Secured
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Fast Interactive Controllers */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                    editMode
                      ? "bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
                      : "btn-primary"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{editMode ? "Close Editor" : "Edit Profile"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--border-default)] hover:border-rose-500/30 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* ═══ 2. ADMIN COMMAND DECK (VISIBLE TO .ENV SUPERADMIN & AUTHORIZED ADMINS) ═══ */}
          {(isAdmin || isSuperAdmin) && (
            <motion.div
              variants={itemVariants}
              className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-amber-600/5 shadow-[0_12px_40px_rgba(245,158,11,0.15)]"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-black tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        ADMIN PRIVILEGES GRANTED
                      </span>
                      {isSuperAdmin && (
                        <span className="text-[10px] font-mono uppercase font-black tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30">
                          MASTER KEYHOLDER (.ENV)
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-1">
                      Nexus Digital Administration Suite
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 max-w-xl">
                      {isSuperAdmin
                        ? "You are logged in with the official Super Admin identity. You possess unrestricted access to the agency dashboard, live client orders, and team permission controls."
                        : "You are logged in with an authorized agency specialist email. You have direct authorization to manage orders, customer inquiries, and growth services."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <Link
                    href="/admin/dashboard"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {isSuperAdmin && (
                    <Link
                      href="/admin/account"
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 text-[var(--text-primary)] border border-amber-500/30 transition-all"
                    >
                      <User className="w-4 h-4 text-amber-500" />
                      <span>Manage Admins</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ 3. TELEMETRY CARDS (REAL-TIME ACTIVITY GAUGES) ═══ */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Orders Tile */}
            <button
              type="button"
              onClick={openOrders}
              className="group text-left p-5 rounded-2xl backdrop-blur-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-brand-blue/40 transition-all shadow-sm hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-brand-blue/15 text-brand-blue-light flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-brand-blue-light flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Orders <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {orders.length}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                Total Orders &amp; Campaign Records
              </p>
            </button>

            {/* Active Plans Tile */}
            <button
              type="button"
              onClick={openOrders}
              className="group text-left p-5 rounded-2xl backdrop-blur-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  Active
                </span>
              </div>
              <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {activeOrders.length}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                Active Digital Marketing Subscriptions
              </p>
            </button>

            {/* Cart Tile */}
            <button
              type="button"
              onClick={openCart}
              className="group text-left p-5 rounded-2xl backdrop-blur-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-purple-500/40 transition-all shadow-sm hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open Cart <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
                {cart.length}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                Packages Ready For Checkout
              </p>
            </button>
          </motion.div>

          {/* ═══ 4. PROFILE & BILLING MATRIX (CLEAN FORM WITH DEDICATED ICON BAYS - ZERO OVERLAP) ═══ */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl backdrop-blur-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-7 border-b border-[var(--border-default)]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                    Profile &amp; Billing Matrix
                  </h2>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue-light font-bold">
                    AUTO-FILL ENABLED
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Your billing information securely auto-fills during package checkout and invoice generation.
                </p>
              </div>

              {!editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-brand-blue-light hover:bg-brand-blue/10 border border-brand-blue/20 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Fields
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-6">
              {/* Personal & Entity Section */}
              <div className="space-y-4">
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text-muted)]">
                  Primary Identity &amp; Contact
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all overflow-hidden">
                      <div className="px-3.5 py-2.5 text-[var(--text-muted)] border-r border-[var(--border-default)] bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-brand-blue-light" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!editMode}
                        placeholder="e.g. Sahil Srivastava"
                        required
                        className="w-full px-3.5 py-2.5 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Email (Read Only from Firebase Auth) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">
                        Account Email
                      </label>
                      <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/50 opacity-80 overflow-hidden">
                      <div className="px-3.5 py-2.5 text-[var(--text-muted)] border-r border-[var(--border-default)] bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                      </div>
                      <input
                        type="email"
                        value={formData.email || user.email || ""}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-transparent text-sm text-[var(--text-secondary)] focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">
                      Phone Number (WhatsApp Preferred)
                    </label>
                    <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all overflow-hidden">
                      <div className="px-3.5 py-2.5 text-[var(--text-muted)] border-r border-[var(--border-default)] bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-brand-blue-light" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editMode}
                        placeholder="+91 96962 62007"
                        className="w-full px-3.5 py-2.5 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Company / Brand Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">
                      Business or Agency Brand Name
                    </label>
                    <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all overflow-hidden">
                      <div className="px-3.5 py-2.5 text-[var(--text-muted)] border-r border-[var(--border-default)] bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-brand-blue-light" />
                      </div>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        disabled={!editMode}
                        placeholder="e.g. Acme Realty Pvt Ltd"
                        className="w-full px-3.5 py-2.5 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax & Invoicing Section */}
              <div className="space-y-4 pt-3 border-t border-[var(--border-default)]">
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text-muted)]">
                  Tax Identification &amp; Entity
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    GSTIN / Tax ID Number (For B2B Tax Invoicing)
                  </label>
                  <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all overflow-hidden">
                    <div className="px-3.5 py-2.5 text-[var(--text-muted)] border-r border-[var(--border-default)] bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-brand-blue-light" />
                    </div>
                    <input
                      type="text"
                      value={formData.gstin || ""}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      disabled={!editMode}
                      placeholder="09AAAAA0000A1Z5 (Optional for input tax credit)"
                      className="w-full px-3.5 py-2.5 bg-transparent text-sm font-mono uppercase text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Billing & Address Matrix */}
              <div className="space-y-4 pt-3 border-t border-[var(--border-default)]">
                <p className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--text-muted)]">
                  Official Dispatch &amp; Billing Address
                </p>

                {/* Street Address (Clean Modular Container - ZERO TEXT OVERLAP) */}
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all overflow-hidden">
                  <div className="px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] border-b border-[var(--border-default)] bg-black/5 dark:bg-white/5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue-light" />
                    <span>Street / Corporate Office Address</span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!editMode}
                    placeholder="Enter street, office number, landmark..."
                    className="w-full p-3.5 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                {/* City, State, Pincode Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">City</label>
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!editMode}
                      placeholder="Gorakhpur"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">State</label>
                    <input
                      type="text"
                      value={formData.state || ""}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      disabled={!editMode}
                      placeholder="Uttar Pradesh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode || ""}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      disabled={!editMode}
                      placeholder="273001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions (Visible in Edit Mode) */}
              {editMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 flex flex-col sm:flex-row items-center gap-3"
                >
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto btn-primary px-8 py-3 rounded-xl justify-center font-bold text-sm shadow-glow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {saved ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-300" />
                        <span>Saved to Cloud!</span>
                      </>
                    ) : saving ? (
                      <span>Encrypting &amp; Saving…</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Matrix</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(userProfile);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border-default)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* ═══ 5. RECENT ACTIVITY & VIP AGENCY CONCIERGE ═══ */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders Feed (2 Columns on Large) */}
            <div className="lg:col-span-2 rounded-3xl backdrop-blur-2xl bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-7 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <PackageCheck className="w-5 h-5 text-brand-blue-light" />
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    Recent Orders &amp; Campaigns
                  </h3>
                </div>
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={openOrders}
                    className="text-xs font-bold text-brand-blue-light hover:underline"
                  >
                    View All ({orders.length})
                  </button>
                )}
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-default)] gap-3 hover:border-brand-blue/30 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-brand-blue-light font-bold">
                            #{order.id}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">·</span>
                          <span className="text-xs text-[var(--text-muted)] font-medium">
                            {order.date} {order.purchaseTime ? `(${order.purchaseTime})` : ""}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-1">
                          {order.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="text-base font-black text-[var(--text-primary)]">
                          {order.amount}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            order.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                              : "bg-amber-500/15 text-amber-500 border border-amber-500/25"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[var(--border-default)] bg-black/2 dark:bg-white/2">
                  <PackageCheck className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    No Campaigns Placed Yet
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                    Explore our revenue-driven digital marketing and web design packages to scale your brand in Gorakhpur and beyond.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-bold btn-primary"
                  >
                    <span>Browse Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* VIP Direct Concierge (1 Column) */}
            <div className="rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-brand-blue/10 via-[var(--bg-card)] to-purple-600/10 border border-[var(--border-default)] p-6 sm:p-7 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-black tracking-widest text-brand-blue-light px-2.5 py-1 rounded-full bg-brand-blue/15 border border-brand-blue/25 inline-block">
                  DEDICATED CONCIERGE
                </span>
                <h3 className="text-lg font-black text-[var(--text-primary)] mt-3">
                  Need Custom Strategy?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Direct priority hotline with our senior strategy team in Gorakhpur. Free strategy review for active accounts.
                </p>

                <div className="space-y-2.5 mt-5">
                  <a
                    href={`https://wa.me/${config.whatsapp.replace(/[^0-9]/g, "")}?text=Hi%20Nexus%20Digital,%20I%20am%20logged%20in%20on%20my%20profile%20and%20need%20assistance.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-all text-xs font-bold group"
                  >
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" /> WhatsApp VIP Hotline
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </a>

                  <a
                    href={`tel:${config.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-primary)] border border-[var(--border-default)] transition-all text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-blue-light" /> Direct Phone Line
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {config.phone}
                    </span>
                  </a>

                  <Link
                    href="/enquiry#enquiry-form"
                    className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[var(--text-primary)] border border-[var(--border-default)] transition-all text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Request Custom Audit
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-default)] mt-6 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Agency Core Online
                </span>
                <span>Gorakhpur, UP • India</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
