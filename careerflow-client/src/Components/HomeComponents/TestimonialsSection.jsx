import { Star } from "lucide-react";
import StatItem from "./StatItem";
import {motion} from "framer-motion"
export default function TestimonialsSection() {
  return (
    // Section background: Light (Soft Gray) / Dark (Matte Zinc) 
    <section className="relative bg-base-100 py-24 transition-colors duration-300">
      {/* Ambient Blur 1 - Top Left */}
          <motion.div 
            animate={{ x: [0, 30, -50, 0], y: [0, -20, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"
          />

          {/* Ambient Blur 2 - Bottom Right */}
          <motion.div 
            animate={{ x: [0, -40, 30, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"
          />
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge: Uses primary branding  */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            💜 LOVED BY STUDENTS
          </div>

          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="text-primary">Join 10,000+ Students</span>
            <br />
            <span className="text-base-content">
              Who Landed Their Dream Jobs
            </span>
          </h2>

          <p className="mt-4 text-base-content/70 text-lg">
            Real stories from students and new grads who crushed their job
            search with CareerFlow.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="bg-base-100 p-8 rounded-box shadow-md hover:shadow-xl transition border border-base-300/50">
            <div className="flex items-center justify-between mb-4">
              {/* Avatar uses primary/secondary variables  */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-content font-semibold">
                AC
              </div>
              <span className="text-primary/20 text-3xl font-serif">”</span>
            </div>

            <div className="flex gap-1 text-warning mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-base-content/70 text-sm leading-relaxed">
              "I was applying to 50+ companies and losing track of everything.
              CareerFlow kept me organized and I landed 3 offers in my final
              semester! Absolute game-changer."
            </p>

            <div className="mt-6 pt-4 border-t border-base-300">
              <p className="font-semibold text-base-content">Alex Chen</p>
              <p className="text-sm text-base-content/50">CS Student</p>
              <p className="text-sm text-primary">UC Berkeley</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-base-100 p-8 rounded-box shadow-md hover:shadow-xl transition border border-base-300/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary text-secondary-content font-semibold">
                MR
              </div>
              <span className="text-primary/20 text-3xl font-serif">”</span>
            </div>

            <div className="flex gap-1 text-warning mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-base-content/70 text-sm leading-relaxed">
              "The automated reminders saved me so many times. I never missed a
              follow-up and it showed recruiters I was serious. Got my first
              dev job in 8 weeks! 🔥"
            </p>

            <div className="mt-6 pt-4 border-t border-base-300">
              <p className="font-semibold text-base-content">Maya Rodriguez</p>
              <p className="text-sm text-base-content/50">Bootcamp Grad</p>
              <p className="text-sm text-primary">App Academy</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-base-100 p-8 rounded-box shadow-md hover:shadow-xl transition border border-base-300/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-content font-semibold">
                JK
              </div>
              <span className="text-primary/20 text-3xl font-serif">”</span>
            </div>

            <div className="flex gap-1 text-warning mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>

            <p className="text-base-content/70 text-sm leading-relaxed">
              "The analytics feature is insane. I could see which companies
              actually responded and adjusted my strategy. Went from 2% to 15%
              response rate. Legit worth it!"
            </p>

            <div className="mt-6 pt-4 border-t border-base-300">
              <p className="font-semibold text-base-content">Jordan Kim</p>
              <p className="text-sm text-base-content/50">Self-Taught Developer</p>
              <p className="text-sm text-primary">Career Switcher</p>
            </div>
          </div>

        </div>

        {/* Stats Section - Uses Primary theme color  */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-base-300 pt-16">
          <StatItem end={10} suffix="K+" label="Active Students" />
          <StatItem end={85} suffix="%" label="Success Rate" />
          <StatItem end={50} suffix="K+" label="Applications Tracked" />
          <StatItem end={4.9} decimals={1} suffix="/5" label="Student Rating" />
        </div>
        

      </div>
    </section>
  );
}