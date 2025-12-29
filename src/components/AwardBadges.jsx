import React from 'react';
import { motion } from 'framer-motion';

const awards = [
    'Habit Bearer Award 🎗️',
    'Victory League Award 🏆',
    'The Bright Beginning Award 🌟',
    'Inspiring Performance Award 🏅',
    'Habit Flagbearer - Demonstrating Stewardship Award 🏳️‍🌈',
];

function AwardBadges() {
    return (
        <div
            className="flex flex-wrap gap-4 justify-center items-center max-w-5xl mx-auto p-4"
        >
            {awards.map((award, idx) => (
                <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="inline-block px-6 py-3 rounded-full text-sm font-semibold glass border border-white/10 text-slate-200 shadow-lg hover:border-primary-400/50 hover:bg-white/10 transition-colors duration-300 cursor-default"
                >
                    {award}
                </motion.span>
            ))}
        </div>
    );
}

export default AwardBadges;
