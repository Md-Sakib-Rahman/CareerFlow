import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion';

const TimelineStep = ({ year, title, description, align }) => {
  return (
    <motion.div
        initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className={`flex flex-col md:flex-row items-center gap-8 mb-16 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}
    >
        <div className={`flex-1 text-center ${align === 'right' ? 'md:text-left' : 'md:text-right'}`}>
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">{year}</h3>
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <p className="text-base-content/60">{description}</p>
        </div>
        <div className="w-12 h-12 bg-base-100 rounded-full border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] z-10 shrink-0">
            <div className="w-4 h-4 bg-secondary rounded-full"></div>
        </div>
        <div className="flex-1 md:block hidden"></div>
    </motion.div>
  )
}

export default TimelineStep
