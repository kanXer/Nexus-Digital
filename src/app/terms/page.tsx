import { Metadata } from "next";
import { config } from "@/lib/config";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using ${config.name}'s services and website.`,
};

export default function Terms() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <AnimatedTitle as="h1" title="Terms of Service" className="text-4xl font-black text-white mb-2" />
          <p className="text-white/40 text-sm mb-8">Last updated: January 2025</p>
          <div className="space-y-6 text-white/65 text-sm leading-relaxed">
            <p>By accessing or using the {config.name} website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            <h2 className="text-white font-bold text-lg mt-8">Services</h2>
            <p>{config.name} provides digital marketing services including but not limited to social media management, paid advertising, SEO, web development, and marketing automation. The specific scope of services will be outlined in your service agreement.</p>
            <h2 className="text-white font-bold text-lg">Payment Terms</h2>
            <p>Fees for services are as outlined in your chosen plan or custom quote. Payments are due on the agreed schedule. Late payments may result in service suspension. All fees are exclusive of applicable taxes.</p>
            <h2 className="text-white font-bold text-lg">Client Responsibilities</h2>
            <p>You agree to provide timely access to necessary accounts, assets, and information required for us to deliver our services. You are responsible for the accuracy of information provided.</p>
            <h2 className="text-white font-bold text-lg">Intellectual Property</h2>
            <p>All content, creatives, and strategies developed by {config.name} remain our intellectual property until full payment is received. Upon full payment, clients receive full usage rights for deliverables created specifically for them.</p>
            <h2 className="text-white font-bold text-lg">Limitation of Liability</h2>
            <p>{config.name} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for the specific service giving rise to the claim.</p>
            <h2 className="text-white font-bold text-lg">Termination</h2>
            <p>Either party may terminate the service agreement with 30 days written notice. Upon termination, you will receive a final report and access to all accounts and assets managed during the engagement.</p>
            <h2 className="text-white font-bold text-lg">Contact</h2>
            <p>For questions about these terms, contact us at {config.email}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
