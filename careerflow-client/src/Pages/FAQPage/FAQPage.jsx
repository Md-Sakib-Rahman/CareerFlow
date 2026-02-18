import React, { useState } from 'react';
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
import Navbar from '../../Components/Shared/Navbar/Navbar';
import Footer from '../../Components/Shared/Footer/Footer';
import FAQItem from '../../Components/FAQComponents/FAQItem';
import CTASection from '../../Components/FAQComponents/CTASection';

const FAQ_DATA = [
    {
        category: "Security & Privacy",
        icon: <ShieldCheck size={24} className="text-primary" />,
        questions: [
            {
                id: "sec-1",
                q: "How is my data secured?",
                a: "We use industry-standard AES-256 encryption for all data at rest and TLS 1.3 for data in transit. Your career data is stored in secure, compliance-certified data centers.",
                icon: <Lock size={18} />
            },
            {
                id: "sec-2",
                q: "Do you share my information with third parties?",
                a: "No. We believe your data belongs to you. We do not sell or share your personal information with third-party advertisers or data brokers.",
                icon: <EyeOff size={18} />
            },
            {
                id: "sec-3",
                q: "Is my payment information safe?",
                a: "Absolutely. We never store your credit card details on our servers. All payments are processed through Stripe, which is a PCI-DSS Level 1 certified payment processor.",
                icon: <Database size={18} />
            }
        ]
    },
    {
        category: "Pricing Clarification",
        icon: <CreditCard size={24} className="text-secondary" />,
        questions: [
            {
                id: "pri-1",
                q: "What's included in the free tier?",
                a: "The free tier allows you to track up to 20 active applications, use our basic resume builder, and access standard job search analytics.",
                icon: <Tag size={18} />
            },
            {
                id: "pri-2",
                q: "Are there any hidden fees?",
                a: "None. What you see is what you get. Our monthly and annual plans are inclusive of all features listed in the pricing table.",
                icon: <Gift size={18} />
            },
            {
                id: "pri-3",
                q: "How do I cancel my subscription?",
                a: "You can cancel anytime through your dashboard settings. You'll continue to have access to premium features until the end of your billing cycle.",
                icon: <XCircle size={18} />
            }
        ]
    },
    {
        category: "Feature Guidance",
        icon: <Settings size={24} className="text-accent" />,
        questions: [
            {
                id: "fea-1",
                q: "How do I track my job applications?",
                a: "Simply click 'Add Application' on your dashboard. You can manually enter details or use our browser extension to pull data directly from job boards.",
                icon: <BarChart3 size={18} />
            },
            {
                id: "fea-2",
                q: "Does CareerFlow integrate with LinkedIn?",
                a: "Yes! Our Chrome extension allows you to save LinkedIn job postings directly to your CareerFlow tracker with a single click.",
                icon: <Link size={18} />
            },
            {
                id: "fea-3",
                q: "Can I export my data?",
                a: "Yes, you can export your entire application history and resume data in CSV or PDF format at any time from your account settings.",
                icon: <Download size={18} />
            }
        ]
    },
    {
        category: "Technical Support",
        icon: <LifeBuoy size={24} className="text-info" />,
        questions: [
            {
                id: "tec-1",
                q: "What should I do if the site isn't loading?",
                a: "First, check your internet connection and try refreshing. If the issue persists, clear your browser cache or try an incognito window.",
                icon: <Zap size={18} />
            },
            {
                id: "tec-2",
                q: "How do I reset my password?",
                a: "Click 'Forgot Password' on the login page. We'll send a secure reset link to your registered email address.",
                icon: <Key size={18} />
            },
            {
                id: "tec-3",
                q: "Is there a mobile app?",
                a: "We currently offer a mobile-responsive web experience. A native iOS and Android app is currently in development and expected to launch soon.",
                icon: <Smartphone size={18} />
            }
        ]
    }
];


const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = FAQ_DATA.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-base-100 py-20">

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black mb-6"
                    >
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Questions</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-base-content/60 mb-10"
                    >
                        Everything you need to know about CareerFlow. Can't find what you're looking for? Reach out to our support team.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-2xl mx-auto"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
                        <input
                            type="text"
                            placeholder="Search for questions..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-base-200/50 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </div>
            </section>

            {/* FAQ Sections */}
            <section className="pb-32 px-6">
                <div className="max-w-4xl mx-auto">
                    {filteredData.length > 0 ? (
                        filteredData.map((category, idx) => (
                            <motion.div
                                key={category.category}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="mb-16 last:mb-0"
                            >
                                <div className="flex items-center gap-3 mb-8 border-b border-base-300 pb-4">
                                    {category.icon}
                                    <h2 className="md:text-2xl text-xl font-bold">{category.category}</h2>
                                </div>

                                <div className="space-y-4">
                                    {category.questions.map((item) => (
                                        <FAQItem
                                            key={item.id}
                                            question={item.q}
                                            answer={item.a}
                                            icon={item.icon}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-base-content/30 mb-4">
                                <Search size={64} className="mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No matches found</h3>
                            <p className="text-base-content/50">Try searching for different keywords or browse the categories below.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="btn-primary px-8 py-3 rounded-xl font-bold mt-6"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <CTASection/>

        </div>
    );
};

export default FAQPage;
