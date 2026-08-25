"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle, Star, X, CheckIcon, Phone,
  TrendingUp, Users, Shield, Zap,
} from "lucide-react";
import { config } from "@/lib/config";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQItem } from "@/components/ui/FAQItem";
import { pricingPlans } from "@/data/pricing";
import LeadCalculator from "@/components/home/LeadCalculator";
import ServiceQuiz from "@/components/home/ServiceQuiz";
import IndustriesWeServe from "@/components/home/IndustriesWeServe";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import LeadMagnetSection from "@/components/home/LeadMagnetSection";
import CashfreeButton from "@/components/payment/CashfreeButton";
import { useAuth } from "@/context/AuthContext";
import { faqs } from "@/data/faq";
import { teamMembers } from "@/data/team";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

const stats = [
  { value: 10, suffix: "+", label: "Happy Clients" },
  { value: 12, suffix: "+", label: "Campaigns Launched" },
  { value: 5, suffix: "+", label: "Industries Served" },
  { value: 5, suffix: "/5", label: "Average Rating" },
];

const services = [
  { icon: "📱", title: "Social Media Marketing", desc: "Build brand authority and community with content that converts.", href: "/services#social-media", gradient: "from-purple-600/20 via-purple-500/5 to-pink-600/10", border: "hover:border-purple-500/30", iconBg: "bg-purple-500/15 border-purple-500/25" },
  { icon: "📊", title: "Paid Advertising", desc: "Meta & Google Ads campaigns that deliver measurable ROAS.", href: "/services#paid-marketing", gradient: "from-blue-600/20 via-blue-500/5 to-cyan-600/10", border: "hover:border-blue-500/30", iconBg: "bg-blue-500/15 border-blue-500/25" },
  { icon: "🔍", title: "SEO & Local SEO", desc: "Rank #1 on Google and dominate your local market.", href: "/services#seo", gradient: "from-emerald-600/20 via-emerald-500/5 to-green-600/10", border: "hover:border-emerald-500/30", iconBg: "bg-emerald-500/15 border-emerald-500/25" },
  { icon: "⚡", title: "Website & Automation", desc: "High-converting pages and smart marketing automation.", href: "/services#website-automation", gradient: "from-orange-600/20 via-amber-500/5 to-yellow-600/10", border: "hover:border-orange-500/30", iconBg: "bg-orange-500/15 border-orange-500/25" },
  { icon: "📈", title: "Analytics & Reporting", desc: "Crystal-clear data insights that drive smarter decisions.", href: "/services#analytics", gradient: "from-red-600/20 via-rose-500/5 to-pink-600/10", border: "hover:border-red-500/30", iconBg: "bg-red-500/15 border-red-500/25" },
];

const whyUs = [
  { icon: TrendingUp, title: "Data-Driven Approach", desc: "Every decision backed by real data, not guesswork. We track, measure, and optimise relentlessly." },
  { icon: Users, title: "Founder-Led & Hands-On", desc: "You work directly with the founder — a full-stack developer and digital marketer who personally handles your strategy, campaigns, and reports. No hand-offs, no juniors." },
  { icon: Shield, title: "Transparent Reporting", desc: "You see everything — spend, results, and what we're doing about it. No black boxes." },
  { icon: Zap, title: "Fast Execution", desc: "Campaigns live in days, not weeks. We move at the speed your business demands." },
];

const clientLogos = ["Gorakhpur Mission Rehab", "1st Poultry Conclave", "Radhey Radhey Blood Bank"];

const caseStudyPreviews = [
  { headline: "Neuro Rehab Website & Local SEO", client: "Gorakhpur Mission Rehab", industry: "Healthcare", service: "Website + Local SEO", gradient: "from-teal-600/25 to-cyan-600/15", href: "/case-studies", result: "Online", label: "Presence" },
  { headline: "Poultry Conclave Event Website", client: "1st Poultry Conclave Gorakhpur", industry: "Event", service: "Event Website + Registrations", gradient: "from-amber-600/25 to-yellow-600/15", href: "/case-studies", result: "Event", label: "Registrations" },
  { headline: "Charitable Blood Bank Web Platform", client: "Radhey Radhey Blood & Component Centre", industry: "Healthcare / Social", service: "Website + Community Outreach", gradient: "from-red-600/25 to-rose-600/15", href: "/portfolio", result: "Community", label: "Reach" },
];

export default function HomeBelowFold() {
  const { user, recordNewOrder } = useAuth();
  const router = useRouter();

  const handleHomeDemo = async (plan: { id: string; name: string; priceInr: number }) => {
    const txnId = `NEX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const order = await recordNewOrder({
      title: plan.name,
      amount: `₹${plan.priceInr.toLocaleString("en-IN")}/mo`,
      planId: plan.id,
      isSubscription: true,
      numericAmount: plan.priceInr,
    });
    router.push(`/payment-success?orderId=${order.id}&plan=${plan.id}&txn=${txnId}`);
  };

  return (
    <div>
      {/* ═══ STATS ═══ */}
      <section className="py-16 border-y border-white/8 bg-white/2 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-50" />
        <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                className="relative group"
              >
                <div className="glass-card rounded-xl p-5 text-center hover:border-white/15 transition-all duration-300">
                  <div className="text-[2.5rem] md:text-[3rem] font-black text-white mb-0.5 tracking-tight">
                    <AnimatedCounter end={s.value} suffix={s.suffix} />
                  </div>
                  <p className="text-white/45 text-xs font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="section-padding relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="container-custom relative z-10">
          <SectionHeading
            badge="What We Do"
            title="Everything You Need to "
            highlight="Dominate Online"
            subtitle="From social media to paid ads, SEO to web development — we handle every aspect of digital marketing for businesses across Gorakhpur, Uttar Pradesh, and all of India."
          />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {services.map((s) => (
              <motion.div key={s.title} variants={itemVariants} whileHover={{ y: -8, scale: 1.01 }} className={`group relative overflow-hidden glass-card rounded-2xl p-6 bg-gradient-to-br ${s.gradient} ${s.border} transition-all duration-400 cursor-pointer`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
                <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {s.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-white transition-colors">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-4 group-hover:text-white/60 transition-colors">{s.desc}</p>
                <Link href={s.href} className="inline-flex items-center gap-1.5 text-brand-blue-light text-sm font-medium group/link">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="mt-10 text-center">
            <Link href="/services" className="btn-secondary px-8 py-3 group">
              View All Services
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ INDUSTRIES WE SERVE ═══ */}
      <IndustriesWeServe />

      {/* ═══ LEAD MAGNETS ═══ */}
      <LeadMagnetSection />

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="section-padding bg-white/2 border-y border-white/6 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="container-custom relative z-10">
          <SectionHeading badge={`Why ${config.shortName}`} title="Top Digital Marketing Agency in " highlight="Gorakhpur & UP" subtitle="As the best digital marketing company, our obsession with data, SEO, and client success sets us apart from others." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                whileHover={{ y: -6 }}
                className="group glass-card rounded-2xl p-6 hover:border-brand-blue/25 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 border border-brand-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-glow-sm transition-all duration-300">
                    <Icon className="w-6 h-6 text-brand-blue-light" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICE QUIZ ═══ */}
      <ServiceQuiz />

      {/* ═══ TEAM ═══ */}
      <section className="section-padding bg-white/2 border-b border-white/6 relative overflow-hidden">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="container-custom relative z-10">
          <SectionHeading badge="Our Team" title="Meet the People " highlight="Behind the Results" subtitle="Founder, editors, and producers working relentlessly to grow your business with strategy, creativity, and craft." />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
            {teamMembers.map((member) => (
              <motion.div key={member.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} whileHover={{ y: -6 }} className="group relative overflow-hidden glass-card rounded-2xl p-6 text-center hover:border-white/15 transition-all">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />
                <div className="relative z-10">
                  {member.photo ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-brand-blue/40 mx-auto mb-4 shadow-[0_4px_20px_rgba(220,38,38,0.3)]">
                      <Image src={member.photo} alt={member.name} fill sizes="96px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-[0_4px_20px_rgba(220,38,38,0.3)]">
                      {member.avatar}
                    </div>
                  )}
                  <h3 className="text-white font-bold text-lg">{member.name}</h3>
                  <p className="text-brand-blue-light text-xs font-semibold mb-3">{member.role}</p>
                  <p className="text-white/45 text-xs leading-relaxed mb-4">{member.bio}</p>
                  {(member.email || member.phone) && (
                    <div className="space-y-1 mb-4">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="block text-[11px] text-white/35 hover:text-brand-blue-light transition-colors break-all">{member.email}</a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`} className="block text-[11px] text-white/35 hover:text-brand-blue-light transition-colors">{member.phone}</a>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                    {member.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/45 border border-white/8">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-center">
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-brand-blue-light hover:border-brand-blue/30 transition-all"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg></a>
                    )}
                    {member.socials.instagram && (
                      <a href={member.socials.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-brand-blue-light hover:border-brand-blue/30 transition-all"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16m0 1.94c-3.15 0-3.52.01-4.77.07-1.08.05-1.66.23-2.05.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.05-.06 1.25-.07 1.62-.07 4.77s.01 3.52.07 4.77c.05 1.08.23 1.66.38 2.05.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.05.38 1.25.06 1.62.07 4.77.07s3.52-.01 4.77-.07c1.08-.05 1.66-.23 2.05-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.05-.06-1.25-.07-1.62-.07-4.77s-.01-3.52-.07-4.77c-.05-1.08-.23-1.66-.38-2.05-.2-.51-.44-.88-.82-1.26a3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.05-.38-1.25-.06-1.62-.07-4.77-.07m0 3.3a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2m0 1.94a2.66 2.66 0 1 0 0 5.32 2.66 2.66 0 0 0 0-5.32m5.29-3.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14"/></svg></a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLIENT LOGOS ═══ */}
      <section className="py-16 overflow-hidden border-b border-white/6 relative">
        <div className="container-custom mb-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/30 text-xs uppercase tracking-[0.2em] font-semibold">Trusted by growing businesses</p>
        </div>
        <div className="relative">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...clientLogos, ...clientLogos].map((name, i) => (
              <div key={i} className="flex items-center justify-center w-40 h-14 glass-card rounded-xl border border-white/8 shrink-0 hover:border-white/15 transition-all">
                <span className="text-white/35 text-sm font-semibold tracking-wide">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CASE STUDIES ═══ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <SectionHeading badge="Case Studies" title="Real Clients. " highlight="Real Results." subtitle="See how we're helping our first clients achieve steady growth." />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseStudyPreviews.map((cs, i) => (
              <motion.div
                key={cs.headline}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden glass-card rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cs.gradient} opacity-50`} />
                <div className="relative z-10 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className="tag-badge text-[10px]">{cs.industry}</span>
                    <span className="text-white/20 text-xs">{cs.service}</span>
                  </div>
                  <h3 className="text-[2rem] font-black text-white mb-1 leading-tight">{cs.headline}</h3>
                  <p className="text-white/50 text-sm mb-6">{cs.client}</p>
                  <Link href={cs.href} className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white group/link transition-colors">
                    Read Case Study
                    <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="mt-10 text-center">
            <Link href="/case-studies" className="btn-secondary px-8 py-3 group">
              View All Case Studies
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ LEAD CALCULATOR ═══ */}
      <LeadCalculator />

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsCarousel />

      {/* ═══ PRICING ═══ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <SectionHeading badge="Pricing" title="Transparent " highlight="Pricing Plans" subtitle="Choose a plan that fits your goals and budget. No hidden fees, no surprises." />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? "glass-card-brand border-brand-blue/40 shadow-[0_0_40px_rgba(220,38,38,0.15)] scale-[1.02] md:scale-105"
                    : "glass-card border-white/8"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-light text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)] inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-white/40 text-xs mb-4">{plan.tagline}</p>
                <div className="mb-6 pb-6 border-b border-white/8">
                  <span className="text-3xl font-black text-white">{plan.priceRange}</span>
                  <span className="text-white/35 text-sm ml-0.5">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.slice(0, 6).map((f) => (
                    <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.included ? "text-white/70" : "text-white/20 line-through"}`}>
                      {f.included
                        ? <CheckIcon className="w-4 h-4 text-brand-blue-light shrink-0" />
                        : <X className="w-4 h-4 text-white/15 shrink-0" />
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaLink} className={`${plan.highlight ? "btn-primary" : "btn-secondary"} justify-center text-sm`}>
                  {plan.cta}
                </Link>
                <div className="mt-4">
                  <p className="text-center text-[11px] uppercase tracking-wider text-white/30 mb-2">
                    Or pay securely &amp; instantly
                  </p>
                  <CashfreeButton
                    planId={plan.id}
                    planName={plan.name}
                    priceInr={plan.priceInr}
                    recurring
                    userId={user?.uid}
                    onDemo={() => handleHomeDemo(plan)}
                  />
                  <p className="text-center text-[11px] text-white/25 mt-3">
                    🔥 Join 200+ businesses growing with us — live in 24h
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="section-padding bg-white/2 border-y border-white/6 relative">
        <div className="container-custom max-w-3xl">
          <SectionHeading badge="FAQ" title="Frequently Asked " highlight="Questions" subtitle="Everything you need to know before getting started." />
          <div className="mt-12 space-y-3">
            {faqs.slice(0, 6).map((faq, i) => (
              <FAQItem key={faq.id} question={faq.question} answer={faq.answer} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DIGITAL MARKETING CONTENT / LOCAL SEO ═══ */}
      <section className="section-padding bg-white/2 border-y border-white/6 relative overflow-hidden">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="container-custom relative z-10">
          <SectionHeading
            badge="Why Local Businesses Choose Us"
            title="Trusted Digital Marketing Agency in "
            highlight="Gorakhpur & Uttar Pradesh"
            subtitle="Keyword-driven content that helps customers find you on Google — and choose you when they do."
          />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="glass-card rounded-2xl p-7 border border-white/8 space-y-4">
              <p className="text-white/55 text-sm leading-relaxed">
                For businesses looking for the <strong className="text-white">best digital marketing agency in Gorakhpur</strong>, Nexus Digital is a top digital marketing company in Gorakhpur that delivers real, measurable growth. Our digital marketing services in Gorakhpur cover SEO, Google Ads, Meta Ads, social media marketing, and lead generation — everything you need to grow online.
              </p>
              <p className="text-white/55 text-sm leading-relaxed">
                As a leading <strong className="text-white">SEO agency in Gorakhpur</strong> and local SEO company, we put local businesses on top of Google Maps and page one of Google. Combined with Google Ads PPC management Gorakhpur businesses trust, and a Meta Ads specialist Gorakhpur brands rely on, we turn searches into sales.
              </p>
              <p className="text-white/55 text-sm leading-relaxed">
                We specialise in website design and digital marketing Gorakhpur businesses need to compete — from high-converting websites to full local business promotion. Our team is a hands-on best digital marketing expert Gorakhpur can call for strategy, content, ads, and analytics.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-7 border border-white/8 space-y-4">
              <p className="text-white/55 text-sm leading-relaxed">
                We are an <strong className="text-white">affordable digital marketing agency in Gorakhpur</strong> with transparent pricing and no long-term lock-ins, offering digital marketing packages across Uttar Pradesh. From digital marketing agency in Uttar Pradesh services to performance marketing agency UP campaigns, we scale businesses at every budget.
              </p>
              <ul className="space-y-2">
                {[
                  "SEO Services in Gorakhpur & Uttar Pradesh",
                  "Local SEO Company Gorakhpur — Google Maps Ranking",
                  "Social Media Marketing Agency Gorakhpur",
                  "Google Ads PPC Management Gorakhpur",
                  "Lead Generation Services Gorakhpur",
                  "Meta Ads Specialist & Management in Gorakhpur",
                  "Website Design & Digital Marketing Gorakhpur",
                  "Real Estate & Healthcare Digital Marketing in UP",
                ].map((k) => (
                  <li key={k} className="flex items-center gap-2 text-xs text-white/60">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                    {k}
                  </li>
                ))}
              </ul>
              <p className="text-white/45 text-xs leading-relaxed pt-2">
                Serving digital marketing for hospitals in Gorakhpur, real estate agencies, schools &amp; colleges, e-commerce brands, and B2B businesses across UP and India with local SEO services in Uttar Pradesh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-purple-600/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-blue/10 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-40" />
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}>
          <span className="tag-badge mb-5 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ready to grow? 🔥 Slots filling fast
          </span>
            <AnimatedTitle
              as="h2"
              title="Start Growing Your Business Today"
              highlight="Today"
              className="text-[clamp(2rem,5vw,3.25rem)] font-black text-white mb-5 leading-tight tracking-tight"
              initialDelay={0.1}
            />
          <p className="text-white/60 text-base md:text-lg mb-4 max-w-lg mx-auto leading-relaxed">
            🔥 Limited new-client slots this month — lock your growth plan today. Book a <strong className="text-white">free consultation</strong> or <strong className="text-white">pay &amp; start instantly</strong> to become a Nexus client in minutes.
          </p>
          <p className="text-brand-blue-light/80 text-sm mb-8 max-w-lg mx-auto font-medium">
            Trusted by 200+ businesses across India 🇮🇳
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact#book-consultation" className="btn-secondary text-base px-8 py-4 group">
              Book Free Consultation
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/pricing" className="btn-primary text-base px-8 py-4 group">
              Pay &amp; Get Started
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a href={`tel:${config.phone}`} className="btn-secondary text-base px-8 py-4">
              <Phone className="w-4 h-4" />
              Call Us Now
            </a>
          </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
