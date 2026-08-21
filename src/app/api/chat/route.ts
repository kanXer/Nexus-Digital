import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { submitEnquiry } from "@/lib/contact";

const NIM_API_BASE = process.env.NIM_API_BASE || "https://integrate.api.nvidia.com/v1";
const NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY || process.env.NIM_API_KEY || "";
const NIM_EMBED_MODEL = process.env.NIM_EMBED_MODEL || "nvidia/nemotron-3-embed-1b";
const NIM_CHAT_MODEL = process.env.NIM_CHAT_MODEL || "meta/llama-3.1-8b-instruct";

const DEFAULT_SITE = process.env.NEXT_PUBLIC_AGENCY_WEBSITE || "https://nexusdigitalmarketing.shop";

type HistoryMsg = { role: "user" | "assistant"; content: string };

type EnquiryState = {
  active: boolean;
  step: number;
  data: Record<string, string>;
};

const SERVICE_OPTIONS = [
  "Social Media Marketing", "Meta Ads", "Google Ads", "SEO & Local SEO",
  "Website & Landing Pages", "WhatsApp Automation", "Email Marketing", "Analytics & Reporting", "Full-Stack Marketing",
];

// Labels used on the Services page so category queries map to the same options.
const SERVICE_ALIASES: { keys: RegExp; value: string }[] = [
  { keys: /social media marketing|paid marketing|social media/i, value: "Social Media Marketing" },
  { keys: /meta ads|facebook ad|meta advertising/i, value: "Meta Ads" },
  { keys: /google ads|ppc|google ad/i, value: "Google Ads" },
  { keys: /seo|search engine optimisation|search engine optimization|local seo|organic|search engine/i, value: "SEO & Local SEO" },
  { keys: /website|landing page|web dev|web design|websites? & (automation|development)/i, value: "Website & Landing Pages" },
  { keys: /whatsapp automation|whatsapp/i, value: "WhatsApp Automation" },
  { keys: /email marketing|email/i, value: "Email Marketing" },
  { keys: /analytics|reporting|reports|report/i, value: "Analytics & Reporting" },
  { keys: /paid marketing|paid ads|advertising|ads &/i, value: "Full-Stack Marketing" },
];

const BUDGET_OPTIONS = [
  "INR 5,000 – 10,000", "INR 10,000 – 25,000", "INR 25,000 – 50,000",
  "INR 50,000 – 1,00,000", "INR 1,00,000+",
];

const CONTACT = {
  whatsappRaw: (process.env.NEXT_PUBLIC_AGENCY_WHATSAPP || "919696262007").replace(/[^0-9]/g, ""),
  phone: process.env.NEXT_PUBLIC_AGENCY_PHONE || "+91-9696262007",
  email: process.env.NEXT_PUBLIC_AGENCY_EMAIL || "nexusdigital.gkp@gmail.com",
};

// Config-driven enquiry steps. Each step asks ONE question and expects ONE answer.
// If `options` is present, the chat shows numbered clickable chips — the user can
// tap one OR type the number / the option text.
const ENQUIRY_STEPS: { key: string; label: string; ask: string; optional?: boolean; options?: string[] }[] = [
  { key: "name", label: "Full Name", ask: "Let me fill the enquiry for you! First, what's your full name?" },
  { key: "email", label: "Email Address", ask: "Got it, thanks! What's your email address?" },
  { key: "phone", label: "Phone / WhatsApp", ask: "Perfect. What's your phone or WhatsApp number?" },
  { key: "business", label: "Business Name", ask: "Nice! What's your business name? (type 'skip' if not started yet)" },
  {
    key: "service",
    label: "Service Required",
    options: SERVICE_OPTIONS,
    ask: `Great! Which service do you need?\n\n${SERVICE_OPTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nJust type the number or service name.`,
  },
  {
    key: "budget",
    label: "Monthly Budget Range",
    options: BUDGET_OPTIONS,
    ask: "What's your monthly budget range? (choose one or type 'skip')\n\n" + BUDGET_OPTIONS.map((b, i) => `${i + 1}. ${b}`).join("\n"),
    optional: true,
  },
  { key: "message", label: "Requirements", ask: "And finally — tell me a bit about your business, goals, and what you need help with." },
];

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function scoreKeyword(text: string): number {
  const lower = text.toLowerCase();
  const words = [
    "seo", "google ads", "ppc", "meta ads", "social media", "instagram", "facebook",
    "website", "landing page", "whatsapp", "email marketing", "analytics", "branding",
    "marketing", "advertis", "campaign", "lead", "growth", "rank", "traffic", "reels",
    "content", "price", "pricing", "cost", "package", "service", "strategy", "audit",
    "hello", "hi", "hey", "namaste", "help", "contact", "enquir", "hire", "book", "quote",
  ];
  return words.filter((w) => lower.includes(w)).length;
}

const OFF_TOPIC_PATTERNS = [
  /\bjoke\b/i, /\bweather\b/i, /\broast\b/i, /\bstory\b/i, /\bpoem\b/i,
  /\bmovie(s)?\b/i, /\bgame(s)?\b/i, /\bsong(s)?\b/i, /\bread(file|my code|this file)\b/i,
  /\bwhat is your (name|password|secret)\b/i, /\bhack\b/i, /\bsing\b/i, /\bdraw\b/i,
  /\bmath(s)?\b/i, /\bscience\b/i, /\bhistory of\b/i, /\bnet worth\b/i, /\bcrush\b/i,
  /\bdate me\b/i, /\bmarry\b/i, /\btell me about yourself\b/i, /\blove\b/i, /\bhoroscope\b/i,
];

function isOffTopic(text: string): boolean {
  if (scoreKeyword(text) >= 2) return false;
  return OFF_TOPIC_PATTERNS.some((p) => p.test(text));
}

function normalizeService(text: string): string {
  const lower = text.toLowerCase();
  for (const s of SERVICE_OPTIONS) {
    const key = s.toLowerCase();
    if (key.split(" ").every((w) => w.length > 2 && lower.includes(w))) return s;
  }
  for (const alias of SERVICE_ALIASES) {
    if (alias.keys.test(lower)) return alias.value;
  }
  return "";
}

// Persona is static — read once per server instance, then served from memory.
let personaCache: string | null = null;
async function loadPersona(): Promise<string> {
  if (personaCache) return personaCache;
  try {
    const file = path.join(process.cwd(), "src", "lib", "chatbot", "persona.md");
    personaCache = await readFile(file, "utf8");
  } catch {
    personaCache = "You are Friday, the AI website assistant for Nexus Digital, a digital marketing agency in Gorakhpur, India. You are warm, concise and helpful. Answer using the website content provided when available. Your name is Friday — always introduce yourself as Friday when asked.";
  }
  return personaCache;
}

// All key site pages the chatbot should crawl so it can answer questions
// about pricing, services, case-studies, etc. regardless of which page the
// visitor is currently on.
const SITE_PAGES = [
  "",
  "/services",
  "/pricing",
  "/about",
  "/case-studies",
  "/testimonials",
  "/faq",
  "/contact",
  "/enquiry",
];

function siteUrl(path: string): string {
  return (DEFAULT_SITE.replace(/\/$/, "")) + path;
}

async function readWebpage(url: string): Promise<string> {
  const target = /^https?:\/\//i.test(url) ? url : DEFAULT_SITE;
  try {
    const res = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NexusAI-Bot/1.0)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    return htmlToText(html);
  } catch {
    return "";
  }
}

// ── SITE CONTEXT CACHE (biggest latency win) ──
// Site text, its chunks AND their embeddings are computed ONCE and reused for
// every message. Per-request cost drops to a single small embedding call for
// just the user's message. Stale cache is served instantly while a background
// refresh runs — visitors never wait on a crawl after the first request.
type SiteContext = { chunks: string[]; embeddings: number[][] | null };

let siteCache: { ts: number; ctx: SiteContext } | null = null;
const SITE_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

async function buildSiteContext(): Promise<SiteContext> {
  // Crawl ALL key pages in parallel.
  const results = await Promise.all(
    SITE_PAGES.map(async (p) => {
      const text = await readWebpage(siteUrl(p));
      return text ? `[PAGE: ${p || "/"}]\n${text}` : "";
    })
  );
  const combined = results.filter(Boolean).join("\n\n");
  const chunks = chunkText(combined, 2000);
  // Batch-embed every chunk once (single API call).
  const embeddings = await embed(chunks);
  return { chunks, embeddings };
}

async function getSiteContext(): Promise<SiteContext> {
  if (siteCache) {
    if (Date.now() - siteCache.ts >= SITE_CACHE_TTL) {
      buildSiteContext()
        .then((ctx) => {
          siteCache = { ts: Date.now(), ctx };
        })
        .catch(() => {});
    }
    return siteCache.ctx;
  }
  const ctx = await buildSiteContext();
  siteCache = { ts: Date.now(), ctx };
  return ctx;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string, size = 2000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    const piece = text.slice(i, i + size).trim();
    if (piece) chunks.push(piece);
  }
  return chunks.slice(0, 20);
}

async function embed(texts: string[]): Promise<number[][] | null> {
  if (!NIM_API_KEY || texts.length === 0) return null;
  try {
    const res = await fetch(`${NIM_API_BASE}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NIM_API_KEY}`,
      },
      body: JSON.stringify({ model: NIM_EMBED_MODEL, input: texts }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const embeddings = Array.isArray(data.data) ? data.data.map((d: { embedding: number[] }) => d.embedding) : null;
    return Array.isArray(embeddings) && embeddings.length > 0 ? embeddings : null;
  } catch {
    return null;
  }
}

// Cheap retrieval fallback when embeddings are unavailable — keyword overlap.
function keywordScore(chunk: string, message: string): number {
  const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return 0;
  const lower = chunk.toLowerCase();
  return words.reduce((s, w) => s + (lower.includes(w) ? 1 : 0), 0);
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function chatCompletion(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${NIM_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NIM_API_KEY}`,
    },
    body: JSON.stringify({
      model: NIM_CHAT_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error(`NIM chat error ${res.status}`);
  const data = await res.json();
  const choice = data?.choices?.[0]?.message ?? {};
  // Reasoning models return chain-of-thought in reasoning_content / <think> tags.
  let raw: string = typeof choice.content === "string" ? choice.content.trim() : "";
  if (!raw && typeof choice.reasoning_content === "string") {
    // Some models put ONLY reasoning when cut short — extract answer from it.
    raw = stripThinking(choice.reasoning_content);
  }
  const processed = stripThinking(raw);
  // Never prefix the reply with a speaker label like "Friday:".
  return processed.replace(/^\s*(?:friday|assistant|ai|bot|you|visitor)\b\s*:\s*/i, "").trim();
}

// Removes <think> blocks, "thinking process" preambles and diagnostic steps,
// keeping only the final plain-text answer.
function stripThinking(raw: string): string {
  let t = (raw || "").trim();
  if (!t) return "";

  // Drop every complete <think>…</think> block (multi-line safe).
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // Drop an unterminated leading <think> block (stream cut mid-thought).
  if (/^\s*<think>/i.test(t)) {
    t = t.replace(/^\s*<think>[\s\S]*/i, (m) => {
      const close = m.indexOf("</think>");
      return close === -1 ? "" : m.slice(close + 8);
    });
  }
  t = t.trim();
  if (!t) return "";

  // Models that produce a "thinking process" often end with the real answer
  // after a labelled section — grab the labelled answer if present.
  for (const marker of ["### Final Answer", "Final Answer:", "Answer:", "# Answer", "**Answer**", "**Response:**"]) {
    const idx = t.indexOf(marker);
    if (idx !== -1) {
      const answer = t.slice(idx + marker.length).trim();
      if (answer) return answer;
    }
  }

  // Otherwise drop the leading "Here's a thinking process:" preamble and any
  // diagnostic reasoning chunks, keeping only the trailing plain-text answer.
  let body = t;
  body = body.replace(/^Here's a thinking process:\s*/i, "");
  body = body.replace(/^thinking process:\s*/i, "");
  body = body.replace(/^{?reasoning effort: [^}]+}?\s*/i, "");

  const chunks = body.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  for (let i = chunks.length - 1; i >= 0; i--) {
    const last = chunks[i];
    if (!last) continue;
    // Skip diagnostic steps (numbered / bulleted headings and their tails).
    if (/^\s*(\d+[.)]|\d+\.\s|[-•]|#)/.test(last)) continue;
    // Skip fragment-like one-liners that are clearly not an answer.
    if (last.length < 3) continue;
    return last;
  }
  return "";
}

// Streams the AI reply as plain-text chunks so the chat can render tokens as
// they arrive. <think> blocks are filtered out on the fly across boundaries.
async function chatCompletionStream(
  messages: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const upstream = await fetch(`${NIM_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NIM_API_KEY}`,
    },
    body: JSON.stringify({
      model: NIM_CHAT_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
      stream: true,
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!upstream.ok || !upstream.body) throw new Error(`NIM chat error ${upstream.status}`);

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let sseBuffer = "";
  let rawAll = ""; // full upstream body — used if upstream ignores stream:true
  let insideThink = false;
  let tagTail = ""; // holds possible partial "<think>" prefix across chunks
  let emitted = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const pushOut = (text: string) => {
        if (!text) return;
        emitted = true;
        controller.enqueue(encoder.encode(text));
      };
      const processDelta = (delta: string): string => {
        tagTail += delta;
        let out = "";
        while (tagTail.length > 0) {
          if (insideThink) {
            const closeIdx = tagTail.indexOf("</think>");
            if (closeIdx !== -1) {
              insideThink = false;
              tagTail = tagTail.slice(closeIdx + 8);
            } else {
              // Discard buffered thought; keep tail in case "</think>" spans boundary.
              tagTail = tagTail.slice(-8);
              break;
            }
          } else {
            const openIdx = tagTail.indexOf("<think>");
            if (openIdx !== -1) {
              out += tagTail.slice(0, openIdx);
              insideThink = true;
              tagTail = tagTail.slice(openIdx + 7);
            } else {
              // Hold back a trailing partial "<think…" prefix (max 7 chars).
              const lt = tagTail.lastIndexOf("<");
              if (lt !== -1 && tagTail.length - lt <= 7 && "<think>".startsWith(tagTail.slice(lt))) {
                out += tagTail.slice(0, lt);
                tagTail = tagTail.slice(lt);
              } else {
                out += tagTail;
                tagTail = "";
              }
              break;
            }
          }
        }
        return out;
      };
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          sseBuffer += chunkStr;
          rawAll += chunkStr;
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string = json?.choices?.[0]?.delta?.content ?? "";
              if (delta) pushOut(processDelta(delta));
            } catch {
              /* ignore malformed SSE lines */
            }
          }
        }
        // Flush any held-back text at stream end.
        if (!insideThink && tagTail) pushOut(tagTail);
        if (!emitted) {
          // Upstream ignored stream:true and returned a normal JSON body —
          // extract the reply from it instead of showing an error.
          try {
            const j = JSON.parse(rawAll);
            const c = j?.choices?.[0]?.message?.content;
            if (typeof c === "string" && c.trim()) pushOut(stripThinking(c).trim());
          } catch {
            /* not JSON either */
          }
        }
        if (!emitted) pushOut("Sorry, I couldn't process that. Please try again.");
      } catch {
        if (!emitted) pushOut("Something went wrong. Please try again or contact us on WhatsApp.");
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

function fallbackReply(): string {
  return `Namaste! 🙏 I'm the Nexus Digital assistant. I couldn't reach the AI models right now, but I can still help you. Check our Services, Pricing or Contact pages, or message us on WhatsApp at ${CONTACT.phone} for a free consultation.`;
}

function buildContactBlock(reason: string): { reply: string; action: "contact" } {
  return {
    reply: `${reason}\n\nYou can reach our team directly:\n• WhatsApp: ${CONTACT.phone}\n• Email: ${CONTACT.email}\n\nWe usually reply within 24 hours. 🙂`,
    action: "contact",
  };
}

function validateStep(step: number, text: string): string | null {
  switch (step) {
    case 0: // name
      return text.trim().length >= 2 ? null : "Please enter your full name.";
    case 1: // email
      return isEmail(text) ? null : "That doesn't look like a valid email. Please enter your email address (e.g. name@example.com).";
    case 2: // phone
      return normalizePhone(text).length >= 10 ? null : "That phone number looks too short. Please enter a valid phone/WhatsApp number with country code.";
    case 3: // business — optional
      return null;
    case 4: // service — accepts a number too
      if (/^\d+$/.test(text)) {
        const n = parseInt(text, 10);
        return n >= 1 && n <= SERVICE_OPTIONS.length ? null : `That number isn't in the list. Please pick a number from 1 to ${SERVICE_OPTIONS.length}:`;
      }
      return normalizeService(text) ? null : `I didn't catch that. Please pick a service from this list:\n\n${SERVICE_OPTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nJust type the number or service name.`;
    case 5: // budget — optional, accepts a number too
      if (/^\d+$/.test(text)) {
        const n = parseInt(text, 10);
        return n >= 1 && n <= BUDGET_OPTIONS.length ? null : `That number isn't in the list. Please pick a number from 1 to ${BUDGET_OPTIONS.length}:`;
      }
      return null;
    case 6: // message
      return text.trim().length >= 10 ? null : "Please tell me a little more — at least a sentence about your business and what you need.";
    default:
      return null;
  }
}

function nextEnquiryStep(state: EnquiryState, step: number): { reply: string; enquiry: EnquiryState; options?: string[] } {
  const next: EnquiryState = { ...state, active: true, step };
  const s = ENQUIRY_STEPS[step];
  const reply = s.optional
    ? `${s.ask}\n\n(You can type "skip" if you'd like to move on.)`
    : s.ask;
  return { reply, enquiry: next, options: s.options };
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (isRateLimited(`chat:${ip}`, 30)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1500) : "";
    const url = typeof body?.url === "string" ? body.url : DEFAULT_SITE;
    const history: HistoryMsg[] = Array.isArray(body?.history)
      ? body.history.filter((m: HistoryMsg) => m && typeof m.content === "string").slice(-8)
      : [];
    const enquiryIn: EnquiryState = body?.enquiry && typeof body.enquiry === "object"
      ? { active: !!body.enquiry.active, step: Number(body.enquiry.step) || 0, data: body.enquiry.data || {} }
      : { active: false, step: 0, data: {} };

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // ── INSTANT GREETINGS (zero latency — skips crawl, RAG and model call) ──
    if (/^(hi+|hello+|hey+|namaste|namaskar|good\s*(morning|afternoon|evening)|thanks?|thank\s*you|thx|ty|ok(ay)?|great|nice|awesome|cool)[\s!.,]*$/i.test(message)) {
      return NextResponse.json({
        reply: "Namaste! 👋 I'm Friday. How can I help you grow today — SEO, Google/Meta Ads, Social Media, or a new website?",
        action: "chat",
      });
    }

    // ── ENQUIRY FLOW ──
    if (enquiryIn.active) {
      const step = enquiryIn.step;

      if (step >= ENQUIRY_STEPS.length) {
        // All data collected — submit the enquiry through the shared pipeline
        // (Telegram → MongoDB → admin email → customer ack email).
        let submitError = "";
        try {
          await submitEnquiry({
            name: enquiryIn.data.name || "",
            email: enquiryIn.data.email || "",
            phone: enquiryIn.data.phone || "",
            business: enquiryIn.data.business || undefined,
            service: enquiryIn.data.service || "",
            budget: enquiryIn.data.budget || undefined,
            message: enquiryIn.data.message || undefined,
          });
        } catch (err) {
          console.error("Enquiry submit failed:", err);
          submitError = " (note: our form had a hiccup, but don't worry — just message us directly below)";
        }
        return NextResponse.json({
          reply: `Thank you ${enquiryIn.data.name || "friend"}! Your enquiry has been received, and our team will get back to you within 24 hours${submitError}.\n\nYou can also reach us right now:\n• WhatsApp: ${CONTACT.phone}\n• Email: ${CONTACT.email} 🙂`,
          action: "contact",
          enquiry: { active: false, step: 0, data: {} },
        });
      }

      // Allow user to back out of the form mid-way.
      if (/cancel|stop|nevermind|never mind|skip the (form|enquiry)/i.test(message)) {
        return NextResponse.json({
          reply: "No problem, I'll stop the enquiry. Is there anything else about our services I can help you with? 🙂",
          action: "chat",
          enquiry: { active: false, step: 0, data: {} },
        });
      }

      const stepDef = ENQUIRY_STEPS[step];
      let answer = message;

      // Handle "skip" for optional fields.
      if (stepDef.optional && /^\s*skip\s*$/i.test(message)) {
        answer = "Skipped";
      }

      const error = validateStep(step, answer);
      if (error) {
        return NextResponse.json({ reply: error, action: "enquiry", enquiry: enquiryIn, options: stepDef.options });
      }

      // Normalize numbered or typed answers to the canonical option.
      if (step === 4 && /^\d+$/.test(answer)) {
        answer = SERVICE_OPTIONS[parseInt(answer, 10) - 1] ?? answer;
      } else if (step === 4) {
        answer = normalizeService(answer) || answer;
      }
      if (step === 5 && /^\d+$/.test(answer)) {
        answer = BUDGET_OPTIONS[parseInt(answer, 10) - 1] ?? answer;
      }

      const data = { ...enquiryIn.data, [stepDef.key]: answer };

      // Required fields check — if a required field is still empty, re-ask.
      if (!stepDef.optional && (!answer.trim() || (step === 2 && normalizePhone(answer).length < 10))) {
        return NextResponse.json({ reply: stepDef.ask, action: "enquiry", enquiry: enquiryIn, options: stepDef.options });
      }

      // Last step answered — submit the enquiry NOW, don't advance past the list.
      if (step + 1 >= ENQUIRY_STEPS.length) {
        let submitError = "";
        try {
          await submitEnquiry({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            business: data.business || undefined,
            service: data.service || "",
            budget: data.budget || undefined,
            message: data.message || undefined,
          });
        } catch (err) {
          console.error("Enquiry submit failed:", err);
          submitError = " (note: our form had a hiccup, but don't worry — just message us directly below)";
        }
        return NextResponse.json({
          reply: `Thank you ${data.name || "friend"}! Your enquiry has been received, and our team will get back to you within 24 hours${submitError}.\n\nYou can also reach us right now:\n• WhatsApp: ${CONTACT.phone}\n• Email: ${CONTACT.email} 🙂`,
          action: "contact",
          followUp: true,
          enquiry: { active: false, step: 0, data: {} },
        });
      }

      return NextResponse.json(nextEnquiryStep({ active: true, step: step + 1, data }, step + 1));
    }

    // ── START ENQUIRY (detect intent) ──
    const enquiryIntent =
      /enquiry|send enquiry|want to (start|work|hire|book|grow)|get a quote|quote for|pricing for|price for|consultation|book a|contact us|connect(i ng)? (with|to)? (a|an|the)? ?(specialist|expert|team|agent|consultant|sales)|talk to (a team|an expert|someone|a human|a specialist)|start a project|hire you/i.test(message);

    if (enquiryIntent && !isOffTopic(message)) {
      return NextResponse.json(nextEnquiryStep({ active: true, step: 0, data: {} }, 0));
    }

    // ── CONSENT TO ENQUIRY OFFER ──
    // If the AI just offered to submit the enquiry form and the visitor agrees
    // ("yes" / "ok" / "haan" / "please" / "go ahead"), actually START the form.
    // Without this, the AI would keep pretending to submit in plain text and the
    // real enquiry never gets recorded.
    const lastAssistant = [...history].reverse().find((h) => h.role === "assistant")?.content || "";
    const offeredEnquiry = /can i submit (your )?enquiry|submit your enquiry|fill an enquiry|start (your|the) enquiry/i.test(lastAssistant);
    const consent = /^(yes|yes please|yep|yup|yeah|ok|okay|sure|sure thing|haan|ha ji|haan ji|please|go ahead|do it|sure, go|of course|yes, fill it|submit (it|the form|it please)|please submit)\b/i.test(message.trim());
    if (offeredEnquiry && consent) {
      return NextResponse.json(nextEnquiryStep({ active: true, step: 0, data: {} }, 0));
    }

    // ── OUT OF SCOPE / OFF TOPIC ──
    if (isOffTopic(message)) {
      return NextResponse.json(buildContactBlock("That's a bit outside what I can help with — I'm here for your marketing & business questions with Nexus Digital."));
    }

    // ── NORMAL QUESTION ANSWERING (RAG + reply model) ──
    const persona = await loadPersona();

    // Cached chunks + precomputed embeddings — per-message cost is ONE small
    // embedding call for the user's message only (crawl happens once, then
    // stale-while-revalidate in background).
    const { chunks, embeddings } = await getSiteContext();
    let context = "";
    if (chunks.length > 0) {
      let scored: { chunk: string; score: number }[];
      const qEmb = await embed([message]);
      if (qEmb && embeddings && embeddings.length === chunks.length) {
        const q = qEmb[0];
        scored = chunks
          .map((chunk, i) => ({ chunk, score: cosineSim(embeddings[i], q) }))
          .sort((a, b) => b.score - a.score);
      } else {
        // Embedding unavailable — cheap keyword retrieval instead.
        scored = chunks.map((chunk) => ({ chunk, score: keywordScore(chunk, message) }));
      }
      // Top 5 relevant slices, trimmed — smaller prompt = faster first token.
      context = scored
        .slice(0, 5)
        .map((s) => s.chunk.slice(0, 1200))
        .join("\n\n");
    }

    const siteInfo = [
      "Website: " + (process.env.NEXT_PUBLIC_AGENCY_WEBSITE || DEFAULT_SITE),
      "Phone/WhatsApp: " + CONTACT.phone,
      "Email: " + CONTACT.email,
    ].join("\n");

    const systemPrompt = `${persona}

Use the website content below as your primary source of truth when it helps answer the visitor's question.

## Conversation so far (context)
${history.length > 0 ? history.map((h) => `${h.role === "user" ? "Visitor:" : "You:"} ${h.content}`).join("\n") : "(no prior messages — this is the first question)"}
Stay on this exact topic in your reply. If the visitor's new message continues the same topic, answer as a natural follow-up — do not restart the topic or give a generic reply.

## Hard constraints (override everything else)
1. Reply ONLY to what was asked. Match the question's scope — short question = short answer (1-3 sentences). Never dump extra services, pricing, or the whole catalog unless asked.
2. Business only: answer solely about Nexus Digital's services, pricing, process and marketing. Never chat about non-business topics; politely steer back.
3. Keep every reply under ~40 words unless the visitor asks for a detailed breakdown/quote.
4. At most ONE call-to-action per reply, and only when relevant.
5. The ONLY call-to-action you may use is offering the enquiry form: "Can I submit your enquiry for you?" (inside the chat — never push "connect with specialist", "talk to a team", or external contact links to the visitor).
6. Never say "connect with a specialist" or "talk to our team". Every offer to move forward MUST be the in-chat enquiry form.
7. Always keep the chat flowing toward help: after answering ANY question, gently steer toward a useful next step — a follow-up question, a relevant service, or the enquiry form. Even casual "hi" or small talk must end with a marketing-relevant question or the enquiry offer.
8. If the visitor mentions budget, a service, or a project — ask: "Can I submit your enquiry for you?" and wait for their yes/no. Do not keep repeating the same offer if they decline — switch to answering their questions and let them lead.

## Site Info
${siteInfo}

## Page Content (${url})
${context || "(no page content available)"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    // Streamed mode — pipe AI tokens to the client as they arrive so replies
    // feel instant. Enquiry/off-topic paths above still return JSON.
    if (body?.stream === true && NIM_API_KEY) {
      try {
        const stream = await chatCompletionStream(messages);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
          },
        });
      } catch (err) {
        console.error("Chat stream failed:", err);
        return NextResponse.json({ reply: fallbackReply(), action: "chat" });
      }
    }

    let reply = "";
    if (NIM_API_KEY) {
      try {
        reply = await chatCompletion(messages);
      } catch (err) {
        console.error("Chat reply failed:", err);
      }
    }

    if (!reply) reply = fallbackReply();

    return NextResponse.json({ reply, action: "chat" });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ reply: fallbackReply(), action: "chat" });
  }
}