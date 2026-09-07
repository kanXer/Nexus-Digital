"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { config } from "@/lib/config";

export default function TopInfoBar() {
  return (
    <div className="hidden lg:flex fixed top-0 left-0 right-0 z-[55] h-9 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 bg-[#000000] border-b border-[#ffffff14] text-xs">
      {/* Left: company identity */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex items-center gap-2 font-bold text-[#ffffff] shrink-0">
          <Image src="/favicon.svg" alt={config.name} width={20} height={20} className="w-5 h-5 object-contain" />
          {config.name}
        </span>
        <span className="text-[#ffffff40]">|</span>
        <span className="text-[#ffffffb3] truncate">{config.tagline}</span>
      </div>

      {/* Right: contact info + admin */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden xl:flex items-center gap-1.5 text-[#ffffffb3]">
          <MapPin className="w-3 h-3 text-brand-blue-light/70" />
          {config.address}
        </span>
        <a
          href={`mailto:${config.email}`}
          className="hidden md:flex items-center gap-1.5 text-[#ffffffb3] hover:text-[#ffffff] transition-colors"
        >
          <Mail className="w-3 h-3 text-brand-blue-light/70" />
          {config.email}
        </a>
        <a
          href={`tel:+${config.phoneRaw}`}
          className="flex items-center gap-1.5 text-[#ffffffb3] hover:text-[#ffffff] transition-colors"
        >
          <Phone className="w-3 h-3 text-brand-blue-light/70" />
          {config.phone}
        </a>

        <span className="w-px h-4 bg-[#ffffff26]" />

        <Link
          href="/admin"
          title="Admin Login"
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ffffff1a] border border-[#ffffff29] font-bold text-[#ffffffd9] hover:bg-[#ffffff33] hover:text-[#ffffff] transition-colors"
        >
          <ShieldCheck className="w-3 h-3" />
          Admin
        </Link>
      </div>
    </div>
  );
}
