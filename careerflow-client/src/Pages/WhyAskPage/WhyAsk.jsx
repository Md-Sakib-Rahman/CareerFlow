import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Target, TrendingUp, CheckCircle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const WhyAsk = () => {
  return (
    <div className="bg-base-200 py-2 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-16"
        >
          <h1 className="md:text-5xl font-bold leading-tight">
              <span className="text-primary">Why CareerFlow?</span>
            
          </h1>
          <p className="text-base-content">
            Career Tech – Job Application Tracker
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* Problem Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="bg-base-100 rounded-2xl shadow-xl p-8"
          >
            <Briefcase className="w-10 h-10 text-indigo-600 mb-4" />
            <h2 className="text-lg font-semibold text-base-content mb-3">
              The Problem
            </h2>
            <p className="text-base-content/60 text-sm leading-relaxed">
              Job seekers apply to multiple companies but struggle to track
              interview stages, deadlines, recruiter contacts, and follow-ups.
              This often results in confusion, missed opportunities, and stress.
            </p>
          </motion.div>

          {/* Goal Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="bg-base-100 rounded-2xl shadow-xl p-8"
          >
            <Target className="w-10 h-10 text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold text-base-content mb-3">
              Our Goal
            </h2>
            <p className="text-base-content/60 text-sm leading-relaxed">
              CareerFlow transforms the chaotic job search into a structured,
              visual pipeline system that helps users stay organized and focused
              throughout their journey.
            </p>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="bg-base-100 rounded-2xl shadow-xl p-8"
          >
            <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
            <h2 className="text-lg font-semibold text-base-content mb-3">
              The Solution
            </h2>
            <p className="text-base-content/60 text-sm leading-relaxed">
              With customizable boards, analytics, reminders, and drag-and-drop
              functionality, CareerFlow keeps everything in one powerful dashboard.
            </p>
          </motion.div>

          {/* Impact Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="bg-base-100 rounded-2xl shadow-xl p-8"
          >
            <TrendingUp className="w-10 h-10 text-purple-600 mb-4" />
            <h2 className="text-lg font-semibold text-base-content mb-3">
              Expected Impact
            </h2>
            <p className="text-base-content/60 text-sm leading-relaxed">
              CareerFlow empowers students and professionals to track progress,
              improve success rates, reduce stress, and make smarter career decisions.
            </p>
          </motion.div>

        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default WhyAsk;
