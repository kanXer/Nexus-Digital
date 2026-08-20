"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Target, TrendingUp, Search, Globe, Cpu, Shield, MessageCircle, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { FAQItem } from "@/components/ui/FAQItem";
import { faqs } from "@/data/faq";
import { config } from "@/lib/config";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});

const whyWeAreBest = [
  {
    icon: Target,
    title: "Results-First Digital Marketing",
    desc: "We don't sell posts or clicks — we build campaigns engineered around one thing: leads and revenue. Every digital marketing strategy we run is tied to measurable business outcomes.",
  },
  {
    icon: TrendingUp,
    title: "Meta Ads & Google Ads Experts",
    desc: "Certified paid-media specialists manage your Meta Ads, Google Ads, Search, and Performance Max campaigns to deliver maximum leads per rupee with complete transparency.",
  },
  {
    icon: Search,
    title: "SEO & Local SEO That Ranks",
    desc: "Our SEO services in India combine keyword research, on-page optimisation, technical fixes, and local SEO to push your business to page one of Google — and keep it there.",
  },
  {
    icon: Globe,
    title: "Website Development in One Place",
    desc: "We design and build high-converting websites, landing pages, and e-commerce stores — then maintain them with our website management plans so you never worry about uptime or security.",
  },
  {
    icon: Cpu,
    title: "Marketing Automation & WhatsApp",
    desc: "We connect your marketing to automation — WhatsApp Business, email drip sequences, and CRM — so leads are nurtured and followed up 24/7, even while you sleep.",
  },
  {
    icon: Shield,
    title: "No Lock-Ins, Full Transparency",
    desc: "Pause or cancel anytime. You get a dedicated account manager, clean monthly reporting, and full ownership of every account and asset. Our results keep clients with us, not contracts.",
  },
];

const faqGroups = [
  { id: "digital-marketing", label: "Digital Marketing", desc: "SEO, ads, social media and lead generation questions", match: ["marketing", "results"] },
  { id: "website", label: "Website Development & Management", desc: "Website design, development, cost, and maintenance", match: ["website"] },
  { id: "pricing", label: "Pricing & Plans", desc: "Costs, budgets and commitments", match: ["billing"] },
  { id: "process", label: "Process & Reporting", desc: "How we work and how we report results", match: ["process", "reporting"] },
  { id: "general", label: "General Questions", desc: "About our agency and clients", match: ["general"] },
];

export default function FaqPage() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>FAQ</motion.span>
          <AnimatedTitle
            as="h1"
            title="Digital Marketing & Website FAQs"
            highlight="FAQs"
            className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about digital marketing, SEO, Google Ads, social media marketing, website development, and website management — answered honestly by {config.name}.
          </motion.p>
        </div>
      </section>

      <section className="section-padding bg-white/2 border-y border-white/6 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading badge="Why Choose Us" title="Why We Are the " highlight="Best Digital Marketing Agency" subtitle="Businesses across India trust us to grow them online. Here's what makes us different from other digital marketing companies." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyWeAreBest.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} {...fadeUp(i)} whileHover={{ y: -5 }} className="group relative overflow-hidden glass-card rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 border border-brand-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-brand-blue-light" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <SectionHeading badge="Questions & Answers" title="Common Questions, " highlight="Honest Answers" subtitle="Browse by category — or jump straight to the question on your mind." />

          <div className="mt-14 space-y-14">
            {faqGroups.map((group, gi) => {
              const groupFaqs = faqs.filter((f) => group.match.includes(f.category || ""));
              if (groupFaqs.length === 0) return null;
              return (
                <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}>
                  <div className="mb-6">
                    <AnimatedTitle as="h2" title={group.label} className="text-2xl font-bold text-white" initialDelay={0.1} />
                    <p className="text-white/45 text-sm mt-1">{group.desc}</p>
                  </div>
                  <div className="space-y-3">
                    {groupFaqs.map((faq, i) => (
                      <FAQItem key={faq.id} question={faq.question} answer={faq.answer} index={gi + i} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="mt-14 glass-card rounded-3xl p-8 md:p-10 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-purple-600/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center mx-auto mb-5"><MessageCircle className="w-7 h-7 text-brand-blue-light" /></div>
              <AnimatedTitle
                as="h3"
                title="Didn't Find Your Answer?"
                className="text-2xl md:text-3xl font-black text-white mb-3"
                initialDelay={0.1}
              />
              <p className="text-white/50 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
                Talk to a real marketing expert. Get a free consultation and a custom growth plan for your business — no cost, no pressure.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/contact#book-consultation" className="btn-primary px-7 py-3.5 text-sm group">
                  Book Free Consultation
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "100%", label: "Transparent Reporting" },
            { value: "24hr", label: "Response Time" },
            { value: "0", label: "Lock-In Contracts" },
            { value: "₹5k", label: "Plans Starting From" },
          ].map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp(i)} className="glass-card rounded-2xl p-6 text-center border border-white/8">
              <p className="text-2xl md:text-3xl font-black gradient-text-brand mb-1">{stat.value}</p>
              <p className="text-white/45 text-xs font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto mt-10 text-center">
          <p className="text-white/35 text-sm">
            Looking for a <Link href="/services" className="text-brand-blue-light hover:text-white transition-colors">digital marketing company</Link>, <Link href="/services#website-automation" className="text-brand-blue-light hover:text-white transition-colors">website development</Link> or <Link href="/services#website-automation" className="text-brand-blue-light hover:text-white transition-colors">website management</Link> partner in Gorakhpur, Lucknow, or anywhere in India? <Link href="/contact" className="text-brand-blue-light hover:text-white transition-colors">Contact us</Link> today — let&apos;s grow your business.
          </p>
        </div>
      </section>
    </div>
  );
}
