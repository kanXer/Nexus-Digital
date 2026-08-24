"use client";
import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

import { config } from "@/lib/config";

import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/data/testimonials";

const featuredProjects = [
  {
    id: "p1",
    name: "Gorakhpur Mission Rehab",
    desc: "Neuro physiotherapy clinic ranked #1 locally. Custom website + Google Business Profile + Local SEO delivering real patient enquiries.",
    url: "https://gorakhpurmission.in/",
    tag: "Healthcare",
    emoji: "🩺",
    result: "Local SEO · Online Leads",
    color: "from-teal-500/20 to-cyan-500/10",
    border: "hover:border-teal-500/30",
  },
  {
    id: "p2",
    name: "1st Poultry Conclave Gorakhpur",
    desc: "Mega poultry event website for UP Government's Animal Husbandry dept — online registrations, exhibitor listings & sponsor pages.",
    url: "https://poultry-conclave.vercel.app/",
    tag: "Event",
    emoji: "🐔",
    result: "Event Registrations",
    color: "from-amber-500/20 to-yellow-500/10",
    border: "hover:border-amber-500/30",
  },
  {
    id: "p3",
    name: "KHABRI.IN — News Decode",
    desc: "AI-powered bilingual news platform (Hindi + English) with real-time updates, category sections, and search — built for speed & SEO.",
    url: "https://khabari-in.vercel.app/",
    tag: "News / Media",
    emoji: "📰",
    result: "AI News Platform · Real-time",
    color: "from-blue-500/20 to-indigo-500/10",
    border: "hover:border-blue-500/30",
  },
  {
    id: "p4",
    name: "Radhey Radhey Charitable Blood & Component Centre",
    desc: "A purpose-driven blood bank web platform for Gorakhpur — enabling communities to find, request, and donate blood online with ease.",
    url: "https://radhe-radhe-blood-bank.vercel.app/",
    tag: "Blood Bank",
    emoji: "🩸",
    result: "Online Presence · Community Reach",
    color: "from-red-500/20 to-rose-500/10",
    border: "hover:border-red-500/30",
  },
];


const stats = [
  { value: "10+", label: "Happy Clients" },
  { value: "5.0", label: "Average Rating", suffix: "/5" },
  { value: "100%", label: "Would Recommend" },
  { value: "12+", label: "Campaigns Delivered" },
];

export default function TestimonialsPage() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Testimonials</motion.span>
          <AnimatedTitle
            as="h1"
            title="What Our Clients Say"
            highlight="Clients Say"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55">
            Don&apos;t take our word for it — here&apos;s what the businesses we work with say about {config.name}, the trusted digital marketing agency in Gorakhpur &amp; Uttar Pradesh.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="glass-card rounded-2xl p-5 text-center border border-white/8">
              <p className="text-3xl font-black text-white">{s.value}</p>
              {s.suffix && <span className="text-white/40 text-sm">{s.suffix}</span>}
              <p className="text-white/45 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Our Work"
            title="Projects That "
            highlight="Speak Volumes"
            subtitle="Real websites and digital platforms we've built — delivering growth, visibility, and impact for businesses across Gorakhpur & India."
          />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProjects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden glass-card rounded-2xl border border-white/8 ${p.border} transition-all duration-300`}
              >
                <div className={`h-36 bg-gradient-to-br ${p.color} flex items-center justify-center relative`}>
                  <span className="text-5xl">{p.emoji}</span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${p.name}`}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </a>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-brand-blue-light bg-brand-blue/10 px-2 py-0.5 rounded-full border border-brand-blue/20">
                    {p.tag}
                  </span>
                  <h3 className="text-white font-semibold text-sm mt-2 mb-1 leading-snug">{p.name}</h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-2">{p.desc}</p>
                  <p className="text-green-400 text-xs font-medium">✦ {p.result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-12 max-w-4xl mx-auto text-center"
        >
          <a
            href={config.gmbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-blue/10 border border-brand-blue/25 hover:bg-brand-blue/20 transition-all group"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            View All Ratings on Google
            <span className="text-xs text-white/50 group-hover:text-white/70">({config.gmbRating} ★ · {config.gmbReviewCount}+ reviews)</span>
          </a>
        </motion.div>
      </section>
    </div>
  );
}
