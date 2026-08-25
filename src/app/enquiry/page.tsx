"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, MessageCircle, Send, Phone, Mail } from "lucide-react";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { config } from "@/lib/config";

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
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "enquiry" }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again or WhatsApp us directly.");
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
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Enquiry</motion.span>
          <AnimatedTitle
            as="h1"
            title="Send Us Your Enquiry"
            highlight="Enquiry"
            className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55 leading-relaxed">
            Share your goals and our best digital marketing agency in Gorakhpur team will get back with a tailored plan — whether you&apos;re in Gorakhpur, Lucknow, Uttar Pradesh, or anywhere across India, no obligations.
          </motion.p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/8">
              <h3 className="text-white font-bold text-lg mb-5">Why Send an Enquiry?</h3>
              <ul className="space-y-4">
                {[
                  { title: "Quick Response", desc: "Our team replies within 24 hours, usually much faster." },
                  { title: "Tailored Plan", desc: "Get recommendations specific to your business and budget." },
                  { title: "No Pressure", desc: "A genuine conversation — no hard selling, ever." },
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
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <MessageCircle className="w-5 h-5" /> WhatsApp Us
              </a>
              <div className="space-y-3">
                <a href={`tel:${config.phone}`} className="flex items-center gap-3.5 group glass-card rounded-xl p-4 border border-white/8">
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
                  <h3 className="text-white font-bold text-xl mb-1">Submit Your Enquiry</h3>
                  <p className="text-white/45 text-sm mb-6">Fill in the details below and our team will reach out to you.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Full Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className="input-field" />
                      </div>
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Email Address *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" className="input-field" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Phone Number *</label>
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" className="input-field" />
                      </div>
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Business Name</label>
                        <input type="text" name="business" value={form.business} onChange={handleChange} placeholder="Your Business" className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Service Required *</label>
                      <select name="service" value={form.service} onChange={handleChange} required className="input-field">
                        <option value="" className="bg-black">Select a service</option>
                        {services_options.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Monthly Budget Range</label>
                      <select name="budget" value={form.budget} onChange={handleChange} className="input-field">
                        <option value="" className="bg-black">Select budget range</option>
                        {budget_options.map((b) => <option key={b} className="bg-black">{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Your Requirements *</label>
                      <textarea name="message" value={form.message} onChange={handleChange} rows={5} required placeholder="Tell us about your business, goals, and what you need help with..." className="input-field" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-cta-premium w-full py-3.5 disabled:opacity-60">
                      <span className="relative z-10">{loading ? "Sending..." : "Send Enquiry"}</span>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <Send className="w-5 h-5 relative z-10" />}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-8 h-8 text-green-400" /></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Enquiry Sent!</h3>
                  <p className="text-white/50 text-sm">Thank you for reaching out. Our team will review your enquiry and get back to you within 24 hours.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
