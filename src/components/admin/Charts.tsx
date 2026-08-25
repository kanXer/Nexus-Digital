"use client";
import React from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Line / Area chart (responsive SVG, no deps)                                */
/* -------------------------------------------------------------------------- */
export function LineAreaChart({
  data,
  labels,
  height = 120,
  color = "#DC2626",
  fill = "rgba(220,38,38,0.18)",
}: {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  fill?: string;
}) {
  const max = Math.max(1, ...data);
  const n = data.length;
  const w = 100;
  const h = 50;
  const pts = data.map((v, i) => {
    const x = n <= 1 ? w / 2 : (i / (n - 1)) * w;
    const y = h - (v / max) * (h - 6) - 3;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height }} className="w-full overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor="rgba(220,38,38,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={1.4} fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {labels && labels.length > 0 && (
        <div className="mt-2 flex justify-between text-[10px] text-white/40">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Donut chart                                                                */
/* -------------------------------------------------------------------------- */
export function DonutChart({
  segments,
  size = 150,
  thickness = 16,
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
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={thickness} />
        {segs.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.len} ${c - s.len}`}
            strokeDashoffset={-s.start}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
        {centerLabel != null && (
          <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-white" fontSize="20" fontWeight="800">
            {centerLabel}
          </text>
        )}
        {centerSub && (
          <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className="fill-white/40" fontSize="9">
            {centerSub}
          </text>
        )}
      </svg>
      <div className="space-y-1.5 min-w-[120px]">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-white/60 truncate flex-1">{s.label}</span>
            <span className="text-white/40">{s.value}</span>
          </div>
        ))}
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
    <div className="space-y-3">
      {items.length === 0 && <p className="text-white/35 text-sm">No data yet.</p>}
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-sm text-white/70 truncate pr-2">{it.label}</span>
            <span className="text-sm font-semibold text-white/80 shrink-0">{fmt(it.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (it.value / top) * 100)}%`,
                background: it.color ?? "linear-gradient(90deg,#B91C1C,#DC2626,#EF4444)",
              }}
            />
          </div>
          {it.sub && <p className="text-[11px] text-white/35 mt-1">{it.sub}</p>}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat tile                                                                 */
/* -------------------------------------------------------------------------- */
export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = "#DC2626",
  index = 0,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ElementType;
  accent?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card rounded-2xl p-5 border border-white/8 relative overflow-hidden"
    >
      <div
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-40"
        style={{ background: accent }}
      />
      {Icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-glow-sm"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      )}
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mt-2">{label}</p>
      {sub && <p className="text-[11px] text-white/35 mt-1">{sub}</p>}
    </motion.div>
  );
}
