import { Check, Sparkles, Crown, Zap } from "lucide-react";

export default function PricingSection() {
  return (
    // Section background: Light (Soft Gray) / Dark (Professional Zinc)
    <section className="bg-base-200/30 py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge: Modular primary color */}
          <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            💎 PRICING
          </div>

          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="text-primary">Student-Friendly</span>
            <br />
            <span className="text-base-content">Pricing That Makes Sense</span>
          </h2>

          <p className="mt-4 text-base-content/70 text-lg">
            Start free, upgrade when you're ready. All plans include a 14-day
            money-back guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Starter Plan */}
          <div className="bg-base-100 p-8 rounded-box shadow-md relative border border-base-300/50 hover:shadow-xl hover:border-2 hover:border-primary transition duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-content text-xs px-4 py-2 rounded-full font-bold">
              Free 
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 mx-auto">
              <Sparkles size={30} />
            </div>

            <h3 className="text-xl font-semibold text-base-content mb-2">Starter</h3>
            <p className="text-base-content/50 text-sm mb-6">
              Perfect for getting started with a single job search
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">$0</span>
              <span className="text-base-content/50 ml-2">per month</span>
            </div>

            {/* Uses Theme-Aware Outline Button */}
            <button className="btn btn-outline w-full h-12  rounded-box">
              Get Started Free
            </button>

            <ul className="mt-6 space-y-3 text-sm text-base-content/70">
              {[
                "Track up to 10 active applications",
                "Access to 1 Kanban Board",
                "Basic job details",
                "Standard Email Support",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check size={16} className="text-primary mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Professional Plan (Highlighted) */}
          <div className="bg-base-100 p-8 rounded-box shadow-xl border-2 border-primary relative z-10 scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-content text-xs px-4 py-1 rounded-full font-bold">
              Most Popular
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content mb-6 shadow-md mx-auto">
              <Crown size={30} />
            </div>

            <h3 className="text-xl font-semibold text-base-content mb-2">Professional</h3>
            <p className="text-base-content/50 text-sm mb-6">
              Designed for active job seekers managing multiple leads
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">$8</span>
              <span className="text-base-content/50 ml-2">per month</span>
            </div>

            {/* Uses your Modular btn-primary (Perfect-Match Gradient) */}
            <button className="btn btn-primary w-full h-12 rounded-box text-lg">
              Purchase Pro
            </button>

            <ul className="mt-6 space-y-3 text-sm text-base-content/70">
              {[
                "Everything in Starter, plus:",
                "Unlimited job applications",
                "Task Management & Checklists",
                "Status Reminders",
                "Document Storage",
                "Basic Analytics",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check size={16} className="text-primary mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Executive Plan */}
          <div className="bg-base-100 p-8 rounded-box shadow-md relative border border-base-300/50 hover:shadow-xl hover:border-2 hover:border-primary transition duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-content text-xs px-4 py-2 rounded-full font-bold">
              Elite
            </div>

            <div className="flex items-center justify-center rounded-xl bg-secondary/10 text-secondary mb-6 mx-auto w-16 h-16">
              <Zap size={30} />
            </div>

            <h3 className="text-xl font-semibold text-base-content mb-2">Executive</h3>
            <p className="text-base-content/50 text-sm mb-6">
              For power users managing diverse career paths
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-primary">$15</span>
              <span className="text-base-content/50 ml-2">per month</span>
            </div>

            <button className="btn btn-outline w-full h-12 rounded-box">
              Purchase Elite
            </button>

            <ul className="mt-6 space-y-3 text-sm text-base-content/70">
              {[
                "Everything in Pro, plus:",
                "Multiple Boards",
                "Data Export",
                "Advanced Funnel Analytics",
                "Priority Support",
                "Custom Tags",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check size={16} className="text-primary mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trusted Logos - Theme Consistent */}
        <div className="mt-20 text-center text-sm text-base-content/50">
          Trusted by students at
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-base-content/70 font-medium italic">
            <span>MIT</span>
            <span>Stanford</span>
            <span>Berkeley</span>
            <span>CMU</span>
            <span>Harvard</span>
            <span>Cornell</span>
          </div>
        </div>
      </div>
    </section>
  );
}