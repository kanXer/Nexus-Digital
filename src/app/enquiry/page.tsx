"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, MessageCircle, Send, Phone, Mail } from "lucide-react";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { config } from "@/lib/config";
import { trackEvent, waLink, WHATSAPP_DEFAULT } from "@/lib/analytics";

const services_options = [
  "Social Media Marketing", "Meta Ads", "Google Ads", "SEO & Local SEO",
  "Website & Landing Pages", "WhatsApp Automation", "Email Marketing", "Analytics & Reporting", "Full-Stack Marketing",
];

const budget_options = [
  "₹5,000 – ₹10,000", "₹10,000 – ₹25,000", "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000", "₹1,00,000+",
];

type EnquiryFormData = {
  name: string;
  email: string;
  phone: string;
  business: string;
  service: string;
  budget: string;
  message: string;
};

const empty: EnquiryFormData = {
  name: "", email: "", phone: "", business: "", service: "", budget: "", message: "",
};

import { useAuth } from "@/context/AuthContext";

export default function EnquiryPage() {
  const { userProfile, user } = useAuth();
  const [form, setForm] = useState<EnquiryFormData>(empty);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [qualified, setQualified] = useState(false);

  useEffect(() => {
    trackEvent("lead_form_start", { location: "enquiry_page" });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (userProfile.name || userProfile.email || userProfile.phone || userProfile.company) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || userProfile.name || "",
        email: prev.email || userProfile.email || "",
        phone: prev.phone || userProfile.phone || "",
        business: prev.business || userProfile.company || "",
      }));
    }
  }, [user, userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "enquiry" }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
      trackEvent("lead_form_submit", { service: form.service, budget: form.budget || "not_specified" });
    } catch {
      setError(true);
      trackEvent("lead_form_submit", { success: "false" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Free Growth Audit</motion.span>
          <AnimatedTitle
            as="h1"
            title="Get Your Free "
            highlight="Growth Audit"
            className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/60 leading-relaxed">
            Tell us a little about your business and what you need help with. It takes less than 60 seconds — no obligation.
          </motion.p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/8">
              <h3 className="text-white font-bold text-lg mb-5">Why Get a Growth Audit?</h3>
              <ul className="space-y-4">
                {[
                  { title: "See what's working", desc: "We review your site, ads, and social presence to spot opportunities." },
                  { title: "Quick to complete", desc: "Just a few questions — under a minute of your time." },
                  { title: "No pressure", desc: "A genuine, helpful analysis. No hard selling, ever." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-blue-light shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <a
                href={waLink(WHATSAPP_DEFAULT)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "enquiry_sidebar" })}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp Us Instead
              </a>
              <div className="space-y-3">
                <a href={`tel:${config.phone}`} onClick={() => trackEvent("phone_click", { location: "enquiry_sidebar" })} className="flex items-center gap-3.5 group glass-card rounded-xl p-4 border border-white/8">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-brand-blue-light" /></div>
                  <div><p className="text-white font-semibold text-sm">Call Us</p><p className="text-white/40 text-xs">{config.phone}</p></div>
                </a>
                <a href={`mailto:${config.email}`} className="flex items-center gap-3.5 group glass-card rounded-xl p-4 border border-white/8">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-brand-blue-light" /></div>
                  <div><p className="text-white font-semibold text-sm">Email</p><p className="text-white/40 text-xs">{config.email}</p></div>
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div id="enquiry-form" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="lg:col-span-3 scroll-mt-28">
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
              {!submitted ? (
                <>
                  <h3 className="text-white font-bold text-xl mb-1">{!qualified ? "Start Your Free Audit" : "Almost there — one more step"}</h3>
                  <p className="text-white/45 text-sm mb-6">
                    {!qualified
                      ? "Just the essentials to get started. We'll ask for a couple more details after this."
                      : "Optional details help us give you a better assessment. You can skip these."}
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block" htmlFor="enq-name">Full Name *</label>
                      <input id="enq-name" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className="input-field" autoComplete="name" />
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block" htmlFor="enq-phone">WhatsApp Number *</label>
                      <input id="enq-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" className="input-field" autoComplete="tel" />
                      <p className="text-[11px] text-white/25 mt-1">We&apos;ll usually respond here.</p>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block" htmlFor="enq-service">What do you need help with? *</label>
                      <select id="enq-service" name="service" value={form.service} onChange={handleChange} required className="input-field">
                        <option value="" className="bg-black">Select a service</option>
                        {services_options.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                      </select>
                    </div>

                    {qualified && (
                      <>
                        <div>
                          <label className="text-white/45 text-xs font-medium mb-1.5 block" htmlFor="enq-business">Website / Instagram</label>
                          <input id="enq-business" type="text" name="business" value={form.business} onChange={handleChange} placeholder="yourwebsite.com or @yourhandle" className="input-field" autoComplete="organization" />
                        </div>
                        <div>
                          <label className="text-white/45 text-xs font-medium mb-1.5 block" htmlFor="enq-budget">Approximate monthly marketing budget</label>
                          <select id="enq-budget" name="budget" value={form.budget} onChange={handleChange} className="input-field">
                            <option value="" className="bg-black">Select budget range</option>
                            {budget_options.map((b) => <option key={b} className="bg-black">{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-white/45 text-xs font-medium mb-1.5 block" htmlFor="enq-email">Email (optional)</label>
                          <input id="enq-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" autoComplete="email" />
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                        Something went wrong. Please try again or <a href={waLink(WHATSAPP_DEFAULT)} target="_blank" rel="noopener noreferrer" className="font-bold underline">contact us on WhatsApp</a>.
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      {!qualified ? (
                        <button
                          type="button"
                          onClick={() => setQualified(true)}
                          className="btn-secondary flex-1 justify-center text-sm"
                        >
                          Continue — Optional Details
                        </button>
                      ) : null}
                      <button type="submit" disabled={loading} className="btn-cta-premium flex-1 py-3.5 disabled:opacity-60">
                        <span className="relative z-10">{loading ? "Submitting…" : "Get My Free Audit"}</span>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <Send className="w-5 h-5 relative z-10" />}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-8 h-8 text-green-400" /></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thanks! Your request has been received.</h3>
                  <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
                    Our team is getting a free growth audit ready for you. For the fastest response, chat with us now:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={waLink(`Hi ${form.name}, my request for a free growth audit has been received. I need help with: ${form.service}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("whatsapp_click", { location: "enquiry_success" })}
                      className="btn-primary px-7 py-3.5 text-sm group"
                    >
                      <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                    </a>
                    <a href={`tel:${config.phone}`} onClick={() => trackEvent("phone_click", { location: "enquiry_success" })} className="btn-secondary px-7 py-3.5 text-sm">
                      <Phone className="w-4 h-4" /> Request a Call
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
