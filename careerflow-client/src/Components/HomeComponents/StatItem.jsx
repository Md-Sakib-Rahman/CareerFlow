import React from 'react'
import { motion } from "framer-motion";
import CountUp from "react-countup";
const StatItem = ({ end, suffix, decimals = 0, label }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} // Only triggers animation once
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h3 className="text-3xl md:text-4xl font-bold text-primary">
        <CountUp 
          start={0} 
          end={end} 
          duration={2.5} 
          suffix={suffix} 
          decimals={decimals}
          enableScrollSpy={true}
          scrollSpyOnce={true}
        />
      </h3>
      <p className="text-base-content/60 text-sm mt-2">{label}</p>
    </motion.div>
  )
}

export default StatItem
