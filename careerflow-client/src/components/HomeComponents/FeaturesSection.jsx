import { Columns, Bell, BarChart3 } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
            ⚡ FEATURES
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="text-purple-600">Everything You Need</span>
            <br />
            <span className="text-gray-900">to Crush Your Job Search</span>
          </h2>

          {/* Subtext */}
          <p className="mt-4 text-gray-600 text-lg">
            Built for the modern tech job hunt. No more messy spreadsheets or
            forgotten applications.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white mb-6">
              <Columns size={22} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Kanban Board Tracking
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              Drag & drop your applications like a pro. From "Applied" to
              "Offer Accepted" - visualize your entire job hunt journey at a glance.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-6">
              <Bell size={22} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Smart Reminders
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              Never ghost a recruiter again! Get timely notifications for
              follow-ups, interviews, and coding challenges. We've got your back.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-6">
              <BarChart3 size={22} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Track Your Progress
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              See your application success rate, response times, and trends.
              Data-driven insights to help you iterate and land offers faster.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
