import { motion } from 'framer-motion';

const Awards = ({ data }) => {
    return (
        <section className="py-10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </span>
                Awards & Accomplishments
            </h3>
            <div className="space-y-4">
                {data.map((award, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="group flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:text-primary-300 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-slate-200 font-medium group-hover:text-white transition-colors">{award}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Awards;
