import { Metadata } from "next";
import { config } from "@/lib/config";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Terms of Service & Digital Marketing Glossary | ${config.name}`,
  description: `Terms and conditions for using ${config.name}'s digital marketing services. Also includes a glossary of key digital marketing terms — SEO, PPC, ROAS, Local SEO, Meta Ads, and more — defined clearly for business owners across Gorakhpur & Uttar Pradesh.`,
  keywords: [
    "best digital marketing agency in gorakhpur",
    "digital marketing agency in gorakhpur",
    "digital marketing agency gorakhpur",
    "digital marketing terms",
    "digital marketing glossary",
    "what is seo",
    "what is ppc",
    "what is roas",
    "what is local seo",
    "what is meta ads",
    "digital marketing website gorakhpur",
    "terms of service digital marketing",
    "best digital marketing agency uttar pradesh",
  ],
};

const glossaryTerms = [
  {
    term: "Digital Marketing",
    definition:
      "The promotion of products, services, or brands through digital channels such as search engines (Google), social media platforms (Facebook, Instagram), email, and websites. As the best digital marketing agency in Gorakhpur, we use digital marketing to generate leads and grow businesses across Uttar Pradesh and India.",
  },
  {
    term: "Digital Marketing Agency",
    definition:
      "A company that specialises in planning and executing digital marketing strategies for businesses. A digital marketing agency like Nexus Digital provides services including SEO, paid advertising, social media management, website development, and lead generation — all under one roof.",
  },
  {
    term: "SEO (Search Engine Optimisation)",
    definition:
      "The process of optimising a website to rank higher on Google for relevant search queries (e.g. 'best digital marketing agency in Gorakhpur'). SEO includes keyword research, on-page content, technical fixes, link building, and Local SEO. Higher rankings = more organic traffic = more leads.",
  },
  {
    term: "Local SEO",
    definition:
      "A branch of SEO that focuses on making a business visible in local search results — Google Maps, 'near me' searches, and local keyword rankings. Essential for brick-and-mortar businesses across Gorakhpur and Uttar Pradesh who want to attract customers from their area.",
  },
  {
    term: "PPC (Pay-Per-Click)",
    definition:
      "A paid advertising model where you pay only when someone clicks on your ad. Google Ads and Meta Ads operate on a PPC model. PPC is ideal for generating immediate traffic and leads while your SEO strategy builds long-term organic rankings.",
  },
  {
    term: "Meta Ads",
    definition:
      "Paid advertising on Meta platforms (Facebook and Instagram). Meta Ads are powerful for brand awareness, retargeting warm audiences, and driving leads for products and services with visual appeal. Our digital marketing agency in Gorakhpur specialises in high-ROAS Meta Ads campaigns.",
  },
  {
    term: "Google Ads",
    definition:
      "Google's pay-per-click advertising platform that places your business at the top of search results when users search for your service. Google Ads are best for high-intent searches like 'digital marketing agency near me in Gorakhpur' — where the user is already looking to buy.",
  },
  {
    term: "ROAS (Return on Ad Spend)",
    definition:
      "A key performance metric that measures revenue generated for every rupee spent on advertising. A 3X ROAS means you earn ₹3 for every ₹1 spent. The best digital marketing agencies track ROAS rigorously to optimise your ad budget and maximise profit.",
  },
  {
    term: "Lead Generation",
    definition:
      "The process of attracting and converting potential customers (leads) into interested prospects for your product or service. Effective lead generation uses a combination of landing pages, ads, SEO, WhatsApp automation, and CRM to capture and nurture high-intent buyers.",
  },
  {
    term: "Digital Marketing Website",
    definition:
      "A website specifically built to perform as a marketing engine — fast, mobile-first, SEO-ready, and conversion-optimised. Unlike a brochure site, a digital marketing website is designed to rank on Google, capture visitor data, and convert traffic into enquiries and sales.",
  },
  {
    term: "Google Business Profile (GBP)",
    definition:
      "A free Google tool that lets businesses manage how they appear on Google Search and Maps. Optimising your GBP is the #1 Local SEO action for Gorakhpur businesses — it drives direct calls, map directions, and enquiries from local customers searching nearby.",
  },
  {
    term: "Social Media Marketing",
    definition:
      "Using social media platforms (Instagram, Facebook, LinkedIn, YouTube) to promote a brand, build community, and generate leads. Social media marketing includes organic content creation, paid ads, influencer collaborations, and community management.",
  },
  {
    term: "WhatsApp Marketing Automation",
    definition:
      "Using WhatsApp Business API to automate lead nurturing, appointment reminders, follow-ups, and customer communication. Highly effective for Indian businesses as WhatsApp is the #1 communication app in India. Our digital marketing agency Gorakhpur integrates this into complete lead funnels.",
  },
  {
    term: "Conversion Rate",
    definition:
      "The percentage of website visitors or ad viewers who take the desired action (fill a form, call, purchase). Improving conversion rate is as important as driving traffic — a 2% conversion rate on 1,000 visitors = 20 leads. Our agency focuses relentlessly on conversion optimisation.",
  },
  {
    term: "Core Web Vitals",
    definition:
      "Google's set of user experience metrics (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift) that measure a website's loading speed, interactivity, and visual stability. Sites with excellent Core Web Vitals get ranking advantages — which is why every website we build passes these tests.",
  },
];

export default function Terms() {
  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-20" />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <span className="tag-badge mb-5 inline-flex">Legal & Glossary</span>
          <AnimatedTitle as="h1" title="Terms of Service & Digital Marketing Glossary" className="text-4xl font-black text-white mb-4 leading-tight" />
          <p className="text-white/45 text-sm">
            Transparent legal terms — and a bonus glossary defining every digital marketing term your business needs to know.
            From the{" "}
            <Link href="/about" className="text-brand-blue-light hover:underline">
              best digital marketing agency in Gorakhpur
            </Link>
            , Nexus Digital.
          </p>
        </div>
      </section>

      {/* Terms of Service */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 border border-white/8">
            <h2 className="text-white font-bold text-2xl mb-1">Terms of Service</h2>
            <p className="text-white/30 text-xs mb-8">Last updated: August 2026</p>
            <div className="space-y-6 text-white/60 text-sm leading-relaxed">
              <p>
                By accessing or using the {config.name} website and services, you agree to be bound by these Terms of Service.
                If you do not agree, please do not use our services.
              </p>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">1. About Us — Business Description</h3>
                <p>
                  {config.name} is a professional digital marketing and web development agency providing technology-driven
                  digital solutions to businesses, startups, and organizations.
                </p>
                <p className="mt-2">
                  Our services include website design and development, search engine optimization (SEO), social media
                  management, digital advertising management, content strategy, branding, analytics, and digital marketing
                  consulting. We provide customized professional services based on the client&apos;s business requirements. We
                  do not sell customer databases, email lists, personal information, or unsolicited marketing lists.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">2. Our Services</h3>
                <p>We offer the following service categories:</p>
                <ul className="list-disc pl-5 space-y-1.5 mt-2">
                  <li><strong className="text-white/80">Website Design &amp; Development</strong> — business websites, landing pages, e-commerce websites, website maintenance and optimization.</li>
                  <li><strong className="text-white/80">Search Engine Optimization (SEO)</strong> — technical SEO, on-page SEO, content optimization, search visibility improvement, SEO reporting and analytics.</li>
                  <li><strong className="text-white/80">Social Media Marketing</strong> — social media strategy, content planning, creative design, account management, performance reporting.</li>
                  <li><strong className="text-white/80">Digital Advertising</strong> — campaign planning and management, search advertising, social media advertising, conversion tracking, campaign analytics and reporting.</li>
                  <li><strong className="text-white/80">Digital Marketing Consulting</strong> — digital strategy, competitor research, online presence analysis, conversion optimization, marketing performance analysis.</li>
                  <li><strong className="text-white/80">Branding &amp; Creative Services</strong> — brand identity, social media creatives, marketing graphics, digital campaign creatives.</li>
                </ul>
                <p className="mt-2">
                  The specific scope of services will be outlined in your quotation, proposal, or selected pricing plan.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">3. Important Service Clarification</h3>
                <p>
                  {config.name} provides professional marketing strategy, consulting, campaign management, creative,
                  analytics, and technology services. We do <strong className="text-white/80">not</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Sell or rent email databases.</li>
                  <li>Sell or rent phone-number databases.</li>
                  <li>Sell personal/customer information.</li>
                  <li>Provide unsolicited bulk messaging services.</li>
                  <li>Sell scraped customer lists.</li>
                  <li>Guarantee leads, sales, rankings, clicks, or advertising results.</li>
                  <li>Process payments on behalf of unrelated third-party businesses.</li>
                </ul>
                <p className="mt-2">
                  All marketing activities are performed according to applicable laws, platform policies, and client
                  requirements.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">4. Payment / Order Process</h3>
                <p>Clients select a service or customized package based on their requirements. After confirmation:</p>
                <ol className="list-decimal pl-5 space-y-1 mt-2">
                  <li>A quotation/proposal is provided.</li>
                  <li>The client receives an invoice or payment request.</li>
                  <li>The client makes the agreed advance/full payment.</li>
                  <li>Work begins after payment confirmation and required information/assets are received.</li>
                  <li>Deliverables are provided according to the agreed scope and timeline.</li>
                </ol>
                <p className="mt-2">
                  For recurring services, billing is performed according to the agreed monthly or periodic service plan.
                  Monthly retainer payments are due on the agreed billing date. Late payments may result in temporary service
                  suspension. All fees are exclusive of applicable GST and taxes. Ad spends (Meta Ads, Google Ads budgets)
                  are billed separately and are the client&apos;s direct expenditure to the respective platforms.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">5. Delivery Policy</h3>
                <p>
                  Digital services are delivered electronically through email, cloud storage, project management tools,
                  communication platforms, or other agreed digital channels. Typical delivery timelines depend on the
                  selected service and project scope. The estimated timeline is communicated to the client before work
                  begins.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">6. Client Responsibilities</h3>
                <p>
                  You agree to provide timely access to necessary accounts (Google Ads, Meta Business Manager, website admin,
                  etc.), brand assets, and information required for us to deliver our services. You are responsible for the
                  accuracy of all information provided and for maintaining the security of your own login credentials.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">7. Intellectual Property</h3>
                <p>
                  All content, creatives, strategies, and code developed by {config.name} remain our intellectual property
                  until full payment is received. Upon full payment, clients receive complete usage and ownership rights for
                  all deliverables created specifically for their business — including ad creatives, website code, and content.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">8. Results &amp; No Guarantees</h3>
                <p>
                  Digital marketing outcomes are influenced by many factors including market competition, ad budget, and
                  platform algorithm changes. While we apply best practices and are committed to delivering results, {config.name}{" "}
                  cannot guarantee specific outcomes such as a fixed number of leads or a specific Google ranking. We report
                  transparently on all campaigns and optimise continuously.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">9. Limitation of Liability</h3>
                <p>
                  {config.name} shall not be liable for any indirect, incidental, or consequential damages arising from the
                  use of our services. Our total liability is limited to the amount paid for the specific service giving rise
                  to the claim in the three months preceding the dispute.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">10. Cancellation &amp; Termination</h3>
                <p>
                  Either party may terminate the service agreement with 30 days written notice. Upon termination, you will
                  receive a final performance report and full access to all ad accounts, content, analytics, and assets
                  managed during the engagement. Refunds and cancellations are handled according to our{" "}
                  <Link href="/refund-cancellation" className="text-brand-blue-light hover:underline">
                    Refund &amp; Cancellation Policy
                  </Link>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">11. Confidentiality</h3>
                <p>
                  Both parties agree to keep all shared business information, strategies, campaign data, and pricing
                  confidential. We will never share your business data with third parties without explicit written consent,
                  except where required by law.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">12. Governing Law</h3>
                <p>
                  These terms are governed by the laws of India. Any disputes shall be resolved under the jurisdiction of
                  courts in Gorakhpur, Uttar Pradesh.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-2">13. Contact</h3>
                <p>
                  Website:{" "}
                  <a href="https://nexusdigitalmarketing.shop" className="text-brand-blue-light hover:underline">
                    https://nexusdigitalmarketing.shop
                  </a>
                  . For service enquiries, billing questions, project support, or refund-related requests, reach us at{" "}
                  <a href={`mailto:${config.email}`} className="text-brand-blue-light hover:underline">
                    {config.email}
                  </a>{" "}
                  or call{" "}
                  <a href={`tel:${config.phone}`} className="text-brand-blue-light hover:underline">
                    {config.phone}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Marketing Glossary */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4 inline-flex">Bonus Resource</span>
            <h2 className="text-3xl font-black text-white mb-3 leading-tight">
              Digital Marketing{" "}
              <span className="gradient-text">Defined Terms</span>
            </h2>
            <p className="text-white/45 text-sm max-w-xl mx-auto">
              Every digital marketing term your business needs to know — explained simply, by the{" "}
              <strong className="text-white">best digital marketing agency in Gorakhpur & Uttar Pradesh</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {glossaryTerms.map((item, i) => (
              <div
                key={item.term}
                className="glass-card rounded-xl p-5 border border-white/8 hover:border-brand-blue/25 transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <h3 className="text-brand-blue-light font-bold text-sm mb-2">{item.term}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center glass-card rounded-2xl p-8 border border-white/8">
            <p className="text-white/60 text-sm mb-4">
              Want to put these terms into action for your business?
            </p>
            <p className="text-white font-bold text-xl mb-6">
              Talk to the{" "}
              <span className="gradient-text">Best Digital Marketing Agency in Gorakhpur</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/enquiry#enquiry-form" className="btn-primary px-7 py-3 text-sm">
                Send an Enquiry
              </Link>
              <Link href="/faq" className="btn-secondary px-7 py-3 text-sm">
                Read Our FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
