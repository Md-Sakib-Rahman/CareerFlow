import { Check, Sparkles, Crown, Zap } from "lucide-react";

export default function PricingSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">

          <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
            💎 PRICING
          </div>

          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="text-purple-600">Student-Friendly</span>
            <br />
            <span className="text-gray-900">Pricing That Makes Sense</span>
          </h2>

          <p className="mt-4 text-gray-600 text-lg">
            Start free, upgrade when you're ready. All plans include a 14-day
            money-back guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Starter */}
          <div className="bg-white p-8 rounded-2xl shadow-md relative">

            <div className="absolute -top-3 left-6 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
              Free Forever
            </div>

            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-500 text-white mb-6">
              <Sparkles size={20} />
            </div>

            <h3 className="text-xl font-semibold mb-2">Starter</h3>
            <p className="text-gray-500 text-sm mb-6">
              Perfect for getting started with a single job search
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-purple-600">$0</span>
              <span className="text-gray-500 ml-2">per month</span>
            </div>

            <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
              Get Started Free
            </button>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {[
                "Track up to 10 active applications",
                "Access to 1 Kanban Board",
                "Basic job details",
                "Standard Email Support",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check size={16} className="text-purple-600 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Professional (Highlighted) */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-600 relative">

            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-4 py-1 rounded-full">
              Most Popular
            </div>

            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-600 text-white mb-6">
              <Crown size={20} />
            </div>

            <h3 className="text-xl font-semibold mb-2">Professional</h3>
            <p className="text-gray-500 text-sm mb-6">
              Designed for active job seekers managing multiple leads
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-purple-600">$8</span>
              <span className="text-gray-500 ml-2">per month</span>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition">
              Start Free Trial
            </button>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {[
                "Everything in Starter, plus:",
                "Unlimited job applications",
                "Task Management & Checklists",
                "Status Reminders",
                "Document Storage",
                "Basic Analytics",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check size={16} className="text-purple-600 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Executive */}
          <div className="bg-white p-8 rounded-2xl shadow-md relative">

            <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              Elite
            </div>

            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500 text-white mb-6">
              <Zap size={20} />
            </div>

            <h3 className="text-xl font-semibold mb-2">Executive</h3>
            <p className="text-gray-500 text-sm mb-6">
              For power users managing diverse career paths
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-purple-600">$15</span>
              <span className="text-gray-500 ml-2">per month</span>
            </div>

            <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:opacity-90 transition">
              Start Free Trial
            </button>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {[
                "Everything in Pro, plus:",
                "Multiple Boards",
                "Data Export",
                "Advanced Funnel Analytics",
                "Priority Support",
                "Custom Tags",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <Check size={16} className="text-purple-600 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Trusted Logos */}
        <div className="mt-20 text-center text-sm text-gray-500">
          Trusted by students at
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-gray-600 font-medium">
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
