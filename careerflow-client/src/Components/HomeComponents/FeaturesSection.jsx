import { Columns, Bell, BarChart3 } from "lucide-react";
import {motion} from 'framer-motion'
export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delays each card by 0.2s for that waterfall effect
      },
    },
  };

  // 2. Card Variant: Uses a subtle "spring" physics instead of a stiff linear slide
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
      },
    },
  };
  return (
    // Section background adapts to theme (Light: Soft gray, Dark: Deep matte zinc)
    <section className="bg-base-200/20 py-20 transition-colors duration-300">
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
        <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }} // Triggers when 50px into the viewport
      className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >

      {/* Card 1 */}
      <motion.div 
        variants={cardVariants}
        whileHover={{ y: -8 }} // Pro-touch: lifts the card slightly on hover
        className="bg-base-100 p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-shadow duration-300 border border-base-300/50 group"
      >
        <motion.div 
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content mb-8 shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.1, rotate: 5 }} // Icon playfully reacts to hover
        >
          <Columns size={26} strokeWidth={2.5} />
        </motion.div>

        <h3 className="text-xl font-bold text-base-content mb-4 tracking-tight">
          Kanban Board Tracking
        </h3>

        <p className="text-base-content/60 text-sm leading-relaxed font-medium">
          Drag & drop your applications like a pro. From "Applied" to
          "Offer Accepted" - visualize your entire job hunt journey at a glance.
        </p>
      </motion.div>

      {/* Card 2 */}
      <motion.div 
        variants={cardVariants}
        whileHover={{ y: -8 }}
        className="bg-base-100 p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-shadow duration-300 border border-base-300/50 group"
      >
        <motion.div 
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content mb-8 shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.1, rotate: -5 }}
        >
          <Bell size={26} strokeWidth={2.5} />
        </motion.div>

        <h3 className="text-xl font-bold text-base-content mb-4 tracking-tight">
          Smart Reminders
        </h3>

        <p className="text-base-content/60 text-sm leading-relaxed font-medium">
          Never ghost a recruiter again! Get timely notifications for
          follow-ups, interviews, and coding challenges. We've got your back.
        </p>
      </motion.div>

      {/* Card 3 */}
      <motion.div 
        variants={cardVariants}
        whileHover={{ y: -8 }}
        className="bg-base-100 p-8 rounded-[2rem] shadow-md hover:shadow-2xl transition-shadow duration-300 border border-base-300/50 group"
      >
        <motion.div 
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content mb-8 shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <BarChart3 size={26} strokeWidth={2.5} />
        </motion.div>

        <h3 className="text-xl font-bold text-base-content mb-4 tracking-tight">
          Track Your Progress
        </h3>

        <p className="text-base-content/60 text-sm leading-relaxed font-medium">
          See your application success rate, response times, and trends.
          Data-driven insights to help you iterate and land offers faster.
        </p>
      </motion.div>

    </motion.div>
        
   
      </div>
    </section>
  );
}