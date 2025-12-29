import { motion } from 'framer-motion';

function Articles() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-12 max-w-2xl rounded-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/10 blur-[80px] rounded-full -ml-20 -mb-20"></div>

                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6 relative z-10">
                    Articles
                </h1>
                <p className="text-xl text-slate-300 mb-8 relative z-10">
                    I'm currently brewing up some technical deep dives and tutorials.
                    <br />Check back soon!
                </p>

                <div className="flex justify-center gap-4 relative z-10">
                    <span className="animate-pulse px-4 py-2 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/20">
                        ✍️ Writing in progress...
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

export default Articles;