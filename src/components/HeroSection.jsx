import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// type animation removed
// Actually, let's keep the custom typing logic or simplify it. The previous one was fine, let's just style it better.
import { useState, useEffect } from 'react';

function HeroSection() {
    const [text] = useState("Soumya");

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center z-10">
            {/* Background enhancement specific to Hero */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -z-10" />

            {/* Intro Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-primary-400 text-sm font-medium backdrop-blur-sm">
                    👋 Welcome to my portfolio
                </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-5xl md:text-7xl font-heading font-bold mb-6 text-white leading-tight"
            >
                Hi, I'm <span className="gradient-text">{text}</span>
            </motion.h1>

            {/* Subheading / Typing Effect */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl md:text-2xl text-slate-400 mb-10 h-8 font-light"
            >
                <TypingEffect text="SDET & Automation Engineer building modern frameworks." />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <Link to="/projects" className="btn-primary">
                    View My Work
                </Link>
                <Link to="/contact" className="btn-outline">
                    Contact Me
                </Link>
            </motion.div>

            {/* Floating Elements (Decorative) */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-[10%] w-16 h-16 bg-white/5 backdrop-blur-md border border-primary-400/30 rounded-2xl rotate-12 -z-10 hidden md:block"
            />
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-[10%] w-20 h-20 bg-white/5 backdrop-blur-md border border-secondary-400/30 rounded-full -z-10 hidden md:block"
            />
        </div>
    );
}

// Simple Typing Component
const TypingEffect = ({ text, speed = 50 }) => {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
        // Reset when text changes
        setDisplayed('');
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span>
            {displayed}
            <span className="animate-pulse">|</span>
        </span>
    );
};

export default HeroSection;