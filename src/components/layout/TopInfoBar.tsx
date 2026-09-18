"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { config } from "@/lib/config";

export default function TopInfoBar() {
  return (
    <div className="hidden lg:flex fixed top-0 left-0 right-0 z-[55] h-9 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)] border-b border-[var(--border-default)] text-xs text-[var(--text-secondary)] transition-colors duration-300">
      {/* Animated gradient micro accent border */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent bg-[length:200%_auto] animate-gradient-x pointer-events-none" />

      {/* Left: company identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex items-center gap-2 font-bold text-[var(--text-primary)] shrink-0">
          <Image src="/favicon.svg" alt={config.name} width={20} height={20} className="w-5 h-5 object-contain" />
          {config.name}
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="opacity-30">|</span>
        <span className="text-[var(--text-secondary)] truncate">{config.tagline}</span>
      </div>

      {/* Right: contact info + admin */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden xl:flex items-center gap-1.5 text-[var(--text-secondary)]">
          <MapPin className="w-3 h-3 text-brand-red-light shrink-0" />
          {config.address}
        </span>
        <a
          href={`mailto:${config.email}`}
          className="hidden md:flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Mail className="w-3 h-3 text-brand-red-light shrink-0" />
          {config.email}
        </a>
        <a
          href={`tel:+${config.phoneRaw}`}
          className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Phone className="w-3 h-3 text-brand-red-light shrink-0" />
          {config.phone}
        </a>
      </div>
    </div>
  );
}
