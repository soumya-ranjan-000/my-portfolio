import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function HeroSection(params) {
    const typedText = "Hello, I'm Soumya 😎.";
    const typingSpeed = 80; // ms per character
    const cursorBlinkSpeed = 500; // ms
    const TypingHeading = () => {
        const [displayed, setDisplayed] = useState('');
        const [showCursor, setShowCursor] = useState(true);

        useEffect(() => {
            let timeout;
            if (displayed.length < typedText.length) {
                timeout = setTimeout(() => {
                    setDisplayed(typedText.slice(0, displayed.length + 1));
                }, typingSpeed);
            } else {
                // After finishing, wait and restart typing effect
                timeout = setTimeout(() => {
                    setDisplayed('');
                }, 8500);
            }
            return () => clearTimeout(timeout);
        }, [displayed]);

        useEffect(() => {
            const cursorInterval = setInterval(() => {
                setShowCursor((v) => !v);
            }, cursorBlinkSpeed);
            return () => clearInterval(cursorInterval);
        }, []);

        return (
            <h1 className="text-6xl font-bold text-gray-800 flex items-center justify-center min-h-[60px]">
                <span>
                    {displayed}
                    <span
                        className="inline-block w-2"
                        style={{
                            opacity: showCursor ? 1 : 0,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        |
                    </span>
                </span>
            </h1>
        );
    };
    return (
        <div className="flex flex-col items-center text-center">
            <TypingHeading />
            <motion.p
                className="mt-4 text-xl text-gray-800 max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
            >
                A passionate SDET & Automation Engineer crafting modern test frameworks and projects.
            </motion.p>
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="mt-8"
            >
            
                <Link
                    to="/projects"
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium shadow-lg hover:bg-amber-600 hover:shadow-2xl transition"
                >
                    View My Work
                </Link>
            </motion.div>
        </div>
    );
}

export default HeroSection;