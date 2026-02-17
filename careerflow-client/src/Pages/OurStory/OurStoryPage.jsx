import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Rocket,
    Target,
    Users,
    Code2,
    Zap,
    Layers,
    Globe,
    GraduationCap,
    Lightbulb,
    TrendingUp,
    Cpu
} from 'lucide-react';
import Navbar from '../../Components/Shared/Navbar/Navbar';
import Footer from '../../Components/Shared/Footer/Footer';

const TimelineStep = ({ year, title, description, align }) => (
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
);

const TechItem = ({ icon: Icon, name, desc }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-base-100 border border-base-300 hover:border-primary/50 transition-all shadow-sm hover:shadow-xl group"
    >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-content transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="font-bold text-lg mb-2">{name}</h3>
        <p className="text-sm text-base-content/60">{desc}</p>
    </motion.div>
);

const OurStoryPage = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <div className="min-h-screen bg-base-200/30 overflow-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 text-center">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base-100 border border-base-300 text-sm font-medium mb-6 shadow-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                    Building the Future
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                    Crafting Careers, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                        One Click at a Time.
                    </span>
                </h1>

                <p className="text-xl text-base-content/60 max-w-2xl mx-auto mb-10">
                    From a dorm room idea to a comprehensive career management platform. This is the story of how CareerFlow came to be.
                </p>

                <div className="flex justify-center gap-10 text-base-content/40">
                    <Layers className="animate-bounce" style={{ animationDelay: '0s' }} />
                    <Globe className="animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Zap className="animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </section>

            {/* Mission Statement */}
            <section className="py-20 px-6 bg-base-100 relative overflow-hidden">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
                        <h2 className="text-4xl font-bold mb-6 relative z-10">The Mission Statement</h2>
                        <p className="text-lg text-base-content/70 mb-6 leading-relaxed">
                            We believe that the job search process is broken. It's fragmented, stressful, and cluttered.
                        </p>
                        <p className="text-lg text-base-content/70 mb-8 leading-relaxed">
                            Our mission is simple: <strong className="text-primary">to empower the next generation of talent.</strong> We're building tools that bring clarity to chaos, helping students and professionals organize their applications, track their progress, and land their dream roles with confidence.
                        </p>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg font-semibold">
                                <Target className="text-primary" size={20} />
                                <span>Focus</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg font-semibold">
                                <Users className="text-secondary" size={20} />
                                <span>Community</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg font-semibold">
                                <Lightbulb className="text-accent" size={20} />
                                <span>Innovation</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50, rotate: 5 }}
                        whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                        viewport={{ once: true }}
                        className="relative h-full min-h-[400px] bg-gradient-to-br from-primary to-secondary rounded-3xl p-1 shadow-2xl skew-y-3"
                    >
                        <div className="absolute inset-0 bg-base-100 rounded-[22px] flex flex-col items-center justify-center p-8 text-center overlow-hidden">
                            <Rocket size={80} className="text-primary mb-6" />
                            <h3 className="text-2xl font-bold mb-2">Accelerating Growth</h3>
                            <p className="text-base-content/60">We don't just track jobs; we fast-track careers.</p>

                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500 via-gray-900 to-black"></div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* The Student Edge */}
            <section className="py-24 px-6 relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10"></div>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">The Student Edge</h2>
                        <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
                            Why CareerFlow is the ultimate companion for students and early-career professionals.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Built by Students",
                                desc: "We understand late-night study sessions and application deadlines because we've been there.",
                                icon: GraduationCap,
                                color: "text-blue-500"
                            },
                            {
                                title: "Zero Fluff",
                                desc: "No corporate jargon. Just clean, effective tools that get out of your way and let you work.",
                                icon: Zap,
                                color: "text-yellow-500"
                            },
                            {
                                title: "Data-Driven",
                                desc: "Gain insights into your application performance to optimize your strategy.",
                                icon: TrendingUp,
                                color: "text-green-500"
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-base-100 p-8 rounded-2xl border border-base-300 hover:border-primary transition-all hover:shadow-lg group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}>
                                    <item.icon size={120} />
                                </div>
                                <div className={`w-14 h-14 rounded-xl bg-base-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                <p className="text-base-content/60 leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Highlight */}
            <section ref={containerRef} className="py-24 px-6 bg-base-100 border-t border-base-300">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="md:w-1/3 md:sticky md:top-32">
                            <h2 className="text-4xl font-black mb-6">Tech Stack Highlight</h2>
                            <p className="text-lg text-base-content/60 mb-8">
                                We leverage the latest and greatest in modern web development to deliver a seamless, high-performance experience.
                            </p>
                            <button className="btn btn-primary btn-outline gap-2 group">
                                <Code2 size={18} />
                                View GitHub
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>

                        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <TechItem
                                icon={Cpu}
                                name="React + Vite"
                                desc="Blazing fast frontend performance with instant HMR and optimized builds."
                            />
                            <TechItem
                                icon={Layers}
                                name="Tailwind CSS"
                                desc="Utility-first CSS framework for rapid UI development and consistent design systems."
                            />
                            <TechItem
                                icon={Zap}
                                name="Framer Motion"
                                desc="Production-ready animation library for fluid, physics-based interactions."
                            />
                            <TechItem
                                icon={Globe}
                                name="Node.js & Express"
                                desc="Scalable backend architecture capable of handling thousands of concurrent requests."
                            />
                            <TechItem
                                icon={Users}
                                name="DaisyUI"
                                desc="Component library built on top of Tailwind for accessible and themeable UI elements."
                            />
                            <TechItem
                                icon={Target}
                                name="MongoDB"
                                desc="Flexible NoSQL database for handling complex data structures and rapid iteration."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline / Journey (Optional but fits Story theme) */}
            <section className="py-20 px-6 bg-base-200/50">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold">Our Journey So Far</h2>
                </div>
                <div className="max-w-4xl mx-auto relative">
                    <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-base-300 hidden md:block"></div>

                    <TimelineStep
                        year="2024"
                        title="The Idea"
                        description="CareerFlow was conceptualized during a university hackathon."
                        align="left"
                    />
                    <TimelineStep
                        year="2025"
                        title="Beta Launch"
                        description="First public release to a closed group of 500 students."
                        align="right"
                    />
                    <TimelineStep
                        year="2026"
                        title="Global Expansion"
                        description="Now serving thousands of users worldwide with advanced analytics."
                        align="left"
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default OurStoryPage;
