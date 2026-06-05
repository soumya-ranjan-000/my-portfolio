import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function HeroSection() {
    const [text] = useState("Soumya");

    return (
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 pt-16 pb-20 min-h-[calc(100vh-7rem)] max-w-6xl mx-auto z-10 px-4">
            
            {/* Background Image with Black-and-White fading gradient overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 h-full overflow-hidden pointer-events-none z-0 opacity-50">
                <img 
                    src="/images/profile_ai.png" 
                    alt="Background Portrait" 
                    className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-100 scale-100 transition-all duration-700"
                />
                {/* Fading gradients to blend the image edges seamlessly into the black page background */}
                <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-black to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Left Column: Intro Text */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-7/12 relative z-10 max-w-xl">
                {/* Background glow behind text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-white/5 rounded-full blur-[120px] -z-10" />

                {/* Intro Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-200 text-sm font-medium backdrop-blur-sm">
                        👋 Welcome to my portfolio
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-4xl md:text-6xl lg:text-7xl hero-heading mb-6 leading-tight"
                >
                    Hi, I'm <span className="hero-heading">{text}</span>
                </motion.h1>

                {/* Subheading / Typing Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg md:text-xl hero-subtitle mb-10 font-light max-w-lg"
                >
                    <TypingEffect text=" A QA Automation Engineer & SDET building modern systems to ensure quality." />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link to="/projects" className="btn-monochrome text-center">
                        View My Work
                    </Link>
                    <Link to="/contact" className="btn-outline text-center">
                        Contact Me
                    </Link>
                </motion.div>
            </div>

            {/* Right Column: Empty space so text layout remains balanced with background image */}
            <div className="hidden md:block md:w-5/12 h-64 pointer-events-none" />

            {/* Floating Elements (Decorative) */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-24 left-[5%] w-10 h-10 bg-white/5 backdrop-blur-md border border-primary-400/20 rounded-xl rotate-12 -z-10 hidden lg:block"
            />
        </div>
    );
}

// Simple Typing Component
const TypingEffect = ({ text, speed = 50 }) => {
    const [displayed, setDisplayed] = useState('');

    useEffect(() => {
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