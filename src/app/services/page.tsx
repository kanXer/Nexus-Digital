"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { serviceCategories } from "@/data/services";
import * as LucideIcons from "lucide-react";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Target: LucideIcons.Target, CalendarDays: LucideIcons.CalendarDays, Palette: LucideIcons.Palette,
    Video: LucideIcons.Video, Hash: LucideIcons.Hash, Clock: LucideIcons.Clock, Users: LucideIcons.Users,
    Facebook: LucideIcons.Globe, Search: LucideIcons.Search, ScanSearch: LucideIcons.ScanSearch,
    Monitor: LucideIcons.Monitor, Zap: LucideIcons.Zap, UserPlus: LucideIcons.UserPlus,
    RefreshCw: LucideIcons.RefreshCw, Code2: LucideIcons.Code2, BarChart3: LucideIcons.BarChart3,
    PenTool: LucideIcons.PenTool, MapPin: LucideIcons.MapPin, Navigation: LucideIcons.Navigation,
    FileText: LucideIcons.FileText, Settings: LucideIcons.Settings, BookOpen: LucideIcons.BookOpen,
    Layout: LucideIcons.Layout, Wrench: LucideIcons.Wrench, Globe2: LucideIcons.Globe2,
    MessageCircle: LucideIcons.MessageCircle, Mail: LucideIcons.Mail, Database: LucideIcons.Database,
    ClipboardList: LucideIcons.ClipboardList, Activity: LucideIcons.Activity,
    FileBarChart: LucideIcons.FileBarChart, DollarSign: LucideIcons.DollarSign,
    ImagePlay: LucideIcons.ImagePlay, Share2: LucideIcons.Share2,
    TrendingUp: LucideIcons.TrendingUp, Globe: LucideIcons.Globe, Cpu: LucideIcons.Cpu,
    BarChart2: LucideIcons.BarChart2, Funnel: LucideIcons.Funnel,
  };
  const Icon = icons[name] || LucideIcons.Sparkles;
  return <Icon className={className} />;
}

export default function ServicesPage() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}>
            <span className="tag-badge mb-5 inline-flex">Our Services</span>
          </motion.div>
          <AnimatedTitle
            as="h1"
            title="Full-Stack Digital Marketing"
            highlight="Services That Convert"
            className="text-[clamp(2rem,5vw,3.75rem)] font-black text-white leading-[1.05] tracking-[-0.04em] mb-5"
          />
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-lg text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            From social media to paid ads, SEO to web development — our digital marketing services in Gorakhpur &amp; India are designed with one goal: growing your revenue. As the best digital marketing agency in Gorakhpur, we are a top digital marketing company in Gorakhpur offering full-service campaigns. From ranking your brand via the best seo company in gorakhpur to designing high-converting sites as a website designing company gorakhpur, running high-performance campaigns as a premier social media marketing agency gorakhpur, or maximizing your ROAS with expert ppc services in gorakhpur — we have you covered.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}>
            <Link href="/contact#book-consultation" className="btn-primary px-8 py-4 group">
              Get Free Consultation
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-xl border-b border-white/8 py-3 px-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {serviceCategories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 border border-white/10 hover:text-white hover:border-brand-blue/40 hover:bg-brand-blue/10 transition-all"
            >
              {cat.title}
            </a>
          ))}
        </div>
      </div>

      {serviceCategories.map((cat, catIdx) => (
        <section
          key={cat.id}
          id={cat.id}
          className={`section-padding ${catIdx % 2 === 1 ? "bg-white/2" : ""} border-b border-white/6 relative`}
        >
          <div className={`absolute inset-0 pointer-events-none ${catIdx % 2 === 1 ? "noise-bg opacity-30" : ""}`} />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
              className={`flex items-start gap-5 mb-12 p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-white/8`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center shrink-0">
                <DynamicIcon name={cat.icon} className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{cat.title}</h2>
                <p className="text-white/55">{cat.subtitle}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cat.services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden glass-card rounded-2xl p-6 flex flex-col gap-4 hover:border-white/15 transition-all duration-300"
                >
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-brand-blue/12 border border-brand-blue/20 flex items-center justify-center group-hover:bg-brand-blue/20 group-hover:scale-110 transition-all duration-300">
                      <DynamicIcon name={service.icon} className="w-5 h-5 text-brand-blue-light" />
                    </div>
                    <h3 className="text-white font-semibold text-lg leading-snug mt-4">{service.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed mt-2">{service.description}</p>
                    <ul className="space-y-1.5 mt-4">
                      {service.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs text-white/55">
                          <CheckCircle className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact#book-consultation"
                      className="mt-4 inline-flex items-center gap-1.5 text-brand-blue-light text-sm font-semibold group/link hover:gap-3 transition-all"
                    >
                      Get Started <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/15 via-transparent to-purple-600/10 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-2xl mx-auto relative z-10">
          <AnimatedTitle
            as="h2"
            title="Not Sure Which Digital Marketing Service You Need?"
            className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
            initialDelay={0.1}
          />
          <p className="text-white/50 mb-8 leading-relaxed">Book a free 30-minute consultation. We&apos;ll audit your current marketing and recommend the right strategy for your business in Gorakhpur, Lucknow, or anywhere in India — including local SEO services in Uttar Pradesh, performance marketing, and lead generation for every budget.</p>
          <Link href="/contact#book-consultation" className="btn-primary px-8 py-4 text-base group">
            Book Free Strategy Call
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
