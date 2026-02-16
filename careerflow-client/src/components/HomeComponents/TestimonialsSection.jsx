import { Star } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
            💜 LOVED BY STUDENTS
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="text-purple-600">Join 10,000+ Students</span>
            <br />
            <span className="text-gray-900">
              Who Landed Their Dream Jobs
            </span>
          </h2>

          {/* Subtext */}
          <p className="mt-4 text-gray-600 text-lg">
            Real stories from students and new grads who crushed their job
            search with CareerFlow.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500 text-white font-semibold">
                AC
              </div>
              <span className="text-purple-200 text-3xl">”</span>
            </div>

            <div className="flex gap-1 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              "I was applying to 50+ companies and losing track of everything.
              CareerFlow kept me organized and I landed 3 offers in my final
              semester! Absolute game-changer."
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="font-semibold text-gray-900">Alex Chen</p>
              <p className="text-sm text-gray-500">CS Student</p>
              <p className="text-sm text-purple-600">UC Berkeley</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                MR
              </div>
              <span className="text-purple-200 text-3xl">”</span>
            </div>

            <div className="flex gap-1 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              "The automated reminders saved me so many times. I never missed a
              follow-up and it showed recruiters I was serious. Got my first
              dev job in 8 weeks! 🔥"
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="font-semibold text-gray-900">Maya Rodriguez</p>
              <p className="text-sm text-gray-500">Bootcamp Grad</p>
              <p className="text-sm text-purple-600">App Academy</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-500 text-white font-semibold">
                JK
              </div>
              <span className="text-purple-200 text-3xl">”</span>
            </div>

            <div className="flex gap-1 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              "The analytics feature is insane. I could see which companies
              actually responded and adjusted my strategy. Went from 2% to 15%
              response rate. Legit worth it!"
            </p>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="font-semibold text-gray-900">Jordan Kim</p>
              <p className="text-sm text-gray-500">Self-Taught Developer</p>
              <p className="text-sm text-purple-600">Career Switcher</p>
            </div>
          </div>

        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          <div>
            <h3 className="text-3xl font-bold text-purple-600">10K+</h3>
            <p className="text-gray-600 text-sm mt-2">Active Students</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-purple-600">85%</h3>
            <p className="text-gray-600 text-sm mt-2">Success Rate</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-purple-600">50K+</h3>
            <p className="text-gray-600 text-sm mt-2">Applications Tracked</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-purple-600">4.9/5</h3>
            <p className="text-gray-600 text-sm mt-2">Student Rating</p>
          </div>

        </div>

      </div>
    </section>
  );
}
