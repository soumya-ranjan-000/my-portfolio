import { motion } from 'framer-motion';

const Overview = ({ data }) => {
    const stats = [
        { label: "Years of Experience", value: data.yearsOfExperience },
        { label: "Certifications", value: data.certifications },
        { label: "Projects Completed", value: data.projects },
        { label: "Companies", value: data.companies }
    ];

    return (
        <section className="py-10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </span>
                Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="glass-card p-6 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors"
                    >
                        <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">
                            {stat.value}
                        </span>
                        <span className="text-slate-300 font-medium tracking-wide uppercase text-sm">
                            {stat.label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Overview;
