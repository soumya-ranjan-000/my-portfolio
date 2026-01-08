import { motion } from 'framer-motion';

const TimelineItem = ({ item, isLast }) => (
    <div className="relative pl-8 md:pl-0">
        {/* Timeline Line (Desktop Center) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2"></div>

        <div className={`flex flex-col md:flex-row items-center justify-between mb-12 ${isLast ? 'mb-0' : ''}`}>
            {/* Left Side (Date/Content alternating) */}
            <div className="md:w-5/12 mb-4 md:mb-0 text-left md:text-right">
                <div className="md:pr-8">
                    <h4 className="text-xl font-bold text-white">{item.role || item.degree}</h4>
                    <h5 className="text-primary-400 font-medium">{item.company || item.institution}</h5>
                    <span className="text-sm text-slate-400 block mt-1 md:hidden">{item.duration || item.year}</span>
                </div>
            </div>

            {/* Center Dot */}
            <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-secondary-500 border-4 border-slate-900 -translate-x-[5px] md:-translate-x-1/2 mt-1.5 md:mt-0 z-10"></div>

            {/* Right Side (Date/Content alternating) */}
            <div className="md:w-5/12 pl-8 text-left">
                <span className="text-sm text-slate-400 hidden md:block mb-2">{item.duration || item.year}</span>
                <p className="text-slate-300 text-sm leading-relaxed">
                    {item.description}
                </p>
                {item.achievements && (
                    <ul className="list-disc list-outside text-slate-400 text-sm mt-2 ml-4 space-y-1">
                        {item.achievements.map((ach, i) => (
                            <li key={i}>{ach}</li>
                        ))}
                    </ul>
                )}
                {item.location && <p className="text-xs text-slate-500 mt-1">{item.location}</p>}
            </div>
        </div>
    </div>
);

const Timeline = ({ title, data, icon }) => {
    return (
        <section className="py-10">
            <h3 className="text-2xl font-bold text-white mb-10 flex items-center gap-2">
                <span className="text-primary-500">
                    {icon}
                </span>
                {title}
            </h3>
            <div className="relative">
                {/* Mobile Line */}
                <div className="md:hidden absolute left-0 top-0 bottom-0 w-px bg-white/10 ml-[3px]"></div>

                {data.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <TimelineItem item={item} isLast={idx === data.length - 1} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Timeline;
