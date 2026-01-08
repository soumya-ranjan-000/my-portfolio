import { motion } from 'framer-motion';

const Certifications = ({ data }) => {
    return (
        <section className="py-10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
                Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.map((cert, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="glass-card p-4 rounded-lg border border-white/5 bg-white/5 flex items-center gap-4 hover:border-primary-500/30 transition-colors"
                    >
                        <div className="w-2 h-2 rounded-full bg-secondary-400"></div>
                        <span className="text-slate-200 font-medium">{cert}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Certifications;
