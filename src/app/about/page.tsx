"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, Lightbulb, Handshake, Rocket, Shield, HeartHandshake } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { config } from "@/lib/config";
import { teamMembers, coreValues, agencyTimeline } from "@/data/team";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});

export default function AboutPage() {
  const valueIcons: Record<string, React.ElementType> = { Target, Lightbulb, Handshake, Rocket, Shield, HeartHandshake };

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>About Us</motion.span>
          <AnimatedTitle
            as="h1"
            title="We Build Digital Growth Engines"
            highlight="Digital Growth"
            className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
            We are the <strong className="text-white">best digital marketing agency in Gorakhpur</strong> — and the most results-obsessed. Nexus Digital is a premier <strong className="text-white">digital marketing agency in Gorakhpur &amp; Uttar Pradesh</strong> built on one belief: every business deserves marketing that actually works. We are a digital marketing agency gorakhpur businesses grow with — combining data, creativity, and technology to generate real leads, real revenue, and real brand authority across Gorakhpur, Lucknow, Uttar Pradesh, and all of India.
          </motion.p>
        </div>
      </section>

      <section className="section-padding bg-white/2 border-y border-white/6 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "Our Mission", title: "Turn every rupee of your marketing budget into measurable business growth", desc: "We are a digital marketing agency in Gorakhpur on a mission: help every business — from a local shop in Gorakhpur to a growing brand across Uttar Pradesh — compete, grow, and win online. We deliver honest, data-driven digital marketing that generates real leads, real customers, and real revenue. No vanity metrics. No black boxes. Just growth." },
            { label: "Our Vision", title: "The most trusted digital marketing agency in Uttar Pradesh and beyond", desc: "To be the digital marketing agency gorakhpur, Uttar Pradesh, and India trust for their long-term growth. We measure our success by the businesses we've helped rank #1 on Google, the leads we've generated, the websites we've launched — like Gorakhpur Mission Rehab, KHABRI.IN, 1st Poultry Conclave, and Radhey Radhey Charitable Blood &amp; Component Centre — and the clients who call us their growth partner, not just a vendor." },
          ].map((item, i) => (
            <motion.div key={item.label} {...fadeUp(i)} className="glass-card rounded-2xl p-8 border border-white/10">
              <span className="tag-badge mb-4 inline-flex">{item.label}</span>
              <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <SectionHeading badge="Our Journey" title="From First Steps to " highlight="Trusted Partner" subtitle="Here's how we started and where we're headed — helping local businesses grow one campaign at a time." />
          <div className="mt-14 relative">
            <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-brand-blue via-brand-blue/50 to-transparent" />
            <div className="space-y-10">
              {agencyTimeline.map((item, i) => (
                <motion.div key={item.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className={`relative flex flex-col md:flex-row items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-10" : "md:text-left md:pl-10"}`}>
                    <div className="glass-card rounded-xl p-5 border border-white/8 inline-block max-w-md hover:border-white/15 transition-all">
                      <span className="text-brand-blue-light text-xs font-bold">{item.year}</span>
                      <h3 className="text-white font-semibold text-base mt-1">{item.event}</h3>
                      <p className="text-white/45 text-xs mt-1 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light border-2 border-black flex items-center justify-center z-10 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Page Interceptor Block */}
      <section className="py-16 px-4 relative overflow-hidden bg-brand-red/10 border-y border-brand-red/30">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-red-600/20 via-rose-600/20 to-orange-600/20 blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 animate-pulse">
            Exclusive Partnership
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            We don't take everyone. Are we a fit?
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl text-sm md:text-base">
            We partner with ambitious businesses ready to scale. If you want measurable growth, stop wasting time and let's talk strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/enquiry#enquiry-form" className="btn-primary px-8 py-3.5 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse-slow font-bold">
              Book a Strategy Session
            </Link>
            <Link href="/pricing" className="btn-secondary px-8 py-3.5 border-red-500/50 hover:bg-red-500/10">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white/2 border-y border-white/6 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading badge="Our Team" title="Meet the People " highlight="Behind the Results" subtitle="Founder, editors, and producers working relentlessly to grow your business with strategy, creativity, and craft." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div key={member.id} {...fadeUp(i)} whileHover={{ y: -6 }} className="group relative overflow-hidden glass-card rounded-2xl p-6 text-center hover:border-white/15 transition-all">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />
                <div className="relative z-10">
                  {member.photo ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-brand-blue/40 mx-auto mb-4 shadow-[0_4px_20px_rgba(220,38,38,0.3)]">
                      <Image src={member.photo} alt={`${member.name} - Digital Marketing Expert at Nexus Digital Marketing Agency Gorakhpur`} fill sizes="96px" className="object-cover" />
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
                      <a href={member.socials.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/40 hover:text-brand-blue-light hover:border-brand-blue/30 transition-all"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16m0 1.94c-3.15 0-3.52.01-4.77.07-1.08.05-1.66.23-2.05.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.05-.06 1.25-.07 1.62-.07 4.77s.01 3.52.07 4.77c.05 1.08.23 1.66.38 2.05.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.05.38 1.25.06 1.62.07 4.77.07s3.52-.01 4.77-.07c1.08-.05 1.66-.23 2.05-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.05.06-1.25.07-1.62.07-4.77s-.01-3.52-.07-4.77c-.05-1.08-.23-1.66-.38-2.05-.2-.51-.44-.88-.82-1.26a3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.05-.38-1.25-.06-1.62-.07-4.77-.07m0 3.3a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2m0 1.94a2.66 2.66 0 1 0 0 5.32 2.66 2.66 0 0 0 0-5.32m5.29-3.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14"/></svg></a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <SectionHeading badge="Core Values" title="What " highlight="Drives Us" subtitle="The principles that guide every campaign, every relationship, and every decision we make." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreValues.map((val, i) => {
              const Icon = valueIcons[val.icon] || Target;
              return (
                <motion.div key={val.title} {...fadeUp(i)} whileHover={{ y: -5 }} className="group relative overflow-hidden glass-card rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all">
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 border border-brand-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-brand-blue-light" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{val.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{val.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden bg-white/2 border-t border-white/6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-purple-600/8 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <AnimatedTitle
            as="h2"
            title="Ready to Write Your Success Story?"
            className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
            initialDelay={0.1}
          />
          <p className="text-white/50 mb-8">Our founder-led team works hands-on with every client — no hand-offs, no juniors. Let&apos;s grow your business together.</p>
          <Link href="/contact#book-consultation" className="btn-primary px-8 py-4 text-base group">
            Start Your Journey
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
