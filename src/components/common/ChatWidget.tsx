/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability */
"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Bot, Send, X, Sparkles, MessageCircle, Mail, Phone, Maximize2, Minimize2, Trash2, ArrowDown, User, ChevronDown, ChevronUp } from "lucide-react";
import { config } from "@/lib/config";

type ChatMsg = { role: "user" | "assistant"; content: string };

type EnquiryData = {
  active: boolean;
  step: number;
  data: Record<string, string>;
};

// Pull an email (and best-effort name) out of the conversation so we can save a
// lead even when the visitor shares it casually instead of going through the
// structured enquiry form.
function extractLead(messages: ChatMsg[]): { email: string; name: string } {
  const emailRe = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  let email = "";
  for (const m of messages) {
    if (m.role === "user") {
      const match = m.content.match(emailRe);
      if (match) email = match[0];
    }
  }
  if (!email) return { email: "", name: "" };

  const nameRe =
    /(?:my name is|i am |i'm |this is|name[:\-]?\s*)([A-Za-z][A-Za-z'’.\-]{1,}(?:\s+[A-Za-z][A-Za-z'’.\-]{1,})?)/i;
  let name = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const nm = messages[i].content.match(nameRe);
    if (nm) {
      name = nm[1].trim();
      break;
    }
  }
  if (!name) name = email.split("@")[0].replace(/[._]/g, " ");
  return { email, name };
}

const WELCOME: ChatMsg = {
  role: "assistant",
  content:
    "Namaste! I'm Friday, your AI assistant. Want more leads & sales? I can show you a plan you can start paying for instantly — or book a free consultation. What can I help you grow today?",
};

// All service categories exactly as shown on the Services page.
const SERVICE_CATEGORIES = [
  "Social Media Marketing",
  "Paid Marketing & Ads",
  "Search Engine Optimisation",
  "Website & Automation",
  "Analytics & Reporting",
];

const QUICK_REPLIES = [...SERVICE_CATEGORIES, "Free SEO audit", "Ask for Pricing", "View Pricing", "Start Paid Plan", "Start my Enquiry"];

// Contextual suggestion chips — shown after each assistant reply, matched against
// the last message's topic so follow-ups feel relevant to what was just said.
const REPLY_SUGGESTIONS: { match: RegExp; chips: string[] }[] = [
  { match: /seo|rank|google map|local seo|on[- ]?page|backlink/i, chips: ["SEO pricing", "Local SEO", "Free SEO audit"] },
  { match: /meta ads|facebook ad|instagram|social media|reel|smm/i, chips: ["Meta Ads cost", "Social Media Marketing", "Can you handle my Instagram?"] },
  { match: /google ads|ppc|search ad|google ad/i, chips: ["Google Ads budget", "PPC management", "How fast do ads work?"] },
  { match: /website|landing page|web dev|web design|custom site/i, chips: ["Website cost", "Landing page design", "How long does it take?"] },
  { match: /email|newsletter|whatsapp/i, chips: ["Email Marketing", "WhatsApp Automation", "Can you send campaigns?"] },
  { match: /plan|price|pricing|cost|package|buy|pay|subscribe|start now|monthly|fee|charge/i, chips: ["View Pricing", "Start Paid Plan", "Ask for Pricing"] },
];

const WHATSAPP_URL = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
  "Hi! I just chatted with Friday and want to talk to your team."
)}`;

// Rotating hint bubble messages — shown one at a time above the floating
// chat button, cycling through on each pop-up so it feels conversational.
const HINT_MESSAGES = [
  "Hi! I'm Friday — your AI assistant",
  "See plans you can start paying for today",
  "Pay & grow with Nexus Digital",
  "Book a free consultation now",
  "Limited slots this month — start today",
  "Your growth plan is one tap away",
];

// Convert plain-text URLs in a message into clickable links (open in new tab).
function linkify(text: string): ReactNode {
  const urlRe =
    /(https?:\/\/[^\s<]+)|(\/(?:pricing|contact|services|enquiry|about|case-studies|testimonials|faq)(?:\/[^\s<]*)?)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = urlRe.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const href = token.startsWith("http")
      ? token
      : `https://nexusdigitalmarketing.shop${token}`;
    out.push(
      <a
        key={i++}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-blue-light underline underline-offset-2 hover:text-white break-words"
      >
        {token}
      </a>
    );
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Friday AI avatar — site logo image inside a branded ring, with name label.
function FridayAvatar() {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 w-9">
      <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center shadow-glow-sm ring-1 ring-white/25">
        <Image src="/favicon.svg" alt="Friday" width={20} height={20} className="w-5 h-5 object-contain" />
      </div>
      <span className="text-[8px] font-bold text-white/45 leading-none">Friday</span>
    </div>
  );
}

// User avatar — simple person icon with "You" label.
function UserAvatar() {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 w-9">
      <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shadow-sm">
        <User className="w-3.5 h-3.5 text-white/70" />
      </div>
      <span className="text-[8px] font-bold text-white/45 leading-none">You</span>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [hint, setHint] = useState(false);
  const [enquiry, setEnquiry] = useState<EnquiryData>({ active: false, step: 0, data: {} });
  const [enquiryOptions, setEnquiryOptions] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState(false);
  const [lastAction, setLastAction] = useState<"chat" | "enquiry" | "contact">("chat");
  const [launcherBottom, setLauncherBottom] = useState(80);
  const [fullscreen, setFullscreen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [showGoDown, setShowGoDown] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [sugOpen, setSugOpen] = useState(true); // suggestions panel collapse toggle
  const scrollRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const leadCapturedRef = useRef(false);

  // Position the launcher just above whichever floating buttons are currently
  // visible, so hidden buttons never leave a dead gap beneath it.
  useEffect(() => {
    const compute = () => {
      const scrolled = window.scrollY > 150;
      const isLg = window.matchMedia("(min-width: 1024px)").matches;
      if (isLg) {
        setLauncherBottom(scrolled ? 184 : 104);
      } else {
        setLauncherBottom(scrolled ? 184 : 104);
      }
    };
    compute();
    const onScroll = () => compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Periodic attention animation — every ~7s the launcher softly pulses.
  useEffect(() => {
    const pulseId = setInterval(() => setPulse((p) => p + 1), 7000);
    return () => clearInterval(pulseId);
  }, []);

  // On phones (<640px) the chat always opens as a full-screen sheet that
  // covers every floating button; `immersive` also detaches the window from
  // launcherBottom so page scrolling can never shift/jitter it.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Keep the input above the on-screen keyboard (iOS): track how much of the
  // visual viewport the keyboard covers and lift the sheet by that amount.
  const [keyboardInset, setKeyboardInset] = useState(0);
  useEffect(() => {
    if (!open || !isNarrow) { setKeyboardInset(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const next = inset > 100 ? Math.round(inset) : 0;
      setKeyboardInset(next);
      if (next > 0) {
        // Keyboard opened/resized — re-pin the newest message so it (plus the
        // suggestions and input row) all stay visible above the keyboard.
        followRef.current = true;
        const pin = () => {
          const el = scrollRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        };
        requestAnimationFrame(pin);
        setTimeout(pin, 280);
      }
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [open, isNarrow]);

  // Lock background page scroll while the mobile sheet is open — stops iOS
  // from panning the page (and the fixed chat with it) when the keyboard opens.
  useEffect(() => {
    if (!open || !isNarrow) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open, isNarrow]);

  const immersive = fullscreen || isNarrow;

  // Hint bubble pops up periodically when the chat is closed, cycling through
  // a set of friendly messages so it never feels repetitive.
  useEffect(() => {
    if (open) return;
    const hintId = setInterval(() => {
      setHintIndex((i) => (i + 1) % HINT_MESSAGES.length);
      setHint(true);
      setTimeout(() => setHint(false), 8000);
    }, 12000);
    return () => clearInterval(hintId);
  }, [open]);

  // Auto-follow control — true while the user is at/near the bottom, so new
  // (streaming) text keeps the latest message visible above the suggestions.
  // The moment the user swipes up/down manually, following stops until they
  // scroll back to the bottom themselves.
  const followRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    followRef.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowGoDown(distFromBottom > 120);
    followRef.current = distFromBottom <= 80;
  }, []);

const clearHistory = () => {
  followRef.current = true;
  setMessages([WELCOME]);
  setEnquiry({ active: false, step: 0, data: {} });
  setEnquiryOptions([]);
  setFollowUp(false);
  setLastAction("chat");
  setLoading(false);
  setInput("");
  requestAnimationFrame(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  });
};

  // Keep the newest message pinned just above the suggestions while streaming,
  // but ONLY while the user hasn't scrolled away (followRef). Instant scrollTop
  // assignment avoids smooth-scroll fighting during rapid typewriter updates.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !followRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  const toggle = () => {
    followRef.current = true;
    setOpen((o) => !o);
    if (!openedRef.current) {
      openedRef.current = true;
      setMessages([WELCOME]);
    }
  };

  // Smooth typewriter — reveals text at message index `replyIndex` at a steady
  // pace so EVERY reply (streamed AI, pre-defined enquiry steps, errors) always
  // appears chunked. Resolves once the full text is visible.
  const typewrite = useCallback(
    (replyIndex: number, full: { text: string }, isDone: () => boolean) =>
      new Promise<void>((resolve) => {
        let rendered = 0;
        const finish = () => {
          setMessages((m) => {
            if (!m[replyIndex] || m[replyIndex].role !== "assistant") return m;
            const copy = [...m];
            copy[replyIndex] = { role: "assistant", content: full.text };
            return copy;
          });
          resolve();
        };
        const typer = setInterval(() => {
          if (rendered >= full.text.length) {
            if (isDone()) {
              clearInterval(typer);
              finish();
            }
            return;
          }
          rendered = Math.min(full.text.length, rendered + Math.max(2, Math.ceil(full.text.length / 140)));
          const snapshot = full.text.slice(0, rendered);
          setMessages((m) => {
            if (!m[replyIndex] || m[replyIndex].role !== "assistant") return m;
            const copy = [...m];
            copy[replyIndex] = { role: "assistant", content: snapshot };
            return copy;
          });
        }, 16);
      }),
    []
  );

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    followRef.current = true; // new message — resume following the bottom
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Capture a lead if the visitor shared an email anywhere in the conversation.
    // (Skip while the structured enquiry form is active — it already saves the lead.)
    const lead = extractLead(next);
    if (lead.email && !leadCapturedRef.current && !enquiry.active) {
      leadCapturedRef.current = true;
      fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lead.name, email: lead.email, message: text }),
      })
        .then(() => {})
        .catch(() => {
          leadCapturedRef.current = false; // allow retry on next message
        });
    }
    const replyIndex = next.length; // fixed index where the assistant reply lands

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          url: typeof window !== "undefined" ? window.location.href : "",
          history: next.slice(0, -1),
          enquiry,
          stream: true,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      // ── STREAMED AI REPLY ── tokens arrive as they are generated.
      if (contentType.includes("text/plain") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const full = { text: "" };
        let finished = false;

        setMessages((m) => [...m, { role: "assistant", content: "" }]);
        setLoading(false);
        const typing = typewrite(replyIndex, full, () => finished);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            full.text += decoder.decode(value, { stream: true });
          }
        } finally {
          reader.releaseLock();
        }

        if (!full.text.trim()) {
          full.text = "Sorry, I couldn't process that. Please try again.";
        }
        finished = true;
        await typing;
        setEnquiryOptions([]);
        return;
      }

      // ── PRE-DEFINED REPLY (enquiry flow / greetings / off-topic / errors) ──
      // Typed out with the same chunked effect for a consistent feel.
      const data = await res.json();
      const action = data.action === "contact" ? "contact" : data.action === "enquiry" ? "enquiry" : "chat";
      setLastAction(action);
      setFollowUp(!!data.followUp);
      if (Array.isArray(data.options)) {
        setEnquiryOptions(data.options);
      } else {
        setEnquiryOptions([]);
      }
      if (data.enquiry && typeof data.enquiry === "object") {
        const e = data.enquiry;
        setEnquiry({ active: !!e.active, step: Number(e.step) || 0, data: e.data || {} });
      }
      const full = { text: data.reply || "Sorry, I couldn't process that. Please try again." };
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      setLoading(false);
      await typewrite(replyIndex, full, () => true);
      return;
    } catch {
      const full = { text: "Something went wrong. Please try again or contact us on WhatsApp." };
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      await typewrite(replyIndex, full, () => true);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Contextual follow-up suggestions for the latest assistant reply (or welcome
  // quick replies on the very first screen). Resets every time a new message is added.
  const suggestions = useMemo(() => {
    if (loading) return [];
    if (messages.length <= 1) return QUICK_REPLIES;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return [];
    const text = last.content.toLowerCase();
    for (const { match, chips } of REPLY_SUGGESTIONS) {
      if (match.test(text)) return chips;
    }
    const base = [...SERVICE_CATEGORIES, "Start my Enquiry"];
    if (/enquiry|form|submit|quote/i.test(text)) return base;
    return [...SERVICE_CATEGORIES.slice(0, 3), "Start my Enquiry"];
  }, [messages, loading, REPLY_SUGGESTIONS, SERVICE_CATEGORIES]);

  const ContactButtons = (
    <div className="flex flex-col gap-2 mt-2">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:brightness-110 active:scale-95 shadow-[0_6px_20px_rgba(37,211,102,0.35)]"
        style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
      >
        <MessageCircle className="w-4 h-4" fill="white" />
        Chat on WhatsApp
      </a>
      <div className="flex gap-2">
        <a
          href={`mailto:${config.email}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:bg-white/12 active:scale-95"
        >
          <Mail className="w-4 h-4 text-brand-blue-light" /> Email
        </a>
        <a
          href={`tel:${config.phoneRaw}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:bg-white/12 active:scale-95"
        >
          <Phone className="w-4 h-4 text-brand-blue-light" /> Call
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Hint bubble + launcher */}
      <div
        className="fixed right-6 z-50 flex flex-col items-end gap-3 always-dark transition-transform duration-300 will-change-transform"
        style={{ bottom: 0, transform: `translateY(-${launcherBottom}px)` }}
      >
        <AnimatePresence>
          {hint && !open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative glass-card rounded-2xl rounded-br-sm px-4 py-2.5 text-[11px] sm:text-xs font-semibold shadow-card cursor-pointer max-w-[calc(100vw-5rem)] sm:max-w-xs"
              onClick={toggle}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-blue-light" />
                {HINT_MESSAGES[hintIndex]}
              </span>
              <span className="absolute -bottom-1 right-5 w-3 h-3 bg-white/[0.06] border-r border-b border-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launcher */}
        <motion.button
          type="button"
          onClick={toggle}
          aria-label="Chat with Friday"
          aria-expanded={open}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-glow-lg cursor-pointer overflow-visible"
          style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 30px rgba(220,38,38,0.45)" }}
        >
          {/* Periodic glow pulse */}
          <AnimatePresence>
            {!open && (
              <motion.span
                key={pulse}
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 2.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-brand-blue pointer-events-none"
              />
            )}
          </AnimatePresence>
          {/* Breathing ring */}
          <span
            className="absolute inset-0 rounded-full ring-2 ring-brand-blue-light animate-pulse pointer-events-none"
            style={{ animationDuration: "3s" }}
          />

          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <X className="w-6 h-6" />
              </motion.span>
            ) : (
              <motion.span
                key="bot"
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 45, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative z-10"
              >
                <Bot className="w-7 h-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={`chat-window fixed z-[60] will-change-transform transition-[opacity,transform] duration-300 ${
              immersive
                ? isNarrow
                  ? "inset-0 h-[100dvh] p-0"
                  : "inset-0 p-4 sm:p-6 flex items-center justify-center"
                : "right-4 left-4 sm:left-auto sm:right-6 sm:w-[400px]"
            }`}
            style={immersive ? { bottom: isNarrow ? keyboardInset : 0, maxHeight: "none" } : { bottom: launcherBottom + 64, top: 80, maxHeight: `calc(100dvh - 80px - ${launcherBottom + 64}px)` }}
          >
            {/* Dimmed, blurred page backdrop visible around the chat on big screens */}
            <AnimatePresence>
              {immersive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-md gpu-layer"
                />
              )}
            </AnimatePresence>

            {/* Glow backdrop */}
            <div className={`absolute inset-0 bg-gradient-to-b from-brand-blue-light/40 via-brand-blue/20 to-transparent blur-[2px] opacity-80 ${
              fullscreen ? "rounded-3xl" : "rounded-3xl"
            }`} />

            <div className={`relative flex flex-col overflow-hidden backdrop-blur-2xl border border-white/10 shadow-card chat-window-bg ${
              isNarrow
                ? "rounded-none h-full w-full"
                : fullscreen
                  ? "rounded-3xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] md:max-h-[85vh] w-full md:w-auto md:min-w-[560px] lg:min-w-[680px]"
                  : "rounded-3xl h-full"
            }`}>
              {/* Top gradient bar */}
              <div className="h-[3px] w-full bg-gradient-brand shrink-0" />

              {/* Ambient glows */}
              <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-brand-blue/25 rounded-full blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 w-44 h-44 bg-brand-blue-dark/20 rounded-full blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-blue/10 to-transparent" />

              {/* Centered content column — keeps the chat focused in the middle on large screens */}
              <div className="relative flex flex-col flex-1 min-h-0 w-full mx-auto max-w-full md:max-w-3xl lg:max-w-4xl">

              {/* Header */}
              <div className="relative flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-4 bg-gradient-to-r from-brand-blue/20 via-transparent to-transparent border-b border-white/10 shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-brand blur-md opacity-60" />
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow ring-2 ring-white/20">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <motion.span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black"
                    animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm sm:text-[15px] leading-tight flex items-center gap-2 text-white">
                    Friday
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      Online
                    </span>
                  </p>
                  <p className="hidden sm:flex text-[11px] text-white/45 items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3 text-brand-blue-light" />
                    Digital Marketing Assistant
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearHistory}
                  aria-label="Clear chat history"
                  title="Clear history"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/12 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {!isNarrow && (
                  <button
                    type="button"
                    onClick={() => setFullscreen((f) => !f)}
                    aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/12 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                  >
                    {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Close chat"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/12 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="relative flex-1 min-h-0 flex flex-col">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto chat-scrollbar p-4 flex flex-col gap-3.5"
                >
                  <div className="pointer-events-none absolute inset-0 chat-overlay" />

                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className={`flex items-end gap-2 ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {m.role === "assistant" && <FridayAvatar />}
                      <div
                        className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[480px] lg:max-w-[520px] px-4 py-2.5 text-[14px] leading-[1.5] whitespace-pre-wrap break-words backdrop-blur-md ${
                          m.role === "user"
                            ? "bg-gradient-brand chat-user-text rounded-2xl rounded-br-sm shadow-[0_8px_24px_rgba(220,38,38,0.35)] border border-white/15"
                            : "bg-blue-500/12 border border-blue-400/25 text-white rounded-2xl rounded-bl-sm shadow-card"
                        }`}
                      >
                        {m.role === "user" && (
                          <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                        )}
                        {linkify(m.content)}
                      </div>
                      {m.role === "user" && <UserAvatar />}
                    </motion.div>
                  ))}
                  {lastAction === "contact" && !loading && (
                    <div className="flex items-end gap-2 justify-start">
                      <FridayAvatar />
                      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[480px]">{ContactButtons}</div>
                    </div>
                  )}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end gap-2"
                    >
                      <FridayAvatar />
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-blue-500/12 border border-blue-400/25 backdrop-blur-md flex items-center gap-1.5">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-brand-blue-light"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0], scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Go-to-bottom floating button — anchored to the messages area, stays at bottom even when scrolling up */}
                <AnimatePresence>
                  {showGoDown && (
                    <motion.button
                      type="button"
                      onClick={scrollToBottom}
                      aria-label="Go to latest message"
                      title="Go to latest message"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-glow-lg border border-white/20 hover:brightness-110 active:scale-90 transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Enquiry options — numbered clickable chips for the current step (service/budget) */}
              {enquiry.active && enquiryOptions.length > 0 && !loading && (
                <div className="flex flex-wrap gap-2 px-4 pb-2 pt-1 shrink-0">
                  {enquiryOptions.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => send(String(idx + 1))}
                      className="group text-[11px] px-3 py-1.5 rounded-full chat-chip border text-white/70 transition-all cursor-pointer hover:text-white hover:border-brand-blue-light/60 hover:bg-brand-blue/15 hover:shadow-glow-sm"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-white/10 group-hover:bg-brand-blue/40 text-[9px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up options after enquiry is submitted — keep the chat going or start fresh */}
              {followUp && !loading && (
                <div className="flex flex-wrap gap-2 px-4 pb-2 pt-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFollowUp(false)}
                    className="group text-[11px] px-3 py-1.5 rounded-full chat-chip border text-white/70 transition-all cursor-pointer hover:text-white hover:border-brand-blue-light/60 hover:bg-brand-blue/15 hover:shadow-glow-sm"
                  >
                    Continue chatting
                  </button>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="group text-[11px] px-3 py-1.5 rounded-full chat-chip border text-white/70 transition-all cursor-pointer hover:text-white hover:border-brand-blue-light/60 hover:bg-brand-blue/15 hover:shadow-glow-sm"
                  >
                    Start new chat
                  </button>
                </div>
              )}

              {/* Suggestion chips — quick replies on first screen, contextual follow-ups after each reply.
                  MOBILE ONLY: collapsible via chevron button + single swipeable row.
                  DESKTOP: always visible, wrapped, no toggle (original behaviour). */}
              {!enquiry.active && !followUp && suggestions.length > 0 && !loading && (
                <div className="shrink-0 px-4 pb-2 pt-1">
                  {/* Mobile-only control row */}
                  <div className="flex items-center justify-between gap-2 md:hidden">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                      Quick replies
                    </span>
                    <button
                      type="button"
                      onClick={() => setSugOpen((o) => !o)}
                      aria-label={sugOpen ? "Hide suggestions" : "Show suggestions"}
                      aria-expanded={sugOpen}
                      title={sugOpen ? "Hide suggestions" : "Show suggestions"}
                      className="flex items-center gap-1 text-[10px] font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 transition-all cursor-pointer active:scale-95"
                    >
                      {sugOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                      {sugOpen ? "Hide" : "Show"}
                    </button>
                  </div>
                  {/* Chips — swipeable row on mobile, wrapped flow on desktop */}
                  <div
                    className={`gap-2 pb-0.5 overflow-x-auto no-scrollbar md:overflow-x-visible md:flex-wrap md:mt-0 ${
                      sugOpen ? "flex mt-1.5 md:mt-0" : "hidden md:flex"
                    }`}
                  >
                    {suggestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="group shrink-0 whitespace-nowrap md:whitespace-normal md:shrink text-[11px] px-3 py-1.5 rounded-full chat-chip border text-white/70 transition-all cursor-pointer hover:text-white hover:border-brand-blue-light/60 hover:bg-brand-blue/15 hover:shadow-glow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 sm:p-3.5 border-t border-white/10 chat-surface-input shrink-0">
                <div className="relative flex items-center gap-2 rounded-full chat-field p-1.5 pl-4 transition-all focus-within:border-brand-blue-light/60 focus-within:shadow-[0_0_0_3px_rgba(220,38,38,0.12),0_4px_20px_rgba(220,38,38,0.15)]">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type your message..."
                    className="chat-input flex-1 bg-transparent text-[13.5px] text-white focus:outline-none min-w-0"
                    maxLength={1500}
                  />
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-90 transition-all cursor-pointer shadow-glow-sm"
                  >
                    {loading ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-white/25">
                  Powered by <span className="text-brand-blue-light font-medium">Nexus Digital</span> AI
                </p>
              </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}