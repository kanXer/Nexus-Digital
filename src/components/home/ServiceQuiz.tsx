"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles, Target } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Answers = { business?: string; goal?: string; audience?: string };

const BUSINESS = [
  { id: "local", label: "Local Business / Store", icon: "🏪" },
  { id: "ecom", label: "E-commerce / Online Store", icon: "🛒" },
  { id: "service", label: "Services / Consultancy", icon: "💼" },
  { id: "personal", label: "Personal Brand / Creator", icon: "🌟" },
];

const GOAL = [
  { id: "leads", label: "More calls & leads", icon: "📞" },
  { id: "sales", label: "More online sales", icon: "💰" },
  { id: "rank", label: "Rank on Google", icon: "🔍" },
  { id: "awareness", label: "Brand awareness", icon: "📣" },
];

const AUDIENCE = [
  { id: "local", label: "My city / locality", icon: "📍" },
  { id: "india", label: "All India", icon: "🇮🇳" },
  { id: "online", label: "Mostly online", icon: "🌐" },
];

const RECOMMENDATION = {
  seo: {
    title: "SEO & Local SEO",
    desc: "Get found on Google & Maps by customers actively searching for you — the highest-ROI, long-term lead source for your business.",
    href: "/services#seo",
    cta: "Explore SEO services",
  },
  meta: {
    title: "Meta Ads (Facebook & Instagram)",
    desc: "Hyper-targeted ad campaigns that put your offer in front of the right local audience and fill your pipeline with qualified leads.",
    href: "/services#paid-marketing",
    cta: "Explore Meta Ads",
  },
  google: {
    title: "Google Ads (Search & PPC)",
    desc: "Capture high-intent buyers the moment they search for your product or service — fastest way to get qualified leads.",
    href: "/services#paid-marketing",
    cta: "Explore Google Ads",
  },
  social: {
    title: "Social Media Marketing",
    desc: "Build a loyal community and a strong brand presence that keeps your business top-of-mind and drives consistent enquiries.",
    href: "/services#social-media",
    cta: "Explore Social Media",
  },
  web: {
    title: "Website & Landing Pages",
    desc: "A fast, conversion-focused website that turns your ad spend and SEO traffic into actual customers — not dead clicks.",
    href: "/services#website-automation",
    cta: "Explore Web Development",
  },
};

function recommend(a: Answers) {
  const { goal, audience, business } = a;
  if (goal === "rank") return RECOMMENDATION.seo;
  if (goal === "sales") {
    if (business === "ecom") return RECOMMENDATION.google;
    return RECOMMENDATION.meta;
  }
  if (goal === "leads") {
    if (audience === "local") return RECOMMENDATION.seo;
    if (business === "ecom") return RECOMMENDATION.google;
    return RECOMMENDATION.meta;
  }
  // awareness
  if (business === "personal") return RECOMMENDATION.social;
  return RECOMMENDATION.social;
}

export default function ServiceQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const choose = (key: keyof Answers, id: string) => {
    const next = { ...answers, [key]: id };
    setAnswers(next);
    if (step < 2) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  const rec = recommend(answers);

  const steps = [
    {
      title: "What kind of business do you run?",
      subtitle: "So we can tailor the recommendation to your reality.",
      options: BUSINESS,
      key: "business" as const,
    },
    {
      title: "What's your #1 growth goal right now?",
      subtitle: "Pick the outcome you care about most this quarter.",
      options: GOAL,
      key: "goal" as const,
    },
    {
      title: "Where are most of your customers?",
      subtitle: "This decides whether we focus local, national or online.",
      options: AUDIENCE,
      key: "audience" as const,
    },
  ];

  return (
    <section className="section-padding relative bg-white/2 border-y border-white/6 overflow-hidden">
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-30" />
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="2-Minute Match"
          title="Which Service Fits "
          highlight="Your Business?"
          subtitle="Answer 3 quick questions and we'll instantly tell you the best marketing service to grow your business — no email required."
        />

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/8 relative overflow-hidden min-h-[360px] flex flex-col">
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />

            {!done && (
              <div className="flex items-center gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? "bg-brand-blue" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex-1 flex flex-col"
                >
                  <h3 className="text-white font-bold text-xl mb-1.5">{steps[step].title}</h3>
                  <p className="text-white/45 text-sm mb-6">{steps[step].subtitle}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {steps[step].options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => choose(steps[step].key, opt.id)}
                        className="group flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:border-brand-blue/40 hover:bg-brand-blue/10 transition-all cursor-pointer"
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="flex-1 text-sm font-medium text-white/80 group-hover:text-white">{opt.label}</span>
                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-brand-blue-light group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex-1 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-blue-light/80 mb-2">
                    Your Best Fit
                  </p>
                  <h3 className="text-white font-bold text-2xl mb-3 flex items-center gap-2 justify-center">
                    <Target className="w-6 h-6 text-brand-blue-light" /> {rec.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed max-w-md mb-7">{rec.desc}</p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link href={rec.href} className="btn-secondary justify-center text-sm px-6 py-3 group">
                      {rec.cta}
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link href="/enquiry#enquiry-form" className="btn-primary justify-center text-sm px-6 py-3 group">
                      Start my enquiry
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake the quiz
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
