"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, X, Phone, Star } from "lucide-react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { config } from "@/lib/config";
import { FAQItem } from "@/components/ui/FAQItem";
import { pricingPlans, pricingFaqs } from "@/data/pricing";
import { servicePricing } from "@/data/servicePricing";
import ServiceItemBuyer from "@/components/pricing/ServiceItemBuyer";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";

export default function PricingPage() {
  const { addToCart } = useAuth();

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span
            className="tag-badge mb-5 inline-flex"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Pricing Plans
          </motion.span>

          <AnimatedTitle
            as="h1"
            title="Simple, Transparent Pricing"
            highlight="Pricing"
            className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-5"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="text-lg text-white/55 leading-relaxed"
          >
            Looking for an affordable digital marketing agency in Gorakhpur?
            As the top digital marketing agency gorakhpur businesses trust,
            Nexus Digital Marketing Agency Gorakhpur offers clear,
            budget-friendly packages. Explore our digital marketing services
            in Gorakhpur with transparent rates, no hidden fees, and zero
            long-term lock-ins.
          </motion.p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Urgency Alert */}
          <div className="max-w-3xl mx-auto bg-brand-red/10 border border-brand-red/30 rounded-lg p-4 mb-10 flex items-center gap-4 animate-pulse-slow">
            <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center shrink-0">
              <span className="text-xl">🔥</span>
            </div>

            <div>
              <p className="text-white font-bold text-sm">
                Limited Client Intake Each Month
              </p>

              <p className="text-white/60 text-xs">
                We intentionally limit our client intake to maintain quality.
                Lock in today&apos;s pricing and secure your onboarding slot before
                we close this month&apos;s intake.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-7 flex flex-col transition-all duration-500 group ${
                  plan.highlight
                    ? "glass-card-brand border-brand-blue/50 shadow-[0_0_60px_rgba(220,38,38,0.25)] scale-[1.02] md:scale-105 hover:shadow-[0_0_90px_rgba(220,38,38,0.4)]"
                    : "glass-card border-white/8 hover:border-brand-blue/50 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                }`}
              >
                {/* Dynamic Glow */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div
                    className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] transition-all duration-700 opacity-0 group-hover:opacity-100 ${
                      plan.highlight
                        ? "bg-brand-blue/60"
                        : "bg-brand-blue/40"
                    }`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-light text-white shadow-[0_4px_20px_rgba(220,38,38,0.4)] inline-flex items-center gap-1.5 whitespace-nowrap">
                      <Star className="w-3 h-3 fill-white" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {plan.name}
                  </h2>

                  <p className="text-white/45 text-sm">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-white/8 relative z-10">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {plan.priceRange}
                    </span>

                    <span className="text-white/40 text-sm">
                      {plan.period}
                    </span>
                  </div>

                  <p className="text-xs text-white/25 mt-2">
                    + applicable GST
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8 relative z-10">
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-start gap-3 text-sm ${
                        f.included
                          ? "text-white/70"
                          : "text-white/25"
                      }`}
                    >
                      {f.included ? (
                        <Check className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                      )}

                      <span className={f.included ? "" : "line-through"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Buttons */}
                <div className="space-y-2.5 relative z-10">
                  <button
                    onClick={() => {
                      trackEvent("pricing_cta_click", { plan: plan.id, action: "add_to_cart" });
                      addToCart({
                        id: plan.id,
                        title: plan.name,
                        price: plan.priceRange,
                        numericPrice: plan.priceInr,
                        description: plan.tagline,
                      });
                    }}
                    className={`w-full ${
                      plan.highlight ? "btn-primary" : "btn-secondary"
                    } justify-center text-sm py-3 font-bold`}
                  >
                    🛒 Add to Cart
                  </button>

                  <Link
                    href="/cart"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
                  >
                    View Cart
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-center text-[11px] text-white/30 mt-3 relative z-10">
                  🔒 No hidden fees · Cancel anytime · GST included where shown
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.5,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="text-center text-white/30 text-sm mt-10"
          >
            All plans include onboarding, strategy session, and a dedicated
            account manager. Prices may vary based on scope.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.6,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="text-center text-white/25 text-xs mt-3"
          >
            *Note: Ad budgets are paid directly to platforms and are not
            included in service fees.
          </motion.p>
        </div>
      </section>

      {/* Service-wise Pricing Breakdown */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none opacity-60" />

        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeading
            badge="Service Pricing"
            title="Service-wise "
            highlight="Breakdown"
            subtitle="Transparent service-fee pricing for each offering — available as both freelance and full agency rates."
          />

          <div className="mt-14 space-y-14">
            {servicePricing.map((group) => (
              <div key={group.category}>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                  className="flex items-center gap-3 text-lg md:text-xl font-bold text-white mb-6"
                >
                  <span className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm shrink-0">
                    <span className="text-xs">₹</span>
                  </span>

                  {group.category}
                </motion.h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {group.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.08,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      className="glass-card border-white/8 rounded-3xl p-6 flex flex-col hover:border-brand-blue/60 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] transition-all duration-500 group relative overflow-hidden"
                    >
                      {/* Card Glow */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[70px] pointer-events-none transition-all duration-700 opacity-0 group-hover:opacity-100 bg-brand-blue/40" />

                      {/* Service Name */}
                      <h4 className="text-[15px] font-bold text-white leading-snug mb-4 relative z-10">
                        {item.serviceName}
                      </h4>

                      {/* Deliverables */}
                      <ul className="space-y-2 flex-1 mb-5 relative z-10">
                        {item.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-2 text-[13px] text-white/60"
                          >
                            <Check className="w-3.5 h-3.5 text-brand-blue-light shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                        {/* Freelance */}
                        <div className="rounded-2xl bg-white/[0.05] border border-white/8 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">
                            Freelance
                          </p>

                          <p className="text-lg font-black text-white">
                            ₹{item.freelanceInr.toLocaleString("en-IN")}
                          </p>

                          <p className="text-[10px] text-white/35">
                            {item.cycle === "monthly"
                              ? "per month"
                              : "one-time"}
                          </p>
                        </div>

                        {/* Agency */}
                        <div className="rounded-2xl bg-gradient-brand/10 border border-brand-blue/25 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-wider text-brand-blue-light font-semibold mb-1">
                            Agency
                          </p>

                          <p className="text-lg font-black text-white">
                            ₹{item.agencyInr.toLocaleString("en-IN")}
                          </p>

                          <p className="text-[10px] text-white/35">
                            {item.cycle === "monthly"
                              ? "per month"
                              : "one-time"}
                          </p>
                        </div>
                      </div>

                      {/* Buyer Component */}
                      <div className="relative z-10">
                        <ServiceItemBuyer item={item} />
                      </div>

                      {/* Disclaimer */}
                      <p className="text-[11px] text-white/35 leading-relaxed border-t border-white/6 pt-3 mt-4 relative z-10">
                        {item.disclaimer}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/2 border-y border-white/6 relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left relative z-10">
          <div className="flex-1">
            <span className="tag-badge mb-3 inline-flex">
              Enterprise
            </span>

            <AnimatedTitle
              as="h2"
              title="Need a Custom Digital Marketing Plan?"
              className="text-2xl md:text-3xl font-bold text-white mb-3"
              initialDelay={0.1}
            />

            <p className="text-white/50 text-sm leading-relaxed">
              For larger businesses, agencies, or brands across India with
              complex requirements, we build fully custom digital marketing
              engagements. Let&apos;s talk.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/enquiry#enquiry-form"
              onClick={() => trackEvent("service_cta_click", { service: "enterprise_custom", location: "pricing_enterprise" })}
              className="btn-primary px-7 py-3 group"
            >
              Get Free Growth Audit
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href={`tel:${config.phone}`}
              className="btn-secondary px-7 py-3"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            badge="FAQ"
            title="Pricing "
            highlight="Questions Answered"
            subtitle="Everything you need to know about our plans and billing."
          />

          <div className="mt-12 space-y-3">
            {pricingFaqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
