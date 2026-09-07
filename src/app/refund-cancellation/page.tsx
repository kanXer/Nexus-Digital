import { Metadata } from "next";
import { config } from "@/lib/config";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy | ${config.name}`,
  description: `Refund and cancellation policy of ${config.name} — how cancellations, refunds, and adjustments are handled for our digital marketing, design, and development services.`,
  keywords: [
    "refund policy digital marketing agency",
    "cancellation policy",
    "digital marketing refund gorakhpur",
  ],
};

export default function RefundCancellationPolicy() {
  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <AnimatedTitle as="h1" title="Refund & Cancellation Policy" className="text-4xl font-black text-white mb-2" />
          <p className="text-white/40 text-sm mb-8">Last updated: August 2026</p>
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/65">
            <p>
              Because digital marketing, consulting, design, and development services involve time, planning, resources,
              and customized work, refunds are handled according to the agreed project scope and stage of completion.
            </p>

            <h2 className="text-white font-bold text-lg mt-8">Cancellation Before Work Begins</h2>
            <p>
              If a client requests cancellation before work has started, the request may be reviewed for a refund subject
              to applicable payment processing charges and the agreed terms.
            </p>

            <h2 className="text-white font-bold text-lg">Cancellation After Work Has Started</h2>
            <p>
              Once customized work, campaign management, development, or other billable services have started, refunds may
              be adjusted based on work already completed and expenses already incurred. Any unused eligible amount, where
              applicable, will be processed according to the agreed terms.
            </p>

            <h2 className="text-white font-bold text-lg">Recurring Services</h2>
            <p>
              For monthly or periodic service plans, clients may cancel future billing cycles as per the agreed service
              terms. Fees for services already rendered within a billing cycle are non-refundable.
            </p>

            <h2 className="text-white font-bold text-lg">Delivery Policy</h2>
            <p>
              Digital services are delivered electronically through email, cloud storage, project management tools,
              communication platforms, or other agreed digital channels. Typical delivery timelines depend on the selected
              service and project scope. The estimated timeline is communicated to the client before work begins.
            </p>

            <h2 className="text-white font-bold text-lg">How to Request a Refund or Cancellation</h2>
            <p>
              To request a cancellation or refund-related review, please contact us with your invoice details at{" "}
              <a href={`mailto:${config.email}`} className="text-brand-blue-light hover:underline">
                {config.email}
              </a>{" "}
              or call{" "}
              <a href={`tel:${config.phone}`} className="text-brand-blue-light hover:underline">
                {config.phone}
              </a>
              . Requests are reviewed and responded to according to the agreed project terms. You can also reach us via
              our{" "}
              <Link href="/contact" className="text-brand-blue-light hover:underline">
                contact page
              </Link>
              .
            </p>

            <h2 className="text-white font-bold text-lg mt-8">Contact</h2>
            <p>
              {config.name}
              <br />
              Website:{" "}
              <a href="https://nexusdigitalmarketing.shop" className="text-brand-blue-light hover:underline">
                https://nexusdigitalmarketing.shop
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
