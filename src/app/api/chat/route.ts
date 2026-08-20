import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { submitEnquiry } from "@/lib/contact";

const NIM_API_BASE = process.env.NIM_API_BASE || "https://integrate.api.nvidia.com/v1";
const NIM_API_KEY = process.env.NVIDIA_NIM_API_KEY || process.env.NIM_API_KEY || "";
const NIM_EMBED_MODEL = process.env.NIM_EMBED_MODEL || "nvidia/nemotron-3-embed-1b";
const NIM_CHAT_MODEL = process.env.NIM_CHAT_MODEL || "nvidia/glm-5.2";

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

async function loadPersona(): Promise<string> {
  try {
    const file = path.join(process.cwd(), "src", "lib", "chatbot", "persona.md");
    return await readFile(file, "utf8");
  } catch {
    return "You are Friday, the AI website assistant for Nexus Digital, a digital marketing agency in Gorakhpur, India. You are warm, concise and helpful. Answer using the website content provided when available. Your name is Friday — always introduce yourself as Friday when asked.";
  }
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
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    return htmlToText(html);
  } catch {
    return "";
  }
}

// In-memory cache of the combined site text so we don't crawl all 9 pages on
// every single chat message. Refreshed every 30 minutes.
let siteCache: { text: string; ts: number } | null = null;
const SITE_CACHE_TTL = 30 * 60 * 1000;

// Fetch all key pages concurrently and combine their text. Falls back to
// reading just the current page if the live site is unreachable.
async function readFullSite(currentUrl: string): Promise<string> {
  if (siteCache && Date.now() - siteCache.ts < SITE_CACHE_TTL) {
    // Append the current page too (cheap — single fetch) in case it's unique.
    let combined = siteCache.text;
    if (currentUrl && !siteCache.text.includes(`[PAGE: ${currentUrl}]`)) {
      const cur = await readWebpage(currentUrl);
      if (cur) combined += `\n\n[PAGE: ${currentUrl}]\n${cur}`;
    }
    return combined;
  }

  // Crawl ALL key pages in parallel.
  const results = await Promise.all(
    SITE_PAGES.map(async (p) => {
      const text = await readWebpage(siteUrl(p));
      return text ? `[PAGE: ${p || "/"}]\n${text}` : "";
    })
  );
  let combined = results.filter(Boolean).join("\n\n");

  // Also include the current page (might differ from the canonical site
  // during local dev or if the visitor is on a unique URL).
  if (currentUrl && !results.some((r) => r.includes(currentUrl))) {
    const cur = await readWebpage(currentUrl);
    if (cur) combined += `\n\n[PAGE: ${currentUrl}]\n${cur}`;
  }

  siteCache = { text: combined, ts: Date.now() };
  return combined;
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
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const embeddings = Array.isArray(data.data) ? data.data.map((d: { embedding: number[] }) => d.embedding) : null;
    return Array.isArray(embeddings) && embeddings.length > 0 ? embeddings : null;
  } catch {
    return null;
  }
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
      max_tokens: 4096,
      reasoning_effort: "low",
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!res.ok) throw new Error(`NIM chat error ${res.status}`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content?.trim() || "";
  // Reasoning models sometimes dump their chain-of-thought into `content`
  // when the run gets cut short. Strip any leading thinking block.
  const processed = /here's a thinking process|thinking process:|here's how i('|’)?ll|let me think|reasoning:/i.test(raw.slice(0, 200))
    ? stripThinking(raw)
    : raw;
  // Never prefix the reply with a speaker label like "Friday:".
  return processed.replace(/^\s*(?:friday|assistant|ai|bot|you|visitor)\b\s*:\s*/i, "").trim();
}

function stripThinking(raw: string): string {
  const t = raw.trim();

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

    // Crawl ALL key site pages (home, services, pricing, about, etc.) so the
    // AI can answer questions about pricing/services even if the visitor is
    // currently on a different page.
    const pageText = await readFullSite(url);
    const chunks = chunkText(pageText || "", 2500);
    let context = "";
    if (chunks.length > 0) {
      const embeddings = await embed([...chunks, message]);
      if (embeddings && embeddings.length === chunks.length + 1) {
        const questionEmbed = embeddings[embeddings.length - 1];
        const scored = chunks
          .map((chunk, i) => ({ chunk, score: cosineSim(embeddings[i], questionEmbed) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);
        context = scored.map((s) => s.chunk).join("\n\n");
      } else {
        context = chunks.slice(0, 8).join("\n\n");
      }
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