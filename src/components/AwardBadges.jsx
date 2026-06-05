import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaStar, FaAward, FaRibbon, FaTimes } from 'react-icons/fa';

// High-fidelity inline SVG Wipro Logo
const WiproLogo = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 100 100" className={`${className} flex-shrink-0`}>
        {/* Core circle */}
        <circle cx="50" cy="50" r="16" fill="#1b365d" />
        {/* Colorful ring dots */}
        <circle cx="50" cy="20" r="7.5" fill="#e4002b" />
        <circle cx="71" cy="29" r="7.5" fill="#ff5c39" />
        <circle cx="80" cy="50" r="7.5" fill="#ffb81c" />
        <circle cx="71" cy="71" r="7.5" fill="#00b050" />
        <circle cx="50" cy="80" r="7.5" fill="#00a3e0" />
        <circle cx="29" cy="71" r="7.5" fill="#0033a0" />
        <circle cx="20" cy="50" r="7.5" fill="#753bbd" />
        <circle cx="29" cy="29" r="7.5" fill="#ec4899" />
    </svg>
);

// High-fidelity inline SVG TransUnion Logo
const TransUnionLogo = ({ className = "w-4 h-4" }) => (
    <svg viewBox="0 0 100 100" className={`${className} flex-shrink-0`}>
        {/* TransUnion brand color background */}
        <rect x="5" y="5" width="90" height="90" rx="20" fill="#00a9e0" />
        {/* Stylized 't' */}
        <path 
            d="M36 28 V64 C36 69, 39 72, 45 72 H48 M28 44 H45" 
            fill="none" 
            stroke="white" 
            strokeWidth="9.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        {/* Stylized 'u' */}
        <path 
            d="M56 44 V62 C56 68, 60 72, 67 72 C74 72, 78 68, 78 62 V44" 
            fill="none" 
            stroke="white" 
            strokeWidth="9.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
    </svg>
);

const CompanyLogo = ({ logoKey, sizeClass = "w-4 h-4" }) => {
    if (logoKey === 'wipro') {
        return <WiproLogo className={sizeClass} />;
    }
    if (logoKey === 'transunion') {
        return <TransUnionLogo className={sizeClass} />;
    }
    return null;
};

const awards = [
    {
        id: 'tu-q4-2025',
        title: 'Quarterly Performance Award – Q4 2025',
        company: 'TransUnion',
        logo: 'transunion',
        description: 'Awarded for outstanding performance, ownership, and contribution to test automation. Improved test stability, execution efficiency, and delivered reliable results leveraging GenAI.',
        icon: FaTrophy,
        color: 'from-cyan-400 to-blue-500',
        glowColor: 'group-hover:border-cyan-500/30 group-hover:shadow-cyan-500/5',
        image: 'https://media.licdn.com/dms/image/v2/D562DAQGxbFJjDD54vg/profile-treasury-image-shrink_800_800/B56ZstZXu8IkAY-/0/1765993191704?e=1781294400&v=beta&t=LF1t9mAg_W-DamoW6Q7P5q8VyV3WgCOzKdtAh6YUUQo'
    },
    {
        id: 'wipro-habit-bearer',
        title: 'Habit Bearer Award',
        company: 'Wipro',
        logo: 'wipro',
        description: 'Recognized for consistently embodying core organizational habits, strong work ethics, and delivering quality outputs.',
        icon: FaRibbon,
        color: 'from-amber-400 to-orange-500',
        glowColor: 'group-hover:border-amber-500/30 group-hover:shadow-amber-500/5'
    },
    {
        id: 'wipro-victory-league',
        title: 'Victory League Award',
        company: 'Wipro',
        logo: 'wipro',
        description: 'Awarded for outstanding contributions to project milestones and high-performance framework development.',
        icon: FaTrophy,
        color: 'from-yellow-400 to-amber-500',
        glowColor: 'group-hover:border-yellow-500/30 group-hover:shadow-yellow-500/5'
    },
    {
        id: 'wipro-bright-beginning',
        title: 'The Bright Beginning Award',
        company: 'Wipro',
        logo: 'wipro',
        description: 'Awarded to promising newcomers for outstanding quick learning, proactive ownership, and early impact.',
        icon: FaStar,
        color: 'from-cyan-400 to-blue-500',
        glowColor: 'group-hover:border-cyan-500/30 group-hover:shadow-cyan-500/5'
    },
    {
        id: 'wipro-inspiring-perf',
        title: 'Inspiring Performance Award',
        company: 'Wipro',
        logo: 'wipro',
        description: 'Recognized for high-impact achievements, outstanding SDET contributions, and driving automation success.',
        icon: FaMedal,
        color: 'from-purple-400 to-indigo-500',
        glowColor: 'group-hover:border-purple-500/30 group-hover:shadow-purple-500/5'
    },
    {
        id: 'wipro-habit-flagbearer',
        title: 'Habit Flagbearer',
        company: 'Wipro',
        logo: 'wipro',
        description: 'Recognized as an exemplary role model for outstanding team stewardship, mentorship, and technical leadership.',
        icon: FaAward,
        color: 'from-emerald-400 to-teal-500',
        glowColor: 'group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/5'
    },
];

function AwardBadges() {
    const [selectedAward, setSelectedAward] = useState(null);

    return (
        <div className="relative">
            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto px-4 mt-2">
                {awards.map((award, idx) => {
                    const IconComponent = award.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedAward(award)}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                            viewport={{ once: true }}
                            className={`group relative flex items-start gap-4 p-5 pt-8 rounded-xl bg-dark-800/30 backdrop-blur-md border border-white/5 hover:bg-dark-800/50 shadow-md ${award.glowColor} transition-all duration-300 cursor-pointer`}
                        >
                            {/* Company Badge (Top Right) */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/5 py-1 px-2.5 rounded-full border border-white/5 group-hover:border-white/10 transition-colors">
                                <CompanyLogo logoKey={award.logo} sizeClass="w-3.5 h-3.5" />
                                <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-300">
                                    {award.company}
                                </span>
                            </div>

                            {/* Icon Badge container with gradient background */}
                            <div className={`flex-shrink-0 p-3 rounded-lg bg-gradient-to-br ${award.color} bg-opacity-10 text-white shadow-inner transform group-hover:scale-110 transition-transform duration-300 mt-1`}>
                                <IconComponent className="w-5 h-5 filter drop-shadow-md text-white" />
                            </div>

                            {/* Text Content */}
                            <div className="flex-grow min-w-0 pr-16">
                                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-primary-300 transition-colors line-clamp-1">
                                    {award.title}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                                    {award.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Popup / Lightbox Overlay on Click */}
            <AnimatePresence>
                {selectedAward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAward(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                            className="relative w-full max-w-lg rounded-2xl bg-dark-800/90 border border-white/10 shadow-2xl p-6 overflow-hidden glass cursor-default"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedAward(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>

                            {/* Header (Company Logo + Name) */}
                            <div className="flex items-center gap-2 mb-4">
                                <CompanyLogo logoKey={selectedAward.logo} sizeClass="w-5 h-5" />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary-400">
                                    {selectedAward.company} Award
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-white mb-3">
                                {selectedAward.title}
                            </h2>

                            {/* Description */}
                            <p className="text-slate-300 text-sm leading-relaxed mb-5">
                                {selectedAward.description}
                            </p>

                            {/* Image (Certificate / Award) if present */}
                            {selectedAward.image && (
                                <div className="mt-4 border border-white/10 rounded-lg overflow-hidden bg-black/40">
                                    <img
                                        src={selectedAward.image}
                                        alt={selectedAward.title}
                                        className="w-full h-auto max-h-[260px] object-contain rounded-md"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AwardBadges;
