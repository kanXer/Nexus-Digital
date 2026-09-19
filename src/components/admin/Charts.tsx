"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Line / Area chart (responsive SVG, with glowing gradient & hover tooltip) */
/* -------------------------------------------------------------------------- */
export function LineAreaChart({
  data,
  labels,
  height = 160,
  color = "#DC2626",
  fillGradient = ["rgba(220, 38, 38, 0.35)", "rgba(239, 68, 68, 0.05)", "rgba(220, 38, 38, 0)"],
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  fillGradient?: string[];
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const max = Math.max(1, ...data);
  const n = data.length;
  const w = 100;
  const h = 50;

  const pts = data.map((v, i) => {
    const x = n <= 1 ? w / 2 : (i / (n - 1)) * w;
    const y = h - (v / max) * (h - 8) - 4;
    return [x, y] as const;
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <div className="w-full relative select-none">
      {/* Active tooltip badge */}
      {activeIdx !== null && (
        <div
          className="absolute -top-3 px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold shadow-glow-sm pointer-events-none transition-all duration-150 transform -translate-x-1/2 z-20"
          style={{
            left: `${pts[activeIdx][0]}%`,
          }}
        >
          {data[activeIdx]} leads {labels?.[activeIdx] ? `(${labels[activeIdx]})` : ""}
        </div>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{ height }}
          className="w-full overflow-visible"
        >
          <defs>
            <linearGradient id="leadAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillGradient[0]} />
              <stop offset="60%" stopColor={fillGradient[1]} />
              <stop offset="100%" stopColor={fillGradient[2]} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Area fill */}
          <path d={area} fill="url(#leadAreaGrad)" />

          {/* Glowing border line */}
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Interactive points */}
          {pts.map((p, i) => {
            const isHovered = activeIdx === i;
            return (
              <g
                key={i}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Hit area */}
                <circle cx={p[0]} cy={p[1]} r={6} fill="transparent" />
                {/* Visual point */}
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={isHovered ? 2.6 : 1.6}
                  fill={isHovered ? "#ffffff" : color}
                  stroke={isHovered ? color : "#ffffff"}
                  strokeWidth={isHovered ? 1.5 : 0.6}
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {labels && labels.length > 0 && (
        <div className="mt-3 flex justify-between text-[11px] font-semibold text-[var(--text-muted)]">
          {labels.map((l, i) => (
            <span
              key={i}
              className={`transition-colors ${activeIdx === i ? "text-red-500 font-bold" : ""}`}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Donut chart (High Contrast, Segmented, Responsive)                        */
/* -------------------------------------------------------------------------- */
export function DonutChart({
  segments,
  size = 160,
  thickness = 18,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string | number;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  const segs = segments.map((s, i) => {
    const len = (s.value / total) * c;
    const start = segments
      .slice(0, i)
      .reduce((a, x) => a + (x.value / total) * c, 0);
    return { ...s, len, start };
  });

  return (
    <div className="flex items-center justify-between gap-6 flex-wrap select-none">
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border-default)"
            strokeWidth={thickness}
          />
          {/* Colored segments */}
          {segs.map((s, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, s.len - 2)} ${c - Math.max(0, s.len - 2)}`}
              strokeDashoffset={-s.start}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-500 hover:opacity-80"
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerLabel != null && (
            <span className="text-2xl font-black text-[var(--text-primary)] leading-tight">
              {centerLabel}
            </span>
          )}
          {centerSub && (
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {centerSub}
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 flex-1 min-w-[140px]">
        {segments.map((s, i) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <div
              key={i}
              className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ background: s.color }}
                />
                <span className="text-[var(--text-secondary)] font-medium truncate">{s.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[var(--text-primary)] font-bold">{s.value}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold w-7 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Horizontal bar list                                                       */
/* -------------------------------------------------------------------------- */
export function HBarList({
  items,
  max,
  format,
}: {
  items: { label: string; value: number; color?: string; sub?: string }[];
  max?: number;
  format?: (n: number) => string;
}) {
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  const fmt = format ?? ((n: number) => String(n));

  return (
    <div className="space-y-3.5 select-none">
      {items.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm italic py-4 text-center">
          No records captured yet.
        </p>
      )}
      {items.map((it, i) => {
        const pct = Math.min(100, Math.round((it.value / top) * 100));
        return (
          <div key={i} className="group">
            <div className="flex justify-between items-baseline mb-1.5 text-xs">
              <span className="font-semibold text-[var(--text-primary)] truncate pr-2 group-hover:text-red-500 transition-colors">
                {it.label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-[var(--text-primary)]">{fmt(it.value)}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold">({pct}%)</span>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full shadow-glow-sm"
                style={{
                  background: it.color ?? "linear-gradient(90deg, #DC2626 0%, #EF4444 60%, #F43F5E 100%)",
                }}
              />
            </div>
            {it.sub && (
              <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">{it.sub}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat tile (Glass Luxury with micro-trend & neon highlights)               */
/* -------------------------------------------------------------------------- */
export function StatTile({
  label,
  value,
  sub,
  trend,
  trendPositive = true,
  icon: Icon,
  accent = "#DC2626",
  index = 0,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ElementType;
  accent?: string;
  index?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={onClick}
      className={`glass-card-luxury rounded-2xl p-5 border border-[var(--border-default)] relative overflow-hidden group transition-all duration-300 shadow-card hover:border-red-500/40 ${
        onClick ? "cursor-pointer hover:scale-[1.01]" : ""
      }`}
    >
      {/* Subtle radial ambient blob */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm text-white"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        {trend && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              trendPositive
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none mb-1">
          {value}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        {sub && (
          <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-1.5 flex items-center gap-1">
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}
