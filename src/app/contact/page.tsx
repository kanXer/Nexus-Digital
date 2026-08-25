"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Calendar, CheckCircle, Loader2, Video, LifeBuoy, Star } from "lucide-react";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { config } from "@/lib/config";

const services_options = [
  "Social Media Marketing", "Meta Ads", "Google Ads", "SEO & Local SEO",
  "Website & Landing Pages", "WhatsApp Automation", "Email Marketing", "Analytics & Reporting", "Full-Stack Marketing",
];

type BookingFormData = {
  name: string; email: string; phone: string; business: string;
  service: string; budget: string; date: string; time: string; message: string;
};

const emptyBooking: BookingFormData = {
  name: "", email: "", phone: "", business: "",
  service: "", budget: "", date: "", time: "", message: "",
};

import { useAuth } from "@/context/AuthContext";

export default function ContactPage() {
  const { userProfile, user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", business: "", service: "", budget: "", message: "" });
  const [bookingData, setBookingData] = useState<BookingFormData>(emptyBooking);

  useEffect(() => {
    if (!user) return;
    if (userProfile.name || userProfile.email || userProfile.phone || userProfile.company) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || userProfile.name || "",
        email: prev.email || userProfile.email || "",
        phone: prev.phone || userProfile.phone || "",
        business: prev.business || userProfile.company || "",
      }));
      setBookingData((prev) => ({
        ...prev,
        name: prev.name || userProfile.name || "",
        email: prev.email || userProfile.email || "",
        phone: prev.phone || userProfile.phone || "",
        business: prev.business || userProfile.company || "",
      }));
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (window.location.hash === "#book-consultation") {
      setTimeout(() => {
        document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBookingData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookingData, type: "booking" }),
      });
      if (!res.ok) throw new Error("Failed");
      setBookingSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again or email us directly.");
    } finally {
      setBookingLoading(false);
    }
  };

  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("book-consultation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-25 pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span className="tag-badge mb-5 inline-flex" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>Contact</motion.span>
          <AnimatedTitle
            as="h1"
            title="Let's Grow Together"
            highlight="Grow Together"
            className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-5"
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="text-lg text-white/55 leading-relaxed">
            Tell us about your business and we&apos;ll create a custom growth plan. As the top digital marketing agency gorakhpur businesses count on, Nexus Digital Marketing Agency Gorakhpur is ready to help your brand rank, advertise, and grow. We offer our services across Gorakhpur, Lucknow, Uttar Pradesh, and all of India.
          </motion.p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/8">
              <h3 className="text-white font-bold text-lg mb-5">Get in Touch</h3>
              <div className="space-y-4">
                <a href={`tel:${config.phone}`} className="flex items-center gap-3.5 group">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/25 transition-colors"><Phone className="w-5 h-5 text-brand-blue-light" /></div>
                  <div><p className="text-white font-semibold text-sm">Call Us</p><p className="text-white/40 text-xs">{config.phone}</p></div>
                </a>
                <a href={`mailto:${config.email}`} className="flex items-center gap-3.5 group">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0 group-hover:bg-brand-blue/25 transition-colors"><Mail className="w-5 h-5 text-brand-blue-light" /></div>
                  <div><p className="text-white font-semibold text-sm">Email</p><p className="text-white/40 text-xs">{config.email}</p></div>
                </a>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-brand-blue-light" /></div>
                  <div><p className="text-white font-semibold text-sm">Office</p><p className="text-white/40 text-xs">{config.address}</p></div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                <MessageCircle className="w-5 h-5" /> WhatsApp Us
              </a>
              <a href="#book-consultation" onClick={scrollToBooking} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm btn-secondary">
                <Calendar className="w-5 h-5" /> Book a Meeting
              </a>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden border border-white/8 h-48">
              <iframe
                src={`https://maps.google.com/maps?q=Nexus+Digital+Marketing+Agency+gorakhpur&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nexus Digital Office Location - Gorakhpur"
              />
            </div>
            <a
              href={`https://www.google.com/maps/place/Nexus+Digital+Marketing+Agency/@26.7780745,83.3677344,17z/data=!3m1!4b1!4m6!3m5!1s0x39914565c023e207:0xfb5a450c09bc064a!8m2!3d26.7780745!4d83.3703093!16s%2Fg%2F11ntr_kp4s?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white transition-colors mt-1"
            >
              <MapPin className="w-3.5 h-3.5" /> Get Directions on Google Maps
            </a>
            <a
              href={config.gmbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-2 w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand-blue/10 border border-brand-blue/25 hover:bg-brand-blue/20 transition-all group"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              View our Google Business Profile
              <span className="text-xs text-white/50 group-hover:text-white/70">({config.gmbRating} ★ · {config.gmbReviewCount}+ reviews)</span>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="lg:col-span-3">
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
              {!submitted ? (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0"><LifeBuoy className="w-5 h-5 text-brand-blue-light" /></div>
                    <h3 className="text-white font-bold text-xl">Need Help? We&apos;re Here for You</h3>
                  </div>
                  <p className="text-white/45 text-sm mb-4">Koi bhi problem, sawaal ya help chahiye? Form bharo — hum 24 hours ke andar reply karenge. Best digital marketing agency in Gorakhpur and India ki complete services ke liye contact karein.</p>
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-xs text-green-400 font-semibold">⚡ Fast Response: We usually reply within 5 minutes on WhatsApp.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="input-field" />
                      </div>
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="input-field" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Phone Number *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" className="input-field" />
                      </div>
                      <div>
                        <label className="text-white/45 text-xs font-medium mb-1.5 block">Business Name</label>
                        <input type="text" name="business" value={formData.business} onChange={handleChange} placeholder="Your Business" className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Service Required *</label>
                      <select name="service" value={formData.service} onChange={handleChange} required className="input-field">
                        <option value="" className="bg-black">Select a service</option>
                        {services_options.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Monthly Budget Range</label>
                      <select name="budget" value={formData.budget} onChange={handleChange} className="input-field">
                        <option value="" className="bg-black">Select budget range</option>
                        <option className="bg-black">₹5,000 – ₹10,000</option>
                        <option className="bg-black">₹10,000 – ₹25,000</option>
                        <option className="bg-black">₹25,000 – ₹50,000</option>
                        <option className="bg-black">₹50,000 – ₹1,00,000</option>
                        <option className="bg-black">₹1,00,000+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">How Can We Help You? *</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={4} required placeholder="Apni problem ya sawaal batao — marketing, website, ads, kuch bhi..." className="input-field" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 group">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><LifeBuoy className="w-5 h-5" /> Get Help Now</>}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-8 h-8 text-green-400" /></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-white/50 text-sm">Thank you for reaching out. Our team will review your details and get back to you within 24 hours.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ BOOK FREE CONSULTATION ═══ */}
      <section id="book-consultation" className="px-4 sm:px-6 lg:px-8 pb-24 relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-purple-600/10 pointer-events-none" />
        <div className="absolute inset-0 grid-dots opacity-20 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }} className="glass-card rounded-3xl p-6 md:p-10 border border-white/10">
            {!bookingSubmitted ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0"><Video className="w-5 h-5 text-brand-blue-light" /></div>
                  <AnimatedTitle
                  as="h2"
                  title="Book a Free Consultation"
                  highlight="Consultation"
                  className="text-2xl md:text-3xl font-black text-white"
                  initialDelay={0.1}
                />
                </div>
                <p className="text-white/45 text-sm mb-4">Pick a date &amp; time that works for you. The team at our digital marketing company in Gorakhpur will join the call with a custom growth plan — 100% free.</p>
                <div className="flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 px-3 py-2 rounded-lg mb-6">
                  <Star className="w-4 h-4 text-brand-blue-light" />
                  <p className="text-xs text-brand-blue-light font-semibold">No commitment required. Just 30 minutes of actionable strategy.</p>
                </div>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Full Name *</label>
                      <input type="text" name="name" value={bookingData.name} onChange={handleBookingChange} required placeholder="John Doe" className="input-field" />
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Email Address *</label>
                      <input type="email" name="email" value={bookingData.email} onChange={handleBookingChange} required placeholder="john@example.com" className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Phone Number *</label>
                      <input type="tel" name="phone" value={bookingData.phone} onChange={handleBookingChange} required placeholder="+91 98765 43210" className="input-field" />
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Business Name</label>
                      <input type="text" name="business" value={bookingData.business} onChange={handleBookingChange} placeholder="Your Business" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/45 text-xs font-medium mb-1.5 block">Service Required *</label>
                    <select name="service" value={bookingData.service} onChange={handleBookingChange} required className="input-field">
                      <option value="" className="bg-black">Select a service</option>
                      {services_options.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Preferred Date *</label>
                      <input type="date" name="date" value={bookingData.date} onChange={handleBookingChange} required className="input-field" />
                    </div>
                    <div>
                      <label className="text-white/45 text-xs font-medium mb-1.5 block">Preferred Time *</label>
                      <select name="time" value={bookingData.time} onChange={handleBookingChange} required className="input-field">
                        <option value="" className="bg-black">Select time slot</option>
                        <option className="bg-black">10:00 AM – 11:00 AM</option>
                        <option className="bg-black">11:00 AM – 12:00 PM</option>
                        <option className="bg-black">12:00 PM – 1:00 PM</option>
                        <option className="bg-black">2:00 PM – 3:00 PM</option>
                        <option className="bg-black">3:00 PM – 4:00 PM</option>
                        <option className="bg-black">4:00 PM – 5:00 PM</option>
                        <option className="bg-black">5:00 PM – 6:00 PM</option>
                        <option className="bg-black">6:00 PM – 7:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/45 text-xs font-medium mb-1.5 block">Monthly Budget Range</label>
                    <select name="budget" value={bookingData.budget} onChange={handleBookingChange} className="input-field">
                      <option value="" className="bg-black">Select budget range</option>
                      <option className="bg-black">₹5,000 – ₹10,000</option>
                      <option className="bg-black">₹10,000 – ₹25,000</option>
                      <option className="bg-black">₹25,000 – ₹50,000</option>
                      <option className="bg-black">₹50,000 – ₹1,00,000</option>
                      <option className="bg-black">₹1,00,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/45 text-xs font-medium mb-1.5 block">Anything you&apos;d like to discuss?</label>
                    <textarea name="message" value={bookingData.message} onChange={handleBookingChange} rows={4} placeholder="Tell us about your goals or questions..." className="input-field" />
                  </div>
                  <button type="submit" disabled={bookingLoading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 group">
                    {bookingLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</> : <><Calendar className="w-5 h-5" /> Book Free Consultation</>}
                  </button>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-8 h-8 text-green-400" /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Consultation Booked!</h3>
                <p className="text-white/50 text-sm">Thank you! Our team will confirm your meeting slot via email within 24 hours. We can&apos;t wait to grow your business.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
