"use client";

/**
 * Lightweight, dependency-free conversion event tracking for Nexus Digital.
 *
 * Integrates with the existing Google Analytics (GA4) gtag integration already
 * loaded in the root layout. Fires standard "track_event" conversions that can
 * be mapped to goals in GA4. No-op gracefully when gtag / Analytics is absent,
 * so it never blocks rendering or throws in any environment.
 *
 * Event taxonomy (see prompt Phase 19):
 *   page_view, hero_cta_click, whatsapp_click, phone_click,
 *   lead_form_start, lead_form_submit, growth_audit_start, growth_audit_complete,
 *   pricing_view, pricing_cta_click, service_cta_click, case_study_view
 */

type EventName =
  | "page_view"
  | "hero_cta_click"
  | "whatsapp_click"
  | "phone_click"
  | "lead_form_start"
  | "lead_form_submit"
  | "growth_audit_start"
  | "growth_audit_complete"
  | "pricing_view"
  | "pricing_cta_click"
  | "service_cta_click"
  | "case_study_view"
  | "service_quiz_complete"
  | "lead_calculator_submit"
  | "newsletter_subscribe"
  | "lead_magnet_download"
  | "chat_initiated"
  | "purchase";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 conversion event. Safe to call from anywhere on the client.
 * Falls back to console.debug in development when gtag is unavailable.
 */
export function trackEvent(name: EventName, params: EventParams = {}): void {
  try {
    if (typeof window === "undefined") return;
    const gtag = window.gtag;
    if (typeof gtag === "function") {
      gtag("event", name, params);
    }
  } catch {
    // Analytics must never break the UX.
  }
}

/** Builds the standard wa.me link used across the site. */
export function waLink(message: string): string {
  const number =
    process.env.NEXT_PUBLIC_AGENCY_WHATSAPP || "91XXXXXXXXXX";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Prebuilt WhatsApp messages to keep CTAs consistent. */
export const WHATSAPP_DEFAULT = "Hi! I'd like to learn more about your digital marketing services.";
export const WHATSAPP_AUDIT = "Hi! I'd like a free digital growth audit for my business.";
