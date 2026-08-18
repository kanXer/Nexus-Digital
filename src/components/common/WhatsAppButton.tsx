"use client";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { config } from "@/lib/config";

const WHATSAPP_NUMBER = config.whatsapp;
const WHATSAPP_MESSAGE = "Hi! I'd like to learn more about your digital marketing services.";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="hidden lg:flex fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full items-center justify-center text-white shadow-[0_4px_20px_rgba(37,211,102,0.5)] transition-shadow hover:shadow-[0_8px_30px_rgba(37,211,102,0.7)]"
      style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <MessageCircle className="w-7 h-7 relative z-10" fill="white" />
    </motion.a>
  );
}
