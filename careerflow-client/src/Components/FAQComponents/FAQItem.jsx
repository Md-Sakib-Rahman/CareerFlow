import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    CreditCard,
    Settings,
    LifeBuoy,
    Search,
    ChevronDown,
    Lock,
    EyeOff,
    Database,
    Tag,
    Gift,
    XCircle,
    BarChart3,
    Link,
    Download,
    Zap,
    Key,
    Smartphone
} from 'lucide-react';
const FAQItem = ({ question, answer, icon }) => {
 const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-base-300 rounded-xl overflow-hidden mb-4 bg-base-100/50 backdrop-blur-sm transition-all hover:border-primary/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-base-200"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-base-200 rounded-lg text-primary">
                        {icon}
                    </div>
                    <span className="font-semibold text-lg">{question}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={20} className="text-base-content/50" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-5 pb-5 pt-0 text-base-content/70 leading-relaxed pl-16">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FAQItem
