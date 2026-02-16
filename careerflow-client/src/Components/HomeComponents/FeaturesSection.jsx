import { Columns, Bell, BarChart3 } from "lucide-react";

export default function FeaturesSection() {
  return (
    // Section background adapts to theme (Light: Soft gray, Dark: Deep matte zinc)
    <section className="bg-base-300 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto">

          {/* Badge - Uses primary variable with opacity */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            ⚡ FEATURES
          </div>

          {/* Heading - Theme aware text colors */}
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="text-primary">Everything You Need</span>
            <br />
            <span className="text-base-content">to Crush Your Job Search</span>
          </h2>

          {/* Subtext - Uses base-content with opacity for readability */}
          <p className="mt-4 text-base-content/70 text-lg">
            Built for the modern tech job hunt. No more messy spreadsheets or
            forgotten applications.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1 - Uses base-100 (White in light, Deep Zinc in dark) */}
          <div className="bg-base-100 p-8 rounded-box shadow-md hover:shadow-xl transition duration-300 border border-base-300/50">
            {/* Icon uses the modular primary/secondary gradient from your theme */}
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content mb-6 shadow-sm">
              <Columns size={22} />
            </div>

            <h3 className="text-lg font-semibold text-base-content mb-3">
              Kanban Board Tracking
            </h3>

            <p className="text-base-content/60 text-sm leading-relaxed">
              Drag & drop your applications like a pro. From "Applied" to
              "Offer Accepted" - visualize your entire job hunt journey at a glance.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-base-100 p-8 rounded-box shadow-md hover:shadow-xl transition duration-300 border border-base-300/50">
            {/* Using primary/secondary for brand consistency across all icons */}
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content mb-6 shadow-sm">
              <Bell size={22} />
            </div>

            <h3 className="text-lg font-semibold text-base-content mb-3">
              Smart Reminders
            </h3>

            <p className="text-base-content/60 text-sm leading-relaxed">
              Never ghost a recruiter again! Get timely notifications for
              follow-ups, interviews, and coding challenges. We've got your back.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-base-100 p-8 rounded-box shadow-md hover:shadow-xl transition duration-300 border border-base-300/50">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-content mb-6 shadow-sm">
              <BarChart3 size={22} />
            </div>

            <h3 className="text-lg font-semibold text-base-content mb-3">
              Track Your Progress
            </h3>

            <p className="text-base-content/60 text-sm leading-relaxed">
              See your application success rate, response times, and trends.
              Data-driven insights to help you iterate and land offers faster.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}