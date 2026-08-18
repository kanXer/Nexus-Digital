import { Metadata } from "next";
import { config } from "@/lib/config";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy of ${config.name} — how we collect, use, and protect your data.`,
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <AnimatedTitle as="h1" title="Privacy Policy" className="text-4xl font-black text-white mb-2" />
          <p className="text-white/40 text-sm mb-8">Last updated: January 2025</p>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/65">
            <p>{config.name} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
            <h2 className="text-white font-bold text-lg mt-8">Information We Collect</h2>
            <p>We may collect personal information that you voluntarily provide when you fill out a contact form, subscribe to our newsletter, or book a consultation. This may include your name, email address, phone number, and business details.</p>
            <h2 className="text-white font-bold text-lg">How We Use Your Information</h2>
            <p>We use the information we collect to: respond to your inquiries, provide our services, send marketing communications (with your consent), improve our website and services, and comply with legal obligations.</p>
            <h2 className="text-white font-bold text-lg">Data Protection</h2>
            <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure. We retain your data only as long as necessary for the purposes outlined in this policy.</p>
            <h2 className="text-white font-bold text-lg">Third-Party Services</h2>
            <p>We may use third-party services such as Google Analytics, Meta Pixel, and email marketing platforms. These services have their own privacy policies governing data use.</p>
            <h2 className="text-white font-bold text-lg">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may opt out of marketing communications at any time. Contact us at {config.email} for any privacy-related requests.</p>
            <h2 className="text-white font-bold text-lg">Contact</h2>
            <p>If you have questions about this Privacy Policy, please contact us at {config.email}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
