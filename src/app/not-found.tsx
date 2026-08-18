"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 grid-dots opacity-20 pointer-events-none" />
      <div className="relative z-10 text-center max-w-lg">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <span className="text-8xl font-black gradient-text block mb-4">404</span>
        </motion.div>
        <AnimatedTitle
          as="h1"
          title="Page Not Found"
          className="text-3xl font-bold text-white mb-3"
          initialDelay={0.15}
        />
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="text-white/50 mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3"><Home className="w-4 h-4" /> Back to Home</Link>
          <button onClick={() => window.history.back()} className="btn-secondary px-6 py-3"><ArrowLeft className="w-4 h-4" /> Go Back</button>
        </motion.div>
      </div>
    </div>
  );
}
